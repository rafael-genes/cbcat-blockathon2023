import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDefined } from "class-validator";
import { TokenBalanceDTO } from "../../../token/application/dto/tokenBalance.dto";

export class BusinessDTO {
    @IsDefined()
    @ApiProperty()
    email: string = '';

    @ApiProperty()
    accountAddress: string = '';

    @ApiPropertyOptional()
    businessLegalName: string = '';

    @ApiProperty()
    isActive: boolean = false;
}

export class BusinessApiKeyDTO extends BusinessDTO {
    @ApiProperty()
    apiPrivateKey: string = '';
}


export class BusinessTokenBalancesDTO extends BusinessDTO {

    @ApiProperty({ type: [TokenBalanceDTO] })
    tokenBalances: TokenBalanceDTO[] = [];
}

export class BusinessTokenBalancesNewDTO extends BusinessTokenBalancesDTO {
    @ApiProperty()
    apiPrivateKey: string = '';
}

