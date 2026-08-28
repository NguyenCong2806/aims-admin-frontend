import { BrandService } from "../services/Brand/BrandSerice";

export class ServiceContainer {
  public readonly brand: BrandService;

  constructor() {
    this.brand = new BrandService();

  }
}

export const services = new ServiceContainer();