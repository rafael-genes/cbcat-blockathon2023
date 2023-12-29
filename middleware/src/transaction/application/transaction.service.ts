import { Injectable } from "@nestjs/common";
import { TransactionServiceDTO } from "./dto/transaction.service.dto";
import { UserTransactionDTO } from "./dto/transaction.dto";
import { BusinessDTO } from "../../business/application/dto/business.dto";
import { TransactionCreateRequestDTO } from "./dto/transaction.request.dto";
import { Web3ServiceDTO } from "../../web3/application/dto/web3.service.dto";
import { TokenServiceDTO } from "../../token/application/dto/token.service.dto";
import { UserServiceDTO } from "../../user/application/dto/user.service.dto";


@Injectable()
export class TransactionService extends TransactionServiceDTO {
  constructor(

    private readonly web3Service: Web3ServiceDTO,
    private readonly tokenService: TokenServiceDTO,
    private readonly userService: UserServiceDTO,
  ) {
    super();
    
  }

    async createEarnCreditsTransaction(business: BusinessDTO, transactionRequest: TransactionCreateRequestDTO):Promise<UserTransactionDTO>{

        // get active credit token
        const creditToken = await this.tokenService.getActiveCreditToken()
        if(!creditToken) throw new Error('No active credit token found')

        const user = await this.userService.getUserTokenBalancesDTOFromEmail(transactionRequest.userEmail)
        if(!user) throw new Error('User not found')

        // TODO check fail
        let transaction: string | Uint8Array
        const contractAddress = creditToken.contractAddress 
        const contractAbi = creditToken.abi
        const senderAddress = business.accountAddress
        const recipientAddress = user.accountAddress
        const amount = transactionRequest.amount
        const type = 'mint'
        try {
          transaction = await this.web3Service.createTokenTransaction(
            contractAddress, 
            contractAbi, 
            senderAddress, 
            recipientAddress, 
            amount, 
            type
          )
        } catch (error) {

          console.error('Error minting tokens', error)
          throw new Error('Error minting tokens: ' + error.message || '')
        }
        
        return {
          accountAddress: user.accountAddress,
          email: transactionRequest.userEmail,
          transactionHash: transaction.toString() // Convert transaction to string
        }
    }


    async createSpendCreditsTransaction(business: BusinessDTO, transactionRequest: TransactionCreateRequestDTO):Promise<UserTransactionDTO>{

      // get active credit token
      const creditToken = await this.tokenService.getActiveCreditToken()
      if(!creditToken) throw new Error('No active credit token found')

      const user = await this.userService.getUserTokenBalancesDTOFromEmail(transactionRequest.userEmail)
      if(!user) throw new Error('User not found')

      const userBalance = user.tokenBalances.find(tokenBalance => tokenBalance.contractAddress === creditToken.contractAddress)
      
      if(!userBalance || userBalance.balance < transactionRequest.amount) throw new Error('User does not have enough tokens to spend')

      let transaction: string | Uint8Array
      
      const contractAddress = creditToken.contractAddress 
      const contractAbi = creditToken.abi
      const senderAddress = user.accountAddress
      const recipientAddress = business.accountAddress
      const amount = transactionRequest.amount
      const type = 'transfer'
      try {
        transaction = await this.web3Service.createTokenTransaction(
          contractAddress, 
          contractAbi, 
          senderAddress, 
          recipientAddress, 
          amount, 
          type
        )
      } catch (error) {

        console.error('Error transfer tokens', error)
        throw new Error('Error transfer tokens: ' + error.message || '')
      }
      
      return {
        accountAddress: user.accountAddress,
        email: transactionRequest.userEmail,
        transactionHash: transaction.toString() // Convert transaction to string
      }
    }

}