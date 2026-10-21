import { API_ENDPOINTS } from "../../common/apiEndpoints";
import { contract, createcontract, updatecontract } from "../../models/Contract/contract";
import { Service } from "../Service";
import { IContractService } from "./IContractService";

export class ContractService
  extends Service<contract, createcontract, updatecontract, number>
  implements IContractService<contract, createcontract, updatecontract, number>
{
  constructor(endpoint = API_ENDPOINTS.CONTRACTS.BASE) {
    super(endpoint);
  }
}
