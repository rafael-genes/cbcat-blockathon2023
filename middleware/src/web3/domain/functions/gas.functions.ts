import Web3 from "web3";

// TODO: set this properly
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
    return gasEstimate;
}

export const getRequiredGasBalanceHex = (gasEstimate: BigInt, currentBalance: BigInt, multiplier = defaultGasBalanceMultiplier) => {
    const requiredBalance = (gasEstimate as any) * BigInt(multiplier) - (currentBalance as any)
    if(requiredBalance < 0) return '0x0';
    const gasBalanceHex = '0x' + (requiredBalance).toString(16);
    return gasBalanceHex;
}
