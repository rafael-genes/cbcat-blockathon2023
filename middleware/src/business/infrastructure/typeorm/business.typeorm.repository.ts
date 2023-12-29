import { Injectable } from "@nestjs/common";

import { DataSource, Repository } from 'typeorm';
import { BusinessRepository } from "../../domain/business.repository";
import { BusinessModel } from "../../domain/business.model";
import { BusinessSchema } from "./business.schema";


@Injectable()
export class BusinessTypeormRepository extends BusinessRepository {
  
  private repository : Repository<BusinessModel>;

  constructor(datasource: DataSource) {
    super();
    this.repository = datasource.getRepository(BusinessSchema);
  }
  
  async getAll() {
    return this.repository.find();
  }

  async save(model: BusinessModel): Promise<BusinessModel> {
    return this.repository.save(model);
  }

  async findByEmailOrFail(
    email: string
  ){
    const response = await this.repository.findOneByOrFail({email});
    return response;
  }

  async findByApiKeyOrFail(apiPrivateKey: string): Promise<BusinessModel> {
    const response = await this.repository.findOneByOrFail({apiPrivateKey})
    return response
  }

}
