from rest_framework import serializers
from .models import Consultant, ConsultationTime, Reservation
from django.utils import timezone
from rest_framework.exceptions import ValidationError


class ConsultantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consultant
        fields = ["id", "user", "bio"]


class ConsultantManageTimeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsultationTime
        fields = ('id', 'start_time', 'end_time', 'is_reserved')  # consultant را read_only نگه دار
        read_only_fields = ('is_reserved',)

    def validate(self, data):
        start = data.get('start_time')
        end = data.get('end_time')

        if not start or not end:
            raise serializers.ValidationError("start_time و end_time هر دو لازم هستند.")
        if end <= start:
            raise serializers.ValidationError("end_time باید بعد از start_time باشد.")
        if start < timezone.now():
            raise serializers.ValidationError("start_time باید در آینده باشد.")
        return data


class ReservationSerializer(serializers.ModelSerializer):
    consultant = ConsultantSerializer(read_only=True)
    consultant_id = serializers.PrimaryKeyRelatedField(
        queryset=Consultant.objects.all(),
        source="consultant",
        write_only=True
    )
    times = ConsultantManageTimeSerializer(many=True, read_only=True)
    time_ids = serializers.PrimaryKeyRelatedField(
        queryset=ConsultationTime.objects.filter(is_reserved=False),
        many=True,
        write_only=True
    )

    class Meta:
        model = Reservation
        fields = [
            "id",
            "user",
            "consultant",
            "consultant_id",
            "type",
            "times",
            "time_ids",
            "created_at",
            "is_completed_by_user",
            "is_completed_by_consultant",
        ]
        read_only_fields = ["user", "created_at", "consultant", "times"]

    def validate(self, attrs):
        user = self.context["request"].user
        consultant = attrs.get("consultant")
        res_type = attrs.get("type")
        time_ids = attrs.get("time_ids", [])

        if not consultant:
            raise ValidationError({"consultant_id": "مشاور باید مشخص شود."})

        if res_type not in ["FREE", "SINGLE", "PACKAGE"]:
            raise ValidationError({"type": "نوع مشاوره معتبر نیست."})

        # 🚨 محدودیت جلسه رایگان: فقط یک بار
        if res_type == "FREE":
            if Reservation.objects.filter(user=user, type="FREE").exists():
                raise ValidationError({"type": "شما قبلاً یک جلسه رایگان استفاده کرده‌اید."})
            if len(time_ids) != 1:
                raise ValidationError({"time_ids": "برای مشاوره رایگان باید دقیقاً یک زمان انتخاب کنید."})

        # بررسی اینکه همه time_ids متعلق به همان مشاور باشند و آزاد باشند
        for time in time_ids:
            if time.consultant != consultant:
                raise ValidationError({"time_ids": "یک یا چند زمان انتخاب شده متعلق به مشاور نیست."})
            if time.is_reserved:
                raise ValidationError({"time_ids": "یک یا چند زمان انتخاب شده قبلاً رزرو شده‌اند."})

        # محدودیت برای جلسه پکیج
        if res_type == "PACKAGE":
            free_count = consultant.times.filter(is_reserved=False).count()
            if free_count < 5:
                raise ValidationError({"type": "این مشاور کمتر از ۵ زمان آزاد دارد."})

        return attrs

    def create(self, validated_data):
        consultant = validated_data.pop("consultant")
        time_ids = validated_data.pop("time_ids", [])
        reservation = Reservation.objects.create(
            user=self.context["request"].user,
            consultant=consultant,
            **validated_data
        )

        for time in time_ids:
            time.is_reserved = True
            time.save()

        reservation.times.set(time_ids)
        return reservation


class FreeConsultationCodeSerializer(serializers.Serializer):
    code = serializers.CharField()
    percent = serializers.IntegerField()


class ConsultantWithTimesSerializer(serializers.ModelSerializer):
    times = ConsultantManageTimeSerializer(many=True, read_only=True)

    class Meta:
        model = Consultant
        fields = ["id", "user", "bio", "times"]
