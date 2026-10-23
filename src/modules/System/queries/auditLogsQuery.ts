import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { services } from "../../../di/ServiceContainer";
import { AuditLogFilter } from "../models/AuditLogDto";

export const auditLogKeys = {
  all: ["audit-logs"] as const,
  lists: () => [...auditLogKeys.all, "list"] as const,
  list: (filter?: AuditLogFilter) => [...auditLogKeys.lists(), filter] as const,
  detail: (id: string | null) => [...auditLogKeys.all, "detail", id] as const,
};

export function useAuditLogs(filter?: AuditLogFilter) {
  return useQuery({
    queryKey: auditLogKeys.list(filter),
    queryFn: () => services.auditLog.getPaged(filter),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30, // 30s
  });
}

export function useAuditLogById(id: string | null) {
  return useQuery({
    queryKey: auditLogKeys.detail(id),
    queryFn: () => (id ? services.auditLog.getById(id) : null),
    enabled: !!id,
    staleTime: 1000 * 60 * 3,
  });
}
