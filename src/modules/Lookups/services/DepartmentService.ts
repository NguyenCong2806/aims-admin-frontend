import { API_ENDPOINTS } from "../../../common/ApiEndpoints";
import { createdepartment, department, updatedepartment } from "../models";
import { Service } from "../../base/Service";
import { IDepartmentService } from "./IDepartmentService";

export class DepartmentService
  extends Service<department, createdepartment, updatedepartment, number>
  implements IDepartmentService<department, createdepartment, updatedepartment, number> {
  constructor(endpoint = API_ENDPOINTS.LOOKUPS.DEPARTMENTS) {
    super(endpoint);
  }
}