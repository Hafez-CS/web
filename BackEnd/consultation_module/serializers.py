from rest_framework import serializers
from .models import Consultant, ConsultationTime, Reservation


class ConsultantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consultant
        fields = ["id", "user", "bio"]


class ConsultationTimeSerializer(serializers.ModelSerializer):
    consultant = ConsultantSerializer()

    class Meta:
        model = ConsultationTime
        fields = ["id", "consultant", "start_time", "end_time", "is_reserved"]


class ReservationSerializer(serializers.ModelSerializer):
    consultant = ConsultantSerializer()
    times = ConsultationTimeSerializer(many=True)

    class Meta:
        model = Reservation
        fields = [
            "id",
            "user",
            "consultant",
            "type",
            "times",
            "created_at",
            "is_completed_by_user",
            "is_completed_by_consultant",
        ]


class ReservationCreateSerializer(serializers.Serializer):
    consultant_id = serializers.IntegerField()
    type = serializers.ChoiceField(choices=["FREE", "SINGLE", "PACKAGE"])
    time_id = serializers.IntegerField(required=False)  # فقط برای SINGLE


class FreeConsultationCodeSerializer(serializers.Serializer):
    code = serializers.CharField()
    percent = serializers.IntegerField()
