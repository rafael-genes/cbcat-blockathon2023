import { Injectable } from "@nestjs/common";
import bcrypt from 'bcrypt'
import { randomBytes } from "crypto";


@Injectable()
export class EncryptionService {
    private readonly defaultSaltRounds = 10;

    async checkMatching(plainString: string, hashedString: string) {
        const match = await bcrypt.compare(plainString, hashedString)
        return match
    }

    async hashString(hashToString: string, saltRounds: number = this.defaultSaltRounds) {
        return await bcrypt.hash(hashToString, saltRounds)
    }

    generatePseudoRandomData(size: number = 32) {
        const token = randomBytes(size).toString('hex')
        return token
    }
    
}