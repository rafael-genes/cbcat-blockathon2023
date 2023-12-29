import { Body, Controller, Post } from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "../../auth/application/decorators/public.decorator";
import { TokenCreateRequestDTO } from "../application/dto/token.request.dto";
import { TokenDTO } from "../application/dto/token.dto";
import { TokenServiceDTO } from "../application/dto/token.service.dto";

@ApiTags('Token')
@Controller('token')
export class TokenController {

    constructor(
        private readonly tokenService: TokenServiceDTO
    ){}


  @Public()
  @Post('/')
  @ApiOperation({ summary: 'TODO: Protect or remove', description: 'Create a new token' })
	@ApiBody({ type: TokenCreateRequestDTO })
	@ApiOkResponse({ description: 'Token created', type: TokenDTO })
  create(
    @Body() dto: TokenCreateRequestDTO
  ) {
    try {
        return this.tokenService.createNewToken(dto)
    } catch (error) {
        throw new Error(error.message)
    }
  }
}