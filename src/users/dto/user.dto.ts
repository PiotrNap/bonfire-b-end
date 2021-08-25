import { IsNotEmpty } from 'class-validator';

export class UserDto {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  publicKey: string;

  createdOn?: Date;
}