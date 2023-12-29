/* import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags('Auth')
@Controller('/')
export class AuthController {

    constructor(
    ){}


    @ApiOperation({ summary: '', description: 'check if credentials are valid, TEST only' })	
    @Get('/auth')
    @ApiBearerAuth()
    @ApiHeader({
            name: 'X-API-KEY',
            description: 'Custom business API key',
        })
    get() {
        return { sucess: true, timestamp: new Date(), };
    }
} */