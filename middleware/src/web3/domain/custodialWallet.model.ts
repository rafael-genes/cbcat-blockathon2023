import { BaseModel } from "../../shared/domain/base.model";


export class CustodialWalletModel extends BaseModel {
    address: string = '';
    name: string = '';
    keyId: string = '';
    }