import { HardwareAsset, HardwareTechnicalSpecs } from "../models/hardwareAsset";
import { IService } from "../../base/IService";

export interface IHardwareService
  extends IService<HardwareAsset, Partial<HardwareAsset>, Partial<HardwareAsset>, string> {
  generateAssetCode(categoryName: string): string;
  getDefaultSpecs(deviceTypeId: string): Partial<HardwareTechnicalSpecs>;
}
