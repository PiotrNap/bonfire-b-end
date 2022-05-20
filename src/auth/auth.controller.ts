import {
  Controller,
  Body,
  Post,
  Get,
  Req,
  Query,
  Res,
  BadRequestException,
  UnprocessableEntityException,
  UnauthorizedException,
} from "@nestjs/common"
import { AuthService } from "./auth.service"
import { LoginStatus } from "./interfaces/login-status.interface"
import { ChallengeDTO } from "src/users/dto/challenge.dto"
import { ChallengeResponseDTO } from "src/users/dto/challenge-response.dto"
import { Public } from "src/common/decorators/public.decorator"
import { roles, Roles } from "./roles/roles.decorator"
import {
  combineUrlPaths,
  DEEP_LINKING_PATHS,
} from "src/common/clientAppLinking"
import { GoogleApiService } from "src/common/google/googleApiService"

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
  public async getChallangeByPayload(@Body() body: any): Promise<ChallengeDTO> {
    const { credential } = body
    return await this.authService.createChallenge(credential)
  }

  /**
   * User wants to obtain a valid JWT by providing us a challenge with
   * his own signature.
   */
  @Public()
  @Post("login")
  public async login(@Body() body: ChallengeResponseDTO): Promise<LoginStatus> {
    return await this.authService.login(body)
  }

  @Public()
  @Get("google-oauth-callback")
  public async oauthGoogleCallback(@Res() res: any, @Query() query: any) {
    const result = await new GoogleApiService().handleGoogleOauthCallback(query)

    if (!result) {
      throw new UnprocessableEntityException()
    }
    return res.redirect(result)
  }

  @Get("google-oauth-url")
  public async getGoogleAuthUrl(
    @Req() req: any,
    @Query() query: { scopes: string; uri: string }
  ): Promise<any> {
    const { scopes, uri } = query
    const { user } = req

    // we don't allow attendees to be redirected to events creation screen
    if (
      user.profileType === "attendee" &&
      uri.includes(
        combineUrlPaths([
          DEEP_LINKING_PATHS.Navigation,
          DEEP_LINKING_PATHS["Available Days Selection"],
        ])
      )
    )
      throw new UnauthorizedException()

    const authUrl = await new GoogleApiService().generateAuthUrl(
      user,
      uri,
      scopes
    )

    if (authUrl) {
      return { authUrl }
    } else {
      throw new BadRequestException()
    }
  }

  @Get("google-oauth-valid")
  public async checkForValidGoogleOauth(@Req() req: any) {
    const { user } = req
    return await new GoogleApiService().checkValidOauth(user)
  }

  //TODO this shouldn't be public
  @Public()
  @Get("google-cal-events")
  @Roles(roles.organizer)
  public async getEvents(@Query() query: any, @Req() req: any) {
    const { user } = req.user
    const events = await new GoogleApiService().getUserGoogleCalendarEvents(
      query,
      user.id
    )

    if (!events) throw new BadRequestException()

    return events
  }
}
