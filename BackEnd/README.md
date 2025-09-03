# Django REST API with JWT Auth & Swagger (SQLite Version)

این پروژه یک وب‌اپلیکیشن Django است که امکانات زیر را فراهم می‌کند:
- ثبت‌نام و ورود کاربران (JWT)
- پروفایل کاربری
- مستندات Swagger UI با drf-spectacular
- دیتابیس SQLite (نیاز به هیچ سرویس جداگانه ندارد)

---

## 🚀 اجرا با Docker

### پیش‌نیازها
- Docker
- Docker Compose

### مراحل
1. کلون کردن پروژه:
   ```bash
   git clone https://github.com/Parsa-developer/User-Profile

2. ساخت و ران کانتینر:

docker-compose up --build


3. اجرای مایگریشن‌ها:

docker-compose run web python manage.py migrate


4. ایجاد سوپریوزر:

docker-compose run web python manage.py createsuperuser

## 📡 دسترسی به API

ثبت‌نام: http://localhost:8000/api/accounts/register/

ورود: http://localhost:8000/api/accounts/login/

پروفایل: http://localhost:8000/api/accounts/profile/

Swagger UI: http://localhost:8000/api/docs/

## 🛠️ توسعه

برای اجرای دستورات Django داخل کانتینر:

docker-compose run web python manage.py makemigrations
docker-compose run web python manage.py migrate

## 🗄️ دیتابیس

SQLite3 (فایل db.sqlite3 داخل ریشه پروژه ذخیره می‌شود)


---

🔑 با این تنظیمات، کانتینر فقط یک سرویس `web` خواهد داشت و دیتابیس SQLite به طور پیش‌فرض روی فایل `db.sqlite3` داخل پروژه نگهداری میشه.  

می‌خوای من برات همین ساختار (پوشه با Dockerfile + docker-compose.yml + README + requirements.txt) رو به شکل یک فایل **zip آماده دانلود** بسازم؟
