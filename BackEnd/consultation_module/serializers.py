from rest_framework import serializers
from .models import Consultant, ConsultationTime, Reservation
from django.utils import timezone
from accounts.models import UserProfile


class ConsultantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consultant
        fields = ["id", "user", "bio"]


class ConsultantManageTimeSerializer(serializers.ModelSerializer):
    date = serializers.SerializerMethodField()
    time_range = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()

    class Meta:
        model = ConsultationTime
        fields = ["id", "start_time", "end_time", "is_reserved", "date", "time_range", "can_edit"]

    def get_date(self, obj):
        return timezone.localtime(obj.start_time).strftime("%Y-%m-%d")

    def get_time_range(self, obj):
        start = timezone.localtime(obj.start_time).strftime("%H:%M")
        end = timezone.localtime(obj.end_time).strftime("%H:%M")
        return f"{start} تا {end}"

    def get_can_edit(self, obj):
        return obj.can_edit()


class ReservationSerializer(serializers.ModelSerializer):
    consultant = ConsultantSerializer(read_only=True)
    consultant_id = serializers.PrimaryKeyRelatedField(
        queryset=UserProfile.objects.filter(role="consultant"),
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
        read_only_fields = ["user", "created_at"]

    def create(self, validated_data):
        consultant = validated_data.pop("consultant")
        times = validated_data.pop("times", [])
        reservation = Reservation.objects.create(
            user=self.context["request"].user,
            consultant=consultant,
            **validated_data
        )
        # ست کردن تایم‌ها و رزرو آنها
        for time in times:
            time.is_reserved = True
            time.save()
        reservation.times.set(times)
        return reservation


class FreeConsultationCodeSerializer(serializers.Serializer):
    code = serializers.CharField()
    percent = serializers.IntegerField()

class ConsultantWithTimesSerializer(serializers.ModelSerializer):
    times = ConsultantManageTimeSerializer(many=True)

    class Meta:
        model = Consultant
        fields = ["id", "user", "bio", "times"]

