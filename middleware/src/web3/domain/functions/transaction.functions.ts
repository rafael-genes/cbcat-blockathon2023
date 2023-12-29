import { AccessListEIP2930Transaction, BlobEIP4844Transaction, FeeMarketEIP1559Transaction, FeeMarketEIP1559TxData, LegacyTransaction, LegacyTxData, TransactionFactory, TypedTxData } from "@ethereumjs/tx"
import Web3, { Bytes, Numbers } from "web3"
import { ecrecover } from "@ethereumjs/util";
import { getChainCommon } from "./connection.functions";
import * as ethUtil from 'ethereumjs-util'
import { convertPublicKeyToAddress } from "./account.functions";


export const getTransactionNonce = async (web3: Web3, address: string) => {
    try {
        return await web3.eth.getTransactionCount(address)
    } catch (error) {
        console.error('Error getting transaction nonce', error)
        throw new Error('Error getting transaction nonce')
    }
}

export const sendSignedTransaction = async (web3: Web3, signedTransaction: Bytes): Promise<Bytes> => {
    let receipt
    try {
        receipt =  await web3.eth.sendSignedTransaction(signedTransaction)
    } catch (error) {
        console.error('Error sending signed transaction', error)
        throw new Error('Error sending signed transaction')
    }
    return receipt.transactionHash
}


export const getGasPrice = async (web3: Web3) => {
    try {
        return await web3.eth.getGasPrice()
    } catch (error) {
        console.error('Error getting gas price', error)
        throw new Error('Error getting gas price')
    }
}

export const getGasLimit = async (web3: Web3, dataObject: any) => {
    try {
        return await web3.eth.estimateGas(dataObject)
    } catch (error) {
        console.error('Error getting gas limit', error)
        throw new Error('Error getting gas limit')
    }
}

export const getTransactioDataObject = (
    toAddress: string, 
    nonce: Numbers, 
    txMethod: any, 
    gasPrice: string,
    gasLimit: string,
    value: string = '0x0',
        ) => {
        const dataObject: LegacyTxData = {
            to: toAddress, // The transaction will be sent to the USDC contract address
            nonce: nonce, // Get the nonce of the wallet
            data: txMethod, // encoded data for the transaction
            gasLimit: gasLimit, // gas limit for the transaction (250000 gas) -> For sending ERC20 tokens, the gas limit is usually around 200,000-250,000 gas
            gasPrice: gasPrice, // TODO REMOVE
            value: value, // Value to send with the transaction
        };
        return dataObject
    }

export const createFeeMarketTransaction = (transactionData: FeeMarketEIP1559TxData) => {
    const tx = FeeMarketEIP1559Transaction.fromTxData(transactionData,
        { 
        common: getChainCommon(),
    }
    );
    return tx
}

export const createLegacyTransaction = (transactionData: LegacyTxData) => {
    const tx = LegacyTransaction.fromTxData(transactionData,
        { 
        common: getChainCommon(),
    }
    );
    return tx
}

export const createFeeMarketTransactionFromSerialized = (transactionData: Uint8Array) => {
    const tx = FeeMarketEIP1559Transaction.fromSerializedTx(transactionData, { 
        common: getChainCommon(),
    });
    return tx
}

export const signTransactionWithPrivateKey = (unsignedTx: LegacyTransaction | AccessListEIP2930Transaction | FeeMarketEIP1559Transaction | BlobEIP4844Transaction, privateKey: string) => {
    let signedTx
    try {
        signedTx = unsignedTx.sign(Buffer.from(privateKey, 'hex'))
    } catch (error) {
        console.error('Error signing transaction', error)
        throw new Error('Error signing transaction')
    }
    return signedTx
}

export const getSignatureFromSignedTransaction = (signedTx: FeeMarketEIP1559Transaction | LegacyTransaction | AccessListEIP2930Transaction | BlobEIP4844Transaction) => {
    const r = "0x" + signedTx.r!.toString(16).padStart(64, '0');
    const s = "0x" + signedTx.s!.toString(16).padStart(64, '0');
    const v = "0x" + signedTx.v!.toString(16).padStart(0, '0');

    const signature = r.substr(2) + s.substr(2) + v.substr(2);

    return {
        r,
        s,
        v,
        signature
    }

}

export async function waitForBlocks(web3: Web3, numBlocks: bigint) {
    const startBlockNumber = await web3.eth.getBlockNumber();
    const endBlockNumber = startBlockNumber + numBlocks;

    while (true) {
        const currentBlockNumber = await web3.eth.getBlockNumber();
        if (currentBlockNumber >= endBlockNumber) {
            break;
        }
        // Sleep for a bit before checking again
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}


export const ecrecoverToAddress = (publicKey: Uint8Array): string => {
    let buffer = Buffer.from(publicKey);
    const addressBuffer = ethUtil.pubToAddress(buffer, true);
    const ethereumAddress = ethUtil.bufferToHex(addressBuffer);
    return ethereumAddress;
  };


export const extractPermitRSV = (
    sig: Buffer,
    message: Buffer,
    expectedPubKey: Buffer,
    chainId: number
  ) => {
    const r = BigInt("0x" + sig.slice(0, 32).toString("hex"));
    let s = BigInt("0x" + sig.slice(32, 64).toString("hex"));
  
    const secp256k1n = BigInt(
      "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141"
    );
  
    if (s > secp256k1n / BigInt(2)) {
      s = secp256k1n - s;
    }
  
    // let v = 35 + chainId * 2 + 0;
    let v = 27 + 0;
  
    let pubKey = ecrecover(
      message,
      BigInt(v),
      Buffer.from(r.toString(16), "hex"),
      Buffer.from(s.toString(16), "hex")
      //     BigInt(chainId)
    );
  
    if (
      "04" + Buffer.from(pubKey).toString("hex") !=
      expectedPubKey.toString("hex")
    ) {
      //v = 35 + chainId * 2 + 1;
      v = 27 + 1;
    }
  
    console.log("test");
    console.log(
      message.toString("hex"),
      BigInt(v),
      r.toString(16),
      s.toString(16)
    );
    pubKey = ecrecover(
      message,
      BigInt(v),
      Buffer.from(r.toString(16), "hex"),
      Buffer.from(s.toString(16), "hex")
      // BigInt(chainId)
    );
  
    if (
      "04" + Buffer.from(pubKey).toString("hex") !=
      expectedPubKey.toString("hex")
    ) {
      throw "Invalid signature provided";
    }
  
    console.log(
      "expected address:",
      convertPublicKeyToAddress(expectedPubKey.toString("hex")),
      "got address:",
      convertPublicKeyToAddress("04" + Buffer.from(pubKey).toString("hex"))
    );
  
    return {
      r: "0x" + r.toString(16),
      s: "0x" + s.toString(16),
      v,
    };
  };

  export const extractLegacyTxRSV = (
    sig: Buffer,
    message: Buffer,
    expectedPubKey: Buffer,
    chainId: number,
  ) => {
    const r = BigInt('0x' + sig.slice(0, 32).toString('hex'));
    let s = BigInt('0x' + sig.slice(32, 64).toString('hex'));
  
    const secp256k1n = BigInt(
      '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141'
    );
  
    if (s > secp256k1n / BigInt(2)) {
      s = secp256k1n - s;
    }
  
    let v = 35 + chainId * 2;

    let pubKey = ecrecover(
      message,
      BigInt(v),
      Buffer.from(r.toString(16), 'hex'),
      Buffer.from(s.toString(16), 'hex'),
      BigInt(chainId)
    );

    const pubKeyTest = Buffer.from(pubKey);
    const address = ethUtil.bufferToHex(ethUtil.pubToAddress(pubKeyTest));

    console.log('address*****', address);
  
    if (
      '04' + Buffer.from(pubKey).toString('hex') !=
      expectedPubKey.toString('hex')
    ) {
      v = 35 + chainId * 2 + 1;
    }
  
    return {
      r: '0x' + r.toString(16),
      s: '0x' + s.toString(16),
      v,
    };
  }
