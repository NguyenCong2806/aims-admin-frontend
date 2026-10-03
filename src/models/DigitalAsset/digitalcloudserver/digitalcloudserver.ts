import { BaseLookupEntity } from "../../BaseEntriy/BaseLookupEntity";

export interface DigitalCloudServer extends BaseLookupEntity {
  ipaddress?: string;
  cpu?: string;
  ram?: string;
  os?: string;
  cloudprovider?: string;
  expiredate?: Date;
}

export interface CreateDigitalCloudServer extends BaseLookupEntity {
  ipaddress?: string;
  cpu?: string;
  ram?: string;
  os?: string;
  cloudprovider?: string;
  expiredate?: Date;
}

export interface UpdateDigitalCloudServer extends BaseLookupEntity {
  ipaddress?: string;
  cpu?: string;
  ram?: string;
  os?: string;
  cloudprovider?: string;
  expiredate?: Date;
}
