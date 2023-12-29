import { ApiProperty } from "@nestjs/swagger"
import { UserDTO } from "../../../user/application/dto/user.dto"


export class UserTransactionDTO extends UserDTO {
    @ApiProperty()
    transactionHash: string = ''
}