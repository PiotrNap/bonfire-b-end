import { IsNotEmpty, IsString } from "class-validator";

export class ChallengeRequestDTO {
  @IsNotEmpty({ message: "Challenge cannot be empty" })
  @IsString()
  challenge: string;

  @IsNotEmpty({ message: "Signature cannot be empty" })
  @IsString()
  signature: string;

  // this is used to lookup user in db
  @IsNotEmpty()
  userCredential: { [index: string]: any };
}
