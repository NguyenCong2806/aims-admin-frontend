import { ContractAddendum, CreateContractAddendum, UpdateContractAddendum } from "../models/contract";
import { IService } from "../../base/IService";

export interface IContractAddendumService
  extends IService<ContractAddendum, CreateContractAddendum, UpdateContractAddendum, number> {
  getByContractId(contractId: number): Promise<ContractAddendum[]>;
}
