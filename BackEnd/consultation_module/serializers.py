from rest_framework import serializers
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
import uuid

from .models import (
    Consultation, FreeConsultationCoupon,
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


class ConsultantAvailableDateSerializer(serializers.ModelSerializer):
    """سریالایزر تایم‌های تقویمی مشاور"""
    consultant_name = serializers.SerializerMethodField(read_only=True)
    is_booked = serializers.SerializerMethodField(read_only=True)
    can_modify = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = ConsultantAvailableDate
        fields = ['id', 'consultant', 'consultant_name', 'date', 
                  'start_time', 'end_time', 'is_available', 'is_booked', 'can_modify', 'created_at']
        read_only_fields = ['consultant', 'created_at', 'is_booked', 'can_modify']

    def get_consultant_name(self, obj):
        return obj.consultant.get_full_name() or obj.consultant.username
    
    def get_is_booked(self, obj):
        """آیا این تایم رزرو شده است"""
        return obj.is_booked()
    
    def get_can_modify(self, obj):
        """آیا این تایم قابل تغییر است (فقط جمعه‌ها و تایم‌های رزرو نشده)"""
        return obj.can_be_modified()

    def validate(self, data):
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("زمان پایان باید بعد از زمان شروع باشد")
        
        if data['date'] < timezone.now().date():
            raise serializers.ValidationError("نمی‌توانید برای گذشته تایم تعریف کنید")
        
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
    """سریالایزر رزرو مشاوره (تک جلسه یا پکیج) - سیستم تقویمی"""
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
        consultation_type = data['consultation_type']
        
        if date < timezone.now().date():
            raise serializers.ValidationError("نمی‌توانید برای گذشته رزرو کنید")
        
        # پیدا کردن تایم مشاور در تاریخ مشخص
        matching_slot = ConsultantAvailableDate.objects.filter(
            consultant=consultant,
            date=date,
            start_time__lte=time,
            end_time__gt=time,
            is_available=True
        ).first()
        
        if not matching_slot:
            raise serializers.ValidationError(
                f"مشاور در تاریخ {date} و ساعت {time.strftime('%H:%M')} تایم خالی ندارد"
            )
        
        # بررسی تداخل با رزروهای موجود
        conflict = Consultation.objects.filter(
            consultant=consultant,
            scheduled_date=date,
            scheduled_time__gte=matching_slot.start_time,
            scheduled_time__lt=matching_slot.end_time,
            status__in=[ConsultationStatus.PENDING, ConsultationStatus.CONFIRMED]
        ).exists()
        
        if conflict:
            raise serializers.ValidationError(
                f"این تایم در تاریخ {date} قبلاً رزرو شده است"
            )
        
        # برای پکیج، بررسی اینکه آیا مشاور 5 تایم خالی دارد
        if consultation_type == ConsultationType.PACKAGE:
            available_slots = self._get_available_slots(consultant, date)
            if len(available_slots) < 5:
                raise serializers.ValidationError(
                    f"مشاور تایم‌های کافی برای پکیج ندارد. تایم‌های موجود: {len(available_slots)} (حداقل 5 نیاز است)"
                )
        
        data['_matched_slot'] = matching_slot
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
        
        # بررسی کوپن تخفیف
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
            
            # پیدا کردن 5 تایم خالی از تقویم مشاور
            available_slots = self._get_available_slots(consultant, date)
            
            if len(available_slots) < 5:
                raise serializers.ValidationError(
                    "مشاور بازه‌های زمانی کافی برای پکیج (۵ جلسه) ندارد"
                )
            
            # رزرو خودکار 5 جلسه از تقویم
            for i, slot in enumerate(available_slots[:5], 1):
                consultation = Consultation.objects.create(
                    user=user,
                    consultant=consultant,
                    consultation_type=consultation_type,
                    scheduled_date=slot.date,
                    scheduled_time=slot.start_time,
                    package_group=package_group,
                    session_number=i,
                    discount_code=discount_code if i == 1 else '',
                    discount_amount=discount_amount if i == 1 else 0
                )
                consultations.append(consultation)
        
        return consultations[0] if len(consultations) == 1 else consultations

    def _get_available_slots(self, consultant, start_date):
        """بازه‌های زمانی خالی مشاور از تقویم - برای 60 روز آینده"""
        end_date = start_date + timedelta(days=60)
        
        # گرفتن تمام تایم‌های موجود مشاور در این بازه
        available_dates = ConsultantAvailableDate.objects.filter(
            consultant=consultant,
            date__gte=start_date,
            date__lte=end_date,
            is_available=True
        ).order_by('date', 'start_time')
        
        available_slots = []
        
        for slot in available_dates:
            # بررسی که رزرو نشده باشد
            is_booked = Consultation.objects.filter(
                consultant=consultant,
                scheduled_date=slot.date,
                scheduled_time__gte=slot.start_time,
                scheduled_time__lt=slot.end_time,
                status__in=[ConsultationStatus.PENDING, ConsultationStatus.CONFIRMED]
            ).exists()
            
            if not is_booked:
                available_slots.append(slot)
                
                # اگر 5 تایم پیدا کردیم، کافیه
                if len(available_slots) >= 5:
                    break
        
        return available_slots


class FreeConsultationCouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = FreeConsultationCoupon
        fields = ['id', 'code', 'used', 'used_at', 'created_at']
        read_only_fields = ['code', 'used', 'used_at', 'created_at']