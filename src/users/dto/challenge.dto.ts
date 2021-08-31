import { IsNotEmpty } from "class-validator";
import { sha256 } from "js-sha256";
export class ChallengeDTO {
  constructor(userid: string) {
    let time = new Date().getTime();
    let hash = sha256(userid + time + process.env.JWT_SECRET);
    this.challengeString = `${userid}-${time}-${hash}`;
  }
  @IsNotEmpty()
  challengeString: string; // Hash of userid and timestamp
}
