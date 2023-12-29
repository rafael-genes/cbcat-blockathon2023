import { Injectable } from "@nestjs/common";
import { TokenCreateRequestDTO } from "./dto/token.request.dto";
import { TokenModel, TokenType } from "../domain/token.model";
import { TokenRepository } from "../domain/token.repository";
import { TokenServiceDTO } from "./dto/token.service.dto";
import { TokenDTO } from "./dto/token.dto";
import { TokenBalanceDTO } from "./dto/tokenBalance.dto";
import { ContractAbi } from "web3";
import { Web3ServiceDTO } from "../../web3/application/dto/web3.service.dto";


@Injectable()
export class TokenService extends TokenServiceDTO {

    constructor(
        private readonly repository: TokenRepository,
        private readonly web3Service: Web3ServiceDTO
    ) {
        super();
    }

    async createNewToken(dto: TokenCreateRequestDTO): Promise<TokenDTO> {

        let token: TokenModel;

        try {

            token = await this.repository.findByContractAddressOrFail(dto.contractAddress);
            throw new Error('Token already exists');

        } catch (e) {

            token = new TokenModel();
        }


        for(let key in dto){
            (token as any)[key] = (dto as any)[key];
        }

        // TODO get name & symbol from contract

        // TODO set token active endpoint + set all business minters
        token.isActive = false;

        token.abi = await this.getTokenAbiJsonFromUrl(token.abiUrl);

        await this.repository.save(token);

        return this.parseTokenDTO(token);

    }

    private parseTokenDTO(token: TokenModel): TokenDTO {
        const tokenDTO = new TokenDTO();

        tokenDTO.contractAddress = token.contractAddress;
        tokenDTO.name = token.name;
        tokenDTO.abi = token.abi?.abi as any[];
        tokenDTO.symbol = token.symbol;
        tokenDTO.isActive = token.isActive;
        tokenDTO.type = token.type;

        return tokenDTO;
    }

    async setMintersForActiveTokens(addresses: string[], isActive: boolean): Promise<boolean> {
        const activeToken = await this.getActiveCreditToken()
        if(!activeToken) throw new Error('No active credit token found')

        try {
            return this.web3Service.setAddressesAsMinter(addresses, activeToken?.contractAddress, activeToken?.abi, isActive);
        } catch (error) {
            console.error('Error setting minter', error)
            throw new Error('Error setting minter: ' + error.message || '')
        }
        
    }

    public async getTokenBalancesByAccountAddress(accountAdress: string, activeOnly: boolean = true): Promise<TokenBalanceDTO[]> {

        if(!accountAdress) throw new Error('accountAdress is required');
        
        const tokens = activeOnly ? await this.repository.getActive() : await this.repository.getAll();
        const tokenBalances = [] as TokenBalanceDTO[];

        for(let token of tokens){

            try{
                if(!token.contractAddress || !token.abi) continue;

                const balance = await this.web3Service.getAccountTokenBalance(accountAdress, token.contractAddress, token.abi.abi, token.tokenId);
                const tokenBalance = new TokenBalanceDTO();
                tokenBalance.balance = balance;
                tokenBalance.contractAddress = token.contractAddress;
                tokenBalance.tokenId = token.tokenId;

                tokenBalances.push(tokenBalance)

            } catch (e) {
                console.log('error getting token balance', e);
            }
        }
        return tokenBalances as TokenBalanceDTO[]
    }

    async getActiveCreditToken(): Promise<TokenDTO | null> {
        const tokens = await this.findTokensByParams('type', TokenType.ERC20);

        // uses find because there should only be one active credit token
        const activeToken = tokens.find(token => token.isActive);

        return activeToken ? this.parseTokenDTO(activeToken) : null;
    }

    private findTokensByParams(paramKey: string, paramValue: string | boolean | number): Promise<TokenModel[]> {
        return this.repository.findTokensByParams(paramKey, paramValue);
    }


    // TODO find a better way to get abi from url
    private async getTokenAbiJsonFromUrl(url: string): Promise<{abi: ContractAbi}> {
        let response;
        try {
            response =  await fetch(url).then(res => res.json());
        } catch (e) {

            throw new Error('Could not fetch abi from url');
        }
        let abiData: any[] = []; 
        for(let key in response){
            try {
                response[key] = typeof response[key] === 'string' ? JSON.parse(response[key]) : response[key];
            } catch (e) {}
            
            if(Array.isArray(response[key])) {
                abiData = response[key];
                break;
            } 
        }
        return { abi: abiData }
    }
}