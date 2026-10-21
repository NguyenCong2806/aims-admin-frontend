import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import type { PaginationFilter } from "../../models/base/PaginationFilter";
import type { HardwareAssetObject } from "../../models/Hardware/hardwareAsset";
import { services } from "../../di/ServiceContainer";

// =====================================================
// QUERY KEY FACTORY
// =====================================================
export const hardwareAssetsKeys = {
  all: ["hardwareAssets"] as const,
  lists: () => [...hardwareAssetsKeys.all, "list"] as const,
  list: (params?: PaginationFilter) => [...hardwareAssetsKeys.lists(), params] as const,
  details: () => [...hardwareAssetsKeys.all, "detail"] as const,
  detail: (id: string | null) => [...hardwareAssetsKeys.details(), id] as const,
};

// =====================================================
// QUERIES
// =====================================================

/**
 * Lấy danh sách thiết bị phần cứng có phân trang & tìm kiếm từ API /hardware_assets/get-hardware-assets-paged
 */
export function useHardwareAssetsPaged(params?: PaginationFilter) {
  return useQuery({
    queryKey: hardwareAssetsKeys.list(params),
    queryFn: () => services.hardwareAsset.getPaged(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 3,
  });
}

/**
 * Lấy thông tin chi tiết một thiết bị phần cứng theo Id
 */
export function useHardwareAssetById(id: string | null) {
  return useQuery({
    queryKey: hardwareAssetsKeys.detail(id),
    queryFn: () => {
      if (!id) throw new Error("Hardware Asset ID is required");
      return services.hardwareAsset.getById(id);
    },
    enabled: !!id,
  });
}

// =====================================================
// MUTATIONS
// =====================================================

export function useCreateHardwareAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: Partial<HardwareAssetObject>) => services.hardwareAsset.createHardwareAsset(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hardwareAssetsKeys.all });
    },
  });
}

export function useUpdateHardwareAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: Partial<HardwareAssetObject> }) =>
      services.hardwareAsset.update(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hardwareAssetsKeys.all });
    },
  });
}

export function useDeleteHardwareAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => services.hardwareAsset.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hardwareAssetsKeys.all });
    },
  });
}

// =====================================================
// PREFETCH HOOK
// =====================================================

export function usePrefetchHardwareAssetsPage() {
  const queryClient = useQueryClient();

  return (targetPage: number, currentFilter: Omit<PaginationFilter, "PageIndex">) => {
    const filter: PaginationFilter = {
      ...currentFilter,
      PageIndex: targetPage,
    };

    queryClient.prefetchQuery({
      queryKey: hardwareAssetsKeys.list(filter),
      queryFn: () => services.hardwareAsset.getPaged(filter),
      staleTime: 1000 * 60 * 3,
    });
  };
}

// Alias tương thích ngược
export const useHardwareAssetsParams = useHardwareAssetsPaged;
