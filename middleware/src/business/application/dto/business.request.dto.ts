import { ApiProperty } from "@nestjs/swagger";
import { IsDefined } from "class-validator";

export class BusinessCreateRequestDTO {
    @IsDefined()
    @ApiProperty()
    email: string = '';

    @ApiProperty()
    businessLegalName: string = '';
}