import { API_ENDPOINTS } from "../../common/apiEndpoints";
import { assetstatus, createassetstatus, updateassetstatus } from "../../models/Lookup/assetstatus/assetstatus";
import { Service } from "../Service";
import { IAssetStatusService } from "./IAssetStatusSerice";
export class AssetStatusService extends Service<assetstatus, createassetstatus, updateassetstatus, number> 
implements IAssetStatusService<assetstatus, createassetstatus, updateassetstatus, number> {

    constructor(endpoint: string = API_ENDPOINTS.LOOKUPS.ASSET_STATUSES) {
        super(endpoint);
    }

    // Thêm các method đặc thù riêng cho Asset Status nếu có
}