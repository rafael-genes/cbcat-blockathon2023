import { BusinessApiKeyDTO, BusinessTokenBalancesDTO, BusinessDTO, BusinessTokenBalancesNewDTO } from "./business.dto";
import { BusinessCreateRequestDTO } from "./business.request.dto";


export abstract class BusinessServiceDTO {
    abstract createOrUpdateBusiness(dto: BusinessCreateRequestDTO): Promise<BusinessTokenBalancesNewDTO | BusinessTokenBalancesDTO>
    abstract getBusinessTokenBalancesDTO(dto: BusinessDTO): Promise<BusinessTokenBalancesDTO>
    abstract getAllBusinessesWithApiKey(): Promise<BusinessApiKeyDTO[]>
}