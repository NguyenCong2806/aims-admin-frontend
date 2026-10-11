import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import type { PaginationFilter } from "../../models/base/PaginationFilter";
import type {
  creatbrand,
  updatebrand,
} from "../../models/Lookup/brand/brand";
import { services } from "../../di/ServiceContainer";

// =====================================================
// QUERY KEY FACTORY
// =====================================================
export const brandKeys = {
  all: ["brands"] as const,
  lists: () => [...brandKeys.all, "list"] as const,
  list: (params?: PaginationFilter) => [...brandKeys.lists(), params] as const,
  details: () => [...brandKeys.all, "detail"] as const,
  detail: (id: number | null) => [...brandKeys.details(), id] as const,
};

// =====================================================
// QUERIES
// =====================================================

export function useBrandAll() {
  return useQuery({
    queryKey: brandKeys.all,
    queryFn: () => services.brand.getAll(),
  });
}

export function useBrandParams(params?: PaginationFilter) {
  return useQuery({
    queryKey: brandKeys.list(params),
    queryFn: () => services.brand.getByParams(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 3,
  });
}

export function useBrandById(id: number | null) {
  return useQuery({
    queryKey: brandKeys.detail(id),
    queryFn: () => {
      if (id === null) throw new Error("Brand ID is required");
      return services.brand.getById(id);
    },
    enabled: id !== null,
  });
}

// =====================================================
// PREFETCH HOOK (Khắc phục lỗi gọi Hook sai vị trí)
// =====================================================

export function usePrefetchBrandPage() {
  const queryClient = useQueryClient();

  return (targetPage: number, currentFilter: Omit<PaginationFilter, "PageIndex">) => {
    const filter: PaginationFilter = {
      ...currentFilter,
      PageIndex: targetPage,
    };

    queryClient.prefetchQuery({
      queryKey: brandKeys.list(filter),
      queryFn: () => services.brand.getByParams(filter),
      staleTime: 1000 * 60 * 3,
    });
  };
}

// =====================================================
// MUTATIONS
// =====================================================

export function useCreateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: creatbrand) => services.brand.create(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
    },
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, params }: { id: number; params: updatebrand }) =>
      services.brand.update(id, params),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: brandKeys.lists() });
      queryClient.invalidateQueries({ queryKey: brandKeys.detail(id) });
    },
  });
}

export function useRemoveBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => services.brand.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
    },
  });
}