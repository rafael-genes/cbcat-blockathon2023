import { Injectable } from "@nestjs/common";
import { getAddressTokenBalanceByContract, getSmartContractInstance } from "../domain/functions/contract.functions";
import Web3, { Contract, ContractAbi } from "web3";
import { Web3ServiceDTO } from "./dto/web3.service.dto";
import { Web3HttpProviderService } from "../infrastructure/providers/http-provider.service";
import { WalletService } from "./wallet.service";
import { Buffer } from 'buffer';
import { createLegacyTransaction, ecrecoverToAddress, extractLegacyTxRSV, extractPermitRSV, getTransactioDataObject, getTransactionNonce, sendSignedTransaction, waitForBlocks } from "../domain/functions/transaction.functions";
import { TokenTransactionType } from "../domain/transaction.types";
import { LegacyTransaction, LegacyTxData } from "@ethereumjs/tx";
import { getChainCommon } from "../domain/functions/connection.functions";
import { encode } from "@ethereumjs/rlp";
import { ethers } from "ethers";
import { RelayerService } from "../infrastructure/relayer.service";
import { ecrecover } from "@ethereumjs/util";
import { HashAlg } from "@bloock/sdk";
import { getGasEstimate, getRequiredGasBalanceHex, getTransactionDefaultGasParams } from "../domain/functions/gas.functions";

@Injectable()
export class Web3Service extends Web3ServiceDTO {

    web3: Web3

    constructor(
        private relayerService: RelayerService,
        private providerService: Web3HttpProviderService,
        private walletService: WalletService,
    ) {
        super()
        const provider = this.providerService.getProvider()
        this.web3 = new Web3(provider)
    }


    async getAccountTokenBalance(accountAddress: string, smartContractAddress: string, contractAbi: ContractAbi, tokenId: string | null){
        const tokenContract = getSmartContractInstance(smartContractAddress, contractAbi, this.web3)
        const balance = await getAddressTokenBalanceByContract(tokenContract, accountAddress, tokenId)
        return balance
    }

    async setAddressesAsMinter(addresses: string[], smartContractAddress: string, contractAbi: ContractAbi, isActive: boolean): Promise<boolean>{
        const tokenContract = getSmartContractInstance(smartContractAddress, contractAbi, this.web3)
        const signerAddress = this.walletService.masterWallet.address

        for(let address of addresses){
            // @ts-ignore
            const method = tokenContract.methods.updateMinters(address, isActive).encodeABI()
            try {
                const nonce = await getTransactionNonce(this.web3, signerAddress)
                const txData = await this.getTransactionInput(smartContractAddress, method, nonce)
                const tx = await this.createSignedTxWithMasterWallet(txData)
                const receipt = await this.sendSignedTransaction(tx)
                console.log('receipt address as minter', receipt)
                return true
            } catch (error) {
                console.error('Error setting address as minter', error)
                throw new Error('Error setting address as minter')
            }
        }
        return true

    }

    async generateCustodialWallet(walletName: string): Promise<string>{
        try {
            const address = await this.walletService.generateCustodialWalletAddress(walletName)
            return address
        } catch (error) {
            console.error('Error generating custodial wallet', error)
            throw new Error('Error generating custodial wallet')
        }
    }

    async createTokenTransaction(
        smartContractAddress: string, 
        contractAbi: ContractAbi, 
        senderAddress: string, 
        recipientAddress: string, 
        amount: number, 
        type: TokenTransactionType) {
        
        const tokenContract = getSmartContractInstance(smartContractAddress, contractAbi, this.web3)
        const { gasLimitHex, gasPriceHex } = getTransactionDefaultGasParams(this.web3)

        const masterAddress =  this.walletService.masterWallet.address

        let signedPermitTx: LegacyTransaction

        switch (type) {
            case 'mint':

                try {
                    const isMinter = await (tokenContract as any).methods.minters(senderAddress).call()
                    if (!isMinter) throw new Error('Sender address is not minter')

                } catch (error) {
                    console.error('Error checking if address is minter', error)
                    throw new Error('Error checking if address is minter')
                }

                // 1. send gas to senderAddress

                const transferEstimateMethod = (tokenContract as any).methods.mint(recipientAddress, amount)// .encodeABI()

                const gasEstimate = await getGasEstimate(senderAddress, transferEstimateMethod)

                const senderBalance = await this.web3.eth.getBalance(senderAddress);

                const nonceGasTx = await getTransactionNonce(this.web3, masterAddress)
                const gasTxData = getTransactioDataObject(
                    senderAddress, 
                    nonceGasTx, 
                    '0x',
                    gasPriceHex, 
                    gasLimitHex,
                    getRequiredGasBalanceHex(gasEstimate, BigInt(senderBalance))
                )
                const gasTx = await this.createSignedTxWithMasterWallet(gasTxData)
                const gasReceipt = await this.sendSignedTransaction(gasTx)

                await waitForBlocks(this.web3, BigInt(1))

                // 2. mint tokens to recipientAddress
                // @ts-ignore
                const mintMethod = tokenContract.methods.mint(recipientAddress, amount).encodeABI()
                const nonce = await getTransactionNonce(this.web3, senderAddress)
                const mintTxData = await this.getTransactionInput(smartContractAddress, mintMethod, nonce)
                const signedMintTx = await this.createSignedTxWithCustodialWallet(mintTxData, senderAddress)

                this.checkTxSender(senderAddress, signedMintTx)
                return await this.sendSignedTransaction(signedMintTx)
                

            break;
            case 'transfer':

                // 1. check balance of senderAddress
                try {
                    const balance = await getAddressTokenBalanceByContract(tokenContract, senderAddress, null)
                    if (balance < amount) throw new Error('Sender address does not have enough tokens')
                } catch (error) {
                    console.error('Error checking sender address balance', error)
                    throw new Error('Error checking sender address balance')
                }
                
                // 2. permit to owner to transfer token from senderAddress to recipientAddress
                //@ts-ignore
                const senderNonce = await tokenContract.methods.nonces(senderAddress).call()
        
                const sig = await this.getPermitSignature(
                    tokenContract, 
                    senderAddress, 
                    masterAddress, 
                    amount, 
                    smartContractAddress,
                    senderNonce as any
                )
                
                // @ts-ignore
                const permitTxMethod = tokenContract.methods.permit(senderAddress, masterAddress, amount, sig.deadline, sig.v, sig.r, sig.s).encodeABI()
                const permitTxNonce = await getTransactionNonce(this.web3, masterAddress)
                const permitTxData = await this.getTransactionInput(smartContractAddress, permitTxMethod, permitTxNonce)
                signedPermitTx = await this.createSignedTxWithMasterWallet(permitTxData)

                this.sendSignedTransaction(signedPermitTx)
                
                await waitForBlocks(this.web3, BigInt(1))

                // 3. transfer tokens from senderAddress to recipientAddress
                //@ts-ignore
                const transferTxMethod = tokenContract.methods.transferFrom(senderAddress, recipientAddress, amount).encodeABI()
                const spenderTxNonce = await getTransactionNonce(this.web3, masterAddress)
                const transferTxData = await this.getTransactionInput(smartContractAddress, transferTxMethod, spenderTxNonce)
                const signedTransferTx = await this.createSignedTxWithMasterWallet(transferTxData)

                return this.sendSignedTransaction(signedTransferTx)
                

            break;
            /* case 'burn':
                // @ts-ignore
                method = tokenContract.methods.burn(amount)
            break; */
            default:
                throw new Error('Invalid token transaction type')
            break;
        }
    }



    async createSignedPermitTransaction(
        tokenContract: Contract<ContractAbi>,
        smartContractAddress: string, 
        senderAddress: string, 
        spenderAddress: string, 
        amount: number,
    ) {
        //@ts-ignore
        const senderNonce = await tokenContract.methods.nonces(senderAddress).call()
        
        const sig = await this.getPermitSignature(
            tokenContract, 
            senderAddress, 
            spenderAddress, 
            amount, 
            smartContractAddress,
            senderNonce as any
        )
        
        // @ts-ignore
        const permitTxMethod = tokenContract.methods.permit(senderAddress, masterAddress, amount, sig.deadline, sig.v, sig.r, sig.s).encodeABI()
        const permitTxNonce = await getTransactionNonce(this.web3, spenderAddress)
        const permitTxData = await this.getTransactionInput(smartContractAddress, permitTxMethod, permitTxNonce)
        const signedPermitTx = await this.createSignedTxWithMasterWallet(permitTxData)
        
        return signedPermitTx
    }   

    checkTxSender(senderAddress: string, signedTx: LegacyTransaction) {
        // @ts-ignore
        const sender = signedTx.getSenderAddress().toString('hex')
        console.log('sender...*************', sender)
        console.log('signerAddress...*************', senderAddress)
        if(sender.toLocaleLowerCase() !== senderAddress.toLocaleLowerCase()) {
            console.error('Error signing transaction - sender address does not match')
            throw new Error('Error signing transaction')
        }
        return true
    }

    private async getPermitSignature(
        tokenContract: Contract<ContractAbi>, 
        signerAddress: string, 
        spenderAddress: string,
        amount: number, 
        smartContractAddress: string,
        nonce: BigInt
    ) {
        console.log('tokenContract', tokenContract)
        console.log('signerAddress', signerAddress)
        console.log('spenderAddress', spenderAddress)
        console.log('amount', amount)
        console.log('smartContractAddress', smartContractAddress)
        console.log('nonce', nonce)

        const name = await tokenContract.methods.name().call();
        console.log('name', name)

        const chainId = getChainCommon().chainId();
        const deadline = this.getTimestampInSeconds() + 4200;

        const domain = {
            name: name as unknown as string,
            version: "1",
            verifyingContract: smartContractAddress,
            chainId: chainId.toString(),
        };

        // Define types
        const types = {
            Permit: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
            { name: "value", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" },
            ],
        };

    // Define transaction
        const values = {
            owner: signerAddress,
            spender: spenderAddress,
            deadline: deadline,
            value: amount,
            nonce: (nonce as unknown as BigInt).toString(),
        };

        // Convert Hash to Uint8Array
        const typedDataEncoded = Buffer.from(
            ethers.utils._TypedDataEncoder.hash(domain, types, values).slice(2),
            "hex"
        );

        console.log(
            "hashh: ",
            ethers.utils._TypedDataEncoder.hash(domain, types, values)
        );

        const signerWallet = await this.walletService.getCustodialWalletByAddress(signerAddress!)
        const signature = await this.walletService.signDataRemote(typedDataEncoded, signerWallet.keyId, HashAlg.None);
        
        console.log("permit signature", signature.signature);

        const signatureBytes = Buffer.from(signature.signature, "hex");
        const messageBytes = typedDataEncoded;
        const publicKeyBytes = Buffer.from(signature.kid, "hex");

        console.log(signature);
        const rsv = extractPermitRSV(
            signatureBytes,
            messageBytes,
            publicKeyBytes,
            Number(getChainCommon().chainId())
        );
        if (rsv == null) {
            console.error("error extracting rsv");
            throw new Error("error extracting transaction signature");
        }

        console.log(typedDataEncoded);
        console.log(
            typedDataEncoded.toString("hex"),
            BigInt(rsv.v),
            Buffer.from(rsv.r.slice(2), "hex").toString("hex"),
            Buffer.from(rsv.s.slice(2), "hex").toString("hex")
        );
        console.log(
            "ecrecover test",
            ecrecoverToAddress(
            ecrecover(
                typedDataEncoded,
                BigInt(rsv.v),
                Buffer.from(rsv.r.slice(2), "hex"),
                Buffer.from(rsv.s.slice(2), "hex")
            )
            )
        );

        console.log(
            "typed data encode",
            ethers.utils._TypedDataEncoder.encode(domain, types, values)
        );

        console.log(
            "typed data hash",
            ethers.utils._TypedDataEncoder.hash(domain, types, values)
        );

        return {
            v: rsv.v,
            r: rsv.r,
            s: rsv.s,
            deadline: deadline,
        };
    }

    getTimestampInSeconds() {
        // returns current timestamp in seconds
        return Math.floor(Date.now() / 1000);
    }


    private async getTransactionInput(smartContractAddress: string, method: any, nonce: bigint) {
        const { gasLimitHex, gasPriceHex } = getTransactionDefaultGasParams(this.web3)
        
        const txData = getTransactioDataObject(
            smartContractAddress, 
            nonce, 
            method,
            // maxPriorityFeePerBytes,
            gasPriceHex, 
            gasLimitHex
        )
        return txData as LegacyTxData
    }
    
    private async createSignedTxWithMasterWallet(txData: LegacyTxData) {

        const unsignedTx = createLegacyTransaction(txData)

        let signedTX = this.walletService.signMasterWalletTransaction(unsignedTx)


        return signedTX as LegacyTransaction
    }


    async createSignedTxWithCustodialWallet(txData: LegacyTxData, signerAddress: string) {

        let unsignedTx: LegacyTransaction = createLegacyTransaction(txData)
        const messageToSign = encode(unsignedTx.getMessageToSign());

        const signerWallet = await this.walletService.getCustodialWalletByAddress(signerAddress!)
        const signature = await this.walletService.signDataRemote(messageToSign, signerWallet.keyId);

        const signatureBytes = Buffer.from(signature.signature, 'hex');
        const messageBytes = Buffer.from(signature.messageHash, 'hex');
        const publicKeyBytes = Buffer.from(signature.kid, 'hex');

        const rsv = extractLegacyTxRSV(signatureBytes, messageBytes, publicKeyBytes, Number(getChainCommon().chainId()));
        if (rsv == null) {
            console.error('error extracting rsv');
            throw new Error('error extracting transaction signature');
        }

        const signedTx = createLegacyTransaction(
            {
              ...unsignedTx,
              r: rsv.r,
              s: rsv.s,
              v: rsv.v,
            },
          );
        
        return signedTx
    }

    private async sendSignedTransaction(signedTx: LegacyTransaction) {
        const txSerialized = Buffer.from(signedTx.serialize());

        try {
            const receipt = await sendSignedTransaction(this.web3, '0x' + txSerialized.toString('hex'))
            console.log('receipt', receipt)
            return receipt
        } catch (error) {
            console.error('Error sending signed transaction', error)
            throw new Error('Error sending signed transaction')
        }
    }
    
}