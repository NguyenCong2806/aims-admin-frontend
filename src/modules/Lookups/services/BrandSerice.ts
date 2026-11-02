import { API_ENDPOINTS } from "../../../common/ApiEndpoints";
import { brand, creatbrand, updatebrand } from "../models";
import { Service } from "../../base/Service";
import { IBrandService } from "./IBrandSerice";

export class BrandService extends Service<brand, creatbrand, updatebrand, number> implements IBrandService<brand, creatbrand, updatebrand, number> {

    constructor(endpoint: string = API_ENDPOINTS.LOOKUPS.BRANDS) {
        super(endpoint);
    }

    // Thêm các method đặc thù riêng cho Band/Brand nếu có
}