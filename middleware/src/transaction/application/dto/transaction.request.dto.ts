import { ApiProperty } from "@nestjs/swagger"

export class TransactionCreateRequestDTO {
    @ApiProperty()
    userEmail: string = ''
    @ApiProperty()
    amount: number = 0
}