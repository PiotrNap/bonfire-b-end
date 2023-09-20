import {
  Injectable,
  HttpException,
  HttpStatus,
  forwardRef,
  Inject,
} from "@nestjs/common"
import { UsersService } from "../users/users.service.js"
import { LoginStatus } from "./interfaces/login-status.interface.js"
import { UserDto } from "../users/dto/user.dto.js"
import { ChallengeDTO } from "../users/dto/challenge.dto.js"
import { ChallengeResponseDTO } from "../users/dto/challenge-response.dto.js"
import { JwtPayload } from "./interfaces/payload.interface.js"
import { JwtService } from "@nestjs/jwt"
import { DeviceCredentialEntity } from "../model/deviceCredential.entity.js"

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
      profileImage: user.profileImage,
      hourlyRateAda: user.hourlyRateAda,
      timeZone: user.timeZone,
      ...token,
    }
  }

  private _createToken({ username, id }: UserDto): any {
    const expiresIn = process.env.EXPIRES_IN

    const user: JwtPayload = { username, sub: id }
    const accessToken = this.jwtService.sign(user)

    return {
      expiresIn,
      expiresAt: new Date().getTime() + Number(expiresIn),
      accessToken,
    }
  }
}
