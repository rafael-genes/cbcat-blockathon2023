import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDefined } from "class-validator";
import { TokenBalanceDTO } from "../../../token/application/dto/tokenBalance.dto";


export class UserDTO {
    @IsDefined()
    @ApiProperty()
    email: string = '';

    @ApiProperty()
    accountAddress: string = '';

    /* @ApiPropertyOptional()
    username?: string; */

}

export class UserTokenBalancesDTO extends UserDTO {
    @ApiProperty({ type: [TokenBalanceDTO] })
    tokenBalances: TokenBalanceDTO[] = [];
}