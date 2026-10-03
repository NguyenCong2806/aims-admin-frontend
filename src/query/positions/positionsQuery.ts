import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PaginationFilter } from "../../models/base/PaginationFilter";
import { services } from "../../di/ServiceContainer";
import { createposition, updateposition } from "../../models/Lookup/position/position";

export const positionKeys = {
  all: ["positions"] as const,
  lists: () => [...positionKeys.all, "list"] as const,
  list: (params?: PaginationFilter) => [...positionKeys.lists(), params] as const,
  detail: (id: number | null) => [...positionKeys.all, "detail", id] as const,
};

export function usePositionParams(params?: PaginationFilter) {
  return useQuery({ queryKey: positionKeys.list(params), queryFn: () => services.position.getByParams(params), placeholderData: keepPreviousData, staleTime: 1000 * 60 * 3 });
}

export function usePositionAll() {
  return useQuery({ queryKey: positionKeys.all, queryFn: () => services.position.getAll(), staleTime: 1000 * 60 * 3 });
}

export function usePositionById(id: number | null) {
  return useQuery({ queryKey: positionKeys.detail(id), queryFn: () => services.position.getById(id as number), enabled: id !== null });
}

export function usePrefetchPositionPage() {
  const queryClient = useQueryClient();
  return (pageIndex: number, currentFilter: Omit<PaginationFilter, "PageIndex">) => {
    const filter = { ...currentFilter, PageIndex: pageIndex };
    queryClient.prefetchQuery({ queryKey: positionKeys.list(filter), queryFn: () => services.position.getByParams(filter), staleTime: 1000 * 60 * 3 });
  };
}

export function useCreatePosition() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (params: createposition) => services.position.create(params), onSuccess: () => queryClient.invalidateQueries({ queryKey: positionKeys.all }) });
}

export function useUpdatePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, params }: { id: number; params: updateposition }) => services.position.update(id, params),
    onSuccess: (_, { id }) => { queryClient.invalidateQueries({ queryKey: positionKeys.lists() }); queryClient.invalidateQueries({ queryKey: positionKeys.detail(id) }); },
  });
}

export function useRemovePosition() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id: number) => services.position.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: positionKeys.all }) });
}