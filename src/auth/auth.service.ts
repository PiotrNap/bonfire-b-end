import {
  Injectable,
  HttpException,
  HttpStatus,
  forwardRef,
  Inject,
} from "@nestjs/common"
import { UsersService } from "../users/users.service"
import { LoginStatus } from "./interfaces/login-status.interface"
import { UserDto } from "../users/dto/user.dto"
import { ChallengeDTO } from "src/users/dto/challenge.dto"
import { ChallengeResponseDTO } from "src/users/dto/challenge-response.dto"
import { JwtPayload } from "./interfaces/payload.interface"
import { JwtService } from "@nestjs/jwt"
import { Buffer } from "buffer"

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  private badCredentialsError() {
    throw new HttpException(
      "Invalid credential provided.",
      HttpStatus.BAD_REQUEST
    )
  }

  async createChallenge(credential: string): Promise<ChallengeDTO> {
    try {
      if (credential == null) this.badCredentialsError()
      var challengeDTO = new ChallengeDTO(credential)

      // return base64 string for ease of use in RN
      challengeDTO.challengeString = Buffer.from(
        challengeDTO.challengeString
      ).toString("base64")

      return challengeDTO
    } catch (e) {
      if (e.message && e.status) throw new HttpException(e.message, e.status)
    }
  }

  async login(payload: ChallengeResponseDTO): Promise<LoginStatus> {
    const user = await this.usersService.challengeLogin(payload)

    // generate and sign token
    const token = this._createToken(user)

    return {
      username: user.username,
      id: user.id,
      profileType: user.profileType,
      profileImage: user.profileImage,
      hourlyRate: user.hourlyRate,
      timeZone: user.timeZone,
      ...token,
    }
  }

  private _createToken({ username, id, profileType }: UserDto): any {
    const expiresIn = process.env.EXPIRES_IN

    const user: JwtPayload = { username, sub: id, profileType }
    const accessToken = this.jwtService.sign(user)

    return {
      expiresIn,
      expiresAt: new Date().getTime() + Number(expiresIn),
      accessToken,
    }
  }
}
