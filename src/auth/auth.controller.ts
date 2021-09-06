import {
  Controller,
  Body,
  Post,
  Get,
  Req,
  Param,
  ParseUUIDPipe,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginStatus } from "./interfaces/login-status.interface";
import { JwtPayload } from "./interfaces/payload.interface";
import { ChallengeDTO } from "src/users/dto/challenge.dto";
import { ChallengeRequestDTO } from "src/users/dto/challenge-request.dto";
import { Public } from "src/common/decorators/public.decorator";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get(":id/challenge")
  public async challenge(
    @Param("id", ParseUUIDPipe) id: string
  ): Promise<ChallengeDTO> {
    return await this.authService.createChallenge(id);
  }

  @Post(":id/login")
  public async login(
    @Body() challengeRequestDTO: ChallengeRequestDTO,
    @Param("id", ParseUUIDPipe) id: string
  ): Promise<LoginStatus> {
    return await this.authService.loginById(challengeRequestDTO, id);
  }

  @Get("whoami")
  public async testAuth(@Req() req: any): Promise<JwtPayload> {
    return req.user;
  }
}
