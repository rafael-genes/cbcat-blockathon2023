import { BaseModel } from "../../shared/domain/base.model";

export class BusinessModel extends BaseModel {
  
  email: string = '';
  businessLegalName: string = '';
  accountAddress?: string;
  // custodialWalletId?: string;
  apiPrivateKey?: string;
  isActive: boolean = false;
}