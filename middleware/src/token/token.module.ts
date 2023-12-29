import { Module } from "@nestjs/common";
import { TokenService } from "./application/token.service";
import { SharedModule } from "../shared/shared.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CqrsModule } from "@nestjs/cqrs";
import { TokenRepository } from "./domain/token.repository";
import { TokenTypeormRepository } from "./infrastructure/typeorm/token.typeorm.repository";
import { TokenController } from "./infrastructure/token.controller";
import { TokenServiceDTO } from "./application/dto/token.service.dto";
import { Web3Module } from "../web3/web3.module";


@Module({
    imports: [
        CqrsModule,
        TypeOrmModule,
        SharedModule,
        Web3Module
    ],
    exports: [
        TokenServiceDTO
    ],
    providers: [
        {
            provide: TokenServiceDTO,
            useClass: TokenService
        },
        {
            provide: TokenRepository,
            useClass: TokenTypeormRepository
        },
    ],
    controllers: [
        TokenController
    ]
})
export class TokenModule {}