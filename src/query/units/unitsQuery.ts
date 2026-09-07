import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PaginationFilter } from "../../models/base/PaginationFilter";
import { services } from "../../di/ServiceContainer";
import { createunit, updateunit } from "../../models/Lookup/unit/unit";

export const unitKeys = {
  all: ["units"] as const,
  lists: () => [...unitKeys.all, "list"] as const,
  list: (params?: PaginationFilter) => [...unitKeys.lists(), params] as const,
  detail: (id: number | null) => [...unitKeys.all, "detail", id] as const,
};

export function useUnitParams(params?: PaginationFilter) {
  return useQuery({ queryKey: unitKeys.list(params), queryFn: () => services.unit.getByParams(params), placeholderData: keepPreviousData, staleTime: 1000 * 60 * 3 });
}

export function useUnitById(id: number | null) {
  return useQuery({ queryKey: unitKeys.detail(id), queryFn: () => services.unit.getById(id as number), enabled: id !== null });
}

export function usePrefetchUnitPage() {
  const queryClient = useQueryClient();
  return (pageIndex: number, currentFilter: Omit<PaginationFilter, "PageIndex">) => {
    const filter = { ...currentFilter, PageIndex: pageIndex };
    queryClient.prefetchQuery({ queryKey: unitKeys.list(filter), queryFn: () => services.unit.getByParams(filter), staleTime: 1000 * 60 * 3 });
  };
}

export function useCreateUnit() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (params: createunit) => services.unit.create(params), onSuccess: () => queryClient.invalidateQueries({ queryKey: unitKeys.all }) });
}

export function useUpdateUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, params }: { id: number; params: updateunit }) => services.unit.update(id, params),
    onSuccess: (_, { id }) => { queryClient.invalidateQueries({ queryKey: unitKeys.lists() }); queryClient.invalidateQueries({ queryKey: unitKeys.detail(id) }); },
  });
}

export function useRemoveUnit() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id: number) => services.unit.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: unitKeys.all }) });
}