import { ContractAddendum, CreateContractAddendum, UpdateContractAddendum } from "../../models/Contract/contract";
import { IService } from "../IService";

export interface IContractAddendumService
  extends IService<ContractAddendum, CreateContractAddendum, UpdateContractAddendum, number> {
  getByContractId(contractId: number): Promise<ContractAddendum[]>;
}
