import { BaseLookupEntity } from "../../base/models/BaseLookupEntity";

export interface costcenter extends BaseLookupEntity {
  budgetLimit?: number;
  fiscalYear?: number;
}

export interface createcostcenter extends BaseLookupEntity {
  budgetLimit?: number;
  fiscalYear?: number;
}

export interface updatecostcenter extends BaseLookupEntity {
  budgetLimit?: number;
  fiscalYear?: number;
}