import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { services } from "../../di/ServiceContainer";
import { AppRole } from "../../models/Permission/permissionModel";

export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  detail: (id: string | null) => [...roleKeys.all, "detail", id] as const,
  modules: ["permission-modules"] as const,
};

export function useRoles() {
  return useQuery({
    queryKey: roleKeys.lists(),
    queryFn: () => services.permission.getRoles(),
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useRoleById(roleId: string | null) {
  return useQuery({
    queryKey: roleKeys.detail(roleId),
    queryFn: () => (roleId ? services.permission.getRoleById(roleId) : null),
    enabled: !!roleId,
  });
}

export function usePermissionModules() {
  return useQuery({
    queryKey: roleKeys.modules,
    queryFn: () => services.permission.getModules(),
    staleTime: 1000 * 60 * 5, // 5 minutes (ít khi đổi)
  });
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissions }: { roleId: string; permissions: string[] }) =>
      services.permission.updateRolePermissions(roleId, permissions),
    onSuccess: (updatedRole: AppRole) => {
      queryClient.setQueryData<AppRole[]>(roleKeys.lists(), (old) => {
        if (!old) return [updatedRole];
        return old.map((r) => (r.id === updatedRole.id ? updatedRole : r));
      });
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(updatedRole.id) });
    },
  });
}

export function useTogglePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: string; permissionId: string }) =>
      services.permission.togglePermission(roleId, permissionId),
    onSuccess: (updatedRole: AppRole) => {
      queryClient.setQueryData<AppRole[]>(roleKeys.lists(), (old) => {
        if (!old) return [updatedRole];
        return old.map((r) => (r.id === updatedRole.id ? updatedRole : r));
      });
    },
  });
}

export function useToggleModulePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleId,
      moduleKey,
      grantAll,
    }: {
      roleId: string;
      moduleKey: string;
      grantAll: boolean;
    }) => services.permission.toggleModulePermissions(roleId, moduleKey, grantAll),
    onSuccess: (updatedRole: AppRole) => {
      queryClient.setQueryData<AppRole[]>(roleKeys.lists(), (old) => {
        if (!old) return [updatedRole];
        return old.map((r) => (r.id === updatedRole.id ? updatedRole : r));
      });
    },
  });
}
