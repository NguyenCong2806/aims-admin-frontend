import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PaginationFilter } from "../../models/base/PaginationFilter";
import { services } from "../../di/ServiceContainer";
import { createmaintenancetype, updatemaintenancetype } from "../../models/Lookup/maintenancetype/maintenancetype";

export const maintenancetypeKeys = {
  all: ["maintenancetypes"] as const,
  lists: () => [...maintenancetypeKeys.all, "list"] as const,
  list: (params?: PaginationFilter) => [...maintenancetypeKeys.lists(), params] as const,
  detail: (id: number | null) => [...maintenancetypeKeys.all, "detail", id] as const,
};

export function useMaintenanceTypeParams(params?: PaginationFilter) {
  return useQuery({ queryKey: maintenancetypeKeys.list(params), queryFn: () => services.maintenanceType.getByParams(params), placeholderData: keepPreviousData, staleTime: 1000 * 60 * 3 });
}

export function useMaintenanceTypeById(id: number | null) {
  return useQuery({ queryKey: maintenancetypeKeys.detail(id), queryFn: () => services.maintenanceType.getById(id as number), enabled: id !== null });
}

export function usePrefetchMaintenanceTypePage() {
  const queryClient = useQueryClient();
  return (pageIndex: number, currentFilter: Omit<PaginationFilter, "PageIndex">) => {
    const filter = { ...currentFilter, PageIndex: pageIndex };
    queryClient.prefetchQuery({ queryKey: maintenancetypeKeys.list(filter), queryFn: () => services.maintenanceType.getByParams(filter), staleTime: 1000 * 60 * 3 });
  };
}

export function useCreateMaintenanceType() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (params: createmaintenancetype) => services.maintenanceType.create(params), onSuccess: () => queryClient.invalidateQueries({ queryKey: maintenancetypeKeys.all }) });
}

export function useUpdateMaintenanceType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, params }: { id: number; params: updatemaintenancetype }) => services.maintenanceType.update(id, params),
    onSuccess: (_, { id }) => { queryClient.invalidateQueries({ queryKey: maintenancetypeKeys.lists() }); queryClient.invalidateQueries({ queryKey: maintenancetypeKeys.detail(id) }); },
  });
}

export function useRemoveMaintenanceType() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id: number) => services.maintenanceType.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: maintenancetypeKeys.all }) });
}