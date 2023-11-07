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
} from "@nestjs/common"
import { AuthService } from "./auth.service.js"
import { LoginStatus } from "./interfaces/login-status.interface.js"
import { ChallengeDTO } from "../users/dto/challenge.dto.js"
import { ChallengeResponseDTO } from "../users/dto/challenge-response.dto.js"
import { Public } from "../common/decorators/public.decorator.js"
import { GoogleApiService } from "../common/google/googleApiService.js"

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("challenge")
  public async getChallangeByPayload(@Body() body: any): Promise<ChallengeDTO> {
    const { deviceID } = body
    console.log("device ??", deviceID)
    return await this.authService.createChallenge(deviceID)
  }

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
    // if (
    //   user.profileType === "attendee" &&
    //   uri.includes(
    //     combineUrlPaths([
    //       DEEP_LINKING_PATHS.Navigation,
    //       DEEP_LINKING_PATHS["Available Days Selection"],
    //     ])
    //   )
    // )
    //   throw new UnauthorizedException()

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
