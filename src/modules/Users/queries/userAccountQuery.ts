import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { services } from "../../../di/ServiceContainer";
import type { PaginationFilter } from "../../base/models/PaginationFilter";
import { CreateUserAccountDto, UpdateUserAccountDto } from "../models/userAccount";

export const userAccountKeys = {
  all: ["user-accounts"] as const,
  lists: () => [...userAccountKeys.all, "list"] as const,
  list: (params?: PaginationFilter) => [...userAccountKeys.lists(), params] as const,
  detail: (id: number | null) => [...userAccountKeys.all, "detail", id] as const,
};

export function useUserAccountsPaged(params?: PaginationFilter) {
  return useQuery({
    queryKey: userAccountKeys.list(params),
    queryFn: () => services.user.getPagedDb(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, // 1 phút
  });
}

export function useUserAccountById(id: number | null) {
  return useQuery({
    queryKey: userAccountKeys.detail(id),
    queryFn: () => (id ? services.user.getById(id) : null),
    enabled: id !== null && id !== undefined,
  });
}

export function useCreateUserAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateUserAccountDto) => services.user.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userAccountKeys.all });
    },
  });
}

export function useUpdateUserAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateUserAccountDto }) =>
      services.user.update(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userAccountKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userAccountKeys.detail(id) });
    },
  });
}

export function useToggleLockUserAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => services.user.toggleLock(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userAccountKeys.lists() });
    },
  });
}

export function useDeleteUserAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => services.user.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userAccountKeys.all });
    },
  });
}

