import { IsNotEmpty, MaxLength } from "class-validator";

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

  @IsNotEmpty({ message: "Name cannot be empty" })
  @MaxLength(100)
  name: string;

  @IsNotEmpty({ message: "Username cannot be empty" })
  @MaxLength(100)
  username: string;

  @IsNotEmpty({ message: "Profile type cannot be empty" })
  profileType: string;

  @IsNotEmpty({ message: "Public key cannot be empty" })
  publicKey: string;

  @IsNotEmpty({ message: "Id cannot be empty" })
  id: string;
}
