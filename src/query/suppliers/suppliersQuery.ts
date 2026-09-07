import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PaginationFilter } from "../../models/base/PaginationFilter";
import { services } from "../../di/ServiceContainer";
import { createsupplier, updatesupplier } from "../../models/Lookup/supplier/supplier";

export const supplierKeys = {
  all: ["suppliers"] as const,
  lists: () => [...supplierKeys.all, "list"] as const,
  list: (params?: PaginationFilter) => [...supplierKeys.lists(), params] as const,
  detail: (id: number | null) => [...supplierKeys.all, "detail", id] as const,
};

export function useSupplierParams(params?: PaginationFilter) {
  return useQuery({ queryKey: supplierKeys.list(params), queryFn: () => services.supplier.getByParams(params), placeholderData: keepPreviousData, staleTime: 1000 * 60 * 3 });
}

export function useSupplierById(id: number | null) {
  return useQuery({ queryKey: supplierKeys.detail(id), queryFn: () => services.supplier.getById(id as number), enabled: id !== null });
}

export function usePrefetchSupplierPage() {
  const queryClient = useQueryClient();
  return (pageIndex: number, currentFilter: Omit<PaginationFilter, "PageIndex">) => {
    const filter = { ...currentFilter, PageIndex: pageIndex };
    queryClient.prefetchQuery({ queryKey: supplierKeys.list(filter), queryFn: () => services.supplier.getByParams(filter), staleTime: 1000 * 60 * 3 });
  };
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (params: createsupplier) => services.supplier.create(params), onSuccess: () => queryClient.invalidateQueries({ queryKey: supplierKeys.all }) });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, params }: { id: number; params: updatesupplier }) => services.supplier.update(id, params),
    onSuccess: (_, { id }) => { queryClient.invalidateQueries({ queryKey: supplierKeys.lists() }); queryClient.invalidateQueries({ queryKey: supplierKeys.detail(id) }); },
  });
}

export function useRemoveSupplier() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id: number) => services.supplier.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: supplierKeys.all }) });
}