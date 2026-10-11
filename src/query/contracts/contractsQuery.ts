import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PaginationFilter } from "../../models/base/PaginationFilter";
import { services } from "../../di/ServiceContainer";
import { createcontract, updatecontract } from "../../models/Contract/contract";

export const contractKeys = {
  all: ["contracts"] as const,
  lists: () => [...contractKeys.all, "list"] as const,
  list: (params?: PaginationFilter) => [...contractKeys.lists(), params] as const,
  detail: (id: number | null) => [...contractKeys.all, "detail", id] as const,
};

export function useContractAll() {
  return useQuery({
    queryKey: contractKeys.all,
    queryFn: () => services.contract.getAll(),
  });
}

export function useContractParams(params?: PaginationFilter) {
  return useQuery({
    queryKey: contractKeys.list(params),
    queryFn: () => services.contract.getByParams(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 3,
  });
}

export function useContractById(id: number | null) {
  return useQuery({
    queryKey: contractKeys.detail(id),
    queryFn: () => services.contract.getById(id as number),
    enabled: id !== null && id !== undefined,
  });
}

export function useCreateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: createcontract) => services.contract.create(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.all });
    },
  });
}

export function useUpdateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, params }: { id: number; params: updatecontract }) =>
      services.contract.update(id, params),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contractKeys.detail(id) });
    },
  });
}

export function useRemoveContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => services.contract.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.all });
    },
  });
}

export function useUploadContractFile() {
  return useMutation({
    mutationFn: (file: File) => services.contract.uploadFile(file),
  });
}
