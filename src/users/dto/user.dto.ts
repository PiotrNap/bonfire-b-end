export class UserDto {
  id: string
  username: string
  deviceID?: string
  baseAddress?: string
  publicKey?: string
  walletPublicKey?: string
  profileImage?: Buffer
  hourlyRateAda?: string | number
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
  deviceID: string
  iat: number
  exp: number
}
