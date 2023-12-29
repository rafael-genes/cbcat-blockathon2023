import { EntitySchema } from "typeorm";
import { CustodialWalletModel } from "../../domain/custodialWallet.model";
import { sharedFields } from "../../../shared/infrastructure/typeorm/shared-fields.schema";


export const CustodialWalletSchema = new EntitySchema<CustodialWalletModel>({
    name: 'custodialWallet',
    columns: {
        ...sharedFields,
      address: {
        type: String,
        nullable: true
      },
      name: {
        type: String,
        nullable: true
      },
      keyId: {
        type: String,
        nullable: true
      },
    },
});