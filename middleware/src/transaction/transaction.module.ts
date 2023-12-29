import { Module } from '@nestjs/common';
import { TransactionController } from './infrastructure/transaction.controller';
import { Web3Module } from '../web3/web3.module';
import { TransactionService } from './application/transaction.service';
import { TransactionServiceDTO } from './application/dto/transaction.service.dto';
import { TokenModule } from '../token/token.module';
import { UserModule } from '../user/user.module';

@Module({
    imports: [
        Web3Module,
        TokenModule,
        UserModule
    ],
    providers: [
        {
            provide: TransactionServiceDTO,
            useClass: TransactionService
        }
    ],
    controllers: [
        TransactionController
    ]
})
export class TransactionModule {}
