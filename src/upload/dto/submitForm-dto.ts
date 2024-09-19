import { IsEmail, IsString } from "class-validator"

export class SubmitFormDto {
  @IsEmail()
  readonly email: string
  @IsString()
  readonly message: string
}
