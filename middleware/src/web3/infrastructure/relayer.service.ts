import { Injectable } from "@nestjs/common";
import { Defender } from "@openzeppelin/defender-sdk";


@Injectable()
export class RelayerService {
    
    private readonly credentials = { relayerApiKey: process.env.RELAYER_API_KEY, relayerApiSecret: process.env.RELAYER_API_SECRET };

    private readonly client = new Defender(this.credentials)
    private readonly provider: any = this.client.relaySigner.getProvider()

    constructor() {}

    getProvider(){
        return this.provider
    }

    async executerRelayerTransaction(
        toAddress: string,
        txData: string,
        gasLimitHex: string,
        value: string = '0x0',
        speed: 'fast' | 'average' = 'fast',
    ){

        
        try {
            const tx = await this.client.relaySigner.sendTransaction({
                to: toAddress, value : value, data: txData, gasLimit: gasLimitHex, speed: speed
            })
            return tx.hash
        } catch (error) {
            console.error(error)
            throw new Error('Error executing relayer transaction')
        }
    }
}

