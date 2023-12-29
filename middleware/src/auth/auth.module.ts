
import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "./application/guards/auth.guard";
// import { AuthController } from "./infrastructure/auth.controller";
import { AuthService } from "./application/auth.service";
import { BusinessModule } from "../business/business.module";
import { UtilsModule } from "../utils/utils.module";
import { ThrottlerGuard } from "@nestjs/throttler";

@Module({
  imports: [
    BusinessModule,
    UtilsModule
  ],
  exports: [
  ],
  providers: [
    AuthService,
    {
        provide: APP_GUARD,
        useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
  }
  ],
  controllers: [
    // AuthController
  ]
})
export class AuthModule {}