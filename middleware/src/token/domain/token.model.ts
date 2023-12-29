import { ContractAbi } from "web3";
import { BaseModel } from "../../shared/domain/base.model";

export enum TokenType {
  ERC20 = 'ERC20', // default; should be used for fungible tokens eg. credit tokens; There should be only one active ERC20 token per programme
  ERC721 = 'ERC721', // should be used for non-fungible tokens eg. status; there can be multiple active ERC721 tokens per programme
  ERC1155 = 'ERC1155' // should be used for semi-fungible tokens eg. rewards; there can be multiple active ERC1155 tokens per programme
}

export class TokenModel extends BaseModel {
    contractAddress: string = '';
    abiUrl: string = '';
    abi?: {abi: ContractAbi} = {abi: []};
    name?: string;
    symbol?: string;
    isActive: boolean = false;
    tokenId: string | null = null;
    type: TokenType = TokenType.ERC20;
  }