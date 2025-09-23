from rest_framework.permissions import BasePermission

class IsPlatformAdmin(BasePermission):
    """
    فقط مدیر پلتفرم
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'platform_admin'
    
class IsConsultant(BasePermission):
    """
    فقط مشاور
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'consultant'
    
class IsSchoolAdmin(BasePermission):
    """
    فقط مدیر مجموعه ( مدیر مدرسه یا دانشگاه )
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'school_admin'
    
class IsNormalUser(BasePermission):
    """
    فقط کاربر عادی
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'normal'
