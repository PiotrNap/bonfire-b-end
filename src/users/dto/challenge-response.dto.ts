import { IsNotEmpty, IsString } from "class-validator"

export class ChallengeResponseDTO {
  @IsNotEmpty({ message: "Challenge cannot be empty" })
  @IsString()
  challenge: string

  @IsNotEmpty({ message: "Signature cannot be empty" })
  @IsString()
  signature: string

  // this is used to lookup user in db
  @IsNotEmpty({ message: "Device ID cannot be empty" })
  @IsString()
  deviceID: string

  @IsNotEmpty({ message: "User ID cannot be empty" })
  @IsString()
  id: string
}
