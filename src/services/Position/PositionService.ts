import { createposition, position, updateposition } from "../../models/Lookup/position/position";
import { Service } from "../Service";
import { IPositionService } from "./IPositionService";

export class PositionService
  extends Service<position, createposition, updateposition, number>
  implements IPositionService<position, createposition, updateposition, number>
{
  constructor(endpoint = "/positions") {
    super(endpoint);
  }
}