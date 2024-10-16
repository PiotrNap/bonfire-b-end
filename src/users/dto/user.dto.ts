import type { Addresses } from "src/model/user.entity.js"

export class UserDto {
  id: string
  username: string
  deviceID?: string
  baseAddresses?: Addresses
  publicKey?: string
  walletPublicKey?: string
  profileImage?: Buffer
  hourlyRateAda?: string | number
  lastUsedRefreshToken?: Date
  createdOn?: Date
  calendarToken?: string | null
  refreshToken?: string | null
  bio?: string
  profession?: string
  jobTitle?: string
  skills?: string | string[]
}

export class JWTUserDto {
  id: string
  username: string
  deviceID: string
  isActive: boolean // whether or not user profile is still active
  iat: number
  exp: number
}
