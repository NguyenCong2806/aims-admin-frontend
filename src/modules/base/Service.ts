import { api } from "../../library/axios";
import { PagedResult } from "./models/PagedResult";
import { PaginationFilter } from "./models/PaginationFilter";
import { Result } from "./models/Result";
import { IService } from "./IService";
import { FileUploadResult } from "./models/FileUploadResult";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { APP_MESSAGES } from "../../common/AppMessages";

export abstract class Service<TEntity, TCreateRequest, TUpdateRequest, TId> implements IService<TEntity, TCreateRequest, TUpdateRequest, TId> {
    constructor(
        protected readonly endpoint: string
    ) { }
    async downloadFile(fileurl: string): Promise<Blob> {
        const response = await api.get<Blob>(
            `${this.endpoint}/${fileurl}/download`,
            {
                responseType: "blob",
            }
        );

        const url = window.URL.createObjectURL(
            response.data
        );

        const link = document.createElement("a");

        link.href = url;
        link.download = fileurl ?? "download";

        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(url);
        return response.data;
    }

    async getAll(): Promise<TEntity[]> {
        const response = await api.get<TEntity[]>(this.endpoint);
        return response.data;
    }

    async getByParams(
        params?: PaginationFilter
    ): Promise<PagedResult<TEntity>> {
        const response = await api.get<PagedResult<TEntity>>(
            `${this.endpoint}/paged`,
            { params }
        );

        return response.data;
    }
    async getById(id: TId): Promise<Result<TEntity>> {
        const response = await api.get<Result<TEntity>>(`${this.endpoint}/${id}`);
        return response.data;
    }
    async create(request: TCreateRequest): Promise<Result<TEntity>> {
        const response = await api.post<Result<TEntity>>(this.endpoint, request);
        toast.success(APP_MESSAGES.COMMON.CREATE_SUCCESS);
        return response.data;
    }
    async update(id: TId, request: TUpdateRequest): Promise<Result<TEntity>> {
        const response = await api.put<Result<TEntity>>(`${this.endpoint}/${id}`, request);
        toast.success(APP_MESSAGES.COMMON.UPDATE_SUCCESS);
        return response.data;
    }
    async delete(id: TId): Promise<Result<TEntity> | null> {
        const result = await Swal.fire({
            title: APP_MESSAGES.COMMON.DELETE_CONFIRM_TITLE,
            text: APP_MESSAGES.COMMON.DELETE_CONFIRM_TEXT,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: APP_MESSAGES.COMMON.CONFIRM_DELETE_BTN,
            cancelButtonText: APP_MESSAGES.COMMON.CANCEL_BTN,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            reverseButtons: true,
        });

        if (!result.isConfirmed) {
            return null;
        }

        const response = await api.delete<Result<TEntity>>(
            `${this.endpoint}/${id}`
        );
        Swal.fire({
            title: APP_MESSAGES.COMMON.DELETE_HEADER,
            text: APP_MESSAGES.COMMON.DELETE_SUCCESS,
            icon: "success"
        });
        return response.data;
    }
    async uploadFile(file: File): Promise<FileUploadResult> {
        const formData = new FormData();
        formData.append("file", file);

        const response = await api.post<FileUploadResult | { data?: FileUploadResult }>(`${this.endpoint}/upload`, formData);
        const raw = response.data;
        if (raw && typeof raw === "object" && "data" in raw && raw.data) {
            return raw.data as FileUploadResult;
        }
        return raw as FileUploadResult;
    }
    async uploadFiles(files: File[]): Promise<Array<FileUploadResult>> {
        const formData = new FormData();

        files.forEach((file) => {
            formData.append("files", file);
        });

        const response = await api.post<Array<FileUploadResult> | { data?: Array<FileUploadResult> }>(
            `${this.endpoint}/upload-multiple`,
            formData
        );

        const raw = response.data;
        if (raw && typeof raw === "object" && "data" in raw && Array.isArray(raw.data)) {
            return raw.data as Array<FileUploadResult>;
        }
        if (Array.isArray(raw)) {
            return raw as Array<FileUploadResult>;
        }
        return [];
    }
    async deleteFile(fileurl: string): Promise<Result<TEntity>> {
        const response = await api.delete<Result<TEntity>>(`${this.endpoint}/${fileurl}`);
        return response.data;
    }
    async deleteFiles(fileurls: string[]): Promise<Result<TEntity>> {
        const response = await api.delete<Result<TEntity>>(`${this.endpoint}/bulk`,
            {
                data: {
                    ids: fileurls,
                },
            });
        return response.data;
    }

    async batchImport(data: File | FormData | Record<string, unknown>[]): Promise<unknown> {
        const importEndpoint = `${this.endpoint}/batch-import`;
        if (data instanceof File) {
            const formData = new FormData();
            formData.append("file", data);
            const response = await api.post(importEndpoint, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        }

        if (data instanceof FormData) {
            const response = await api.post(importEndpoint, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        }

        const response = await api.post(importEndpoint, data);
        return response.data;
    }
}
