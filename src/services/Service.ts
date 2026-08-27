import { api } from "../library/axios";
import { PagedResult } from "../models/base/PagedResult";
import { PaginationFilter } from "../models/base/PaginationFilter";
import { Result } from "../models/base/Result";
import { IService } from "./IService";
import { FileUploadResult } from "../models/base/FileUploadResult";


export class Service<TEntity, TCreateRequest = Partial<TEntity>,
    TUpdateRequest = Partial<TEntity>,
    TId = number> implements IService<TEntity, TCreateRequest, TUpdateRequest, TId> {
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

    async getByParams(params?: PaginationFilter): Promise<PagedResult<TEntity>> {
        const response = await api.get<PagedResult<TEntity>>(this.endpoint, { params });
        return response.data;
    }
    async getById(id: TId): Promise<Result<TEntity>> {
        const response = await api.get<Result<TEntity>>(`${this.endpoint}/${id}`);
        return response.data;
    }
    async create(request: TCreateRequest): Promise<Result<TEntity>> {
        const response = await api.post<Result<TEntity>>(this.endpoint, request);
        return response.data;
    }
    async update(id: TId, request: TUpdateRequest): Promise<Result<TEntity>> {
        const response = await api.put<Result<TEntity>>(`${this.endpoint}/${id}`, request);
        return response.data;
    }
    async delete(id: TId): Promise<Result<TEntity>> {
        const response = await api.delete<Result<TEntity>>(`${this.endpoint}/${id}`);
        return response.data;
    }
    async uploadFile(file: File): Promise<FileUploadResult> {
        const formData = new FormData();
        formData.append("file", file);

        const response = await api.post<FileUploadResult>(`${this.endpoint}/upload`, formData);
        return response.data;
    }
    async uploadFiles(files: File[]): Promise<Array<FileUploadResult>> {
        const formData = new FormData();

        files.forEach((file) => {
            formData.append("files", file);
        });

        const response = await api.post<Array<FileUploadResult>>(
            `${this.endpoint}/upload-multiple`,
            formData
        );

        return response.data;
    }
    async deleteFile(fileurl: string): Promise<Result<TEntity>> {
        const response = await api.delete<Result<TEntity>>(`${this.endpoint}/${fileurl}`);
        return response.data;
    }
    async deleteFiles(fileurls: Array<string>[]): Promise<Result<TEntity>> {
        const response = await api.delete<Result<TEntity>>(`${this.endpoint}/bulk`,
            {
                data: {
                    ids: fileurls,
                },
            });
        return response.data;
    }
}