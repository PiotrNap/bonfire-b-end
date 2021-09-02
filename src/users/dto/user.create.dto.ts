import { IsNotEmpty, IsEmail } from "class-validator";

export class CreateUserDto {
  constructor(name: string, username: string, publicKey: string, id: string) {
    this.name = name;
    this.username = username;
    this.publicKey = publicKey;
    this.id = id;
  }

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  publicKey: string;

  @IsNotEmpty()
  id: string;
}
