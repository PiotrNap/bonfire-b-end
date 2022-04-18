import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import { AuthService } from "../auth.service"
import { Injectable, HttpException, HttpStatus } from "@nestjs/common"
import { JwtPayload } from "../interfaces/payload.interface"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      //@TODO Change this to false after testing + test it
      ignoreExpiration: true,
      secretOrKey: process.env.JWT_SECRET,
    })
  }

  async validate(payload: JwtPayload): Promise<any> {
    const user = await this.authService.validateUser(payload)
    console.log("validating user: ", payload)
    if (!user) {
      throw new HttpException("Invalid token", HttpStatus.UNAUTHORIZED)
    }
    return user
  }
}
