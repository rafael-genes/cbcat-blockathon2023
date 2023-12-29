import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDefined } from "class-validator";

export class UserCreateRequestDTO {
    @IsDefined()
    @ApiProperty()
    email: string = '';

    /* @ApiPropertyOptional()
    username?: string; */
}