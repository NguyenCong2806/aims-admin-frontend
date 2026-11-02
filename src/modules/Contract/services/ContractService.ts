import { API_ENDPOINTS } from "../../../common/ApiEndpoints";
import { contract, createcontract, updatecontract } from "../models/contract";
import { Service } from "../../base/Service";
import { IContractService } from "./IContractService";

export class ContractService
  extends Service<contract, createcontract, updatecontract, number>
  implements IContractService<contract, createcontract, updatecontract, number> {
  constructor(endpoint = API_ENDPOINTS.CONTRACTS.BASE) {
    super(endpoint);
  }
}
