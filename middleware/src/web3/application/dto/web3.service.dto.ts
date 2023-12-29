import { Bytes, ContractAbi } from "web3";
import { TokenTransactionType } from "../../domain/transaction.types";


export abstract class Web3ServiceDTO {
    abstract getAccountTokenBalance(accountAddress: string, smartContractAddress: string, contractAbi: ContractAbi,tokenId: string | null): Promise<number>
    abstract setAddressesAsMinter(addresses: string[], smartContractAddress: string, contractAbi: ContractAbi, isActive: boolean): Promise<boolean>
    abstract generateCustodialWallet(walletName: string): Promise<string>
    abstract createTokenTransaction(smartContractAddress: string, contractAbi: ContractAbi, senderAddress: string, recipientAddress: string, amount: number, type: TokenTransactionType): Promise<Bytes>
}