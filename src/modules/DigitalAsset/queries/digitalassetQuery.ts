import {

  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import type { PaginationFilter } from "../../base/models/PaginationFilter";
import { services } from "../../../di/ServiceContainer";
import { DigitalAssetObject } from "../models/digitalAsset";

export const digitalAssetKeys = {
  all: ["digitalAssets"] as const,
  lists: () => [...digitalAssetKeys.all, "list"] as const,
  list: (params?: PaginationFilter) => [...digitalAssetKeys.lists(), params] as const,
  details: () => [...digitalAssetKeys.all, "detail"] as const,
  detail: (id: string | null) => [...digitalAssetKeys.details(), id] as const,
};
export const useCreateDigitalAsset = () => useAddDigitalAsset();
export function useAddDigitalAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DigitalAssetObject) => services.digitalAsset.create(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: digitalAssetKeys.all });
    },
  });
}
/// get dữ liệu dự vào filter ///

export function useDigitalAssetParams(params?: PaginationFilter) {
  return useQuery({
    queryKey: digitalAssetKeys.list(params),
    queryFn: () => services.digitalAsset.getDigitalAssetsByParams(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 3,
  });
}

export function useDigitalAssetById(id: string | null) {
  return useQuery({
    queryKey: digitalAssetKeys.detail(id),
    queryFn: () => {
      if (id === null) throw new Error("Digital Asset ID is required");
      return services.digitalAsset.getById(id);
    },
    enabled: id !== null,
  });
}

export function usePrefetchDigitalAssetPage() {
  const queryClient = useQueryClient();

  return (targetPage: number, currentFilter: Omit<PaginationFilter, "PageIndex">) => {
    const filter: PaginationFilter = {
      ...currentFilter,
      PageIndex: targetPage,
    };

    queryClient.prefetchQuery({
      queryKey: digitalAssetKeys.list(filter),
      queryFn: () => services.digitalAsset.getByParams(filter),
      staleTime: 1000 * 60 * 3,
    });
  };
}

export function useUpdateDigitalAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, params }: { id: string; params: DigitalAssetObject }) =>
      services.digitalAsset.update(id, params),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: digitalAssetKeys.lists() });
      queryClient.invalidateQueries({ queryKey: digitalAssetKeys.detail(id) });
    },
  });
}

export function useRemoveDigitalAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => services.digitalAsset.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: digitalAssetKeys.all });
    },
  });
}
