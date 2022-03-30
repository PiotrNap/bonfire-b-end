import { IsNotEmpty } from "class-validator"

export class JWT {
  iss: string // issuer
  exp: string // expiration time
  sub: string // subject
  aud: string // audience
  nbf?: string // not before claim
  iat?: string // issued at claim
  jti?: string // jwt id claim
}
