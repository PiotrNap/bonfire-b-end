import {
  Controller,
  Body,
  Post,
  Get,
  Req,
  Redirect,
  Query,
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

  /**
   * User asks for a challenge to proof his identity.
   *
   * When signin UP the credential is an uuid obtained by the user entity creation.
   * When signin IN the credential is the public key stored on their device.
   *
   * @example
   *    body: {
   *       credential: 'XUNUHDbu3MnwaG2xvl+IY9j2G3cckhIyexGDuK3ETTQ='
   *    }
   */
  @Public()
  @Post("challenge")
  public async getChallangeByPayload(
    @Body() challengePayload: any
  ): Promise<ChallengeDTO> {
    const { credential } = challengePayload;
    return await this.authService.createChallenge(credential);
  }

  /**
   * User wants obtain a valid JWT by providing us a challenge with
   * his own signature.
   */
  @Public()
  @Post("login")
  public async login(
    @Body() challengeRequestDTO: ChallengeRequestDTO
  ): Promise<LoginStatus> {
    return await this.authService.login(challengeRequestDTO);
  }

  @Get("whoami")
  public async testAuth(@Req() req: any): Promise<JwtPayload> {
    return req.user;
  }

  @Get("google-oauth-callback")
  @Redirect("exp://127.0.0.1:19000/--/expo-auth-session")
  public async oauthGoogleCallback(@Query() query: any) {
    if (query.error != null && query.error === "access_denied") {
      // handle error message
      return { statusCode: 500 };
    }
    const { code } = query;
    const accessToken = await this.authService.getUserAccessToken(code);

    return accessToken;
  }

  @Get("google-oauth-url")
  getGoogleAuthUrl(@Query() query: { scopes: string }) {
    const { scopes } = query;

    const authUrl = this.authService.generateAuthUrl(scopes);

    if (authUrl) {
      return { authUrl };
    } else {
      throw new Error("Something went wrong while creating the url");
    }
  }
}
