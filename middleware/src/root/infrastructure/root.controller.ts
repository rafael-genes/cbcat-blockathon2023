import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../auth/application/decorators/public.decorator";

@ApiTags('Root')
@Controller('/')
export class RootController {

  @Public()
  @Get('/')
  get() {
    return { message: `Welcome to ${process.env.APP_NAME} API` };
  }

  @Public()
  @Get('/healthcheck')
  gets() {
    return { sucess: true, timestamp: new Date() };
  }

}
