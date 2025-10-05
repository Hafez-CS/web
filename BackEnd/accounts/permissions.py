# from rest_framework.permissions import BasePermission

# class IsPlatformAdmin(BasePermission):
#     """
#     فقط مدیر پلتفرم
#     """
#     def has_permission(self, request, view):
#         return request.user.is_authenticated and request.user.role == 'platform_admin'
    
# class IsConsultant(BasePermission):
#     """
#     فقط مشاور
#     """
#     def has_permission(self, request, view):
#         return request.user.is_authenticated and request.user.role == 'consultant'
    
# class IsSchoolAdmin(BasePermission):
#     """
#     فقط مدیر مجموعه ( مدیر مدرسه یا دانشگاه )
#     """
#     def has_permission(self, request, view):
#         return request.user.is_authenticated and request.user.role == 'school_admin'
    
# class IsNormalUser(BasePermission):
#     """
#     فقط کاربر عادی
#     """
#     def has_permission(self, request, view):
#         return request.user.is_authenticated and request.user.role == 'normal'
from rest_framework import permissions
from rest_framework.permissions import BasePermission

class IsConsultant(permissions.BasePermission):
    """فقط مشاورین می‌توانند دسترسی داشته باشند"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'consultant'


class IsPlatformAdmin(permissions.BasePermission):
    """فقط مدیران پلتفرم می‌توانند دسترسی داشته باشند"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'platform_admin'


class IsSchoolAdmin(permissions.BasePermission):
    """فقط مدیران مجموعه می‌توانند دسترسی داشته باشند"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'school_admin'


class IsNormalUser(permissions.BasePermission):
    """فقط کاربران عادی می‌توانند دسترسی داشته باشند"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'normal'