import { Injectable } from "@nestjs/common";
import { AuthenticityService } from "../infrastructure/authenticity.service";
import { convertPublicKeyToAddress } from "../domain/functions/account.functions";
import { CustodialWalletModel } from "../domain/custodialWallet.model";
import { CustodialWalletRepository } from "../domain/custodialWallet.repository";
import { AccessListEIP2930Transaction, BlobEIP4844Transaction, FeeMarketEIP1559Transaction, FeeMarketEIP1559TxData, LegacyTransaction, TransactionFactory, TypedTxData } from "@ethereumjs/tx"

import { signTransactionWithPrivateKey } from "../domain/functions/transaction.functions";
import { HashAlg } from "@bloock/sdk";

@Injectable()
export class WalletService {

    readonly masterWallet = {
        privateKey: process.env.MASTER_WALLET_PRIVATE_KEY!,
        address: process.env.MASTER_WALLET_ADDRESS!
    }

    constructor(
        private readonly authenticityService: AuthenticityService,
        private repository: CustodialWalletRepository
    ) {}

    signMasterWalletTransaction(transaction: LegacyTransaction | AccessListEIP2930Transaction | FeeMarketEIP1559Transaction | BlobEIP4844Transaction){
        return signTransactionWithPrivateKey(transaction, this.masterWallet.privateKey)
    }

    async generateCustodialWalletAddress(walletName: string){
        try {
            const key = await this.authenticityService.createKey(walletName)

            const hexString = key.key;

            const address = convertPublicKeyToAddress(hexString)

            const wallet = new CustodialWalletModel()

            // TODO: store address as hash in database, but return the actual address
            wallet.address = address
            wallet.name = walletName
            wallet.keyId = key.id

            await this.repository.save(wallet)

            return address
        
        } catch (error) {
            console.error(error)
            throw new Error('Error generating custodial wallet')
        }
    }

    async getCustodialWalletByAddress(address: string){
        return await this.repository.findByAddressOrFail(address)
    }


    async signDataRemote(data: Uint8Array, walletKeyId: string, hashAlg: HashAlg = HashAlg.Keccak256){
        return await this.authenticityService.signWithBloock(data, walletKeyId, hashAlg)
    }

}