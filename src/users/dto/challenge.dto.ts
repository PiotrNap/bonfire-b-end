import { IsNotEmpty } from "class-validator";

export class ChallengeDTO {
    @IsNotEmpty()
    challengeString: string; // Hash of userid and timestamp
  }
  