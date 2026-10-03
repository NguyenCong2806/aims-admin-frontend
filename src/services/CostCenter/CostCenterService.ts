import { costcenter, createcostcenter, updatecostcenter } from "../../models/Lookup/costcenter/costcenter";
import { Service } from "../Service";
import { ICostCenterService } from "./ICostCenterService";

export class CostCenterService
  extends Service<costcenter, createcostcenter, updatecostcenter, number>
  implements ICostCenterService<costcenter, createcostcenter, updatecostcenter, number>
{
  constructor(endpoint = "/cost-center") {
    super(endpoint);
  }
}