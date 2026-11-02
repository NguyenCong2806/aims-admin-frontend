import { API_ENDPOINTS } from "../../../common/ApiEndpoints";
import { createlicensetype, licensetype, updatelicensetype } from "../models";
import { Service } from "../../base/Service";
import { ILicenseTypeService } from "./ILicenseTypeService";

export class LicenseTypeService
  extends Service<licensetype, createlicensetype, updatelicensetype, number>
  implements ILicenseTypeService<licensetype, createlicensetype, updatelicensetype, number> {
  constructor(endpoint = API_ENDPOINTS.LOOKUPS.LICENSE_TYPES) {
    super(endpoint);
  }
}