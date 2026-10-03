import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import type { PaginationFilter } from "../../models/base/PaginationFilter";
import { services } from "../../di/ServiceContainer";
import { creatassetcategorie, updateassetcategorie } from "../../models/Lookup/assetcategorie/assetcategorie";

// =====================================================
// QUERY KEY FACTORY
// =====================================================
export const assetcategorieKeys = {
  all: ["assetcategories"] as const,
  lists: () => [...assetcategorieKeys.all, "list"] as const,
  list: (params?: PaginationFilter) => [...assetcategorieKeys.lists(), params] as const,
  details: () => [...assetcategorieKeys.all, "detail"] as const,
  detail: (id: number | null) => [...assetcategorieKeys.details(), id] as const,
};

// =====================================================
// QUERIES
// =====================================================

export function useAssetCategoryAll() {
  return useQuery({
    queryKey: assetcategorieKeys.all,
    queryFn: () => services.assetCategory.getAll(),
  });
}

export function useAssetCategoryParams(params?: PaginationFilter) {
  return useQuery({
    queryKey: assetcategorieKeys.list(params),
    queryFn: () => services.assetCategory.getByParams(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 3,
  });
}

export function useAssetCategoryById(id: number | null) {
  return useQuery({
    queryKey: assetcategorieKeys.detail(id),
    queryFn: () => {
      if (id === null) throw new Error("Asset Category ID is required");
      return services.assetCategory.getById(id);
    },
    enabled: id !== null,
  });
}

// =====================================================
// PREFETCH HOOK (Khắc phục lỗi gọi Hook sai vị trí)
// =====================================================

export function usePrefetchAssetCategoryPage() {
  const queryClient = useQueryClient();

  return (targetPage: number, currentFilter: Omit<PaginationFilter, "PageIndex">) => {
    const filter: PaginationFilter = {
      ...currentFilter,
      PageIndex: targetPage,
    };

    queryClient.prefetchQuery({
      queryKey: assetcategorieKeys.list(filter),
      queryFn: () => services.assetCategory.getByParams(filter),
      staleTime: 1000 * 60 * 3,
    });
  };
}

// =====================================================
// MUTATIONS
// =====================================================

export function useCreateAssetCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: creatassetcategorie) => services.assetCategory.create(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetcategorieKeys.all });
    },
  });
}

export function useUpdateAssetCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, params }: { id: number; params: updateassetcategorie }) =>
      services.assetCategory.update(id, params),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: assetcategorieKeys.lists() });
      queryClient.invalidateQueries({ queryKey: assetcategorieKeys.detail(id) });
    },
  });
}

export function useRemoveAssetCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => services.assetCategory.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetcategorieKeys.all });
    },
  });
}