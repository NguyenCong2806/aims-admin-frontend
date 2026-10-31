import { Service } from "../../base/Service";
import { IDigitalAssetService } from "./IDigitalAssetService";
import { API_ENDPOINTS } from "../../../common/ApiEndpoints";
import { api } from "../../../library/axios";
import { Result } from "../../base/models/Result";
import { toast } from "sonner";
import { APP_MESSAGES } from "../../../common/AppMessages";
import { DigitalAssetObject, DigitalAssetViewdDto } from "../models/digitalAsset";
import { PaginationFilter, PagedResult } from "../../base";
import Swal from "sweetalert2";

export class DigitalAssetService
  extends Service<DigitalAssetViewdDto, DigitalAssetObject, DigitalAssetObject, string>
  implements IDigitalAssetService {
  constructor(endpoint: string = API_ENDPOINTS.DIGITAL_ASSETS.BASE) {
    super(endpoint);
  }
  generateAssetCode(categoryOrSubType?: string): string {
    const raw = (categoryOrSubType || "").trim().toUpperCase();

    // Bản đồ tiền tố mã cho các phân loại tài sản số (DigitalAsset)
    const prefixMap: Record<string, string> = {
      DOMAIN: "DOM",
      SSL: "SSL",
      CLOUD_SERVER: "SRV",
      SOFTWARE_LICENSE: "LIC",
      SAAS_SUBSCRIPTION: "SAAS",
      INTERNET_LINE: "NET",
      DNS: "DNS",
      VPS: "VPS",
      DATABASE: "DB",
      STORAGE: "STR",
      HOSTING: "HST",
      VPN: "VPN",
      FIREWALL: "FW",
      SOFTWARE: "LIC",
      EMAIL_SERVICE: "MAIL",
      API_SERVICE: "API",
      AI_SERVICE: "AI",
    };

    let prefix = prefixMap[raw];

    // Nếu không khớp trực tiếp mã subtype, nhận diện thông minh theo từ khóa trong tên danh mục
    if (!prefix) {
      const lower = (categoryOrSubType || "").toLowerCase();
      if (lower.includes("domain") || lower.includes("tên miền") || lower.includes("dns")) {
        prefix = "DOM";
      } else if (lower.includes("ssl") || lower.includes("chứng chỉ") || lower.includes("certificate")) {
        prefix = "SSL";
      } else if (
        lower.includes("cloud") ||
        lower.includes("server") ||
        lower.includes("máy chủ") ||
        lower.includes("vps") ||
        lower.includes("hosting")
      ) {
        prefix = "SRV";
      } else if (
        lower.includes("license") ||
        lower.includes("bản quyền") ||
        lower.includes("phần mềm") ||
        lower.includes("software")
      ) {
        prefix = "LIC";
      } else if (
        lower.includes("saas") ||
        lower.includes("thuê bao") ||
        lower.includes("subscription") ||
        lower.includes("account")
      ) {
        prefix = "SAAS";
      } else if (
        lower.includes("internet") ||
        lower.includes("đường truyền") ||
        lower.includes("line") ||
        lower.includes("ftth") ||
        lower.includes("mạng")
      ) {
        prefix = "NET";
      } else {
        prefix = "DIG";
      }
    }

    const year = new Date().getFullYear();
    const rand = Math.floor(100 + Math.random() * 900);
    return `${prefix}-${year}-${rand}`;
  }
  async getDigitalAssetsByParams(params?: PaginationFilter): Promise<PagedResult<DigitalAssetViewdDto>> {
    const response = await api.get<PagedResult<DigitalAssetViewdDto>>(
      `${this.endpoint}/get-digital-assets`,
      { params }
    );
    return response.data;
  }
  override async create(request: DigitalAssetObject): Promise<Result<DigitalAssetViewdDto>> {
    const response = await api.post<Result<DigitalAssetViewdDto>>(
      `${this.endpoint}/add-digital-asset`,
      request
    );
    toast.success(APP_MESSAGES.COMMON.CREATE_SUCCESS);
    return response.data;
  }

  override async update(_id: string, request: DigitalAssetObject): Promise<Result<DigitalAssetViewdDto>> {
    const response = await api.post<Result<DigitalAssetViewdDto>>(
      `${this.endpoint}/add-digital-asset`,
      request
    );
    toast.success(APP_MESSAGES.COMMON.UPDATE_SUCCESS);
    return response.data;
  }

  override async getById(id: string): Promise<Result<any>> {
    const response = await api.get<Result<any>>(
      `${this.endpoint}/get-digital-assets-by-id/${id}`
    );
    return response.data;
  }

  override async delete(id: string): Promise<Result<DigitalAssetViewdDto> | null> {
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

    const response = await api.delete<Result<DigitalAssetViewdDto>>(
      `${this.endpoint}/delete-digital-asset/${id}`
    );
    Swal.fire({
      title: APP_MESSAGES.COMMON.DELETE_HEADER,
      text: APP_MESSAGES.COMMON.DELETE_SUCCESS,
      icon: "success"
    });
    return response.data;
  }
}

export const digitalAssetService = new DigitalAssetService();
