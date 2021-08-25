import { IsNotEmpty } from "class-validator";

export class ChallengeResponseDTO {
  @IsNotEmpty()
  username: string;
  @IsNotEmpty()
  challenge: string;
  @IsNotEmpty()
  signature: string;
}

