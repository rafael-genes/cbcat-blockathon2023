import { Module } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';

import { RootModule } from "./root/root.module";
import { SharedModule } from "./shared/shared.module";
import { UtilsModule } from "./utils/utils.module";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ErrorsInterceptor } from "./shared/infrastructure/interceptors/error.interceptor";
import { UserSchema } from "./user/infrastructure/typeorm/user.schema";
import { UserModule } from "./user/user.module";
import { BusinessModule } from "./business/business.module";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { TransactionModule } from "./transaction/transaction.module";
import { AuthModule } from "./auth/auth.module";
import { BusinessSchema } from "./business/infrastructure/typeorm/business.schema";
import { TokenSchema } from "./token/infrastructure/typeorm/token.schema";
import { TokenModule } from "./token/token.module";
import { CustodialWalletSchema } from "./web3/infrastructure/typeorm/custodialWallet.schema";

const typeOrmSchema = [
  UserSchema,
  BusinessSchema,
  TokenSchema,
  CustodialWalletSchema
]

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT!),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: process.env.ENV === 'local',
      // dropSchema: true,
    }),
    TypeOrmModule.forFeature(typeOrmSchema),
    ThrottlerModule.forRoot([{
      ttl: 10000,
      limit: 20
    }]),
    SharedModule,
    UtilsModule,
    RootModule,
    UserModule,
    BusinessModule,
    TransactionModule,
    AuthModule,
    TokenModule
  ],
  
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorsInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ],
})
export class AppModule {}
