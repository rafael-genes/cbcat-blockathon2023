import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '../shared/shared.module';
import { BusinessController } from './infrastructure/business.controller';
import { BusinessRepository } from './domain/business.repository';
import { BusinessTypeormRepository } from './infrastructure/typeorm/business.typeorm.repository';
import { BusinessService } from './application/business.service';
import { UtilsModule } from '../utils/utils.module';
import { BusinessServiceDTO } from './application/dto/business.service.dto';
import { TokenModule } from '../token/token.module';

@Module({
    imports: [
        CqrsModule,
        TypeOrmModule,
        SharedModule,
        UtilsModule,
        TokenModule
    ],
    exports: [
        BusinessServiceDTO
    ],
    providers: [
        {
            provide: BusinessServiceDTO,
            useClass: BusinessService
        },
        {
            provide: BusinessRepository,
            useClass: BusinessTypeormRepository
        },
    ],
    controllers: [
        BusinessController
    ]
})
export class BusinessModule {}
