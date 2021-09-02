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
import { ChallengeDTO } from "src/users/dto/challenge.dto";
import { UsersService } from "src/users/users.service";
import { UserDto } from "src/users/dto/user.dto";

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
  public async challenge(@Param() param: string): Promise<ChallengeDTO> {
    return await this.authService.challenge(param);
  }

  @Post("login")
  public async login(
    @Body() challengeResponse: ChallengeResponseDTO
  ): Promise<LoginStatus> {
    return await this.authService.login(challengeResponse);
  }

  @Get("whoami")
  @UseGuards(AuthGuard())
  public async testAuth(@Req() req: any): Promise<JwtPayload> {
    return req.user;
  }
}
