import { EntitySchema } from "typeorm"
import { sharedFields } from "../../../shared/infrastructure/typeorm/shared-fields.schema";
import { UserModel } from "../../domain/user.model";

export const UserSchema = new EntitySchema<UserModel>({
  name: 'user',
  columns: {
    ...sharedFields,
    accountAddress: {
      type: String,
      nullable: true
    },
    /* custodialWalletName: {
      type: String,
      nullable: true
    }, */
    email: {
      type: String,
      nullable: false
    },
    /* username: {
      type: String,
      nullable: true
    } */
  },
});
