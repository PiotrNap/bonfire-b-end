export class UserDto {
  id: string
  username: string
  publicKey: string
  profileType: string
  googleApiCredentials?: string
  lastUsedRefreshToken?: Date
  createdOn?: Date
  calendarToken?: string | null
  refreshToken?: string | null
}

export class JWTUserDto {
  id: string
  username: string
  publicKey: string
  profileType: string
}
