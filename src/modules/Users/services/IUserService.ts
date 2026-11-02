import { UserAccount, UserAccountFilter } from "../models/userAccount";
import { IService } from "../../base/IService";

export interface IUserService extends Partial<IService<UserAccount, Partial<UserAccount>, Partial<UserAccount>, number>> {
  getUsers(filter?: UserAccountFilter): Promise<UserAccount[]>;
}
