import { API_ENDPOINTS } from "../../common/apiEndpoints";
import { createunit, unit, updateunit } from "../../models/Lookup/unit/unit";
import { Service } from "../Service";
import { IUnitService } from "./IUnitService";

export class UnitService
  extends Service<unit, createunit, updateunit, number>
  implements IUnitService<unit, createunit, updateunit, number>
{
  constructor(endpoint = API_ENDPOINTS.LOOKUPS.UNITS) {
    super(endpoint);
  }
}