import { API_ENDPOINTS } from "../../common/apiEndpoints";
import { DigitalSoftwareLicense, CreateDigitalSoftwareLicense, UpdateDigitalSoftwareLicense } from "../../models/DigitalAsset/digitalsoftwarelicense/digitalsoftwarelicense";
import { Service } from "../Service";

export class DigitalSoftwareLicenseService extends Service<DigitalSoftwareLicense, CreateDigitalSoftwareLicense, UpdateDigitalSoftwareLicense, number> {
    constructor(endpoint: string = API_ENDPOINTS.DIGITAL_ASSETS.SOFTWARE_LICENSES) {
        super(endpoint);
    }
}
