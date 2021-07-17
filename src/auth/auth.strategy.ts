import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config()
@Injectable()

export class AuthStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: (req) => {
        if (!req || !req.cookies || req.cookies['access_token'] === undefined) {
          console.log(req.cookies)
          console.log('uh oh!')
          return null
        };
        console.log('great!')
        console.log(req.cookies)
        return req.cookies['access_token'];
      },
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }
  async validate(data: any): Promise<any> {
    if (!data === null || undefined) return true;
  }
}
