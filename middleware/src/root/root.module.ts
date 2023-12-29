import { Module } from "@nestjs/common";
import { RootController } from "./infrastructure/root.controller";

@Module({
  controllers: [RootController],
  providers: [
  ]
})
export class RootModule {}
