import { contract, createcontract, updatecontract } from "../models/contract";
import { IService } from "../../base/IService";

export type IContractService<
  TEntity = contract,
  TCreate = createcontract,
  TUpdate = updatecontract,
  TId = number
> = IService<TEntity, TCreate, TUpdate, TId>;

