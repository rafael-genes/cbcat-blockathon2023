import { BaseModel } from "../../shared/domain/base.model";

export class UserModel extends BaseModel {
  
  email: string = '';
  // username?: string;
  accountAddress: string = '';
  // custodialWalletName?: string;
}