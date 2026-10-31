import { API_ENDPOINTS } from "../../../common/ApiEndpoints";
import { Service } from "../../base/Service";
import { IHardwareService } from "./IHardwareService";
import { HARDWARE_DEVICE_TYPES } from "../../../common/HardwareDeviceType";
import { hardwareassetobject, hardwareassetviewdto } from "../models/hardwareAsset";
import { PaginationFilter, PagedResult } from "../../base";
import { api } from "../../../library/axios";
import { Result } from "../../base/models/Result";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { APP_MESSAGES } from "../../../common/AppMessages";

export class HardwareService
  extends Service<hardwareassetviewdto, hardwareassetobject, hardwareassetobject, string>
  implements IHardwareService {
  constructor(endpoint: string = API_ENDPOINTS.HARDWARE.BASE) {
    super(endpoint);
  }

  async getHardwareAssetsByParams(params?: PaginationFilter): Promise<PagedResult<hardwareassetviewdto>> {
    const response = await api.get<PagedResult<hardwareassetviewdto>>(
      `${this.endpoint}/get-hardware-assets`,
      { params }
    );

    return response.data;
  }

  override async create(request: hardwareassetobject): Promise<Result<hardwareassetviewdto>> {
    const response = await api.post<Result<hardwareassetviewdto>>(
      `${this.endpoint}/add-hardware-assets`,
      request
    );
    toast.success(APP_MESSAGES.COMMON.CREATE_SUCCESS);
    return response.data;
  }

  override async update(_id: string, request: hardwareassetobject): Promise<Result<hardwareassetviewdto>> {
    const response = await api.post<Result<hardwareassetviewdto>>(
      `${this.endpoint}/add-hardware-assets`,
      request
    );
    toast.success(APP_MESSAGES.COMMON.UPDATE_SUCCESS);
    return response.data;
  }

  override async getById(id: string): Promise<Result<any>> {
    const response = await api.get<Result<any>>(
      `${this.endpoint}/get-hardware-assets-by-id/${id}`
    );
    return response.data;
  }

  override async delete(id: string): Promise<Result<hardwareassetviewdto> | null> {
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

    const response = await api.delete<Result<hardwareassetviewdto>>(
      `${this.endpoint}/delete-hardware-assets/${id}`
    );
    Swal.fire({
      title: APP_MESSAGES.COMMON.DELETE_HEADER,
      text: APP_MESSAGES.COMMON.DELETE_SUCCESS,
      icon: "success"
    });
    return response.data;
  }

  generateAssetCode(categoryName: string): string {
    const matched = HARDWARE_DEVICE_TYPES.find((d) => d.categoryName === categoryName);
    const prefix = matched ? matched.prefix : "HW-GEN";
    const year = new Date().getFullYear();
    const rand = Math.floor(100 + Math.random() * 900);
    return `${prefix}-${year}-${rand}`;
  }
}
