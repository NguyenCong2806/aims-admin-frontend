import { API_ENDPOINTS } from "../../common/apiEndpoints";
import { createlocation, location, updatelocation } from "../../models/Lookup/location/location";
import { Service } from "../Service";
import { ILocationService } from "./ILocationService";

export class LocationService
  extends Service<location, createlocation, updatelocation, number>
  implements ILocationService<location, createlocation, updatelocation, number>
{
  constructor(endpoint = API_ENDPOINTS.LOOKUPS.LOCATIONS) {
    super(endpoint);
  }
}