import { IsNotEmpty, MaxLength } from "class-validator"
import type { UserDto } from "./user.dto.js"
import type { Addresses } from "src/model/user.entity.js"

export class CreateUserDto implements UserDto {
  constructor(
    username: string,
    publicKey: string,
    id: string,
    profileImage?: Buffer,
    betaTesterCode?: string
  ) {
    this.username = username
    this.publicKey = publicKey
    this.id = id
    this.profileImage = profileImage
    this.betaTesterCode = betaTesterCode
  }

  @IsNotEmpty({ message: "Username cannot be empty" })
  @MaxLength(100)
  username: string

  @IsNotEmpty({ message: "Public key cannot be empty" })
  publicKey: string

  @IsNotEmpty({ message: "Id cannot be empty" })
  id: string

  @IsNotEmpty({ message: "Base address cannot empty" })
  baseAddresses: Addresses

  profileImage?: Buffer
  betaTesterCode?: string
}
