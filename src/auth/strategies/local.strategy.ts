import { Injectable, UnauthorizedException } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Strategy } from "passport-local"
import { AuthService } from "../auth.service.js"

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super()
  }

  async validate(username: string): Promise<any> {
    throw new Error("unused path")

    // const user = await this.authService.validateUser({ username });
    // if (!user) {
    //   throw new UnauthorizedException();
    // }
    return username
  }
}
