import { API_ENDPOINTS } from "../../../common/ApiEndpoints";
import { DigitalInternetLine, CreateDigitalInternetLine, UpdateDigitalInternetLine } from "../models/digitalinternetline";
import { Service } from "../../base/Service";

export class DigitalInternetLineService extends Service<DigitalInternetLine, CreateDigitalInternetLine, UpdateDigitalInternetLine, number> {
    constructor(endpoint: string = API_ENDPOINTS.DIGITAL_ASSETS.INTERNET_LINES) {
        super(endpoint);
    }
}
