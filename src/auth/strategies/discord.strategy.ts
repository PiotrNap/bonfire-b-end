import { PassportStrategy } from "@nestjs/passport"
import { Injectable } from "@nestjs/common"
import { Strategy } from "passport-oauth2"

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, "discord") {
  http: any
  constructor() {
    super({
      authorizationURL: null,
      tokenURL: null,
      clientID: null,
      clientSecret: null,
      callbackURL: null,
      scope: null,
    })
  }

  async validate(accessToken: string): Promise<any> {
    const res = await fetch("https://discordapp.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const data = await res.json()
    return data
  }
}
