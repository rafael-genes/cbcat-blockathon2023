import { ApiProperty } from "@nestjs/swagger"
import { TokenType } from "../../domain/token.model";


export class TokenCreateRequestDTO {
    @ApiProperty()
    contractAddress: string = ''

    @ApiProperty()
    abiUrl: string = ''

    @ApiProperty({enum: TokenType})
    type: TokenType = TokenType.ERC20;
}