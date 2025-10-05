from rest_framework import serializers
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
import uuid

from .models import (
    ConsultantSchedule, Consultation, FreeConsultationCoupon,
    ConsultationType, ConsultationStatus, ConsultantAvailableDate
)
from accounts.models import UserProfile


class UserBasicSerializer(serializers.ModelSerializer):
    """سریالایزر ساده برای نمایش اطلاعات کاربر"""
    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'get_full_name']
    
    get_full_name = serializers.SerializerMethodField()
    
    def get_get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class ConsultantScheduleSerializer(serializers.ModelSerializer):
    consultant_name = serializers.SerializerMethodField(read_only=True)
    day_name = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = ConsultantSchedule
        fields = ['id', 'consultant', 'consultant_name', 'day_of_week', 'day_name',
                  'start_time', 'end_time', 'is_available', 'created_at']
        read_only_fields = ['consultant', 'created_at']

    def get_consultant_name(self, obj):
        return obj.consultant.get_full_name() or obj.consultant.username
    
    def get_day_name(self, obj):
        days = ['دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه', 'یکشنبه']
        return days[obj.day_of_week]

    def validate(self, data):
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("زمان پایان باید بعد از زمان شروع باشد")
        return data


class ConsultationSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField(read_only=True)
    consultant_name = serializers.SerializerMethodField(read_only=True)
    can_complete = serializers.SerializerMethodField()
    is_completed = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Consultation
        fields = [
            'id', 'user', 'user_name', 'consultant', 'consultant_name',
            'consultation_type', 'scheduled_date', 'scheduled_time', 'status', 'status_display',
            'session_number', 'package_group', 'discount_code', 'discount_amount',
            'user_completed', 'consultant_completed', 'completed_at',
            'can_complete', 'is_completed', 'created_at'
        ]
        read_only_fields = [
            'user', 'status', 'package_group', 'session_number',
            'user_completed', 'consultant_completed', 'completed_at', 'created_at'
        ]

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
    
    def get_consultant_name(self, obj):
        return obj.consultant.get_full_name() or obj.consultant.username

    def get_can_complete(self, obj):
        request = self.context.get('request')
        if not request:
            return False
        
        if request.user == obj.user:
            return not obj.user_completed and obj.status == ConsultationStatus.CONFIRMED
        elif request.user == obj.consultant:
            return not obj.consultant_completed and obj.status == ConsultationStatus.CONFIRMED
        return False

    def get_is_completed(self, obj):
        return obj.status == ConsultationStatus.COMPLETED


class BookConsultationSerializer(serializers.Serializer):
    """سریالایزر رزرو مشاوره (تک جلسه یا پکیج)"""
    consultant_id = serializers.IntegerField()
    consultation_type = serializers.ChoiceField(choices=ConsultationType.choices)
    scheduled_date = serializers.DateField()
    scheduled_time = serializers.TimeField()
    discount_code = serializers.CharField(required=False, allow_blank=True)

    def validate_consultant_id(self, value):
        try:
            consultant = UserProfile.objects.get(id=value, role='consultant')
            return consultant
        except UserProfile.DoesNotExist:
            raise serializers.ValidationError("مشاور نامعتبر است")

    def validate(self, data):
        consultant = data['consultant_id']
        date = data['scheduled_date']
        time = data['scheduled_time']
        
        if date < timezone.now().date():
            raise serializers.ValidationError("نمی‌توانید برای گذشته رزرو کنید")
        
        matching_date_slot = ConsultantAvailableDate.objects.filter(
            consultant=consultant,
            date=date,
            start_time__lte=time,
            end_time__gt=time,
            is_available=True
        ).first()
        
        if not matching_date_slot:
            day_of_week = date.weekday()
            
            matching_slot = ConsultantSchedule.objects.filter(
                consultant=consultant,
                day_of_week=day_of_week,
                start_time__lte=time,
                end_time__gt=time,
                is_available=True
            ).first()
            
            if not matching_slot:
                raise serializers.ValidationError(
                    f"مشاور در تاریخ {date} و ساعت {time.strftime('%H:%M')} تایم خالی ندارد"
                )
            
            matched_slot = matching_slot
        else:
            matched_slot = matching_date_slot
        
        conflict = Consultation.objects.filter(
            consultant=consultant,
            scheduled_date=date,
            scheduled_time__gte=matched_slot.start_time,
            scheduled_time__lt=matched_slot.end_time,
            status__in=[ConsultationStatus.PENDING, ConsultationStatus.CONFIRMED]
        ).exists()
        
        if conflict:
            raise serializers.ValidationError(
                f"این تایم در تاریخ {date} قبلاً رزرو شده است"
            )
        
        data['_matched_slot'] = matched_slot
        return data
    
    @transaction.atomic
    def create(self, validated_data):
        user = self.context['request'].user
        consultant = validated_data['consultant_id']
        consultation_type = validated_data['consultation_type']
        date = validated_data['scheduled_date']
        time = validated_data['scheduled_time']
        discount_code = validated_data.get('discount_code', '')
        matched_slot = validated_data.pop('_matched_slot', None)
        
        discount_amount = 0
        
        if discount_code:
            try:
                coupon = FreeConsultationCoupon.objects.get(
                    user=user,
                    code=discount_code,
                    used=False
                )
                coupon.use_coupon()
                discount_amount = 100
            except FreeConsultationCoupon.DoesNotExist:
                raise serializers.ValidationError("کد تخفیف نامعتبر یا قبلاً استفاده شده است")
        
        consultations = []
        
        if consultation_type == ConsultationType.SINGLE:
            consultation = Consultation.objects.create(
                user=user,
                consultant=consultant,
                consultation_type=consultation_type,
                scheduled_date=date,
                scheduled_time=time,
                discount_code=discount_code,
                discount_amount=discount_amount,
                session_number=1
            )
            consultations.append(consultation)
            
        elif consultation_type == ConsultationType.PACKAGE:
            package_group = f"{user.id}_{consultant.id}_{uuid.uuid4().hex[:8]}"
            
            available_dates = self._get_available_slots(consultant, date, weeks=8)
            
            if len(available_dates) < 5:
                raise serializers.ValidationError(
                    "مشاور بازه‌های زمانی کافی برای پکیج (۵ جلسه) ندارد"
                )
            
            for i, (session_date, session_time) in enumerate(available_dates[:5], 1):
                consultation = Consultation.objects.create(
                    user=user,
                    consultant=consultant,
                    consultation_type=consultation_type,
                    scheduled_date=session_date,
                    scheduled_time=session_time,
                    package_group=package_group,
                    session_number=i,
                    discount_code=discount_code if i == 1 else '',
                    discount_amount=discount_amount if i == 1 else 0
                )
                consultations.append(consultation)
        
        return consultations[0] if len(consultations) == 1 else consultations

    def _get_available_slots(self, consultant, start_date, weeks=8):
        """بازه‌های زمانی خالی مشاور در هفته‌های آینده"""
        available = []
        current_date = start_date
        end_date = start_date + timedelta(weeks=weeks)
        
        while current_date <= end_date and len(available) < 10:
            day_of_week = current_date.weekday()
            
            schedules = ConsultantSchedule.objects.filter(
                consultant=consultant,
                day_of_week=day_of_week,
                is_available=True
            ).order_by('start_time')
            
            for schedule in schedules:
                is_booked = Consultation.objects.filter(
                    consultant=consultant,
                    scheduled_date=current_date,
                    scheduled_time__gte=schedule.start_time,
                    scheduled_time__lt=schedule.end_time,
                    status__in=[ConsultationStatus.PENDING, ConsultationStatus.CONFIRMED]
                ).exists()
                
                if not is_booked:
                    available.append((current_date, schedule.start_time))
            
            current_date += timedelta(days=1)
        
        return available
class FreeConsultationCouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = FreeConsultationCoupon
        fields = ['id', 'code', 'used', 'used_at', 'created_at']
        read_only_fields = ['code', 'used', 'used_at', 'created_at']

class ConsultantAvailableDateSerializer(serializers.ModelSerializer):
    consultant_name = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = ConsultantAvailableDate
        fields = ['id', 'consultant', 'consultant_name', 'date', 
                  'start_time', 'end_time', 'is_available', 'created_at']
        read_only_fields = ['consultant', 'created_at']

    def get_consultant_name(self, obj):
        return obj.consultant.get_full_name() or obj.consultant.username

    def validate(self, data):
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("زمان پایان باید بعد از زمان شروع باشد")
        
        if data['date'] < timezone.now().date():
            raise serializers.ValidationError("نمی‌توانید برای گذشته تایم تعریف کنید")
        
        return data