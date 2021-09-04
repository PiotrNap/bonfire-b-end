import {
  Controller,
  Body,
  Post,
  Get,
  Req,
  UseGuards,
  Param,
} from "@nestjs/common";
import { CreateUserDto } from "../users/dto/user.create.dto";
import { AuthService } from "./auth.service";
import { LoginStatus } from "./interfaces/login-status.interface";
import { JwtPayload } from "./interfaces/payload.interface";
import { AuthGuard } from "@nestjs/passport";
import { ChallengeResponseDTO } from "src/users/dto/challenge-response.dto";
import { UsersService } from "src/users/users.service";
import { UserDto } from "src/users/dto/user.dto";
import { ChallengeDTO } from "src/users/dto/challenge.dto";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService
  ) {}

  @Post("register")
  public async register(
    @Body() createUserDto: CreateUserDto
  ): Promise<UserDto> {
    const result: UserDto = await this.usersService.registerUser(createUserDto);

    return result;
  }

  @Get(":id/challenge")
  public async challenge(
    @Param() param: { id: string }
  ): Promise<ChallengeDTO> {
    const challengeDTO = await this.authService.challenge(param.id);

    // return base64 string for ease of use in RN
    challengeDTO.challengeString = Buffer.from(
      challengeDTO.challengeString
    ).toString("base64");

    return challengeDTO;
  }

  @Post(":id/login")
  public async login(
    @Body() challengeResponse: ChallengeResponseDTO,
    @Param() params: { id: string }
  ): Promise<LoginStatus> {
    return await this.authService.login(challengeResponse, params.id);
  }

  @Get("whoami")
  @UseGuards(AuthGuard())
  public async testAuth(@Req() req: any): Promise<JwtPayload> {
    return req.user;
  }
}
