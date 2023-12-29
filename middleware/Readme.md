
# blockathon2023

### Introduction

This project holds the API for blockathon2023, which serves the endpoints and integrates with some third party tools.

This project is built upon multiple layers which are needed to be executed simultaneously in order for fast development cycle (i.e.: making changes and execute code).

The layers mentioned are:
  - **Docker** ([Website](https://docs.docker.com))
    - Serving a MariaDB container
    - Serving Adminer as a UI management tool
  - **NestJS framework** ([Website](https://docs.nestjs.com))
    - Using TypeScript
    - Configured to use a serverless express tool
  - **Serverless framework** ([Website](https://www.serverless.com/framework/docs))
    - Using serverless-offline as a plugin for local development

Also it's worth mentioning that the project uses a **simpified hexagonal architecture** which splits each module in the following folder structure:
- **module-folder**
  - **application**
    - This folder contains the services, commands, use cases, etc...
  - **domain**
    - This folder contains repository abstract classes, data models, etc...
  - **infrastructure**
    - This folder contains the coupled layers, like persistance repositories, controllers, response handlers, etc...

<br />

### Run project
The following steps must be followed to execute the project locally for the first time:

##### Create an env/.env file
  You can use the base .env file as a template

##### Install dependencies
```
  $ npm install
```

##### Execute the project for local development
You need to open 3 terminals, and execute one of the following commands in each of them:
```
  // This serves the required Docker containers
  $ npm run docker
  (Important: In the database container you must manually create
   a database (utf8) with the same name you set in your DB_NAME envvar)

  // This executes and watches NestJS framework, which will update the ./dist folder
  $ npm run nest:watch

  // This runs serverless locally, simulating lambda functions and watching ./dist folder that is updated by the previous command
  $ npm run serverless:watch
```
<br />

### Recommendations
The following recommendations will make your development more confortable and faster.

##### VSCode - REST Client (extension)
This extension will allow you to send http requests directly from VSCode and use the REST/*.http files

##### Swagger
Use Swagger to document your endpoints. Swagger is already used in the project and you can access it in the /docs path.

<br />

### Project features
The project has the following features implemented and pending to be implemented:

##### Implemented

 - [x] Configure NestJS
 - [x] Configure Serverless
 - [x] Configure Serverless offline
 - [x] Prepare base Controller-Service example
 - [x] Prepare hexagonal architecture example
 - [x] Prepare example endpoint with DTO
 - [x] Prepare framework for DTO validations
 - [x] Auto reload on save
 - [x] Write Readme file
 - [x] Docker configuration
 - [x] Environment variables loading
 - [x] Prepare git repository
 - [x] Prepare automatic Swagger docs
 - [x] Database integration with TypeORM
 - [x] Decoupled model and schema for print
 - [x] Decoupled repositories
 - [x] Example save data endpoint
 - [x] Example get data endpoint

<br />

##### Pending to be implemented
###### Futuribles 1
 - [ ] Example unit test
 - [ ] Example integration test

###### Futuribles 2
 - [ ] Prepare manual deploy to AWS
 - [ ] Prepare git deploy pipeline to AWS


##### Futuribles 3
 - [ ] Endpoint to set active token
 - [ ] toggle business is minter
 - [ ] auto set all existing business minter on new contract
 - [ ] toggle active business
 - [ ] seperate create business from update (api-key only)
 - [ ] 
 - [ ] 
 - [ ] 
 - [ ] 
 - [ ] 
 - [ ] 



 #### Flow to setup

 1. create Master account 

 2. deploy smartContract with masterAdress as owner

 3. upload new businesses (important: atm businesses are set as minters on account creation) // TODO: add remove minters
