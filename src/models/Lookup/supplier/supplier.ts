import { BaseLookupEntity } from "../../BaseEntriy/BaseLookupEntity";

export interface supplier extends BaseLookupEntity {
  taxCode?: string;
  phone?: string;
  email?: string;
  address?: string;
  contactPerson?: string;
}

export interface createsupplier extends BaseLookupEntity {
  taxCode?: string;
  phone?: string;
  email?: string;
  address?: string;
  contactPerson?: string;
}

export interface updatesupplier extends BaseLookupEntity {
  taxCode?: string;
  phone?: string;
  email?: string;
  address?: string;
  contactPerson?: string;
}