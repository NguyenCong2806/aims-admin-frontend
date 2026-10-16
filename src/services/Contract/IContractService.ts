import { contract, createcontract, updatecontract } from "../../models/Contract/contract";
import { IService } from "../IService";

export type IContractService<
  TEntity = contract,
  TCreate = createcontract,
  TUpdate = updatecontract,
  TId = number
> = IService<TEntity, TCreate, TUpdate, TId>;

