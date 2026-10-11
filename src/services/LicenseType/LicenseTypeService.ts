import { API_ENDPOINTS } from "../../common/apiEndpoints";
import { createlicensetype, licensetype, updatelicensetype } from "../../models/Lookup/licensetype/licensetype";
import { Service } from "../Service";
import { ILicenseTypeService } from "./ILicenseTypeService";

export class LicenseTypeService
  extends Service<licensetype, createlicensetype, updatelicensetype, number>
  implements ILicenseTypeService<licensetype, createlicensetype, updatelicensetype, number>
{
  constructor(endpoint = API_ENDPOINTS.LOOKUPS.LICENSE_TYPES) {
    super(endpoint);
  }
}