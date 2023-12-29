import { Injectable } from "@nestjs/common";
import { UserModel } from "./user.model";

@Injectable()
export abstract class UserRepository {

  abstract save(model: UserModel): Promise<UserModel>;
  abstract getAll(): Promise<UserModel[]>;
  abstract findByEmailOrFail(email: string): Promise<UserModel>;
}
