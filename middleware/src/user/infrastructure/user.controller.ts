import { Body, Controller, Post, Get, HttpException, HttpStatus, Param } from "@nestjs/common";
import { ApiTags, ApiBody, ApiParam, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiBearerAuth, ApiHeader } from "@nestjs/swagger";
import { UserCreateRequestDTO } from "../application/dto/user.request.dto";
import { Public } from "../../auth/application/decorators/public.decorator";
import { UserServiceDTO } from "../application/dto/user.service.dto";
import { UserTokenBalancesDTO } from "../application/dto/user.dto";

@ApiTags('User')
@Controller('user')
export class UserController {

	constructor(
		private userService: UserServiceDTO
	) {}
	/* @Public()
	@Get('/account/:email')
	@ApiOperation({ summary: 'PLEASE REPLACE WITH POST /check', description: 'DEPRECATED (should not expose email in params) - Get a user account by email' })
	@ApiParam({ name: 'email', type: String, required: true })
	@ApiOkResponse({ description: 'User found', type: UserTokenBalancesDTO })
	@ApiNotFoundResponse({ description: 'User not found' })
	async getByEmail(
		@Param() params: { email: string}
	) {
		try {
			const user = await this.userService.getUserTokenBalancesDTOFromEmail(params.email)
			return user
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.NOT_FOUND)
		}
	} */

	@Public()
	@Post('/check')
	@ApiOperation({ summary: '', description: 'Get a user account by email' })
	@ApiBody({ type: UserCreateRequestDTO })
	@ApiOkResponse({ description: 'User found', type: UserTokenBalancesDTO })
	@ApiNotFoundResponse({ description: 'User not found' })
	async checkAccountEmail(
		@Body() dto: UserCreateRequestDTO
	) {
		try {
			const user = await this.userService.getUserTokenBalancesDTOFromEmail(dto.email)
			return user
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.NOT_FOUND)
		}
	}

	@ApiBearerAuth()
	@Post('/account')
	@ApiHeader({
		name: 'X-API-KEY',
		description: 'Custom business API key',
	})
	@ApiOperation({ summary: '', description: 'Create or update an user account' })
	@ApiBody({ type: UserCreateRequestDTO })
	@ApiOkResponse({ description: 'User created', type: UserTokenBalancesDTO })
	  async create(
		@Body() dto: UserCreateRequestDTO
	) {
		try {
			return await this.userService.createOrUpdateUser(dto);
		} catch (error) {
			throw new Error(error.message)
		}
	}
}