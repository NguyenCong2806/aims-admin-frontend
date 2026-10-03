import { BaseLookupEntity } from "../../BaseEntriy/BaseLookupEntity";

export interface DigitalInternetLine extends BaseLookupEntity {
  bandwidth?: string;
  staticip?: string;
  location?: string;
  provider?: string;
  expiredate?: Date;
}

export interface CreateDigitalInternetLine extends BaseLookupEntity {
  bandwidth?: string;
  staticip?: string;
  location?: string;
  provider?: string;
  expiredate?: Date;
}

export interface UpdateDigitalInternetLine extends BaseLookupEntity {
  bandwidth?: string;
  staticip?: string;
  location?: string;
  provider?: string;
  expiredate?: Date;
}
