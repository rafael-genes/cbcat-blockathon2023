import { Global, Module } from "@nestjs/common";
import { Web3ServiceDTO } from "./application/dto/web3.service.dto";
import { Web3Service } from "./application/web3.service";
import { Web3HttpProviderService } from "./infrastructure/providers/http-provider.service";
import { AuthenticityService } from "./infrastructure/authenticity.service";
import { WalletService } from "./application/wallet.service";
import { CustodialWalletRepository } from "./domain/custodialWallet.repository";
import { CustodialWalletTypeormRepository } from "./infrastructure/typeorm/custodialWallet.typeorm.repository";
import { RelayerService } from "./infrastructure/relayer.service";


@Global()
@Module({
  providers: [
    // TODO set this
    Web3HttpProviderService,
    RelayerService,
    WalletService,
    AuthenticityService,
    {
        provide: Web3ServiceDTO,
        useClass: Web3Service
    },
    {
        provide: CustodialWalletRepository,
        useClass: CustodialWalletTypeormRepository
    }
  ],
  exports: [
    Web3ServiceDTO,
  ],
})
export class Web3Module {

}