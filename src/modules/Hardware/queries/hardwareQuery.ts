import {

  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import type { PaginationFilter } from "../../base/models/PaginationFilter";
import { services } from "../../../di/ServiceContainer";

export const hardwareKeys = {
  all: ["hardwareAssets"] as const,
  lists: () => [...hardwareKeys.all, "list"] as const,
  list: (params?: PaginationFilter) => [...hardwareKeys.lists(), params] as const,
  details: () => [...hardwareKeys.all, "detail"] as const,
  detail: (id: number | null) => [...hardwareKeys.details(), id] as const,
};
export function useAddHardware() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateHardware) => services.digitalAsset.adddigitalasset(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hardwareKeys.all });
    },
  });
}
export function useHardwareAll() {
  return useQuery({
    queryKey: hardwareKeys.all,
    queryFn: () => services.digitalAsset.getAll(),
  });
}

export function useHardwareParams(params?: PaginationFilter) {
  return useQuery({
    queryKey: hardwareKeys.list(params),
    queryFn: () => services.digitalAsset.getByParams(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 3,
  });
}

export function useHardwareById(id: number | null) {
  return useQuery({
    queryKey: hardwareKeys.detail(id),
    queryFn: () => {
      if (id === null) throw new Error("Hardware ID is required");
      return services.digitalAsset.getById(id);
    },
    enabled: id !== null,
  });
}

export function usePrefetchHardwarePage() {
  const queryClient = useQueryClient();

  return (targetPage: number, currentFilter: Omit<PaginationFilter, "PageIndex">) => {
    const filter: PaginationFilter = {
      ...currentFilter,
      PageIndex: targetPage,
    };

    queryClient.prefetchQuery({
      queryKey: hardwareKeys.list(filter),
      queryFn: () => services.digitalAsset.getByParams(filter),
      staleTime: 1000 * 60 * 3,
    });
  };
}

export function useCreateHardware() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateHardware) => services.digitalAsset.create(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hardwareKeys.all });
    },
  });
}

export function useUpdateHardware() {
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
