import { Injectable } from "@nestjs/common";
import { CustodialWalletRepository } from "../../domain/custodialWallet.repository";
import { DataSource, Repository } from "typeorm";
import { CustodialWalletModel } from "../../domain/custodialWallet.model";
import { CustodialWalletSchema } from "./custodialWallet.schema";

@Injectable()
export class CustodialWalletTypeormRepository extends CustodialWalletRepository {
  
  private repository : Repository<CustodialWalletModel>;

  constructor(datasource: DataSource) {
    super();
    this.repository = datasource.getRepository(CustodialWalletSchema);
  }
  
  async getAll() {
    return this.repository.find();
  }

  async save(model: CustodialWalletModel): Promise<CustodialWalletModel> {
    return this.repository.save(model);
  }

  async findByAddressOrFail(
    address: string
  ){
    if(!address) throw new Error('Address is required');
    const response = await this.repository.findOneByOrFail({address});
    return response;
  }
}
