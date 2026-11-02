import { BaseLookupEntity } from "../../base/models/BaseLookupEntity";

export interface licensetype extends BaseLookupEntity {
  isSubscription?: boolean;
}

export interface createlicensetype extends BaseLookupEntity {
  isSubscription?: boolean;
}

export interface updatelicensetype extends BaseLookupEntity {
  isSubscription?: boolean;
}