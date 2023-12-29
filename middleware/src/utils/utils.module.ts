import { Global, Module } from "@nestjs/common";
import { EncryptionService } from "./application/encryption.service";

@Global()
@Module({
  providers: [
    EncryptionService
  ],
  exports: [
    EncryptionService
  ],
})
export class UtilsModule {

}