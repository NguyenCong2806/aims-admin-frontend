import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import type { PaginationFilter } from "../../base/models/PaginationFilter";
import { services } from "../../../di/ServiceContainer";
import { hardwareassetobject } from "../models/hardwareAsset";

export const hardwareKeys = {
  all: ["hardwareAssets"] as const,
  lists: () => [...hardwareKeys.all, "list"] as const,
  list: (params?: PaginationFilter) => [...hardwareKeys.lists(), params] as const,
  details: () => [...hardwareKeys.all, "detail"] as const,
  detail: (id: string | null) => [...hardwareKeys.details(), id] as const,
};

export function useAddHardware() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: hardwareassetobject) => services.hardware.create(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hardwareKeys.all });
    },
  });
}

export function useHardwareAll() {
  return useQuery({
    queryKey: hardwareKeys.all,
    queryFn: () => services.hardware.getAll(),
  });
}

export function useHardwareParams(params?: PaginationFilter) {
  return useQuery({
    queryKey: hardwareKeys.list(params),
    queryFn: () => services.hardware.getByParams(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 3,
  });
}

export function useHardwareById(id: string | null) {
  return useQuery({
    queryKey: hardwareKeys.detail(id),
    queryFn: () => {
      if (id === null) throw new Error("Hardware ID is required");
      return services.hardware.getById(id);
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
      queryFn: () => services.hardware.getByParams(filter),
      staleTime: 1000 * 60 * 3,
    });
  };
}

export function useUpdateHardware() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, params }: { id: string; params: hardwareassetobject }) =>
      services.hardware.update(id, params),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: hardwareKeys.lists() });
      queryClient.invalidateQueries({ queryKey: hardwareKeys.detail(id) });
    },
  });
}

export function useRemoveHardware() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => services.hardware.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hardwareKeys.all });
    },
  });
}
