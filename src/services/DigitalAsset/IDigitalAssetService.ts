/* eslint-disable @typescript-eslint/no-empty-object-type */
import { IService } from "../IService";

export interface IDigitalAssetService<DigitalAsset, CreateDigitalAsset = Partial<DigitalAsset>, UpdateDigitalAsset = Partial<DigitalAsset>, TId = number>
  extends IService<DigitalAsset, CreateDigitalAsset, UpdateDigitalAsset, TId> {}