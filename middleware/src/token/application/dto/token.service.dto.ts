import { TokenDTO } from "./token.dto";
import { TokenCreateRequestDTO } from "./token.request.dto";
import { TokenBalanceDTO } from "./tokenBalance.dto";


export abstract class TokenServiceDTO {
    abstract createNewToken(dto: TokenCreateRequestDTO): Promise<TokenDTO>
    abstract getTokenBalancesByAccountAddress(tokenAddress: string, activeOnly?: boolean): Promise<TokenBalanceDTO[]>
    abstract getActiveCreditToken(): Promise<TokenDTO | null>
    abstract setMintersForActiveTokens(addresses: string[], isActive: boolean): Promise<boolean>
}