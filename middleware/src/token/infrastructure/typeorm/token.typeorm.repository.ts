import { Injectable } from "@nestjs/common";

import { DataSource, Repository } from 'typeorm';
import { TokenRepository } from "../../domain/token.repository";
import { TokenModel } from "../../domain/token.model";
import { TokenSchema } from "./token.schema";


@Injectable()
export class TokenTypeormRepository extends TokenRepository {
  
  private repository : Repository<TokenModel>;

  constructor(datasource: DataSource) {
    super();
    this.repository = datasource.getRepository(TokenSchema);
  }

  async save(model: TokenModel) {
    return this.repository.save(model);
  }
  
  async getAll() {
    return this.repository.find();
  }

  async getActive() {
    return this.repository.find({ where: { isActive: true } });
  }

  async findByContractAddressOrFail(contractAddress: string) {
    return this.repository.findOneByOrFail({ contractAddress });
  }

  async findTokensByParams(paramKey: string, paramValue: string | boolean | number): Promise<TokenModel[]> {
    return this.repository.find({ where: { [paramKey]: paramValue } });
  }

}
