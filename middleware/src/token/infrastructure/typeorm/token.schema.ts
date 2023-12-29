import { EntitySchema } from "typeorm";
import { TokenModel } from "../../domain/token.model";
import { sharedFields } from "../../../shared/infrastructure/typeorm/shared-fields.schema";


export const TokenSchema = new EntitySchema<TokenModel>({
    name: 'token',
    columns: {
      ...sharedFields,
      contractAddress: {
        type: String,
        nullable: true
      },
        abiUrl: {
        type: String,
        nullable: true
        },
        abi: {
        type: 'json',
        nullable: true
        },
        name: {
        type: String,
        nullable: true
        },
        tokenId: {
          type: String,
          nullable: true
      },
      symbol: {
        type: String,
        nullable: true
      },
        isActive: {
            type: Boolean,
            nullable: true
        },
        type: {
            type: String,
            nullable: true
        }
    },
});