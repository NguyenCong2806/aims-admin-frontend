import { IService } from "../../base/IService";
import { hardwareassetobject, hardwareassetviewdto } from "../models/hardwareAsset";

export interface IHardwareService
  extends IService<hardwareassetviewdto, hardwareassetobject, hardwareassetobject, string> {
  generateAssetCode(categoryName: string): string;
}
