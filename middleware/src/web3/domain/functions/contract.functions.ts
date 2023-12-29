import Web3, { Contract, ContractAbi } from "web3"
import { convertBigNumberToNumber } from "./helper.functions"


/** @description get the smart contract instance
* @param smartContractAddress 
* @param abi 
* @param web3
* @returns Contract | null
*/
export function getSmartContractInstance(smartContractAddress: string, contractAbi: any, web3: Web3): Contract<ContractAbi> {
 // get the web3 connection
 try {
   const contract = new web3.eth.Contract(contractAbi, smartContractAddress)
   return contract
 } catch (error) {
   console.error('Error getting smart contract instance', error)
   throw new Error('Error getting smart contract instance')
 }
}


/**
   * @description get the token balance for a given contract address and optional token id
   * @param contract
   * @param address
   * @param tokenId
   * @returns 
   */
export const getAddressTokenBalanceByContract = async (contract: Contract<ContractAbi>, accountAddress: string, tokenId: string | null) => {

    const params = [accountAddress]
    if(tokenId) params.push(tokenId)
    const tokenBalance = await callContractMethod(contract, 'balanceOf', params) 

    const balanceBigNumber = convertBigNumberToNumber(tokenBalance)
    return balanceBigNumber
  }


/**
   * @description call a contract method with params
   * @param contract 
   * @param methodName 
   * @param params 
   * @returns 
   */
export const callContractMethod = async (contract: Contract<ContractAbi>, methodName: string, params?: any[]) => {
    // check if contract has method with methodName
    if(!contract.methods[methodName]) {
      console.error('Contract does not have method', methodName)
      throw new Error('Contract does not have method')
    }
    
    try {
      if(!params) {
        const receipt = await contract.methods[methodName]().call()
        return receipt;
      }
      const receipt = await (contract as any).methods[methodName](...params).call()
      return receipt;
    } catch (error) {
      console.error('Error executing contract method', error)
      throw new Error('Error executing contract method')
    }
  }