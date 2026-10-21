import { toast } from "sonner";
import { API_ENDPOINTS } from "../../common/apiEndpoints";
import { api } from "../../library/axios";
import {
  HardwareAssetObject,
  HardwareAssetPagedItem,
} from "../../models/Hardware/hardwareAsset";
import { PagedResult } from "../../models/base/PagedResult";
import { PaginationFilter } from "../../models/base/PaginationFilter";
import { Result } from "../../models/base/Result";
import { Service } from "../Service";
import { IHardwareAssetService } from "./IHardwareAssetService";

export class HardwareAssetService
  extends Service<HardwareAssetObject, Partial<HardwareAssetObject>, Partial<HardwareAssetObject>, string>
  implements IHardwareAssetService<HardwareAssetObject, Partial<HardwareAssetObject>, Partial<HardwareAssetObject>, string> {
  constructor(endpoint: string = API_ENDPOINTS.HARDWARE.BASE) {
    super(endpoint);
  }

  async createHardwareAsset(request: Partial<HardwareAssetObject>): Promise<Result<HardwareAssetObject>> {
    const response = await api.post<Result<HardwareAssetObject>>(API_ENDPOINTS.HARDWARE.ADD_HARDWARE_ASSET, request);
    toast.success("Thêm mới dữ liệu thành công!");
    return response.data;
  }

  /**
   * Lấy danh sách thiết bị phần cứng có phân trang từ API:
   * /hardware_assets/get-hardware-assets-paged
   */
  async getPaged(params?: PaginationFilter): Promise<PagedResult<HardwareAssetPagedItem>> {
    const response = await api.get<PagedResult<HardwareAssetPagedItem>>(
      API_ENDPOINTS.HARDWARE.GET_PAGED_HARDWARE_ASSETS,
      { params }
    );

    const rawData = response.data;
    const rawItems = Array.isArray(rawData?.items) ? rawData.items : [];

    return {
      items: rawItems,
      pagination: rawData?.pagination || {
        pageIndex: params?.PageIndex || 1,
        pageSize: params?.PageSize || 10,
        totalRecords: rawItems.length,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };
  }
}
