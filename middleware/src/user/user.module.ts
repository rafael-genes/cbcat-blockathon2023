import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '../shared/shared.module';
import { UserController } from './infrastructure/user.controller';
import { UserService } from './application/user.service';
import { UserRepository } from './domain/user.repository';
import { UserTypeormRepository } from './infrastructure/typeorm/user.typeorm.repository';
import { UserServiceDTO } from './application/dto/user.service.dto';
import { TokenModule } from '../token/token.module';

@Module({
    imports: [
        CqrsModule,
        TypeOrmModule,
        SharedModule,
        TokenModule
    ],
    exports: [
        UserServiceDTO
    ],
    providers: [
        {
            provide: UserServiceDTO,
            useClass: UserService
        },
        {
            provide: UserRepository,
            useClass: UserTypeormRepository
        },
    ],
    controllers: [
        UserController
    ]
})
export class UserModule {}
