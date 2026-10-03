import { createsupplier, supplier, updatesupplier } from "../../models/Lookup/supplier/supplier";
import { Service } from "../Service";
import { ISupplierService } from "./ISupplierService";

export class SupplierService
  extends Service<supplier, createsupplier, updatesupplier, number>
  implements ISupplierService<supplier, createsupplier, updatesupplier, number>
{
  constructor(endpoint = "/suppliers") {
    super(endpoint);
  }
}