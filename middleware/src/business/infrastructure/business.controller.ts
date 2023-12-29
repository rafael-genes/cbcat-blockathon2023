import { Body, Controller, Post, Get, HttpException, HttpStatus, Req } from "@nestjs/common";
import { ApiTags, ApiBody, ApiNotFoundResponse, ApiOkResponse, ApiBearerAuth, ApiOperation, ApiHeader } from "@nestjs/swagger";
import { BusinessCreateRequestDTO } from "../application/dto/business.request.dto";
import { Public } from "../../auth/application/decorators/public.decorator";
import { BusinessServiceDTO } from "../application/dto/business.service.dto";
import { BusinessTokenBalancesDTO, BusinessTokenBalancesNewDTO } from "../application/dto/business.dto";

@ApiTags('Business')

@Controller('business')
export class BusinessController {

	constructor(
		private businessService: BusinessServiceDTO
	) {}
	/* @Post('/check')
	@ApiBearerAuth()
	@ApiHeader({
		name: 'X-API-KEY',
		description: 'Custom business API key',
	})
	@ApiOperation({ summary: 'PLEASE REPLACE WITH GET /me', description: 'Deprecated (Replace with GET) - Retrieve a business account by email' })
	@ApiBody({ type: BusinessCreateRequestDTO })
	@ApiOkResponse({ description: 'Business found', type: BusinessTokenBalancesDTO })
	@ApiNotFoundResponse({ description: 'Business not found' })
	async getByEmail(
		@Req() request: Request,
		@Body() dto: BusinessCreateRequestDTO
	) {
		try {
			const business = (request as any)['business'] 
			return await this.businessService.getBusinessTokenBalancesDTO(business)
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.NOT_FOUND)
		}
	} */

	@Get('/me')
	@ApiBearerAuth()
	@ApiHeader({
		name: 'X-API-KEY',
		description: 'Custom business API key',
	})
	@ApiOperation({ summary: '', description: 'Retrieve by api key' })
	@ApiOkResponse({ description: 'Business found', type: BusinessTokenBalancesDTO })
	@ApiNotFoundResponse({ description: 'Business not found' })
	async getByApiKey(
		@Req() request: Request,
	) {
		try {
			const business = (request as any)['business']
			return await this.businessService.getBusinessTokenBalancesDTO(business)
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.NOT_FOUND)
		}
	}
	
	@Post('/account')
	@Public()
	@ApiOperation({ summary: '', description: 'Create or update a new business account' })
	@ApiBody({ type: BusinessCreateRequestDTO })
	@ApiOkResponse({ description: 'Business created', type: BusinessTokenBalancesNewDTO || BusinessTokenBalancesDTO })
	  async create(
		@Body() dto: BusinessCreateRequestDTO
	) {
		try {
			return await this.businessService.createOrUpdateBusiness(dto);
		} catch (error) {
			throw new Error(error.message)
		}
	}
}