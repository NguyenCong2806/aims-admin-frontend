import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PaginationFilter } from "../../base/models/PaginationFilter";
import { services } from "../../../di/ServiceContainer";
import { createdepartment, updatedepartment } from "../models";

export const departmentKeys = {
  all: ["departments"] as const,
  lists: () => [...departmentKeys.all, "list"] as const,
  list: (params?: PaginationFilter) => [...departmentKeys.lists(), params] as const,
  detail: (id: number | null) => [...departmentKeys.all, "detail", id] as const,
};

export function useDepartmentParams(params?: PaginationFilter) {
  return useQuery({ queryKey: departmentKeys.list(params), queryFn: () => services.department.getByParams(params), placeholderData: keepPreviousData, staleTime: 1000 * 60 * 3 });
}

export function useDepartmentAll() {
  return useQuery({ queryKey: departmentKeys.all, queryFn: () => services.department.getAll(), staleTime: 1000 * 60 * 3 });
}

export function useDepartmentSelectList() {
  return useQuery({ queryKey: [...departmentKeys.all, "select-list"] as const, queryFn: () => services.department.getSelectList(), staleTime: 1000 * 60 * 5 });
}

export function useDepartmentById(id: number | null) {
  return useQuery({ queryKey: departmentKeys.detail(id), queryFn: () => services.department.getById(id as number), enabled: id !== null });
}

export function usePrefetchDepartmentPage() {
  const queryClient = useQueryClient();
  return (pageIndex: number, currentFilter: Omit<PaginationFilter, "PageIndex">) => {
    const filter = { ...currentFilter, PageIndex: pageIndex };
    queryClient.prefetchQuery({ queryKey: departmentKeys.list(filter), queryFn: () => services.department.getByParams(filter), staleTime: 1000 * 60 * 3 });
  };
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (params: createdepartment) => services.department.create(params), onSuccess: () => queryClient.invalidateQueries({ queryKey: departmentKeys.all }) });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, params }: { id: number; params: updatedepartment }) => services.department.update(id, params),
    onSuccess: (_, { id }) => { queryClient.invalidateQueries({ queryKey: departmentKeys.lists() }); queryClient.invalidateQueries({ queryKey: departmentKeys.detail(id) }); },
  });
}

export function useRemoveDepartment() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id: number) => services.department.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: departmentKeys.all }) });
}

export function useBatchImportDepartments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: File | FormData | Record<string, unknown>[]) => services.department.batchImport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all });
    },
  });
}