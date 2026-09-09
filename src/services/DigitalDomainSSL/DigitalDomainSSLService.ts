import { DigitalDomainSSL, CreateDigitalDomainSSL, UpdateDigitalDomainSSL } from "../../models/DigitalAsset/digitaldomain/digitaldomain";
import { Service } from "../Service";

export class DigitalDomainSSLService extends Service<DigitalDomainSSL, CreateDigitalDomainSSL, UpdateDigitalDomainSSL, number> {
    constructor(endpoint: string = "/digitaldomainsssls") {
        super(endpoint);
    }
}
