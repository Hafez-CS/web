📌 مستند کامل API‌ها
1. FreeConsultationCodeView

URL: POST /api/consultation/free-code/

Role: Authenticated User (کاربر عادی)

Request Body: (هیچ پارامتری نیاز نیست)

Response Sample:
```json
{
  "code": "FREE123",
  "discount": "100%",
  "usable_once": true
}
```

2. SingleConsultationTimesView

URL: GET /api/consultation/single-times/

Role: Authenticated User

Params: ندارد

Response: لیست تایم‌های آزاد برای تک‌جلسه (همه مشاوران یا مشاور خاص؟ → طبق نسخه قبلی فقط یک مشاور خاص رو میاره)
```json
[
  {
    "id": 12,
    "start_time": "2025-10-05T10:00:00Z",
    "end_time": "2025-10-05T11:00:00Z",
    "is_reserved": false
  }
]
```

3. ConsultantAvailableTimesView

URL: GET /api/consultation/consultant/<consultant_id>/times/

Role: Authenticated User

Params:

consultant_id → شناسه مشاور در URL

Response: همه تایم‌های آزاد یک مشاور خاص
```json
{
  "consultant": "دکتر احمدی",
  "times": [
    {
      "id": 21,
      "start_time": "2025-10-06T14:00:00Z",
      "end_time": "2025-10-06T15:00:00Z",
      "is_reserved": false
    }
  ]
}
```

4. PackageConsultantsView

URL: GET /api/consultation/package-consultants/

Role: Authenticated User

Params: ندارد

Response: لیست مشاورانی که حداقل ۵ تایم آزاد دارن
```json
[
  {
    "id": 3,
    "name": "دکتر رضایی",
    "specialty": "مشاور تحصیلی",
    "free_times_count": 7
  }
]
```

5. ReserveConsultationView

URL: POST /api/consultation/reserve/

Role: Authenticated User

Request Body:
```json
{
  "consultant_id": 3,
  "type": "SINGLE",   // FREE | SINGLE | PACKAGE
  "time_id": 21       // فقط برای SINGLE و FREE
}
```

Response:
```json
{
  "id": 101,
  "user": 5,
  "consultant": {"id": 3, "name": "دکتر رضایی"},
  "type": "SINGLE",
  "times": [
    {
      "id": 21,
      "start_time": "2025-10-06T14:00:00Z",
      "end_time": "2025-10-06T15:00:00Z"
    }
  ],
  "created_at": "2025-09-30T12:00:00Z",
  "is_completed_by_user": false,
  "is_completed_by_consultant": false
}
```

6. MyReservationsView

URL: GET /api/consultation/my-reservations/

Role: Authenticated User

Response: رزروهای فعال کاربر
```json
[
  {
    "id": 101,
    "consultant": {"id": 3, "name": "دکتر رضایی"},
    "type": "PACKAGE",
    "times": [...]
  }
]
```
7. MyCompletedReservationsView

URL: GET /api/consultation/my-completed/

Role: Authenticated User

Response: رزروهای تکمیل‌شده
```json
[
  {
    "id": 88,
    "consultant": {"id": 2, "name": "دکتر احمدی"},
    "type": "SINGLE",
    "times": [...]
  }
]
```
8. CompleteByUserView

URL: POST /api/consultation/complete/<pk>/

Role: Authenticated User (کاربر رزروکننده)

Params:

pk → ID رزرو

Response:
```json
{"detail": "جلسه توسط کاربر تکمیل شد."}
```
9. CompleteByConsultantView

URL: POST /api/consultation/complete-by-consultant/<pk>/

Role: Consultant (خود مشاور)

Params:

pk → ID رزرو

Response:
```json
{"detail": "جلسه توسط مشاور تکمیل شد."}
```
10. ConsultantTimeListCreateView

URL: GET /api/consultation/consultant/times/ → لیست تایم‌های خود مشاور

URL: POST /api/consultation/consultant/times/ → اضافه کردن تایم جدید

Role: Consultant

POST Request Body:
```json
{
  "start_time": "2025-10-07T09:00:00Z",
  "end_time": "2025-10-07T10:00:00Z"
}
```

Response:
```json
{
  "id": 33,
  "start_time": "2025-10-07T09:00:00Z",
  "end_time": "2025-10-07T10:00:00Z",
  "is_reserved": false
}
```
11. ConsultantTimeUpdateDeleteView

URL: PUT /api/consultation/consultant/times/<pk>/

URL: DELETE /api/consultation/consultant/times/<pk>/

Role: Consultant

PUT Request Body:
```json
{
  "start_time": "2025-10-08T09:00:00Z",
  "end_time": "2025-10-08T10:00:00Z"
}
```

Response:
```json
{
  "id": 33,
  "start_time": "2025-10-08T09:00:00Z",
  "end_time": "2025-10-08T10:00:00Z",
  "is_reserved": false
}
```
12. SingleConsultantsWithTimesView

URL: GET /api/consultation/single-consultants/

Role: Authenticated User

Response: لیست مشاورانی که حداقل ۱ تایم آزاد دارن + تایم‌های آزادشون
```json
[
  {
    "id": 3,
    "name": "دکتر احمدی",
    "specialty": "روانشناس",
    "times": [
      {
        "id": 40,
        "start_time": "2025-10-05T10:00:00Z",
        "end_time": "2025-10-05T11:00:00Z"
      }
    ]
  }
]
```