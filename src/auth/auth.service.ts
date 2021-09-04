import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { CreateUserDto } from "../users/dto/user.create.dto";
import { RegistrationStatus } from "../auth/interfaces/registration-status.interface";
import { UsersService } from "../users/users.service";
import { LoginStatus } from "./interfaces/login-status.interface";
import { UserDto } from "../users/dto/user.dto";
import { JwtPayload } from "./interfaces/payload.interface";
import { JwtService } from "@nestjs/jwt";
import { ChallengeResponseDTO } from "src/users/dto/challenge-response.dto";
import { ChallengeDTO } from "src/users/dto/challenge.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async register(userDto: CreateUserDto): Promise<RegistrationStatus> {
    let status: RegistrationStatus = {
      success: true,
      message: "user registered",
    };

    try {
      await this.usersService.registerUser(userDto);
    } catch (err) {
      status = {
        success: false,
        message: err,
      };
    }

    return status;
  }

  async challenge(userid: string): Promise<ChallengeDTO> {
    return new ChallengeDTO(userid);
  }

  // async validateChallenge(userDto: string): Promise<boolean | void> {
  //     // const user =
  // }

  async login(
    challengeResponse: ChallengeResponseDTO,
    id?: string
  ): Promise<LoginStatus> {
    // find user in db
    const user = await this.usersService.challengeLogin(challengeResponse, id);

    // generate and sign token
    const token = this._createToken(user);

    return {
      username: user.username,
      id: user.id,
      ...token,
    };
  }

  async validateUser(payload: JwtPayload): Promise<UserDto> {
    const user = await this.usersService.findByPayload(payload);
    if (!user) {
      throw new HttpException("Invalid token", HttpStatus.UNAUTHORIZED);
    }
    return user;
  }

  private _createToken({ username }: UserDto): any {
    const expiresIn = process.env.EXPIRES_IN;

    const user: JwtPayload = { username };
    const accessToken = this.jwtService.sign(user);

    return {
      expiresIn,
      accessToken,
    };
  }
}
