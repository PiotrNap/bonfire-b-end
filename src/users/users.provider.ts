import { SetMetadata } from "@nestjs/common"
import { UserEntity } from "src/model/user.entity.js"

export const USER_PROVIDER = "UserProvider"
export class UserProvider extends UserEntity {
  provide: "UserProvider"
  useValue: UserEntity
}

export const UserProviderDecorator = () => SetMetadata(USER_PROVIDER, true)
