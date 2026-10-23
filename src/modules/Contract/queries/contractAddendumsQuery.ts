import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { services } from "../../../di/ServiceContainer";
import {
  CreateContractAddendum,
  UpdateContractAddendum,
} from "../models/contract";
import { contractKeys } from "./contractsQuery";

export const contractAddendumKeys = {
  all: ["contract-addendums"] as const,
  byContract: (contractId: number) =>
    [...contractAddendumKeys.all, "by-contract", contractId] as const,
  detail: (id: number) => [...contractAddendumKeys.all, "detail", id] as const,
};

/**
 * Hook truy vấn danh sách Phụ lục của một Hợp đồng
 */
export function useContractAddendums(contractId?: number | null) {
  return useQuery({
    queryKey: contractAddendumKeys.byContract(contractId ?? 0),
    queryFn: () => services.contractAddendum.getByContractId(contractId as number),
    enabled: Boolean(contractId && contractId > 0),
  });
}

/**
 * Hook Thêm mới Phụ lục hợp đồng
 */
export function useCreateContractAddendum() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateContractAddendum) =>
      services.contractAddendum.create(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: contractAddendumKeys.byContract(variables.contractId),
      });
      queryClient.invalidateQueries({ queryKey: contractKeys.all });
    },
  });
}

/**
 * Hook Cập nhật Phụ lục hợp đồng
 */
export function useUpdateContractAddendum() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateContractAddendum }) =>
      services.contractAddendum.update(id, payload),
    onSuccess: (_, variables) => {
      if (variables.payload.contractId) {
        queryClient.invalidateQueries({
          queryKey: contractAddendumKeys.byContract(variables.payload.contractId),
        });
      }
      queryClient.invalidateQueries({ queryKey: contractAddendumKeys.all });
      queryClient.invalidateQueries({ queryKey: contractKeys.all });
    },
  });
}

/**
 * Hook Xóa Phụ lục hợp đồng
 */
export function useDeleteContractAddendum() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number; contractId: number }) =>
      services.contractAddendum.delete(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: contractAddendumKeys.byContract(variables.contractId),
      });
      queryClient.invalidateQueries({ queryKey: contractKeys.all });
    },
  });
}
