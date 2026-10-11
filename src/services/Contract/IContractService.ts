import { contract, createcontract, updatecontract } from "../../models/Contract/contract";
import { IService } from "../IService";

export interface IContractService<
  TEntity = contract,
  TCreate = createcontract,
  TUpdate = updatecontract,
  TId = number
> extends IService<TEntity, TCreate, TUpdate, TId> {}
