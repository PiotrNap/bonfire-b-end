import { IsNotEmpty } from "class-validator";
import { sha256 } from "js-sha256";

export class ChallengeDTO {
  constructor(userid: string) {
    let time = new Date().getTime();
    let hash = sha256(userid + time + process.env.JWT_SECRET);
    // use underscores as UUID contains multiple '-'
    this.challengeString = `${userid}_${time}_${hash}`;
  }
  @IsNotEmpty({ message: "Challenge string cannot be empty" })
  challengeString: string; // Hash of userid and timestamp
}
