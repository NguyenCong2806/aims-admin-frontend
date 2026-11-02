import { API_ENDPOINTS } from "../../../common/ApiEndpoints";
import { costcenter, createcostcenter, updatecostcenter } from "../models";
import { Service } from "../../base/Service";
import { ICostCenterService } from "./ICostCenterService";

export class CostCenterService
  extends Service<costcenter, createcostcenter, updatecostcenter, number>
  implements ICostCenterService<costcenter, createcostcenter, updatecostcenter, number> {
  constructor(endpoint = API_ENDPOINTS.LOOKUPS.COST_CENTERS) {
    super(endpoint);
  }
}