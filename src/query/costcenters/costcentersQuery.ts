import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PaginationFilter } from "../../models/base/PaginationFilter";
import { services } from "../../di/ServiceContainer";
import { createcostcenter, updatecostcenter } from "../../models/Lookup/costcenter/costcenter";

export const costcenterKeys = {
  all: ["costcenters"] as const,
  lists: () => [...costcenterKeys.all, "list"] as const,
  list: (params?: PaginationFilter) => [...costcenterKeys.lists(), params] as const,
  details: () => [...costcenterKeys.all, "detail"] as const,
  detail: (id: number | null) => [...costcenterKeys.details(), id] as const,
};

export function useCostCenterParams(params?: PaginationFilter) {
  return useQuery({
    queryKey: costcenterKeys.list(params),
    queryFn: () => services.costCenter.getByParams(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 3,
  });
}

export function useCostCenterById(id: number | null) {
  return useQuery({
    queryKey: costcenterKeys.detail(id),
    queryFn: () => services.costCenter.getById(id as number),
    enabled: id !== null,
  });
}

export function usePrefetchCostCenterPage() {
  const queryClient = useQueryClient();
  return (pageIndex: number, currentFilter: Omit<PaginationFilter, "PageIndex">) => {
    const filter = { ...currentFilter, PageIndex: pageIndex };
    queryClient.prefetchQuery({
      queryKey: costcenterKeys.list(filter),
      queryFn: () => services.costCenter.getByParams(filter),
      staleTime: 1000 * 60 * 3,
    });
  };
}

export function useCreateCostCenter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: createcostcenter) => services.costCenter.create(params),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: costcenterKeys.all }),
  });
}

export function useUpdateCostCenter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, params }: { id: number; params: updatecostcenter }) => services.costCenter.update(id, params),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: costcenterKeys.lists() });
      queryClient.invalidateQueries({ queryKey: costcenterKeys.detail(id) });
    },
  });
}

export function useRemoveCostCenter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => services.costCenter.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: costcenterKeys.all }),
  });
}