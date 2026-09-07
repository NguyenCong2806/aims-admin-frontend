import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PaginationFilter } from "../../models/base/PaginationFilter";
import { services } from "../../di/ServiceContainer";
import { createlocation, updatelocation } from "../../models/Lookup/location/location";

export const locationKeys = {
  all: ["locations"] as const,
  lists: () => [...locationKeys.all, "list"] as const,
  list: (params?: PaginationFilter) => [...locationKeys.lists(), params] as const,
  detail: (id: number | null) => [...locationKeys.all, "detail", id] as const,
};

export function useLocationParams(params?: PaginationFilter) { return useQuery({ queryKey: locationKeys.list(params), queryFn: () => services.location.getByParams(params), placeholderData: keepPreviousData, staleTime: 1000 * 60 * 3 }); }
export function useLocationAll() { return useQuery({ queryKey: locationKeys.all, queryFn: () => services.location.getAll(), staleTime: 1000 * 60 * 3 }); }
export function useLocationById(id: number | null) { return useQuery({ queryKey: locationKeys.detail(id), queryFn: () => services.location.getById(id as number), enabled: id !== null }); }
export function usePrefetchLocationPage() {
  const queryClient = useQueryClient();
  return (pageIndex: number, currentFilter: Omit<PaginationFilter, "PageIndex">) => { const filter = { ...currentFilter, PageIndex: pageIndex }; queryClient.prefetchQuery({ queryKey: locationKeys.list(filter), queryFn: () => services.location.getByParams(filter), staleTime: 1000 * 60 * 3 }); };
}
export function useCreateLocation() { const queryClient = useQueryClient(); return useMutation({ mutationFn: (params: createlocation) => services.location.create(params), onSuccess: () => queryClient.invalidateQueries({ queryKey: locationKeys.all }) }); }
export function useUpdateLocation() { const queryClient = useQueryClient(); return useMutation({ mutationFn: ({ id, params }: { id: number; params: updatelocation }) => services.location.update(id, params), onSuccess: (_, { id }) => { queryClient.invalidateQueries({ queryKey: locationKeys.lists() }); queryClient.invalidateQueries({ queryKey: locationKeys.detail(id) }); } }); }
export function useRemoveLocation() { const queryClient = useQueryClient(); return useMutation({ mutationFn: (id: number) => services.location.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: locationKeys.all }) }); }