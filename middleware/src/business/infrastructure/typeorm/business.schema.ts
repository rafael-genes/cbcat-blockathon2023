import { EntitySchema } from "typeorm"
import { sharedFields } from "../../../shared/infrastructure/typeorm/shared-fields.schema";
import { BusinessModel } from "../../domain/business.model";

export const BusinessSchema = new EntitySchema<BusinessModel>({
  name: 'business',
  columns: {
    ...sharedFields,
    accountAddress: {
      type: String,
      nullable: true
    },
    businessLegalName: {
      type: String,
      nullable: true
    },
    apiPrivateKey: {
      type: String,
      nullable: true
    },
    /* custodialWalletName: {
      type: String,
      nullable: true
    }, */
    email: {
      type: String,
      nullable: true
    },
    isActive: {
      type: Boolean,
      nullable: true
    }
  },
});
