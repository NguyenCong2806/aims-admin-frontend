import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import type { PaginationFilter } from "../../models/base/PaginationFilter";
import type {
  DigitalDomainSSL,
  CreateDigitalDomainSSL,
  UpdateDigitalDomainSSL,
} from "../../models/DigitalAsset/digitaldomain/digitaldomain";
import { services } from "../../di/ServiceContainer";

export const digitalDomainSSLKeys = {
  all: ["digitalDomainSSLs"] as const,
  lists: () => [...digitalDomainSSLKeys.all, "list"] as const,
  list: (params?: PaginationFilter) => [...digitalDomainSSLKeys.lists(), params] as const,
  details: () => [...digitalDomainSSLKeys.all, "detail"] as const,
  detail: (id: number | null) => [...digitalDomainSSLKeys.details(), id] as const,
};

export function useDigitalDomainSSLAll() {
  return useQuery({
    queryKey: digitalDomainSSLKeys.all,
    queryFn: () => services.digitalDomainSSL.getAll(),
  });
}

export function useDigitalDomainSSLParams(params?: PaginationFilter) {
  return useQuery({
    queryKey: digitalDomainSSLKeys.list(params),
    queryFn: () => services.digitalDomainSSL.getByParams(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 3,
  });
}

export function useDigitalDomainSSLById(id: number | null) {
  return useQuery({
    queryKey: digitalDomainSSLKeys.detail(id),
    queryFn: () => {
      if (id === null) throw new Error("Digital Domain SSL ID is required");
      return services.digitalDomainSSL.getById(id);
    },
    enabled: id !== null,
  });
}

export function usePrefetchDigitalDomainSSLPage() {
  const queryClient = useQueryClient();

  return (targetPage: number, currentFilter: Omit<PaginationFilter, "PageIndex">) => {
    const filter: PaginationFilter = {
      ...currentFilter,
      PageIndex: targetPage,
    };

    queryClient.prefetchQuery({
      queryKey: digitalDomainSSLKeys.list(filter),
      queryFn: () => services.digitalDomainSSL.getByParams(filter),
      staleTime: 1000 * 60 * 3,
    });
  };
}

export function useCreateDigitalDomainSSL() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateDigitalDomainSSL) => services.digitalDomainSSL.create(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: digitalDomainSSLKeys.all });
    },
  });
}

export function useUpdateDigitalDomainSSL() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, params }: { id: number; params: UpdateDigitalDomainSSL }) =>
      services.digitalDomainSSL.update(id, params),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: digitalDomainSSLKeys.lists() });
      queryClient.invalidateQueries({ queryKey: digitalDomainSSLKeys.detail(id) });
    },
  });
}

export function useRemoveDigitalDomainSSL() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => services.digitalDomainSSL.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: digitalDomainSSLKeys.all });
    },
  });
}
