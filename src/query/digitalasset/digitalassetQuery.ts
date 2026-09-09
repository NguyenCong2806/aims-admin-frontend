/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import type { PaginationFilter } from "../../models/base/PaginationFilter";
import type {
  CreateDigitalAsset,
  UpdateDigitalAsset,
} from "../../models/DigitalAsset/digitalasset/digitalasset";
import { services } from "../../di/ServiceContainer";

export const digitalAssetKeys = {
  all: ["digitalAssets"] as const,
  lists: () => [...digitalAssetKeys.all, "list"] as const,
  list: (params?: PaginationFilter) => [...digitalAssetKeys.lists(), params] as const,
  details: () => [...digitalAssetKeys.all, "detail"] as const,
  detail: (id: number | null) => [...digitalAssetKeys.details(), id] as const,
};

export function useDigitalAssetAll() {
  return useQuery({
    queryKey: digitalAssetKeys.all,
    queryFn: () => services.digitalAsset.getAll(),
  });
}

export function useDigitalAssetParams(params?: PaginationFilter) {
  return useQuery({
    queryKey: digitalAssetKeys.list(params),
    queryFn: () => services.digitalAsset.getByParams(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 3,
  });
}

export function useDigitalAssetById(id: number | null) {
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

export function useCreateDigitalAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateDigitalAsset) => services.digitalAsset.create(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: digitalAssetKeys.all });
    },
  });
}

export function useUpdateDigitalAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, params }: { id: number; params: UpdateDigitalAsset }) =>
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
    mutationFn: (id: number) => services.digitalAsset.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: digitalAssetKeys.all });
    },
  });
}
