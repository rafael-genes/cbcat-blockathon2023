import { Injectable } from "@nestjs/common";

import { DataSource, Repository } from 'typeorm';
import { UserSchema } from "./user.schema";
import { UserModel } from "../../domain/user.model";
import { UserRepository } from "../../domain/user.repository";

@Injectable()
export class UserTypeormRepository extends UserRepository {
  
  private repository : Repository<UserModel>;

  constructor(datasource: DataSource) {
    super();
    this.repository = datasource.getRepository(UserSchema);
  }
  
  async getAll() {
    return this.repository.find();
  }

  async save(model: UserModel): Promise<UserModel> {
    return this.repository.save(model);
  }

  async findByEmailOrFail(
    email: string
  ){
    if(!email) throw new Error('Email is required');
    const response = await this.repository.findOneByOrFail({email});
    return response;
  }

}
