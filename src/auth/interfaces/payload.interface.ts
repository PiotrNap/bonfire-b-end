export interface JwtPayload {
  username: string
  sub: string
}

export interface SuccessMessage {
  message: string
  status: number
}
