import { IsNotEmpty } from "class-validator"
import { sha256 } from "js-sha256"

export class ChallengeDTO {
  constructor(pubKey: string) {
    const time = new Date().getTime()
    const hash = sha256(pubKey + time + process.env.JWT_SECRET)
    this.challenge = Buffer.from(`${pubKey}_${time}_${hash}`).toString("base64")
  }

  @IsNotEmpty({ message: "Challenge string cannot be empty" })
  challenge: string // Hash of credential and timestamp

  @IsNotEmpty({ message: "Device ID cannot be empty" })
  deviceID: string // Hash of credential and timestamp
}
