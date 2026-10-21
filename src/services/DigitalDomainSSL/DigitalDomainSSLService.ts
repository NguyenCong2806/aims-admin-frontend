import { API_ENDPOINTS } from "../../common/apiEndpoints";
import { DigitalDomainSSL, CreateDigitalDomainSSL, UpdateDigitalDomainSSL } from "../../models/DigitalAsset/digitaldomain/digitaldomain";
import { Service } from "../Service";

export class DigitalDomainSSLService extends Service<DigitalDomainSSL, CreateDigitalDomainSSL, UpdateDigitalDomainSSL, number> {
    constructor(endpoint: string = API_ENDPOINTS.DIGITAL_ASSETS.DOMAINS_SSL) {
        super(endpoint);
    }
}
