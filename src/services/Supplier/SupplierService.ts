import { API_ENDPOINTS } from "../../common/apiEndpoints";
import { api } from "../../library/axios";
import { createsupplier, supplier, updatesupplier } from "../../models/Lookup/supplier/supplier";
import { Service } from "../Service";
import { ISupplierService } from "./ISupplierService";

export class SupplierService
  extends Service<supplier, createsupplier, updatesupplier, number>
  implements ISupplierService<supplier, createsupplier, updatesupplier, number>
{
  constructor(endpoint = API_ENDPOINTS.LOOKUPS.SUPPLIERS) {
    super(endpoint);
  }

  /**
   * Import file hoặc dữ liệu nhà cung cấp hàng loạt
   * Endpoint: /suppliers/batch-import (tự động gắn tiền tố VITE_API_URL từ baseURL của axios)
   */
  async batchImport(data: File | FormData | any[]): Promise<any> {
    if (data instanceof File) {
      const formData = new FormData();
      formData.append("file", data);
      const response = await api.post(API_ENDPOINTS.LOOKUPS.SUPPLIERS_BATCH_IMPORT, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    }

    if (data instanceof FormData) {
      const response = await api.post(API_ENDPOINTS.LOOKUPS.SUPPLIERS_BATCH_IMPORT, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    }

    const response = await api.post(API_ENDPOINTS.LOOKUPS.SUPPLIERS_BATCH_IMPORT, data);
    return response.data;
  }
}