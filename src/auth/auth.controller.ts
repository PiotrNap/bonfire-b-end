import {
  Controller,
  Body,
  Post,
  HttpException,
  HttpStatus,
  UsePipes,
  Get,
  Req,
  UseGuards,
  Param,
} from "@nestjs/common";
import { CreateUserDto } from "../users/dto/user.create.dto";
import { RegistrationStatus } from "./interfaces/registration-status.interface";
import { AuthService } from "./auth.service";
import { LoginStatus } from "./interfaces/login-status.interface";
import { JwtPayload } from "./interfaces/payload.interface";
import { AuthGuard } from "@nestjs/passport";
import { ChallengeResponseDTO } from "src/users/dto/challenge-response.dto";
import { ChallengeDTO } from "src/users/dto/challenge.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  public async register(
    @Body() createUserDto: CreateUserDto
  ): Promise<RegistrationStatus> {
    const result: RegistrationStatus = await this.authService.register(
      createUserDto
    );

    if (!result.success) {
      throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
    }

    return result;
  }

  @Get(":id/challenge")
  public async challenge(
    @Param() params 
  ): Promise<ChallengeDTO> {
    return await this.authService.challenge(params.id);
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
  