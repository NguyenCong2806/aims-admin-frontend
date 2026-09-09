import { DigitalAsset, CreateDigitalAsset, UpdateDigitalAsset } from "../../models/DigitalAsset/digitalasset/digitalasset";
import { Service } from "../Service";
import { IDigitalAssetService } from "./IDigitalAssetService";

export class DigitalAssetService
  extends Service<DigitalAsset, CreateDigitalAsset, UpdateDigitalAsset, number>
  implements IDigitalAssetService<DigitalAsset, CreateDigitalAsset, UpdateDigitalAsset, number>
{
  constructor(endpoint = "/digital-assets") {
    super(endpoint);
  }
}
