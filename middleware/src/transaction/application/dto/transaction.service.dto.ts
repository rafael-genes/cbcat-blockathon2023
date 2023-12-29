import { BusinessDTO } from "../../../business/application/dto/business.dto";
import { UserTransactionDTO } from "./transaction.dto";
import { TransactionCreateRequestDTO } from "./transaction.request.dto";


export abstract class TransactionServiceDTO {
    abstract createEarnCreditsTransaction(business: BusinessDTO, transactionRequest: TransactionCreateRequestDTO):Promise<UserTransactionDTO>
    abstract createSpendCreditsTransaction(business: BusinessDTO, transactionRequest: TransactionCreateRequestDTO):Promise<UserTransactionDTO>
}