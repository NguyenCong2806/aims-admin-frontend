import { API_ENDPOINTS } from "../../../common/ApiEndpoints";
import { DigitalDomainSSL, CreateDigitalDomainSSL, UpdateDigitalDomainSSL } from "../models/digitaldomain";
import { Service } from "../../base/Service";

export class DigitalDomainSSLService extends Service<DigitalDomainSSL, CreateDigitalDomainSSL, UpdateDigitalDomainSSL, number> {
    constructor(endpoint: string = API_ENDPOINTS.DIGITAL_ASSETS.DOMAINS_SSL) {
        super(endpoint);
    }
}
