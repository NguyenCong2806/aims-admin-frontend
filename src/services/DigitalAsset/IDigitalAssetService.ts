/* eslint-disable @typescript-eslint/no-explicit-any */
import { IService } from "../IService";

export interface IDigitalAssetService<
  DigitalAsset,
  CreateDigitalAsset = Partial<DigitalAsset>,
  UpdateDigitalAsset = Partial<DigitalAsset>,
  TId = number
> extends IService<DigitalAsset, CreateDigitalAsset, UpdateDigitalAsset, TId> {

  adddigitalasset(request: CreateDigitalAsset): Promise<any>;

}