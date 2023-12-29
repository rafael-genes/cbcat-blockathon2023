import { UserCreateRequestDTO } from "./user.request.dto";
import { UserTokenBalancesDTO } from "./user.dto";

export abstract class UserServiceDTO {
    abstract createOrUpdateUser(dto: UserCreateRequestDTO): Promise<UserTokenBalancesDTO>
    abstract getUserTokenBalancesDTOFromEmail(email: string): Promise<UserTokenBalancesDTO>
}