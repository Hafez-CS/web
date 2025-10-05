from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count, Prefetch
from django.utils import timezone
from drf_spectacular.utils import extend_schema, OpenApiParameter
import uuid

from .models import (
    ConsultantSchedule, Consultation, FreeConsultationCoupon,
    ConsultationType, ConsultationStatus, ConsultantAvailableDate
)
from .serializers import (
    ConsultantScheduleSerializer, ConsultationSerializer,
    BookConsultationSerializer, FreeConsultationCouponSerializer,
    UserBasicSerializer, ConsultantAvailableDateSerializer
)
from accounts.permissions import IsConsultant, IsPlatformAdmin, IsNormalUser
from accounts.models import UserProfile


class ConsultantScheduleViewSet(viewsets.ModelViewSet):
    """مدیریت زمان‌بندی مشاور"""
    serializer_class = ConsultantScheduleSerializer
    permission_classes = [permissions.IsAuthenticated, IsConsultant]

    def get_queryset(self):
        return ConsultantSchedule.objects.filter(
            consultant=self.request.user
        ).select_related('consultant')

    def perform_create(self, serializer):
        serializer.save(consultant=self.request.user)

    @extend_schema(
        summary="بروزرسانی گروهی زمان‌بندی",
        tags=["Consultant-consultation_module"]
    )
    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """بروزرسانی چندین بازه زمانی به صورت همزمان"""
        schedule_ids = request.data.get('schedule_ids', [])
        is_available = request.data.get('is_available', True)
        
        updated = ConsultantSchedule.objects.filter(
            id__in=schedule_ids,
            consultant=request.user
        ).update(is_available=is_available)
        
        return Response({
            'updated_count': updated,
            'message': f'{updated} زمان‌بندی با موفقیت بروز شد'
        })


class ConsultationViewSet(viewsets.ReadOnlyModelViewSet):
    """مدیریت و رزرو مشاوره"""
    serializer_class = ConsultationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'normal':
            return Consultation.objects.filter(user=user)
        elif user.role == 'consultant':
            return Consultation.objects.filter(consultant=user)
        elif user.role == 'platform_admin':
            return Consultation.objects.all()
        
        return Consultation.objects.none()
    @extend_schema(
            summary="لیست مشاوران موجود",
            parameters=[
                OpenApiParameter('consultation_type', str, description='single یا package'),
            ],
            tags=["User-consultation_module"]
        )
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def available_consultants(self, request):
            """لیست مشاوران با تایم‌های خالی"""
            consultation_type = request.query_params.get('consultation_type', ConsultationType.SINGLE)
            start_date = request.query_params.get('start_date')
            
            consultants = UserProfile.objects.filter(
                role='consultant',
                is_active=True
            ).prefetch_related(
                Prefetch('schedules', queryset=ConsultantSchedule.objects.filter(is_available=True)),
                Prefetch('available_dates', queryset=ConsultantAvailableDate.objects.filter(
                    is_available=True,
                    date__gte=timezone.now().date()
                ))
            )
            
            data = []
            for consultant in consultants:
                regular_slots = ConsultantScheduleSerializer(consultant.schedules.all(), many=True).data
                specific_dates = ConsultantAvailableDateSerializer(consultant.available_dates.all(), many=True).data
                
                data.append({
                    'consultant': {
                        'id': consultant.id,
                        'full_name': consultant.get_full_name() or consultant.username,
                        'email': consultant.email
                    },
                    'regular_weekly_slots': regular_slots,
                    'specific_available_dates': specific_dates,
                })
            
            return Response(data)

    @extend_schema(
        summary="رزرو مشاوره (تک جلسه یا پکیج)",
        request=BookConsultationSerializer,
        tags=["User-consultation_module"]
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
                'consultations': ConsultationSerializer(result, many=True).data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'message': 'مشاوره با موفقیت رزرو شد',
                'consultation': ConsultationSerializer(result).data
            }, status=status.HTTP_201_CREATED)

    @extend_schema(
        summary="مشاوره‌های دریافت شده",
        tags=["User-consultation_module", "Consultant-consultation_module"]
    )
    @action(detail=False, methods=['get'])
    def received(self, request):
        """لیست مشاوره‌های دریافت شده (در انتظار و تأیید شده)"""
        consultations = self.get_queryset().filter(
            status__in=[ConsultationStatus.PENDING, ConsultationStatus.CONFIRMED]
        ).select_related('user', 'consultant').order_by('scheduled_date', 'scheduled_time')
        
        serializer = self.get_serializer(consultations, many=True)
        return Response(serializer.data)
    @extend_schema(
            summary="مشاوره‌های تمام شده",
            tags=["User-consultation_module", "Consultant-consultation_module"]
        )
    @action(detail=False, methods=['get'])
    def completed(self, request):
            """لیست مشاوره‌های تمام شده"""
            consultations = self.get_queryset().filter(
                status=ConsultationStatus.COMPLETED
            ).select_related('user', 'consultant').order_by('-completed_at')
            
            serializer = self.get_serializer(consultations, many=True)
            return Response(serializer.data)

    @extend_schema(
            summary="علامت‌گذاری مشاوره به عنوان تمام شده",
            tags=["User-consultation_module", "Consultant-consultation_module"]
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
            tags=["Consultant-consultation_module", "Admin-consultation_module"]
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
        summary="دریافت کوپن رایگان",
        tags=["User-consultation_module"]
    )
    @action(detail=False, methods=['post'])
    def generate(self, request):
        """دریافت کوپن مشاوره رایگان یکبار مصرف"""
        if hasattr(request.user, 'free_coupon'):
            coupon = request.user.free_coupon
            if coupon.used:
                return Response(
                    {'error': 'کوپن رایگان قبلاً استفاده شده است'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response(FreeConsultationCouponSerializer(coupon).data)
        code = f"FREE-{uuid.uuid4().hex[:8].upper()}"
        coupon = FreeConsultationCoupon.objects.create(
            user=request.user,
            code=code
        )
            
        return Response(
            FreeConsultationCouponSerializer(coupon).data,
            status=status.HTTP_201_CREATED
        )

class ConsultantAvailableDateViewSet(viewsets.ModelViewSet):
        """مدیریت تاریخ‌های آزاد مشاور"""
        serializer_class = ConsultantAvailableDateSerializer
        permission_classes = [permissions.IsAuthenticated, IsConsultant]

        def get_queryset(self):
            return ConsultantAvailableDate.objects.filter(
                consultant=self.request.user,
                date__gte=timezone.now().date()
            ).select_related('consultant')

        def perform_create(self, serializer):
            serializer.save(consultant=self.request.user)

        @extend_schema(
            summary="حذف گروهی تایم‌ها",
            tags=["Consultant-consultation_module"]
        )
        @action(detail=False, methods=['post'])
        def bulk_delete(self, request):
            """حذف چند تایم به صورت همزمان"""
            date_ids = request.data.get('date_ids', [])
            
            deleted = ConsultantAvailableDate.objects.filter(
                id__in=date_ids,
                consultant=request.user
            ).delete()[0]
            
            return Response({
                'deleted_count': deleted,
                'message': f'{deleted} تایم با موفقیت حذف شد'
            })

        @extend_schema(
            summary="تایم‌های آزاد در بازه زمانی",
            parameters=[
                OpenApiParameter('start_date', str, description='تاریخ شروع (YYYY-MM-DD)'),
                OpenApiParameter('end_date', str, description='تاریخ پایان (YYYY-MM-DD)'),
            ],
            tags=["Consultant-consultation_module"]
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