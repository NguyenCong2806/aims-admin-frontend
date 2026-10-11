import { BaseLookupEntity } from "../../BaseEntriy/BaseLookupEntity";

export interface maintenancetype extends BaseLookupEntity {
  isPreventive?: boolean;
}

export interface createmaintenancetype extends BaseLookupEntity {
  isPreventive?: boolean;
}

export interface updatemaintenancetype extends BaseLookupEntity {
  isPreventive?: boolean;
}