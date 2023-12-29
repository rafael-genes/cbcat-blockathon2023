import { Injectable } from "@nestjs/common";
import { BusinessRepository } from "../domain/business.repository";
import { BusinessCreateRequestDTO } from "./dto/business.request.dto";
import { BusinessModel } from "../domain/business.model";
import { EncryptionService } from "../../utils/application/encryption.service";
import { TokenBalanceDTO } from "../../token/application/dto/tokenBalance.dto";
import { BusinessServiceDTO } from "./dto/business.service.dto";
import { BusinessDTO, BusinessTokenBalancesDTO, BusinessTokenBalancesNewDTO, BusinessApiKeyDTO } from "./dto/business.dto";
import { TokenServiceDTO } from "../../token/application/dto/token.service.dto";
import { Web3ServiceDTO } from "../../web3/application/dto/web3.service.dto";


@Injectable()
export class BusinessService extends BusinessServiceDTO {

    constructor(
        private readonly repository: BusinessRepository,
        private readonly encryptionService: EncryptionService,
        private readonly tokenService: TokenServiceDTO,
        private readonly web3Service: Web3ServiceDTO,
    ) {
        super();
    }

    public async createOrUpdateBusiness(dto: BusinessCreateRequestDTO){
        let business: BusinessModel
        let plainApiKeyToken: string | undefined

        try{
            business = await this.getBusinessByEmail(dto.email);
        }catch(e){
            business = new BusinessModel();
            business.isActive = false;

            const walletAddress = await this.createWallet(dto.email)
            business.accountAddress = walletAddress

            plainApiKeyToken = this.encryptionService.generatePseudoRandomData()
            await this.setAddressAsMinter(business.accountAddress!)
        }

        for(let key in dto){
            if((dto as any)[key]) (business as any)[key] = (dto as any)[key];
        }

        // await this.setAddressAsMinter(business.accountAddress!)

        
        if(plainApiKeyToken) business.apiPrivateKey = await this.encryptionService.hashString(plainApiKeyToken)

        await this.repository.save(business);

        const businessDTO = this.parseBusinessDTO(business);

        let tokenBalances: TokenBalanceDTO[] = []

        try{
            if(business.accountAddress) tokenBalances = await this.getAccountBalances(business.accountAddress)
        } catch (error) {
            console.error('Error getting account balances', error)
        }

        return {...businessDTO, ...{apiPrivateKey: plainApiKeyToken}, ...{tokenBalances}} as BusinessTokenBalancesNewDTO | BusinessTokenBalancesDTO;
    }


    private async setAddressAsMinter(address: string, isActive: boolean = true){
        await this.tokenService.setMintersForActiveTokens([address], isActive)
    }

    private async createWallet(email: string){
        try{
            const wallet = await this.web3Service.generateCustodialWallet(email)
            return wallet
        } catch (error) {
            console.error('Error generating custodial wallet', error)
            throw new Error('Error generating custodial wallet')
        }
    }


    private parseBusinessDTO(business: BusinessModel): BusinessDTO {
        const businessDTO = new BusinessDTO();
        
        businessDTO.email = business.email;
        businessDTO.businessLegalName = business.businessLegalName;
        businessDTO.isActive = business.isActive;
        businessDTO.accountAddress = business.accountAddress!;

        return businessDTO;
    }


    async getBusinessTokenBalancesDTO(dto: BusinessDTO): Promise<BusinessTokenBalancesDTO> {

        const tokenBalance = await this.getAccountBalances(dto.accountAddress);

        return {...dto, ...{tokenBalances: tokenBalance}} as BusinessTokenBalancesDTO;
    }


    async getAccountBalances(address: string | null): Promise<TokenBalanceDTO[]> {

        if(!address) return [] as TokenBalanceDTO[];
        const balances = await this.tokenService.getTokenBalancesByAccountAddress(address);
        return balances;
    }


    private getBusinessByEmail(email: string) {
        return this.repository.findByEmailOrFail(email);
    }

    private getAllBusinessModels(): Promise<BusinessModel[]>{
        return this.repository.getAll();
    }

    public async getAllBusinessesWithApiKey(): Promise<BusinessApiKeyDTO[]> {
        const businesses = await this.getAllBusinessModels();

        return businesses.map(business => {
            const businessDTO = this.parseBusinessDTO(business);
            return {...businessDTO, ...{apiPrivateKey: business.apiPrivateKey}} as BusinessApiKeyDTO;
        });
    }
}