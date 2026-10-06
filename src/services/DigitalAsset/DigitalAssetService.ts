import { API_ENDPOINTS } from "../../common/apiEndpoints";
import { toast } from "sonner";
import { api } from "../../library/axios";
import { DigitalAsset, CreateDigitalAsset, UpdateDigitalAsset } from "../../models/DigitalAsset/digitalasset/digitalasset";
import { Result } from "../../models/base/Result";
import { Service } from "../Service";
import { IDigitalAssetService } from "./IDigitalAssetService";

export class DigitalAssetService
  extends Service<DigitalAsset, CreateDigitalAsset, UpdateDigitalAsset, number>
  implements IDigitalAssetService<DigitalAsset, CreateDigitalAsset, UpdateDigitalAsset, number> {
  constructor(endpoint = API_ENDPOINTS.DIGITAL_ASSETS.BASE) {
    super(endpoint);
  }
  async adddigitalasset(request: CreateDigitalAsset): Promise<Result<DigitalAsset>> {
    const response = await api.post<Result<DigitalAsset>>(`${this.endpoint}/add-digital-assets`, request);
    toast.success("Thêm mới dữ liệu thành công!");
    return response.data;
  }
}
