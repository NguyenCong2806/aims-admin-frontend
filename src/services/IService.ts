import { FileUploadResult } from "../models/base/FileUploadResult";
import { PagedResult } from "../models/base/PagedResult";
import { PaginationFilter } from "../models/base/PaginationFilter";
import { Result } from "../models/base/Result";

export interface IService<TEntity, TCreateRequest = Partial<TEntity>, TUpdateRequest = Partial<TEntity>, TId = number> {

    getAll(): Promise<Array<TEntity>>;

    getByParams(params?: PaginationFilter): Promise<PagedResult<TEntity>>;

    getById(id: TId): Promise<Result<TEntity>>;

    create(request: TCreateRequest): Promise<Result<TEntity>>;

    update(id: TId, request: TUpdateRequest): Promise<Result<TEntity>>;

    delete(id: TId): Promise<Result<TEntity> | null>;

    uploadFile(file: File): Promise<FileUploadResult>;

    uploadFiles(files: File[]): Promise<Array<FileUploadResult>>;

    deleteFile(fileurl: string): Promise<Result<TEntity>>;

    deleteFiles(fileurls: Array<string>[]): Promise<Result<TEntity>>;
    
    downloadFile(fileurl: string): Promise<Blob>;
}