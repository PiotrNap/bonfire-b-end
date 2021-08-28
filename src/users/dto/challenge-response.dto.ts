import { IsNotEmpty } from "class-validator";
import { UserDto } from "./user.dto";

export class ChallengeResponseDTO {
  async validate(username): Promise<UserDto> {
    return;
  }
  @IsNotEmpty()
  username: string;
  @IsNotEmpty()
  jwt: string;
  @IsNotEmpty()
  publicKey: string;
}
