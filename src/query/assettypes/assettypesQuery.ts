import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import type { PaginationFilter } from "../../models/base/PaginationFilter";
import { services } from "../../di/ServiceContainer";
import { creatassettype, updateassettype } from "../../models/Lookup/assettype/assettype";

// =====================================================
// QUERY KEY FACTORY
// =====================================================
export const assettypeKeys = {
  all: ["assettypes"] as const,
  lists: () => [...assettypeKeys.all, "list"] as const,
  list: (params?: PaginationFilter) => [...assettypeKeys.lists(), params] as const,
  details: () => [...assettypeKeys.all, "detail"] as const,
  detail: (id: number | null) => [...assettypeKeys.details(), id] as const,
};

// =====================================================
// QUERIES
// =====================================================

export function useAssetTypeAll() {
  return useQuery({
    queryKey: assettypeKeys.all,
    queryFn: () => services.assetType.getAll(),
  });
}

export function useAssetTypeParams(params?: PaginationFilter) {
  return useQuery({
    queryKey: assettypeKeys.list(params),
    queryFn: () => services.assetType.getByParams(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 3,
  });
}

export function useAssetTypeById(id: number | null) {
  return useQuery({
    queryKey: assettypeKeys.detail(id),
    queryFn: () => {
      if (id === null) throw new Error("Asset Type ID is required");
      return services.assetType.getById(id);
    },
    enabled: id !== null,
  });
}

// =====================================================
// PREFETCH HOOK (Khắc phục lỗi gọi Hook sai vị trí)
// =====================================================

export function usePrefetchAssetTypePage() {
  const queryClient = useQueryClient();

  return (targetPage: number, currentFilter: Omit<PaginationFilter, "PageIndex">) => {
    const filter: PaginationFilter = {
      ...currentFilter,
      PageIndex: targetPage,
    };

    queryClient.prefetchQuery({
      queryKey: assettypeKeys.list(filter),
      queryFn: () => services.assetType.getByParams(filter),
      staleTime: 1000 * 60 * 3,
    });
  };
}

// =====================================================
// MUTATIONS
// =====================================================

export function useCreateAssetType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: creatassettype) => services.assetType.create(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assettypeKeys.all });
    },
  });
}

export function useUpdateAssetType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, params }: { id: number; params: updateassettype }) =>
      services.assetType.update(id, params),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: assettypeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: assettypeKeys.detail(id) });
    },
  });
}

export function useRemoveAssetType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => services.assetType.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assettypeKeys.all });
    },
  });
}