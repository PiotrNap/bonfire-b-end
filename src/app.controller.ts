import {
  Controller,
  Get,
  Post,
  Res,
  Request,
  UseGuards,
  Req,
} from "@nestjs/common";
import { AuthService } from "./auth/auth.service";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { LocalAuthGuard } from "./auth/guards/local-auth.guard";
import { GoogleService } from "./auth/services/google/google.service";
import { Redirect } from "@nestjs/common";
import { Query } from "@nestjs/common";

const currentTime = Math.floor(Date.now());
const validityPeriod = currentTime + 1000 * 60; // equates to a 60s validity period
const validFor = (validityPeriod - currentTime) / 1000;
const tokenExpiry = new Date(validityPeriod);
@Controller()
export class AppController {
  constructor(
    private readonly authService: AuthService
    ) {}

  @UseGuards(LocalAuthGuard)
  @Post("auth/login")
  async updateRes(@Res() response, @Req() req) {
    const token = await this.login(req);

    response
      .cookie("access_token", token.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: true,
        domain: "localhost", // for now...
        expires: tokenExpiry,
      })
      .send({
        success: true,
        validFor: `${validFor}s`,
        currentTime: new Date(currentTime),
        tokenExpiry: tokenExpiry,
        jwt: token.access_token,
      });
  }
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  getProfile(@Request() req) {
    return req.user;
  }
  @Get("events")
  @UseGuards(JwtAuthGuard)
  async devices(@Req() req): Promise<any> {
    const events = [
      {
        date: new Date(currentTime + 1000 * 60 * 60 * 24 * 1),
        description: "Super event 1",
        keywords: [
          "spoken word",
          "iambic pentameter",
          "finger snapping good times",
        ],
      },
      {
        date: new Date(currentTime + 1000 * 60 * 60 * 24 * 2),
        description: "Super event 2",
        keywords: ["concert", "music", "festival"],
      },
      {
        date: new Date(currentTime + 1000 * 60 * 60 * 24 * 3),
        description: "Super event 3",
        keywords: ["bluegrass", "folk", "jazz"],
      },
      {
        date: new Date(currentTime + 1000 * 60 * 60 * 24 * 4),
        description: "Super event 4",
        keywords: ["theater", "comedy", "drama"],
      },
    ];
    return events;
  }
}
/* 
# Guarded objects
- User's Google calendar availability data
- 

I will need to be able to pull CIDs from IPFS, DAT
check txids on bitcoin, cardano and ethereum networks, etc etc.

Pull google calendar events
*/

@Controller("auth/google")
export class AuthController {
  constructor(private readonly googleService: GoogleService) {}

  @Get()
  @Redirect("exp://127.0.0.1:19000/--/expo-auth-session")
  async oauthGoogleCallback(@Query() query: any) {
    if (query.error != null && query.error === "access_denied") {
      // handle error message
      return { statusCode: 500 };
    }
    console.log(query);
    const { code } = query;
    const accessToken = await this.googleService.getUserAccessToken(code);

    console.log(accessToken);
    return;
  }
}

@Controller("auth/google/url")
export class AuthGoogleController {
  constructor(private readonly googleService: GoogleService) {}

  @Get()
  getGoogleAuthUrl(@Query() query: { scopes: string }) {
    const { scopes } = query;

    const authUrl = this.googleService.generateAuthUrl(scopes);

    if (authUrl) {
      return { authUrl };
    } else {
      throw new Error("Something went wrong while creating the url");
    }
  }
}

@Controller("auth/google/events")
export class AuthGoogleEventsController {
  constructor(private readonly googleService: GoogleService) {}

  @Get()
  getGoogleCalendarEvents() {
    const events = this.googleService.getUserCalendarEvents();

    if (events) {
      return { events };
    } else {
      throw new Error("Something went wrong while receiving events");
    }
  }
}

/*
organizer needs to create an event, with a description, avatar, etc.

Should specify the length of the event and the availabilty within that window

query his calendar to see his listed events and based on this data we can show to potential 
attendee on which days the organizer is offering, updated in real time? rxjs??

event registry should be considered
graphql traversal of the event registry needs to be protected endpoint

*/
