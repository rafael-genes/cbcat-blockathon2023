import { CustodialWalletModel } from "./custodialWallet.model";

export abstract class CustodialWalletRepository {
    abstract save(model: CustodialWalletModel): Promise<CustodialWalletModel>;
    abstract getAll(): Promise<CustodialWalletModel[]>;
    abstract findByAddressOrFail(address: string): Promise<CustodialWalletModel>;
}