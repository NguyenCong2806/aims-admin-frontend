import { API_ENDPOINTS } from "../../../common/ApiEndpoints";
import { DigitalCloudServer, CreateDigitalCloudServer, UpdateDigitalCloudServer } from "../models/digitalcloudserver";
import { Service } from "../../base/Service";

export class DigitalCloudServerService extends Service<DigitalCloudServer, CreateDigitalCloudServer, UpdateDigitalCloudServer, number> {
    constructor(endpoint: string = API_ENDPOINTS.DIGITAL_ASSETS.CLOUD_SERVERS) {
        super(endpoint);
    }
}
