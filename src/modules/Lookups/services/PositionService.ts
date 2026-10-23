import { API_ENDPOINTS } from "../../../common/ApiEndpoints";
import { createposition, position, updateposition } from "../models";
import { Service } from "../../base/Service";
import { IPositionService } from "./IPositionService";

export class PositionService
  extends Service<position, createposition, updateposition, number>
  implements IPositionService<position, createposition, updateposition, number> {
  constructor(endpoint = API_ENDPOINTS.LOOKUPS.POSITIONS) {
    super(endpoint);
  }
}