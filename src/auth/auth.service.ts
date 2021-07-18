import { Injectable } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { v4 as uuidv4 } from "uuid";
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const sessionID = await uuidv4(); // if userID was userDiD we'd need a DiD resolution method
    const payload = {
      username: user.username,
      sub: user.userId,
      session: sessionID,
      xtra: user.x,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
