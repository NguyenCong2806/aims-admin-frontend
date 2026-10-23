import { IService } from "../../base/IService";
import { DigitalAsset, CreateDigitalAsset, UpdateDigitalAsset } from "../models";
import { Result } from "../../base/models/Result";

export interface IDigitalAssetService
  extends IService<DigitalAsset, CreateDigitalAsset, UpdateDigitalAsset, number> {
  addDigitalAsset(request: CreateDigitalAsset): Promise<Result<DigitalAsset>>;
  adddigitalasset(request: CreateDigitalAsset): Promise<Result<DigitalAsset>>;
}
