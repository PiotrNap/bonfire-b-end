import { IsNotEmpty } from "class-validator";

export class ChallengeResponseDTO {
  @IsNotEmpty()
  username: string;
  @IsNotEmpty()
  jwt: string;
  @IsNotEmpty()
  publicKey: string;
}

