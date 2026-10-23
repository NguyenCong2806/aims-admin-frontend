import { FileUploadResult } from "./models/FileUploadResult";
import { PagedResult } from "./models/PagedResult";
import { PaginationFilter } from "./models/PaginationFilter";
import { Result } from "./models/Result";

export interface IService<TEntity, TCreateRequest, TUpdateRequest, TId> {
    ///get all
    getAll(): Promise<Array<TEntity>>;

    ///get all with pagination
    getByParams(params?: PaginationFilter): Promise<PagedResult<TEntity>>;

    ///get by id
    getById(id: TId): Promise<Result<TEntity>>;

    ///create
    create(request: TCreateRequest): Promise<Result<TEntity>>;

    ///update
    update(id: TId, request: TUpdateRequest): Promise<Result<TEntity>>;

    ///delete
    delete(id: TId): Promise<Result<TEntity> | null>;
    ///upload file
    uploadFile(file: File): Promise<FileUploadResult>;
    ///upload files
    uploadFiles(files: File[]): Promise<Array<FileUploadResult>>;
    ///delete file
    deleteFile(fileurl: string): Promise<Result<TEntity>>;
    ///delete files
    deleteFiles(fileurls: string[]): Promise<Result<TEntity>>;
    ///download file
    downloadFile(fileurl: string): Promise<Blob>;
    ///batch import
    batchImport(data: File | FormData | Record<string, unknown>[]): Promise<unknown>;
}
