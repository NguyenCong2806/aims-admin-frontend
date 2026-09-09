import { BaseLookupEntity } from "../../BaseEntriy/BaseLookupEntity";

export interface DigitalSoftwareLicense extends BaseLookupEntity {
  licensekey?: string;
  seatcount?: number;
  version?: string;
  expiredate?: Date;
}

export interface CreateDigitalSoftwareLicense extends BaseLookupEntity {
  licensekey?: string;
  seatcount?: number;
  version?: string;
  expiredate?: Date;
}

export interface UpdateDigitalSoftwareLicense extends BaseLookupEntity {
  licensekey?: string;
  seatcount?: number;
  version?: string;
  expiredate?: Date;
}
