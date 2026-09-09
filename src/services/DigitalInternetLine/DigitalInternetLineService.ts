import { DigitalInternetLine, CreateDigitalInternetLine, UpdateDigitalInternetLine } from "../../models/DigitalAsset/digitalinternetline/digitalinternetline";
import { Service } from "../Service";

export class DigitalInternetLineService extends Service<DigitalInternetLine, CreateDigitalInternetLine, UpdateDigitalInternetLine, number> {
    constructor(endpoint: string = "/digitalinternetlines") {
        super(endpoint);
    }
}
