import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import type { PaginationFilter } from "../../models/base/PaginationFilter";
import type {
  DigitalCloudServer,
  CreateDigitalCloudServer,
  UpdateDigitalCloudServer,
} from "../../models/DigitalAsset/digitalcloudserver/digitalcloudserver";
import { services } from "../../di/ServiceContainer";

export const digitalCloudServerKeys = {
  all: ["digitalCloudServers"] as const,
  lists: () => [...digitalCloudServerKeys.all, "list"] as const,
  list: (params?: PaginationFilter) => [...digitalCloudServerKeys.lists(), params] as const,
  details: () => [...digitalCloudServerKeys.all, "detail"] as const,
  detail: (id: number | null) => [...digitalCloudServerKeys.details(), id] as const,
};

export function useDigitalCloudServerAll() {
  return useQuery({
    queryKey: digitalCloudServerKeys.all,
    queryFn: () => services.digitalCloudServer.getAll(),
  });
}

export function useDigitalCloudServerParams(params?: PaginationFilter) {
  return useQuery({
    queryKey: digitalCloudServerKeys.list(params),
    queryFn: () => services.digitalCloudServer.getByParams(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 3,
  });
}

export function useDigitalCloudServerById(id: number | null) {
  return useQuery({
    queryKey: digitalCloudServerKeys.detail(id),
    queryFn: () => {
      if (id === null) throw new Error("Digital Cloud Server ID is required");
      return services.digitalCloudServer.getById(id);
    },
    enabled: id !== null,
  });
}

export function usePrefetchDigitalCloudServerPage() {
  const queryClient = useQueryClient();

  return (targetPage: number, currentFilter: Omit<PaginationFilter, "PageIndex">) => {
    const filter: PaginationFilter = {
      ...currentFilter,
      PageIndex: targetPage,
    };

    queryClient.prefetchQuery({
      queryKey: digitalCloudServerKeys.list(filter),
      queryFn: () => services.digitalCloudServer.getByParams(filter),
      staleTime: 1000 * 60 * 3,
    });
  };
}

export function useCreateDigitalCloudServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateDigitalCloudServer) => services.digitalCloudServer.create(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: digitalCloudServerKeys.all });
    },
  });
}

export function useUpdateDigitalCloudServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, params }: { id: number; params: UpdateDigitalCloudServer }) =>
      services.digitalCloudServer.update(id, params),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: digitalCloudServerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: digitalCloudServerKeys.detail(id) });
    },
  });
}

export function useRemoveDigitalCloudServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => services.digitalCloudServer.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: digitalCloudServerKeys.all });
    },
  });
}
