import { IsNotEmpty } from "class-validator";

export class CreateUserDto {
  constructor(
    name: string,
    username: string,
    publicKey: string,
    id: string,
    profileType: string
  ) {
    this.name = name;
    this.username = username;
    this.publicKey = publicKey;
    this.id = id;
    this.profileType = profileType;
  }

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  profileType: string;

  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  publicKey: string;

  @IsNotEmpty()
  id: string;
}
