from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import UserProfile

class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = UserProfile
        fields = ('email', 'username', 'role')

class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = UserProfile
        fields = ('email', 'username', 'role', 'password')

class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = UserProfile

    list_display = ('email', 'username', 'role', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active')

    fieldsets = (
        (None, {"fields": ("email", "username", "password")}),
        ("اطلاعات شخصی", {"fields": ("first_name", "last_name", "bio", "role")}),
        ("دسترسی‌ها", {"fields": ("is_staff", "is_active", "is_superuser", "groups", "user_permissions")}),
        ("تاریخ‌ها", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "username", "role", "password1", "password2", "is_staff", "is_active"),
        }),
    )

    search_fields = ("email",)
    ordering = ("email",)

admin.site.register(UserProfile, CustomUserAdmin)
