import { API_ENDPOINTS } from "../../../common/ApiEndpoints";
import { assetcategorie, creatassetcategorie, updateassetcategorie } from "../models";
import { Service } from "../../base/Service";
import { IAssetCategoryService } from "./IAssetCategorySerice";

export class AssetCategoryService extends Service<assetcategorie, creatassetcategorie, updateassetcategorie, number>
    implements IAssetCategoryService<assetcategorie, creatassetcategorie, updateassetcategorie, number> {

    constructor(endpoint: string = API_ENDPOINTS.LOOKUPS.ASSET_CATEGORIES) {
        super(endpoint);
    }

    // Thêm các method đặc thù riêng cho Asset Category nếu có
}