export class UserDto {
  id: string;
  username: string;
  publicKey: string;
  profileType: string;
  createdOn?: Date;
  calendarToken?: string | null;
  refreshToken?: string | null;
}
