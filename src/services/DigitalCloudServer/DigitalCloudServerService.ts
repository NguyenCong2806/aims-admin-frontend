import { DigitalCloudServer, CreateDigitalCloudServer, UpdateDigitalCloudServer } from "../../models/DigitalAsset/digitalcloudserver/digitalcloudserver";
import { Service } from "../Service";

export class DigitalCloudServerService extends Service<DigitalCloudServer, CreateDigitalCloudServer, UpdateDigitalCloudServer, number> {
    constructor(endpoint: string = "/digitalcloudservers") {
        super(endpoint);
    }
}
