import { api } from "../library/axios";
import { PagedResult } from "../models/base/PagedResult";
import { PaginationFilter } from "../models/base/PaginationFilter";
import { Result } from "../models/base/Result";
import { IService } from "./IService";
import { FileUploadResult } from "../models/base/FileUploadResult";
import { toast } from "sonner";
import Swal from "sweetalert2";

export abstract class Service<TEntity, TCreateRequest = Partial<TEntity>,
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

    async getByParams(
        params?: PaginationFilter
    ): Promise<PagedResult<TEntity>> {
        const response = await api.get<PagedResult<TEntity>>(
            `${this.endpoint}/getbrands`,
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
        toast.success("Thêm mới dữ liệu thành công!");
        return response.data;
    }
    async update(id: TId, request: TUpdateRequest): Promise<Result<TEntity>> {
        const response = await api.put<Result<TEntity>>(`${this.endpoint}/${id}`, request);
        toast.success("Cập nhật dữ liệu thành công!");
        return response.data;
    }
    async delete(id: TId): Promise<Result<TEntity> | null> {
        const result = await Swal.fire({
            title: "Bạn có chắc muốn xóa?",
            text: "Hãng sản xuất này sẽ bị xóa.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy",
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
            title: "Xóa bỏ!",
            text: "Đã loại bỏ dữ liệu thành công.",
            icon: "success"
        });
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