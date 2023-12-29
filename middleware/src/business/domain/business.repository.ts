import { Injectable } from "@nestjs/common";
import { BusinessModel } from "./business.model";

@Injectable()
export abstract class BusinessRepository {

  abstract save(model: BusinessModel): Promise<BusinessModel>;
  abstract getAll(): Promise<BusinessModel[]>;
  abstract findByEmailOrFail(id: string): Promise<BusinessModel>;
  abstract findByApiKeyOrFail(hashedKey: string): Promise<BusinessModel>;
}
