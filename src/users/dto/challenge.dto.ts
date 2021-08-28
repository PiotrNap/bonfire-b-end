import { IsNotEmpty } from "class-validator";
import bcrypt from 'bcrypt'
export class ChallengeDTO {
  constructor(userid: string) {
    let time = new Date().getTime()
    let hash = bcrypt.hash(userid+time, 10)
    this.challengeString = `${userid}-${time}-${hash}`
  }
  @IsNotEmpty()
  challengeString: string; // Hash of userid and timestamp
}
