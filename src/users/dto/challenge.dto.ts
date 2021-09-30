import { IsNotEmpty } from "class-validator";
import { sha256 } from "js-sha256";

export class ChallengeDTO {
  constructor(credential: string) {
    let time = new Date().getTime();
    let hash = sha256(credential + time + process.env.JWT_SECRET);
    this.challengeString = `${credential}_${time}_${hash}`;
  }

  @IsNotEmpty({ message: "Challenge string cannot be empty" })
  challengeString: string; // Hash of credential and timestamp
}
