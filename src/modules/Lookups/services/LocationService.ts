import { API_ENDPOINTS } from "../../../common/ApiEndpoints";
import { createlocation, location, updatelocation } from "../models";
import { Service } from "../../base/Service";
import { ILocationService } from "./ILocationService";

export class LocationService
  extends Service<location, createlocation, updatelocation, number>
  implements ILocationService<location, createlocation, updatelocation, number> {
  constructor(endpoint = API_ENDPOINTS.LOOKUPS.LOCATIONS) {
    super(endpoint);
  }
}