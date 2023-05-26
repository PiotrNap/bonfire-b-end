export class UserDto {
  id: string
  username: string
  profileType: string
  profileImage?: Buffer
  hourlyRate?: string | number
  googleApiCredentials?: string
  lastUsedRefreshToken?: Date
  createdOn?: Date
  calendarToken?: string | null
  refreshToken?: string | null
  timeZone?: any
}

export class OrganizerDTO extends UserDto {
  bio: string
  hourlyRate: number
  profession?: string
  jobTitle?: string
  skills?: string | string[]
  tags?: string[]
}

export class JWTUserDto {
  id: string
  username: string
  publicKey: string
  profileType: string
  iat: number
  exp: number
}
