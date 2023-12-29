import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { TokenType } from "../../domain/token.model";
import { ContractAbi } from "web3";



export class TokenDTO {
    @ApiProperty()
    contractAddress: string = '';


    @ApiPropertyOptional()
    tokenId?: string;

    @ApiPropertyOptional()
    abi: ContractAbi = [];

    @ApiPropertyOptional()
    name?: string;

    @ApiPropertyOptional()
    symbol?: string;

    @ApiProperty()
    isActive: boolean = false;

    @ApiProperty({enum: TokenType})
    type: TokenType = TokenType.ERC20;
}