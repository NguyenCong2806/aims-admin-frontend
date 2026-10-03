import { createlocation, location, updatelocation } from "../../models/Lookup/location/location";
import { Service } from "../Service";
import { ILocationService } from "./ILocationService";

export class LocationService
  extends Service<location, createlocation, updatelocation, number>
  implements ILocationService<location, createlocation, updatelocation, number>
{
  constructor(endpoint = "/location") {
    super(endpoint);
  }
}