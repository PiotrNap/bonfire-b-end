import { PassportStrategy } from "@nestjs/passport"
import { Injectable } from "@nestjs/common"
import { Strategy } from "passport-oauth2"

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, "discord") {
  http = require("http")
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
    const { data } = await this.http
      .get("https://discordapp.com/api/users/@me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .toPromise()
  }
}
