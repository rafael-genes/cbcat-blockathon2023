import { Injectable } from "@nestjs/common";
import { EncryptionService } from "../../utils/application/encryption.service";
import { BusinessServiceDTO } from "../../business/application/dto/business.service.dto";
import { BusinessDTO } from "../../business/application/dto/business.dto";

@Injectable()
export class AuthService {

    constructor(
        private readonly businessService: BusinessServiceDTO,
        private readonly encryptionService: EncryptionService
    ){}

    async getBusinessFromApiKey(apiKey: string){
        try {

            const businesses = await this.businessService.getAllBusinessesWithApiKey()
            for(let business of businesses){
                const isMatching = await this.encryptionService.checkMatching(apiKey, business.apiPrivateKey)
                if(isMatching){
                    (business as any).apiPrivateKey = undefined
                    return business as BusinessDTO
                }
            }
            
        } catch (error) {
            throw new Error('Invalid API Key')
        }
        throw new Error('Invalid API Key')
    }
    
}