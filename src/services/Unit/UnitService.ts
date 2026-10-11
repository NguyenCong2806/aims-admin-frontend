import { API_ENDPOINTS } from "../../common/apiEndpoints";
import { api } from "../../library/axios";
import { createunit, unit, updateunit } from "../../models/Lookup/unit/unit";
import { Service } from "../Service";
import { IUnitService } from "./IUnitService";

export class UnitService
  extends Service<unit, createunit, updateunit, number>
  implements IUnitService<unit, createunit, updateunit, number>
{
  constructor(endpoint = API_ENDPOINTS.LOOKUPS.UNITS) {
    super(endpoint);
  }

  /**
   * Import file hoặc dữ liệu đơn vị tính hàng loạt
   * Endpoint: /units/batch-import (tự động gắn tiền tố VITE_API_URL từ baseURL của axios)
   */
  async batchImport(data: File | FormData | any[]): Promise<any> {
    if (data instanceof File) {
      const formData = new FormData();
      formData.append("file", data);
      const response = await api.post(API_ENDPOINTS.LOOKUPS.UNITS_BATCH_IMPORT, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    }

    if (data instanceof FormData) {
      const response = await api.post(API_ENDPOINTS.LOOKUPS.UNITS_BATCH_IMPORT, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    }

    const response = await api.post(API_ENDPOINTS.LOOKUPS.UNITS_BATCH_IMPORT, data);
    return response.data;
  }
}