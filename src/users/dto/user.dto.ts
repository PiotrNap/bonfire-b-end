export class UserDto {
  id: string;
  username: string;
  publicKey: string;
  profileType: string;
  createdOn?: Date;
  currChallenge?: string | null;
  calendarToken?: string | null;
  refreshToken?: string | null;
}
