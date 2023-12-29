import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TransactionCreateRequestDTO } from '../application/dto/transaction.request.dto';
import { UserTransactionDTO } from '../application/dto/transaction.dto';
import { TransactionServiceDTO } from '../application/dto/transaction.service.dto';
import { BusinessDTO } from '../../business/application/dto/business.dto';

@ApiTags('Transaction')
@Controller('transaction')
export class TransactionController {

    constructor(
        private transactionService: TransactionServiceDTO
    ) {
    }

    @Post('/earn')
    @ApiBearerAuth()
    @ApiHeader({
		name: 'X-API-KEY',
		description: 'Custom business API key',
	})
	@ApiOperation({ summary: '', description: 'Add credits to account' })
    @ApiBody({ type: TransactionCreateRequestDTO })
    @ApiOkResponse({ description: 'Transaction complete', type: UserTransactionDTO })
    async earn(
        @Req() request: Request,
        @Body() dto: TransactionCreateRequestDTO
        ){

        const business: BusinessDTO = (request as any)['business']
        return await this.transactionService.createEarnCreditsTransaction(business, dto)

    }




    @Post('/spend')
    @ApiBearerAuth()
    @ApiHeader({
		name: 'X-API-KEY',
		description: 'Custom business API key',
	})
	@ApiOperation({ summary: '', description: 'Spend credits from account' })
    @ApiBody({ type: TransactionCreateRequestDTO })
    @ApiOkResponse({ description: 'Transaction complete', type: UserTransactionDTO })
    async spend(
        @Req() request: Request,
        @Body() dto: TransactionCreateRequestDTO
        ){
        
        const business: BusinessDTO = (request as any)['business']
        return await this.transactionService.createSpendCreditsTransaction(business, dto)

    }

}



