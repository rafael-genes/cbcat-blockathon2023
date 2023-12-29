import { Injectable } from "@nestjs/common";
import Web3 from "web3";

@Injectable()
export class Web3HttpProviderService {

    private provider: any

    constructor(
    ) {
        this.provider = this.getInfuraProvider()
    }


    private getInfuraProvider(){
        return new Web3.providers.HttpProvider(`${process.env.INFURA_BASE_URL}/${process.env.INFURA_API_KEY}`)
    }


    getProvider(){
        return this.provider
    }
    
}