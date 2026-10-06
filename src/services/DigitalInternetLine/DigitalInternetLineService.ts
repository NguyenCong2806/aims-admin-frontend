import { API_ENDPOINTS } from "../../common/apiEndpoints";
import { DigitalInternetLine, CreateDigitalInternetLine, UpdateDigitalInternetLine } from "../../models/DigitalAsset/digitalinternetline/digitalinternetline";
import { Service } from "../Service";

export class DigitalInternetLineService extends Service<DigitalInternetLine, CreateDigitalInternetLine, UpdateDigitalInternetLine, number> {
    constructor(endpoint: string = API_ENDPOINTS.DIGITAL_ASSETS.INTERNET_LINES) {
        super(endpoint);
    }
}
