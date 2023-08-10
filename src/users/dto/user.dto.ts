export class UserDto {
  id: string
  username: string
  baseAddress?: string
  publicKey?: string
  profileImage?: Buffer
  hourlyRateAda?: string | number
  googleApiCredentials?: string
  lastUsedRefreshToken?: Date
  createdOn?: Date
  calendarToken?: string | null
  refreshToken?: string | null
  timeZone?: any
  bio?: string
  profession?: string
  jobTitle?: string
  skills?: string | string[]
}

export class JWTUserDto {
  id: string
  username: string
  publicKey: string
  profileType: string
  iat: number
  exp: number
}
