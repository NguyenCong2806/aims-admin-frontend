import {
  UserAccount,
  CreateUserAccountDto,
  UpdateUserAccountDto,
} from "../models/userAccount";
import { PagedResult } from "../../base/models/PagedResult";
import { PaginationFilter } from "../../base/models/PaginationFilter";
import { Result } from "../../base/models/Result";

export interface IUserService {
  getPagedDb(params?: PaginationFilter): Promise<PagedResult<UserAccount>>;
  getById(id: number): Promise<Result<UserAccount> | UserAccount | null>;
  create(dto: CreateUserAccountDto): Promise<Result<UserAccount>>;
  update(id: number, dto: UpdateUserAccountDto): Promise<Result<UserAccount>>;
  toggleLock(id: number): Promise<Result<UserAccount>>;
  delete(id: number): Promise<Result<UserAccount> | boolean | null>;
  resetPassword(id: number): Promise<{ tempPassword: string }>;
  exportToCsv(users: UserAccount[]): void;
}
