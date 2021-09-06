import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { CreateUserDto } from "../users/dto/user.create.dto";
import { RegistrationStatus } from "../auth/interfaces/registration-status.interface";
import { UsersService } from "../users/users.service";
import { LoginStatus } from "./interfaces/login-status.interface";
import { UserDto } from "../users/dto/user.dto";
import { JwtPayload } from "./interfaces/payload.interface";
import { JwtService } from "@nestjs/jwt";
import { ChallengeDTO } from "src/users/dto/challenge.dto";
import { ChallengeRequestDTO } from "src/users/dto/challenge-request.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  // async register(userDto: CreateUserDto): Promise<RegistrationStatus> {
  //   let status: RegistrationStatus = {
  //     success: true,
  //     message: "user registered",
  //   };

  //   try {
  //     await this.usersService.registerUser(userDto);
  //   } catch (err) {
  //     status = {
  //       success: false,
  //       message: err,
  //     };
  //   }

  //   return status;
  // }

  async createChallenge(userid: string): Promise<ChallengeDTO> {
    var challengeDTO = new ChallengeDTO(userid);

    // return base64 string for ease of use in RN
    challengeDTO.challengeString = Buffer.from(
      challengeDTO.challengeString
    ).toString("base64");

    return challengeDTO;
  }

  // async validateChallenge(userDto: string): Promise<boolean | void> {
  //     // const user =
  // }

  async loginById(
    challengeResponse: ChallengeRequestDTO,
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

  private _createToken({ username, id }: UserDto): any {
    const expiresIn = process.env.EXPIRES_IN;

    const user: JwtPayload = { username, sub: id };
    const accessToken = this.jwtService.sign(user);

    return {
      expiresIn,
      accessToken,
    };
  }
}
