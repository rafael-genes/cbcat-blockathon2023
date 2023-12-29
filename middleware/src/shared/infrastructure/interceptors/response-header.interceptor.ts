

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

import { Response as ExpressResponse } from 'express';

@Injectable()
export class ResponseHeaderInterceptor implements NestInterceptor {
    intercept(context:ExecutionContext, next:CallHandler): Observable<any> {

        const ResponseObj:ExpressResponse = context.switchToHttp().getResponse();
        // ResponseObj.setHeader('x-access-token', 'Your Data' );
        ResponseObj.setHeader("Content-Type", "application/json; charset=utf-8");
        ResponseObj.setHeader("Access-Control-Allow-Origin", "*");
        ResponseObj.setHeader("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept");
        ResponseObj.setHeader("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");

        return next.handle();
    }
}