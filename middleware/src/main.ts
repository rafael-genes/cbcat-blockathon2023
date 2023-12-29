
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import serverlessExpress from '@vendia/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { Application } from 'express';
import { DocumentBuilder } from '@nestjs/swagger';
import { SwaggerModule } from '@nestjs/swagger/dist';
import { ErrorsInterceptor } from './shared/infrastructure/interceptors/error.interceptor';
import { AppModule } from './app.module';
import { ResponseHeaderInterceptor } from './shared/infrastructure/interceptors/response-header.interceptor';
const packageJson = require('../package.json')

let server: Handler;

// const awsServerlessExpress = require('aws-serverless-express')
// const app = require('./app')
// const server = awsServerlessExpress.createServer(app)

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule);
;
  
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ErrorsInterceptor());
  app.useGlobalInterceptors(new ResponseHeaderInterceptor());
  
  setupSwagger(app);
  await app.init();

  const expressApp: Application = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

function setupSwagger(app: INestApplication) {
  const options = new DocumentBuilder()
    .setTitle(`${process.env.APP_NAME} API docs`)
    .setDescription(`${process.env.APP_NAME} OpenAPI endpoints documentation`)
    .setVersion(packageJson.version)
    .build()
  ;
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  if (event.pathParameters ==null )  {
    event.path = '/';
  }
  else{
      event.path = '/'+event.pathParameters.proxy;
  }
  console.log("event.path", event.path);
  server = server ?? (await bootstrap()); 
  return server(event, context, callback);
};

/* export const handler: Handler = async (event: any, context: Context) => {
  // https://github.com/vendia/serverless-express/issues/86
  if (event.pathParameters ==null )  {
    event.path = '/';
  }
  else{
      event.path = '/'+event.pathParameters.proxy;
  }

awsServerlessExpress.proxy(server, event, context);
  event.path = event.pathParameters.proxy;
  cachedServer = await bootstrapServer();
  return proxy(cachedServer, event, context, 'PROMISE').promise;
}; */