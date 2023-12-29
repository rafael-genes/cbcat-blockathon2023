import { Injectable } from "@nestjs/common";
import { TokenModel } from "./token.model";

@Injectable()
export abstract class TokenRepository {

  abstract save(model: TokenModel): Promise<TokenModel>;
  abstract getAll(): Promise<TokenModel[]>;
  abstract getActive(): Promise<TokenModel[]>;
  abstract findByContractAddressOrFail(contractAddress: string): Promise<TokenModel>;
  abstract findTokensByParams(paramKey: string, paramValue: string | boolean | number): Promise<TokenModel[]>
}
