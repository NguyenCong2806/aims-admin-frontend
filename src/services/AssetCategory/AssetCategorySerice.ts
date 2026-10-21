import { API_ENDPOINTS } from "../../common/apiEndpoints";
import { assetcategorie, creatassetcategorie, updateassetcategorie } from "../../models/Lookup/assetcategorie/assetcategorie";
import { Service } from "../Service";
import { IAssetCategoryService } from "./IAssetCategorySerice";

export class AssetCategoryService extends Service<assetcategorie, creatassetcategorie, updateassetcategorie, number> 
implements IAssetCategoryService<assetcategorie, creatassetcategorie, updateassetcategorie, number> {

    constructor(endpoint: string = API_ENDPOINTS.LOOKUPS.ASSET_CATEGORIES) {
        super(endpoint);
    }

    // Thêm các method đặc thù riêng cho Asset Category nếu có
}