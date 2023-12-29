import { ApiProperty } from "@nestjs/swagger"


export class TokenBalanceDTO {
    @ApiProperty()
    contractAddress: string = ''

    @ApiProperty()
    balance: number = 0

    @ApiProperty({type: String, nullable: true})
    tokenId?: string | null
}