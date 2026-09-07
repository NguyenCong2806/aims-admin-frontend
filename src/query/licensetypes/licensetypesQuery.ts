import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PaginationFilter } from "../../models/base/PaginationFilter";
import { services } from "../../di/ServiceContainer";
import { createlicensetype, updatelicensetype } from "../../models/Lookup/licensetype/licensetype";

export const licensetypeKeys = {
  all: ["licensetypes"] as const,
  lists: () => [...licensetypeKeys.all, "list"] as const,
  list: (params?: PaginationFilter) => [...licensetypeKeys.lists(), params] as const,
  detail: (id: number | null) => [...licensetypeKeys.all, "detail", id] as const,
};

export function useLicenseTypeParams(params?: PaginationFilter) {
  return useQuery({ queryKey: licensetypeKeys.list(params), queryFn: () => services.licenseType.getByParams(params), placeholderData: keepPreviousData, staleTime: 1000 * 60 * 3 });
}

export function useLicenseTypeById(id: number | null) {
  return useQuery({ queryKey: licensetypeKeys.detail(id), queryFn: () => services.licenseType.getById(id as number), enabled: id !== null });
}

export function usePrefetchLicenseTypePage() {
  const queryClient = useQueryClient();
  return (pageIndex: number, currentFilter: Omit<PaginationFilter, "PageIndex">) => {
    const filter = { ...currentFilter, PageIndex: pageIndex };
    queryClient.prefetchQuery({ queryKey: licensetypeKeys.list(filter), queryFn: () => services.licenseType.getByParams(filter), staleTime: 1000 * 60 * 3 });
  };
}

export function useCreateLicenseType() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (params: createlicensetype) => services.licenseType.create(params), onSuccess: () => queryClient.invalidateQueries({ queryKey: licensetypeKeys.all }) });
}

export function useUpdateLicenseType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, params }: { id: number; params: updatelicensetype }) => services.licenseType.update(id, params),
    onSuccess: (_, { id }) => { queryClient.invalidateQueries({ queryKey: licensetypeKeys.lists() }); queryClient.invalidateQueries({ queryKey: licensetypeKeys.detail(id) }); },
  });
}

export function useRemoveLicenseType() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id: number) => services.licenseType.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: licensetypeKeys.all }) });
}