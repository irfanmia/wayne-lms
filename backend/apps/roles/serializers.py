from rest_framework import serializers
from .models import Role, Permission, RolePermission, UserRole


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = '__all__'


class RolePermissionSerializer(serializers.ModelSerializer):
    permission = PermissionSerializer(read_only=True)

    class Meta:
        model = RolePermission
        fields = ['id', 'permission']


class RoleSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = Role
        fields = ['id', 'name', 'description', 'is_system', 'created_at', 'permissions']

    def get_permissions(self, obj):
        rps = obj.role_permissions.select_related('permission').all()
        return PermissionSerializer([rp.permission for rp in rps], many=True).data


class RoleWriteSerializer(serializers.ModelSerializer):
    permission_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)

    class Meta:
        model = Role
        fields = ['id', 'name', 'description', 'is_system', 'permission_ids']

    def create(self, validated_data):
        perm_ids = validated_data.pop('permission_ids', [])
        role = Role.objects.create(**validated_data)
        for pid in perm_ids:
            RolePermission.objects.create(role=role, permission_id=pid)
        return role

    def update(self, instance, validated_data):
        perm_ids = validated_data.pop('permission_ids', None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        if perm_ids is not None:
            instance.role_permissions.all().delete()
            for pid in perm_ids:
                RolePermission.objects.create(role=instance, permission_id=pid)
        return instance


class UserRoleSerializer(serializers.ModelSerializer):
    role_detail = RoleSerializer(source='role', read_only=True)
    custom_permission_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Permission.objects.all(), source='custom_permissions', required=False
    )

    class Meta:
        model = UserRole
        fields = ['id', 'user', 'role', 'role_detail', 'custom_permissions', 'custom_permission_ids']
        read_only_fields = ['custom_permissions']
