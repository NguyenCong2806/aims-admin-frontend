import { API_ENDPOINTS } from "../../../common/ApiEndpoints";
import { Service } from "../../base/Service";
import { IHardwareService } from "./IHardwareService";
import { HARDWARE_DEVICE_TYPES } from "../../../common/HardwareDeviceType";
import { hardwareassetobject, hardwareassetviewdto } from "../models/hardwareAsset";

export class HardwareService
  extends Service<hardwareassetviewdto, hardwareassetobject, hardwareassetobject, string>
  implements IHardwareService {
  constructor(endpoint: string = API_ENDPOINTS.HARDWARE.BASE) {
    super(endpoint);
  }

  generateAssetCode(categoryName: string): string {
    const matched = HARDWARE_DEVICE_TYPES.find((d) => d.categoryName === categoryName);
    const prefix = matched ? matched.prefix : "HW-GEN";
    const year = new Date().getFullYear();
    const rand = Math.floor(100 + Math.random() * 900);
    return `${prefix}-${year}-${rand}`;
  }
}