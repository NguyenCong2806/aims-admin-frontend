import { API_ENDPOINTS } from "../../../common/ApiEndpoints";
import { DigitalSoftwareLicense, CreateDigitalSoftwareLicense, UpdateDigitalSoftwareLicense } from "../models/digitalsoftwarelicense";
import { Service } from "../../base/Service";

export class DigitalSoftwareLicenseService extends Service<DigitalSoftwareLicense, CreateDigitalSoftwareLicense, UpdateDigitalSoftwareLicense, number> {
    constructor(endpoint: string = API_ENDPOINTS.DIGITAL_ASSETS.SOFTWARE_LICENSES) {
        super(endpoint);
    }
}
