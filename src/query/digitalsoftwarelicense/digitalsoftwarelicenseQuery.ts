import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import type { PaginationFilter } from "../../models/base/PaginationFilter";
import type {
  DigitalSoftwareLicense,
  CreateDigitalSoftwareLicense,
  UpdateDigitalSoftwareLicense,
} from "../../models/DigitalAsset/digitalsoftwarelicense/digitalsoftwarelicense";
import { services } from "../../di/ServiceContainer";

export const digitalSoftwareLicenseKeys = {
  all: ["digitalSoftwareLicenses"] as const,
  lists: () => [...digitalSoftwareLicenseKeys.all, "list"] as const,
  list: (params?: PaginationFilter) => [...digitalSoftwareLicenseKeys.lists(), params] as const,
  details: () => [...digitalSoftwareLicenseKeys.all, "detail"] as const,
  detail: (id: number | null) => [...digitalSoftwareLicenseKeys.details(), id] as const,
};

export function useDigitalSoftwareLicenseAll() {
  return useQuery({
    queryKey: digitalSoftwareLicenseKeys.all,
    queryFn: () => services.digitalSoftwareLicense.getAll(),
  });
}

export function useDigitalSoftwareLicenseParams(params?: PaginationFilter) {
  return useQuery({
    queryKey: digitalSoftwareLicenseKeys.list(params),
    queryFn: () => services.digitalSoftwareLicense.getByParams(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 3,
  });
}

export function useDigitalSoftwareLicenseById(id: number | null) {
  return useQuery({
    queryKey: digitalSoftwareLicenseKeys.detail(id),
    queryFn: () => {
      if (id === null) throw new Error("Digital Software License ID is required");
      return services.digitalSoftwareLicense.getById(id);
    },
    enabled: id !== null,
  });
}

export function usePrefetchDigitalSoftwareLicensePage() {
  const queryClient = useQueryClient();

  return (targetPage: number, currentFilter: Omit<PaginationFilter, "PageIndex">) => {
    const filter: PaginationFilter = {
      ...currentFilter,
      PageIndex: targetPage,
    };

    queryClient.prefetchQuery({
      queryKey: digitalSoftwareLicenseKeys.list(filter),
      queryFn: () => services.digitalSoftwareLicense.getByParams(filter),
      staleTime: 1000 * 60 * 3,
    });
  };
}

export function useCreateDigitalSoftwareLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateDigitalSoftwareLicense) => services.digitalSoftwareLicense.create(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: digitalSoftwareLicenseKeys.all });
    },
  });
}

export function useUpdateDigitalSoftwareLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, params }: { id: number; params: UpdateDigitalSoftwareLicense }) =>
      services.digitalSoftwareLicense.update(id, params),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: digitalSoftwareLicenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: digitalSoftwareLicenseKeys.detail(id) });
    },
  });
}

export function useRemoveDigitalSoftwareLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => services.digitalSoftwareLicense.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: digitalSoftwareLicenseKeys.all });
    },
  });
}
