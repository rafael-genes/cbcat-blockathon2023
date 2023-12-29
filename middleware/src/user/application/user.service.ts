import { Injectable } from "@nestjs/common";
import { UserCreateRequestDTO } from "./dto/user.request.dto";
import { UserRepository } from "../domain/user.repository";
import { UserModel } from "../domain/user.model";
import { TokenBalanceDTO } from "../../token/application/dto/tokenBalance.dto";
import { UserServiceDTO } from "./dto/user.service.dto";
import { UserTokenBalancesDTO, UserDTO } from "./dto/user.dto";
import { TokenServiceDTO } from "../../token/application/dto/token.service.dto";
import { Web3ServiceDTO } from "../../web3/application/dto/web3.service.dto";


@Injectable()
export class UserService extends UserServiceDTO {

    constructor(
        private readonly repository: UserRepository,
        private readonly tokenService: TokenServiceDTO,
        private readonly web3Service: Web3ServiceDTO,
    ) {
        super();
    }


    public async createOrUpdateUser(dto: UserCreateRequestDTO): Promise<UserTokenBalancesDTO>{
        let user
        try{
            user = await this.getUserByEmail(dto.email);
        }catch(e){
            //console.log(e);
            user = new UserModel();

            const walletAddress = await this.createWallet(dto.email)
            user.accountAddress = walletAddress
        }

        for(let key in dto){
            (user as any)[key] = (dto as any)[key];
        }


        const newUser = await this.repository.save(user);

        return await this.getUserTokenBalanceDTO(this.parseUserDTO(newUser));

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

    async getAccountBalances(address: string): Promise<TokenBalanceDTO[]> {
        
        if(!address) return [] as TokenBalanceDTO[];
        const balances = await this.tokenService.getTokenBalancesByAccountAddress(address);
        return balances;
    }

    private parseUserDTO(user: UserModel): UserDTO {
        const userResponseDTO = new UserDTO();
        
        userResponseDTO.email = user.email;
        userResponseDTO.accountAddress = user.accountAddress;
        // userResponseDTO.username = user.username;

        return userResponseDTO;
    }

    private async getUserTokenBalanceDTO(dto: UserDTO): Promise<UserTokenBalancesDTO> {

        let tokenBalances: TokenBalanceDTO[] = []
        try{
            tokenBalances = await this.getAccountBalances(dto.accountAddress)
        } catch (error) {
            console.error('Error getting account balances', error)
        }

        return {...dto, ...{tokenBalances: tokenBalances}} as UserTokenBalancesDTO;
    }
    

    getUserByEmail(email: string): Promise<UserModel> {
        return this.repository.findByEmailOrFail(email);
    }

    async getAllUsers(): Promise<UserModel[]> {
        let users = await this.repository.getAll();
        return users;
    }

    async getUserTokenBalancesDTOFromEmail(email: string): Promise<UserTokenBalancesDTO> {
        try{
            let user = await this.getUserByEmail(email);
            return await this.getUserTokenBalanceDTO(this.parseUserDTO(user))

        } catch(e){
            throw e;
        }  
    }
}