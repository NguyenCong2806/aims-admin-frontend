import { API_ENDPOINTS } from "../../../common/ApiEndpoints";
import { assettype, creatassettype, updateassettype } from "../models";
import { Service } from "../../base/Service";
import { IAssetTypeService } from "./IAssetTypeSerice";

export class AssetTypeService extends Service<assettype, creatassettype, updateassettype, number>
    implements IAssetTypeService<assettype, creatassettype, updateassettype, number> {

    constructor(endpoint: string = API_ENDPOINTS.LOOKUPS.ASSET_TYPES) {
        super(endpoint);
    }

    // Thêm các method đặc thù riêng cho Asset Type nếu có
}