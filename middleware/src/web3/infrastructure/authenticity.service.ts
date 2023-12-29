import { Injectable } from "@nestjs/common";
import {
    AuthenticityClient,
    Bloock,
    HashAlg,
    KeyClient,
    KeyProtectionLevel,
    KeyType,
    ManagedKey,
    ManagedKeyParams,
    RecordClient,
    Signer
  } from "@bloock/sdk";


@Injectable()
export class AuthenticityService{

    private apiKey = process.env.BLOOCK_API_KEY;

    private keyProtection: KeyProtectionLevel = KeyProtectionLevel.SOFTWARE;
    private keyType: KeyType = KeyType.EcP256k;
    
    constructor(
        
    ) {
        Bloock.setApiKey(this.apiKey!);
    }

    async createKey(
        
        keyName: string,
        protection: KeyProtectionLevel = this.keyProtection, 
        keyType: KeyType = this.keyType
        ): Promise<ManagedKey> {

        let keyClient = new KeyClient();
        
        try{
            const key: ManagedKey = await keyClient.newManagedKey(
                new ManagedKeyParams(protection, keyType, keyName)
            );
            return key;
        }catch(e){
            console.log('error generating key', e);
            throw e;
        }
    }

    async signWithBloock(hashedData: Uint8Array, keyId: string, hashAlg: HashAlg = HashAlg.Keccak256) {
        let recordClient = new RecordClient();
        let keyClient = new KeyClient();
      
        let loadedKey = await keyClient.loadManagedKey(keyId);
      
        let signer = new Signer(loadedKey, hashAlg);
      
        let record = await recordClient.fromBytes(hashedData).withSigner(signer).build();
      
        let authenticityClient = new AuthenticityClient();
        let signatures = await authenticityClient.getSignatures(record);
      
        let signature = signatures[0];
      
        return signature;
      }

    async signDataFromBytes(data: Uint8Array, keyId: string) {

        let recordClient = new RecordClient();

        // There're multiple record constructors available for different data types 
        // (https://docs.bloock.com/integrity/features/prepare-data)
        let loadedKey = await this.getManagedKey(keyId)

        let signer = new Signer(loadedKey);

        let record = await recordClient.fromBytes(data)
        .withSigner(signer)
        .build();

        let authenticityClient = new AuthenticityClient();
        let signatures = await authenticityClient.getSignatures(record);

        let signature = signatures[0];
        
        return signature;
    }

    async getManagedKey(keyId: string) {
        let keyClient = new KeyClient();

        let loadedKey = await keyClient.loadManagedKey(keyId);
        return loadedKey;

    }

    decodePayload(payload: Uint8Array) {
        const decoder = new TextDecoder();
        const text = decoder.decode(payload);
        return text;
    }
}