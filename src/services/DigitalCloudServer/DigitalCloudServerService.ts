import { API_ENDPOINTS } from "../../common/apiEndpoints";
import { DigitalCloudServer, CreateDigitalCloudServer, UpdateDigitalCloudServer } from "../../models/DigitalAsset/digitalcloudserver/digitalcloudserver";
import { Service } from "../Service";

export class DigitalCloudServerService extends Service<DigitalCloudServer, CreateDigitalCloudServer, UpdateDigitalCloudServer, number> {
    constructor(endpoint: string = API_ENDPOINTS.DIGITAL_ASSETS.CLOUD_SERVERS) {
        super(endpoint);
    }
}
