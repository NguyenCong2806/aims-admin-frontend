import { createunit, unit, updateunit } from "../../models/Lookup/unit/unit";
import { Service } from "../Service";
import { IUnitService } from "./IUnitService";

export class UnitService
  extends Service<unit, createunit, updateunit, number>
  implements IUnitService<unit, createunit, updateunit, number>
{
  constructor(endpoint = "/units") {
    super(endpoint);
  }
}