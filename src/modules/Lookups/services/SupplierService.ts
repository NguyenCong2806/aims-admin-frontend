import { API_ENDPOINTS } from "../../../common/ApiEndpoints";
import { api } from "../../../library/axios";
import { createsupplier, supplier, updatesupplier } from "../models";
import { Service } from "../../base/Service";
import { ISupplierService } from "./ISupplierService";

export class SupplierService
  extends Service<supplier, createsupplier, updatesupplier, number>
  implements ISupplierService<supplier, createsupplier, updatesupplier, number> {
  constructor(endpoint = API_ENDPOINTS.LOOKUPS.SUPPLIERS) {
    super(endpoint);
  }

  /**
   * Import file hoặc dữ liệu nhà cung cấp hàng loạt
   * Endpoint: /suppliers/batch-import (tự động gắn tiền tố VITE_API_URL từ baseURL của axios)
   */
  async batchImport(data: File | FormData | Record<string, unknown>[]): Promise<unknown> {
    const importEndpoint = `${this.endpoint}/batch-import`;
    if (data instanceof File) {
      const formData = new FormData();
      formData.append("file", data);
      const response = await api.post(importEndpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    }

    if (data instanceof FormData) {
      const response = await api.post(importEndpoint, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    }

    const response = await api.post(importEndpoint, data);
    return response.data;
  }
}
