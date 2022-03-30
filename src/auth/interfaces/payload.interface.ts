export interface JwtPayload {
  username: string
  sub: string
  profileType: string
}

export interface SuccessMessage {
  message: string
  status: number
}
