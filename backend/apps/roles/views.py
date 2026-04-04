from rest_framework import viewsets, permissions
from .models import Role, Permission, UserRole
from .serializers import RoleSerializer, RoleWriteSerializer, PermissionSerializer, UserRoleSerializer


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return RoleWriteSerializer
        return RoleSerializer


class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserRoleViewSet(viewsets.ModelViewSet):
    queryset = UserRole.objects.select_related('role', 'user').all()
    serializer_class = UserRoleSerializer
    permission_classes = [permissions.IsAuthenticated]
