import { DigitalSoftwareLicense, CreateDigitalSoftwareLicense, UpdateDigitalSoftwareLicense } from "../../models/DigitalAsset/digitalsoftwarelicense/digitalsoftwarelicense";
import { Service } from "../Service";

export class DigitalSoftwareLicenseService extends Service<DigitalSoftwareLicense, CreateDigitalSoftwareLicense, UpdateDigitalSoftwareLicense, number> {
    constructor(endpoint: string = "/digitalsoftwarelicenses") {
        super(endpoint);
    }
}
