import Web3 from "web3";

const defaultGasLimit = 100000;
const defaultGasPriceGwei = '10';
const defaultGasBalanceMultiplier = 100000000000;


export const getTransactionDefaultGasParams = (web3: Web3, gasLimit: number = defaultGasLimit, gasPriceGwei: string = defaultGasPriceGwei) => {
    const gasLimitHex = "0x" + gasLimit.toString(16);


    // Convert gas price from Gwei to Wei
    const gasPriceWei = web3.utils.toWei(gasPriceGwei, 'gwei');
    const gasPriceHex = "0x" + parseInt(gasPriceWei).toString(16);

    return {
        gasLimitHex,
        gasPriceHex
    }
}

export const getGasEstimate = async (senderAddress: string, transactionData: any) => {
    const gasEstimate = await transactionData.estimateGas({from : senderAddress});
    console.log('gasEstimate', gasEstimate, typeof gasEstimate);
    return gasEstimate;
}

export const getRequiredGasBalanceHex = async (senderAddress: string, transactionData: any, multiplier = defaultGasBalanceMultiplier) => {
    const gasEstimate = await getGasEstimate(senderAddress, transactionData);
    const gasBalance = '0x' + ((gasEstimate * BigInt(multiplier))).toString(16);
    return gasBalance;
}
