import { useQuery } from "@tanstack/react-query";
import { SystemLogFilter } from "../../models/SystemLog/systemLog";
import { systemLogService } from "../../services/SystemLog/systemLogService";

export const SYSTEM_LOG_KEYS = {
  all: ["system-logs"] as const,
  list: (filter: SystemLogFilter) => ["system-logs", "list", filter] as const,
  detail: (id: string | null) => ["system-logs", "detail", id] as const,
};

export const useSystemLogs = (filter: SystemLogFilter) => {
  return useQuery({
    queryKey: SYSTEM_LOG_KEYS.list(filter),
    queryFn: () => systemLogService.getByParams(filter),
    staleTime: 1000 * 30, // 30s
  });
};

export const useSystemLogById = (id: string | null) => {
  return useQuery({
    queryKey: SYSTEM_LOG_KEYS.detail(id),
    queryFn: () => (id ? systemLogService.getById(id) : null),
    enabled: !!id,
  });
};
