import { API_ENDPOINTS } from "../../../common/ApiEndpoints";
import { Service } from "../../base/Service";
import { HardwareAsset, HardwareTechnicalSpecs } from "../models/hardwareAsset";
import { IHardwareService } from "./IHardwareService";
import { HARDWARE_DEVICE_TYPES } from "../../../common/HardwareDeviceType";

export class HardwareService
  extends Service<HardwareAsset, Partial<HardwareAsset>, Partial<HardwareAsset>, string>
  implements IHardwareService
{
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

  getDefaultSpecs(deviceTypeId: string): Partial<HardwareTechnicalSpecs> {
    switch (deviceTypeId) {
      case "pc":
        return {
          cpu: "Intel Core i7-13700",
          ram: "32GB DDR5",
          storage: "1TB NVMe SSD",
          gpu: "NVIDIA RTX 4060 8GB",
          os: "Windows 11 Pro 64-bit",
        };
      case "laptop":
        return {
          cpu: "Intel Core i7-13700H",
          ram: "32GB LPDDR5",
          storage: "1TB NVMe SSD",
          gpu: "Intel Iris Xe Graphics",
          os: "Windows 11 Pro 64-bit",
          screenSize: "14 inch FHD IPS",
        };
      case "server":
        return {
          cpu: "Dual Intel Xeon Silver 4314 (32 Cores)",
          ram: "128GB ECC Registered DDR4",
          storage: "8x 1.92TB SAS SSD (RAID-10)",
          rackLocation: "Rack R03 - U10-U12",
          powerSupply: "Dual 800W Redundant Platinum",
        };
      case "monitor":
        return {
          screenSize: "27 inch",
          resolution: "4K UHD (3840 x 2160)",
          refreshRate: "60Hz IPS Black",
        };
      case "printer":
        return {
          printTechnology: "Laser đơn sắc đa năng",
          paperSizes: "A4, A5, Letter",
          duplex: true,
        };
      case "network":
        return {
          portCount: "24 Port Gigabit PoE+ & 4 Port 10G SFP+",
          networkSpeed: "Layer 3 Managed Gigabit Switch",
        };
      default:
        return {};
    }
  }
}

export const hardwareService = new HardwareService();
