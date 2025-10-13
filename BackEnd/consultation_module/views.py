from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count, Prefetch
from django.utils import timezone
from drf_spectacular.utils import extend_schema, OpenApiParameter
from datetime import timedelta, datetime
import uuid

from .models import (
    ConsultantAvailableDate, Consultation, FreeConsultationCoupon,
    ConsultationType, ConsultationStatus
)
from .serializers import (
    ConsultationSerializer, BookConsultationSerializer, 
    FreeConsultationCouponSerializer, ConsultantAvailableDateSerializer
)
from accounts.permissions import IsConsultant, IsPlatformAdmin, IsNormalUser
from accounts.models import UserProfile


class ConsultantAvailableDateViewSet(viewsets.ModelViewSet):
    """مدیریت تقویم تایم‌های آزاد مشاور - سیستم تقویمی"""
    serializer_class = ConsultantAvailableDateSerializer
    permission_classes = [permissions.IsAuthenticated, IsConsultant]
    
    def get_queryset(self):
        return ConsultantAvailableDate.objects.filter(
            consultant=self.request.user,
            date__gte=timezone.now().date()
        ).select_related('consultant').order_by('date', 'start_time')

    def perform_create(self, serializer):
        """مشاور همیشه می‌تواند تایم جدید اضافه کند"""
        serializer.save(consultant=self.request.user)

    def update(self, request, *args, **kwargs):
        """فقط در روز جمعه و فقط تایم‌های رزرو نشده قابل ویرایش هستند"""
        instance = self.get_object()
        
        today = timezone.now().date()
        is_friday = today.weekday() == 4  # 4 = Friday
        
        if not is_friday:
            return Response(
                {'error': 'فقط در روز جمعه می‌توانید تایم‌ها را ویرایش کنید'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if instance.is_booked():
            return Response(
                {'error': 'این تایم رزرو شده است و قابل تغییر نیست'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """فقط در روز جمعه و فقط تایم‌های رزرو نشده قابل حذف هستند"""
        instance = self.get_object()
        
        today = timezone.now().date()
        is_friday = today.weekday() == 4  # 4 = Friday
        
        if not is_friday:
            return Response(
                {'error': 'فقط در روز جمعه می‌توانید تایم‌ها را حذف کنید'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if instance.is_booked():
            return Response(
                {'error': 'این تایم رزرو شده است و قابل حذف نیست'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)

    @extend_schema(
        summary="ایجاد گروهی تایم‌ها در تقویم",
        tags=["Consultant-Schedule"]
    )
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """ایجاد چندین تایم به صورت همزمان"""
        slots = request.data.get('slots', [])
        
        created_slots = []
        errors = []
        
        for slot_data in slots:
            serializer = self.get_serializer(data=slot_data)
            if serializer.is_valid():
                serializer.save(consultant=request.user)
                created_slots.append(serializer.data)
            else:
                errors.append({
                    'slot': slot_data,
                    'errors': serializer.errors
                })
        
        return Response({
            'created_count': len(created_slots),
            'created_slots': created_slots,
            'errors': errors
        }, status=status.HTTP_201_CREATED if created_slots else status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="حذف گروهی تایم‌ها",
        tags=["Consultant-Schedule"]
    )
    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        """حذف چند تایم به صورت همزمان - فقط جمعه‌ها و تایم‌های رزرو نشده"""
        today = timezone.now().date()
        is_friday = today.weekday() == 4
        
        if not is_friday:
            return Response(
                {'error': 'فقط در روز جمعه می‌توانید تایم‌ها را حذف کنید'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        date_ids = request.data.get('date_ids', [])
        
        dates = ConsultantAvailableDate.objects.filter(
            id__in=date_ids,
            consultant=request.user
        )
        
        deleted = 0
        skipped = 0
        
        for date_slot in dates:
            if not date_slot.is_booked():
                date_slot.delete()
                deleted += 1
            else:
                skipped += 1
        
        return Response({
            'deleted_count': deleted,
            'skipped_count': skipped,
            'message': f'{deleted} تایم با موفقیت حذف شد. {skipped} تایم رزرو شده بود.'
        })

    @extend_schema(
        summary="بروزرسانی گروهی تایم‌ها",
        tags=["Consultant-Schedule"]
    )
    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """بروزرسانی چندین تایم به صورت همزمان - فقط جمعه‌ها و تایم‌های رزرو نشده"""
        today = timezone.now().date()
        is_friday = today.weekday() == 4
        
        if not is_friday:
            return Response(
                {'error': 'فقط در روز جمعه می‌توانید تایم‌ها را ویرایش کنید'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        date_ids = request.data.get('date_ids', [])
        is_available = request.data.get('is_available', True)
        
        dates = ConsultantAvailableDate.objects.filter(
            id__in=date_ids,
            consultant=request.user
        )
        
        updated = 0
        skipped = 0
        
        for date_slot in dates:
            if not date_slot.is_booked():
                date_slot.is_available = is_available
                date_slot.save()
                updated += 1
            else:
                skipped += 1
        
        return Response({
            'updated_count': updated,
            'skipped_count': skipped,
            'message': f'{updated} تایم با موفقیت بروز شد. {skipped} تایم رزرو شده بود.'
        })

    @extend_schema(
        summary="تایم‌های آزاد در بازه زمانی",
        parameters=[
            OpenApiParameter('start_date', str, description='تاریخ شروع (YYYY-MM-DD)'),
            OpenApiParameter('end_date', str, description='تاریخ پایان (YYYY-MM-DD)'),
        ],
        tags=["Consultant-Schedule"]
    )
    @action(detail=False, methods=['get'])
    def date_range(self, request):
        """دریافت تایم‌های آزاد در یک بازه زمانی"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        queryset = self.get_queryset()
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class ConsultationViewSet(viewsets.ReadOnlyModelViewSet):
    """مدیریت و رزرو مشاوره - سیستم تقویمی"""
    serializer_class = ConsultationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'normal':
            return Consultation.objects.filter(user=user).select_related('user', 'consultant')
        elif user.role == 'consultant':
            return Consultation.objects.filter(consultant=user).select_related('user', 'consultant')
        elif user.role == 'platform_admin':
            return Consultation.objects.all().select_related('user', 'consultant')
        
        return Consultation.objects.none()

    @extend_schema(
        summary="لیست مشاوران با تقویم تایم‌های آزاد",
        parameters=[
            OpenApiParameter('consultation_type', str, description='single یا package', required=False),
            OpenApiParameter('start_date', str, description='تاریخ شروع جستجو (YYYY-MM-DD)', required=False),
            OpenApiParameter('end_date', str, description='تاریخ پایان جستجو (YYYY-MM-DD)', required=False),
        ],
        tags=["User-Consultations"]
    )
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def available_consultants(self, request):
        """لیست مشاوران با تقویم تایم‌های خالی"""
        consultation_type = request.query_params.get('consultation_type', ConsultationType.SINGLE)
        start_date_str = request.query_params.get('start_date', str(timezone.now().date()))
        end_date_str = request.query_params.get('end_date')
        
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        except:
            start_date = timezone.now().date()
        
        if end_date_str:
            try:
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            except:
                end_date = start_date + timedelta(days=60)
        else:
            end_date = start_date + timedelta(days=60)
        
        consultants = UserProfile.objects.filter(
            role='consultant',
            is_active=True
        ).prefetch_related(
            Prefetch('available_dates', queryset=ConsultantAvailableDate.objects.filter(
                is_available=True,
                date__gte=start_date,
                date__lte=end_date
            ).order_by('date', 'start_time'))
        )
        
        data = []
        for consultant in consultants:
            # گرفتن تایم‌های خالی (رزرو نشده)
            available_slots = []
            for slot in consultant.available_dates.all():
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
            
            # برای پکیج، فقط مشاورانی که حداقل 5 تایم خالی دارند
            if consultation_type == ConsultationType.PACKAGE and len(available_slots) < 5:
                continue
            
            slots_data = ConsultantAvailableDateSerializer(available_slots, many=True).data
            
            data.append({
                'consultant': {
                    'id': consultant.id,
                    'username': consultant.username,
                    'full_name': consultant.get_full_name() or consultant.username,
                    'email': consultant.email,
                    'bio': consultant.bio or ''
                },
                'available_slots_count': len(available_slots),
                'available_slots': slots_data,
            })
        
        return Response(data)

    @extend_schema(
        summary="رزرو مشاوره (تک جلسه یا پکیج)",
        request=BookConsultationSerializer,
        tags=["User-Consultations"]
    )
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def book(self, request):
        """رزرو جلسه مشاوره یا پکیج"""
        if request.user.role != 'normal':
            return Response(
                {'error': 'فقط کاربران عادی می‌توانند مشاوره رزرو کنند'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = BookConsultationSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        result = serializer.save()
        
        if isinstance(result, list):
            return Response({
                'message': f'پکیج با موفقیت رزرو شد: {len(result)} جلسه',
                'consultations': ConsultationSerializer(result, many=True, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'message': 'مشاوره با موفقیت رزرو شد',
                'consultation': ConsultationSerializer(result, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)

    @extend_schema(
        summary="مشاوره‌های دریافت شده",
        tags=["User-Consultations", "Consultant-Consultations"]
    )
    @action(detail=False, methods=['get'])
    def received(self, request):
        """لیست مشاوره‌های دریافت شده (در انتظار و تأیید شده)"""
        consultations = self.get_queryset().filter(
            status__in=[ConsultationStatus.PENDING, ConsultationStatus.CONFIRMED]
        ).order_by('scheduled_date', 'scheduled_time')
        
        serializer = self.get_serializer(consultations, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="مشاوره‌های تمام شده",
        tags=["User-Consultations", "Consultant-Consultations"]
    )
    @action(detail=False, methods=['get'])
    def completed(self, request):
        """لیست مشاوره‌های تمام شده"""
        consultations = self.get_queryset().filter(
            status=ConsultationStatus.COMPLETED
        ).order_by('-completed_at')
        
        serializer = self.get_serializer(consultations, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="علامت‌گذاری مشاوره به عنوان تمام شده",
        tags=["User-Consultations", "Consultant-Consultations"]
    )
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """علامت‌گذاری مشاوره به عنوان تمام شده توسط کاربر یا مشاور"""
        consultation = self.get_object()
        
        if consultation.status != ConsultationStatus.CONFIRMED:
            return Response(
                {'error': 'فقط مشاوره‌های تأیید شده را می‌توان تمام کرد'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if request.user == consultation.user:
            if consultation.user_completed:
                return Response({'error': 'قبلاً توسط کاربر تمام شده است'}, status=status.HTTP_400_BAD_REQUEST)
            consultation.mark_completed_by_user()
            message = 'تمام شد. منتظر تأیید مشاور هستیم.'
        elif request.user == consultation.consultant:
            if consultation.consultant_completed:
                return Response({'error': 'قبلاً توسط مشاور تمام شده است'}, status=status.HTTP_400_BAD_REQUEST)
            consultation.mark_completed_by_consultant()
            message = 'تمام شد. منتظر تأیید کاربر هستیم.'
        else:
            return Response({'error': 'دسترسی غیرمجاز'}, status=status.HTTP_403_FORBIDDEN)
        
        if consultation.status == ConsultationStatus.COMPLETED:
            message = 'مشاوره با موفقیت به اتمام رسید!'
        
        return Response({
            'message': message,
            'consultation': ConsultationSerializer(consultation, context={'request': request}).data
        })

    @extend_schema(
        summary="آمار مشاوره‌ها",
        tags=["Consultant-Consultations", "Admin-Reports"]
    )
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """آمار مشاوره‌ها برای مشاور یا ادمین"""
        queryset = self.get_queryset()
        
        total = queryset.count()
        completed = queryset.filter(status=ConsultationStatus.COMPLETED).count()
        pending = queryset.filter(status__in=[ConsultationStatus.PENDING, ConsultationStatus.CONFIRMED]).count()
        
        return Response({
            'total': total,
            'completed': completed,
            'pending': pending,
            'completion_rate': round((completed / total * 100) if total > 0 else 0, 2)
        })


class FreeConsultationCouponViewSet(viewsets.ReadOnlyModelViewSet):
    """مدیریت کوپن مشاوره رایگان"""
    serializer_class = FreeConsultationCouponSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FreeConsultationCoupon.objects.filter(user=self.request.user)

    @extend_schema(
        summary="دریافت کوپن رایگان یکبار مصرف",
        tags=["User-Consultations"]
    )
    @action(detail=False, methods=['post'])
    def request_free_coupon(self, request):
        """دریافت کوپن مشاوره رایگان یکبار مصرف - دکمه "مشاوره رایگان یکبار مصرف" """
        if request.user.role != 'normal':
            return Response(
                {'error': 'فقط کاربران عادی می‌توانند کوپن رایگان دریافت کنند'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if hasattr(request.user, 'free_coupon'):
            coupon = request.user.free_coupon
            if coupon.used:
                return Response(
                    {'error': 'کوپن رایگان قبلاً استفاده شده است'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response({
                'message': 'شما قبلاً کوپن رایگان دریافت کرده‌اید',
                'coupon': FreeConsultationCouponSerializer(coupon).data
            })
        
        code = f"FREE-{uuid.uuid4().hex[:8].upper()}"
        coupon = FreeConsultationCoupon.objects.create(
            user=request.user,
            code=code
        )
        
        return Response({
            'message': 'کوپن 100% تخفیف با موفقیت صادر شد',
            'coupon': FreeConsultationCouponSerializer(coupon).data
        }, status=status.HTTP_201_CREATED)