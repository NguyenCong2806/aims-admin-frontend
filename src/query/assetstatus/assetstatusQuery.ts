import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import type { PaginationFilter } from "../../models/base/PaginationFilter";
import { services } from "../../di/ServiceContainer";
import { createassetstatus, updateassetstatus } from "../../models/Lookup/assetstatus/assetstatus";

// =====================================================
// QUERY KEY FACTORY
// =====================================================
export const assetstatusKeys = {
  all: ["assetstatuses"] as const,
  lists: () => [...assetstatusKeys.all, "list"] as const,
  list: (params?: PaginationFilter) => [...assetstatusKeys.lists(), params] as const,
  details: () => [...assetstatusKeys.all, "detail"] as const,
  detail: (id: number | null) => [...assetstatusKeys.details(), id] as const,
};

// =====================================================
// QUERIES
// =====================================================

export function useAssetStatusAll() {
  return useQuery({
    queryKey: assetstatusKeys.all,
    queryFn: () => services.assetStatus.getAll(),
  });
}

export function useAssetStatusParams(params?: PaginationFilter) {
  return useQuery({
    queryKey: assetstatusKeys.list(params),
    queryFn: () => services.assetStatus.getByParams(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 3,
  });
}

export function useAssetStatusById(id: number | null) {
  return useQuery({
    queryKey: assetstatusKeys.detail(id),
    queryFn: () => {
      if (id === null) throw new Error("Asset Status ID is required");
      return services.assetStatus.getById(id);
    },
    enabled: id !== null,
  });
}

// =====================================================
// PREFETCH HOOK (Khắc phục lỗi gọi Hook sai vị trí)
// =====================================================

export function usePrefetchAssetStatusPage() {
  const queryClient = useQueryClient();

  return (targetPage: number, currentFilter: Omit<PaginationFilter, "PageIndex">) => {
    const filter: PaginationFilter = {
      ...currentFilter,
      PageIndex: targetPage,
    };

    queryClient.prefetchQuery({
      queryKey: assetstatusKeys.list(filter),
      queryFn: () => services.assetStatus.getByParams(filter),
      staleTime: 1000 * 60 * 3,
    });
  };
}

// =====================================================
// MUTATIONS
// =====================================================

export function useCreateAssetStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: createassetstatus) => services.assetStatus.create(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetstatusKeys.all });
    },
  });
}

export function useUpdateAssetStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, params }: { id: number; params: updateassetstatus }) =>
      services.assetStatus.update(id, params),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: assetstatusKeys.lists() });
      queryClient.invalidateQueries({ queryKey: assetstatusKeys.detail(id) });
    },
  });
}

export function useRemoveAssetStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => services.assetStatus.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetstatusKeys.all });
    },
  });
}