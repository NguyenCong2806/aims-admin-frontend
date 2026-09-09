import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import type { PaginationFilter } from "../../models/base/PaginationFilter";
import type {
  DigitalInternetLine,
  CreateDigitalInternetLine,
  UpdateDigitalInternetLine,
} from "../../models/DigitalAsset/digitalinternetline/digitalinternetline";
import { services } from "../../di/ServiceContainer";

export const digitalInternetLineKeys = {
  all: ["digitalInternetLines"] as const,
  lists: () => [...digitalInternetLineKeys.all, "list"] as const,
  list: (params?: PaginationFilter) => [...digitalInternetLineKeys.lists(), params] as const,
  details: () => [...digitalInternetLineKeys.all, "detail"] as const,
  detail: (id: number | null) => [...digitalInternetLineKeys.details(), id] as const,
};

export function useDigitalInternetLineAll() {
  return useQuery({
    queryKey: digitalInternetLineKeys.all,
    queryFn: () => services.digitalInternetLine.getAll(),
  });
}

export function useDigitalInternetLineParams(params?: PaginationFilter) {
  return useQuery({
    queryKey: digitalInternetLineKeys.list(params),
    queryFn: () => services.digitalInternetLine.getByParams(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 3,
  });
}

export function useDigitalInternetLineById(id: number | null) {
  return useQuery({
    queryKey: digitalInternetLineKeys.detail(id),
    queryFn: () => {
      if (id === null) throw new Error("Digital Internet Line ID is required");
      return services.digitalInternetLine.getById(id);
    },
    enabled: id !== null,
  });
}

export function usePrefetchDigitalInternetLinePage() {
  const queryClient = useQueryClient();

  return (targetPage: number, currentFilter: Omit<PaginationFilter, "PageIndex">) => {
    const filter: PaginationFilter = {
      ...currentFilter,
      PageIndex: targetPage,
    };

    queryClient.prefetchQuery({
      queryKey: digitalInternetLineKeys.list(filter),
      queryFn: () => services.digitalInternetLine.getByParams(filter),
      staleTime: 1000 * 60 * 3,
    });
  };
}

export function useCreateDigitalInternetLine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateDigitalInternetLine) => services.digitalInternetLine.create(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: digitalInternetLineKeys.all });
    },
  });
}

export function useUpdateDigitalInternetLine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, params }: { id: number; params: UpdateDigitalInternetLine }) =>
      services.digitalInternetLine.update(id, params),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: digitalInternetLineKeys.lists() });
      queryClient.invalidateQueries({ queryKey: digitalInternetLineKeys.detail(id) });
    },
  });
}

export function useRemoveDigitalInternetLine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => services.digitalInternetLine.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: digitalInternetLineKeys.all });
    },
  });
}
