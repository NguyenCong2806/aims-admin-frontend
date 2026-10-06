import {
    useQuery,
    useQueryClient,
    keepPreviousData,
} from "@tanstack/react-query";
import type { PaginationFilter } from "../../models/base/PaginationFilter";
import { services } from "../../di/ServiceContainer";

// =====================================================
// QUERY KEY FACTORY
// =====================================================
export const computerauditsKeys = {
    all: ["computerauditss"] as const,
    lists: () => [...computerauditsKeys.all, "list"] as const,
    list: (params?: PaginationFilter) => [...computerauditsKeys.lists(), params] as const,
    details: () => [...computerauditsKeys.all, "detail"] as const,
    detail: (id: string | null) => [...computerauditsKeys.details(), id] as const,
    listssofware: () => [...computerauditsKeys.all, "listsofware"] as const,
    listsofware: (id: string | null) => [...computerauditsKeys.listssofware(), id] as const,

};

// =====================================================
// QUERIES
// =====================================================

export function usecomputerauditsAll() {
    return useQuery({
        queryKey: computerauditsKeys.all,
        queryFn: () => services.computerAudit.getAll(),
    });
}

export function usecomputerauditsParams(params?: PaginationFilter) {
    return useQuery({
        queryKey: computerauditsKeys.list(params),
        queryFn: () => services.computerAudit.getAllParams(params),
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 3,
    });
}

export function usecomputerauditsById(id: string | null) {
    return useQuery({
        queryKey: computerauditsKeys.detail(id),
        queryFn: () => {
            if (id === null) throw new Error("computeraudits ID is required");
            return services.computerAudit.getById(id);
        },
        enabled: id !== null,
    });
}

export function usecomputerauditsofware(id: string | null) {
    return useQuery({
        queryKey: computerauditsKeys.listsofware(id),
        queryFn: () => {
            if (id === null) throw new Error("computeraudits ID is required");
            return services.computerAudit.getListInstalledSoftware(id);
        },
        enabled: id !== null,
    });
}
export function usecomputerauditsByDetail(id: string | null) {
    return useQuery({
        queryKey: computerauditsKeys.detail(id),
        queryFn: () => {
            if (id === null) throw new Error("computeraudits ID is required");
            return services.computerAudit.getByDetail(id);
        },
        enabled: id !== null,
    });
}
// =====================================================
// PREFETCH HOOK (Khắc phục lỗi gọi Hook sai vị trí)
// =====================================================

export function usePrefetchcomputerauditsPage() {
    const queryClient = useQueryClient();

    return (targetPage: number, currentFilter: Omit<PaginationFilter, "PageIndex">) => {
        const filter: PaginationFilter = {
            ...currentFilter,
            PageIndex: targetPage,
        };

        queryClient.prefetchQuery({
            queryKey: computerauditsKeys.list(filter),
            queryFn: () => services.computerAudit.getByParams(filter),
            staleTime: 1000 * 60 * 3,
        });
    };
}
