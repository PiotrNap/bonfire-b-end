import { IsNotEmpty, MaxLength } from "class-validator"
import { UserDto } from "./user.dto"

export class CreateUserDto implements UserDto {
  constructor(
    username: string,
    publicKey: string,
    id: string,
    profileImage?: Buffer,
    timeZone?: string
  ) {
    this.username = username
    this.publicKey = publicKey
    this.id = id
    this.profileImage = profileImage
    this.timeZone = timeZone
  }

  @IsNotEmpty({ message: "Username cannot be empty" })
  @MaxLength(100)
  username: string

  @IsNotEmpty({ message: "Public key cannot be empty" })
  publicKey: string

  @IsNotEmpty({ message: "Id cannot be empty" })
  id: string

  @IsNotEmpty({ message: "Base address cannot empty" })
  baseAddress: string

  profileImage?: Buffer
  timeZone?: string
}
