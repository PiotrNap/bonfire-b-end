import { IsNotEmpty } from "class-validator";

export class ChallengeRequestDTO {
  @IsNotEmpty()
  challenge: string;
  @IsNotEmpty()
  signature: string;
}
