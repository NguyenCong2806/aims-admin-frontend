import { api } from "../../../library/axios";
import { API_ENDPOINTS } from "../../../common/ApiEndpoints";
import {
  ContractAddendum,
  CreateContractAddendum,
  UpdateContractAddendum,
} from "../models/contract";
import { Service } from "../../base/Service";
import { IContractAddendumService } from "./IContractAddendumService";
import { Result } from "../../base/models/Result";

export class ContractAddendumService
  extends Service<ContractAddendum, CreateContractAddendum, UpdateContractAddendum, number>
  implements IContractAddendumService {
  constructor(endpoint = API_ENDPOINTS.CONTRACTS.ADDENDUMS) {
    super(endpoint);
  }

  /**
   * Tạo danh sách các ứng viên URL linh hoạt giữa gạch nối (-), gạch dưới (_) và nested route
   */
  private getCandidateEndpoints(contractId?: number, id?: number): string[] {
    const base = this.endpoint;
    const variants = new Set<string>();

    variants.add(base);
    if (base.includes("_")) {
      variants.add(base.replace(/_/g, "-"));
    }
    if (base.includes("-")) {
      variants.add(base.replace(/-/g, "_"));
    }

    const results: string[] = [];
    variants.forEach((v) => {
      if (id !== undefined) {
        results.push(`${v}/${id}`);
      } else {
        results.push(v);
      }
    });

    if (contractId) {
      if (id !== undefined) {
        results.push(`/contracts/${contractId}/addendums/${id}`);
      } else {
        results.push(`/contracts/${contractId}/addendums`);
      }
    }

    return results;
  }

  /**
   * Lấy danh sách toàn bộ Phụ lục của một Hợp đồng cụ thể
   */
  async getByContractId(contractId: number): Promise<ContractAddendum[]> {
    if (!contractId) return [];

    const candidateUrls = [
      `${this.endpoint}/contract/${contractId}`,
      `${this.endpoint}?contractId=${contractId}`,
      `/contracts/${contractId}/addendums`,
      `${this.endpoint.includes("_") ? this.endpoint.replace(/_/g, "-") : this.endpoint.replace(/-/g, "_")}/contract/${contractId}`,
      `${this.endpoint.includes("_") ? this.endpoint.replace(/_/g, "-") : this.endpoint.replace(/-/g, "_")}?contractId=${contractId}`,
    ];

    for (const url of candidateUrls) {
      try {
        const response = await api.get<ContractAddendum[] | { data?: ContractAddendum[]; items?: ContractAddendum[] }>(url);
        const data = response.data;
        if (Array.isArray(data)) return data;
        if (data && typeof data === "object") {
          if (Array.isArray(data.data)) return data.data;
          if (Array.isArray(data.items)) return data.items;
        }
      } catch (err: unknown) {
        const errObj = err as { response?: { status?: number } };
        if (errObj?.response?.status === 404) {
          continue;
        }
      }
    }
    return [];
  }

  /**
   * Thêm mới Phụ lục với khả năng tự động fallback nếu route khác quy ước
   */
  override async create(request: CreateContractAddendum): Promise<Result<ContractAddendum>> {
    const endpoints = this.getCandidateEndpoints(request.contractId);
    let lastError: unknown = null;

    for (const ep of endpoints) {
      try {
        const response = await api.post<Result<ContractAddendum>>(ep, request);
        return response.data;
      } catch (err: unknown) {
        lastError = err;
        const errObj = err as { response?: { status?: number } };
        if (errObj?.response?.status === 404) {
          continue;
        }
        throw err;
      }
    }
    throw lastError;
  }

  /**
   * Cập nhật Phụ lục với fallback tự động
   */
  override async update(id: number, request: UpdateContractAddendum): Promise<Result<ContractAddendum>> {
    const endpoints = this.getCandidateEndpoints(request.contractId, id);
    let lastError: unknown = null;

    for (const ep of endpoints) {
      try {
        const response = await api.put<Result<ContractAddendum>>(ep, request);
        return response.data;
      } catch (err: unknown) {
        lastError = err;
        const errObj = err as { response?: { status?: number } };
        if (errObj?.response?.status === 404) {
          continue;
        }
        throw err;
      }
    }
    throw lastError;
  }

  /**
   * Xóa Phụ lục trực tiếp (tránh trùng lặp hộp thoại xác nhận)
   */
  override async delete(id: number): Promise<Result<ContractAddendum> | null> {
    const endpoints = this.getCandidateEndpoints(undefined, id);
    let lastError: unknown = null;

    for (const ep of endpoints) {
      try {
        const response = await api.delete<Result<ContractAddendum>>(ep);
        return response.data;
      } catch (err: unknown) {
        lastError = err;
        const errObj = err as { response?: { status?: number } };
        if (errObj?.response?.status === 404) {
          continue;
        }
        throw err;
      }
    }
    throw lastError;

  }
}

