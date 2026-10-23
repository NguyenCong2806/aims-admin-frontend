import { Service } from "../../base/Service";
import { DigitalAsset, CreateDigitalAsset, UpdateDigitalAsset } from "../models";
import { IDigitalAssetService } from "./IDigitalAssetService";
import { API_ENDPOINTS } from "../../../common/ApiEndpoints";
import { api } from "../../../library/axios";
import { Result } from "../../base/models/Result";
import { toast } from "sonner";
import { APP_MESSAGES } from "../../../common/AppMessages";

export class DigitalAssetService
  extends Service<DigitalAsset, CreateDigitalAsset, UpdateDigitalAsset, number>
  implements IDigitalAssetService
{
  constructor(endpoint: string = API_ENDPOINTS.DIGITAL_ASSETS.BASE) {
    super(endpoint);
  }

  async addDigitalAsset(request: CreateDigitalAsset): Promise<Result<DigitalAsset>> {
    const response = await api.post<Result<DigitalAsset>>(`${this.endpoint}/add-digital-assets`, request);
    toast.success(APP_MESSAGES.DIGITAL_ASSET.CREATE_SUCCESS);
    return response.data;
  }

  async adddigitalasset(request: CreateDigitalAsset): Promise<Result<DigitalAsset>> {
    return this.addDigitalAsset(request);
  }
}

export const digitalAssetService = new DigitalAssetService();
