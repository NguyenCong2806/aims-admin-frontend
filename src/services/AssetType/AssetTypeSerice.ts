import { assettype, creatassettype, updateassettype } from "../../models/Lookup/assettype/assettype";
import { Service } from "../Service";
import { IAssetTypeService } from "./IAssetTypeSerice";

export class AssetTypeService extends Service<assettype, creatassettype, updateassettype, number> 
implements IAssetTypeService<assettype, creatassettype, updateassettype, number> {

    constructor(endpoint: string = "/asset-types") {
        super(endpoint);
    }

    // Thêm các method đặc thù riêng cho Asset Type nếu có
}