import { brand, creatbrand, updatebrand } from "../../models/Lookup/brand/brand";
import { Service } from "../Service";
import { IBrandService } from "./IBrandSerice";


export class BrandService extends Service<brand, creatbrand, updatebrand, number> implements IBrandService<brand, creatbrand, updatebrand, number> {

    constructor(endpoint: string = "/brands") {
        super(endpoint);
    }

    // Thêm các method đặc thù riêng cho Band/Brand nếu có
}