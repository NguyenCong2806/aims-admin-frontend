/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import type { PaginationFilter } from "../../models/base/PaginationFilter";

import type {
    creatbrand,
    updatebrand,
} from "../../models/Lookup/brand/brand";
import { services } from "../../di/ServiceContainer";


// =====================================================
// GET ALL
// =====================================================

export function usequeryBrandAll() {
    return useQuery({
        queryKey: ["brands"],
        queryFn: () => services.brand.getAll(),
    });
}

// =====================================================
// GET BY PARAMS
// =====================================================

export function usequeryBrandParams(params?: PaginationFilter) {
    return useQuery({
        queryKey: ["brands", params],
        queryFn: () => services.brand.getByParams(params),
    });
}
// =====================================================
// GET BY ID
// =====================================================

export function usequeryByIdBrand(id: number | null) {
  return useQuery({
    queryKey: ["brands", id],

    queryFn: () => {
      if (id === null) {
        throw new Error("Brand ID is required");
      }

      return services.brand.getById(id);
    },

    enabled: id !== null,
  });
}
// =====================================================
// CREATE
// =====================================================

export function usecreateBrand() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: creatbrand) => {
            return services.brand.create(params);
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["brands"],
            });
        },
    });
}

// =====================================================
// UPDATE
// =====================================================

export function useupdateBrand() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            params,
        }: {
            id: number;
            params: updatebrand;
        }) => {
            return services.brand.update(id, params);
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["brands"],
            });
        },
    });
}

// =====================================================
// DELETE
// =====================================================

export function useremoveBrand() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => {
            return services.brand.delete(id);
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["brands"],
            });
        },
    });
}