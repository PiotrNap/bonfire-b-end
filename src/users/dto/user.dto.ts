import { IsNotEmpty } from "class-validator";
export class UserDto {
  id: string;
  username: string;
  publicKey: string;
  createdOn?: Date;
  calendarToken?: string | null;
  refreshToken?: string | null;
}
