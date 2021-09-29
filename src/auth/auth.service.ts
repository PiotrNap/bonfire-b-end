import {
  Injectable,
  HttpException,
  HttpStatus,
  forwardRef,
  Inject,
} from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { LoginStatus } from "./interfaces/login-status.interface";
import { UserDto } from "../users/dto/user.dto";
import { JwtPayload } from "./interfaces/payload.interface";
import { JwtService } from "@nestjs/jwt";
import { ChallengeDTO } from "src/users/dto/challenge.dto";
import { ChallengeRequestDTO } from "src/users/dto/challenge-request.dto";
import { google } from "googleapis";
import { Random } from "../common/utils";
import { to } from "../common/to";
import { readFile, readFileSync, writeFileSync } from "fs";

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  private googleOauthEndPoint = "https://oauth2.googleapis.com/token?";

  async createChallenge(credential: string): Promise<ChallengeDTO> {
    try {
      if (credential == null) this.badCredentialsError();
      var challengeDTO = new ChallengeDTO(credential);

      // return base64 string for ease of use in RN
      challengeDTO.challengeString = Buffer.from(
        challengeDTO.challengeString
      ).toString("base64");

      return challengeDTO;
    } catch (e) {
      if (e.message && e.status) throw new HttpException(e.message, e.status);
    }
  }

  async login(challengeRequest: ChallengeRequestDTO): Promise<LoginStatus> {
    const user = await this.usersService.challengeLogin(challengeRequest);

    // generate and sign token
    const token = this._createToken(user);

    return {
      username: user.username,
      id: user.id,
      profileType: user.profileType,
      ...token,
    };
  }

  async validateUser(payload: JwtPayload): Promise<UserDto> {
    const user = await this.usersService.findByPayload(payload);
    if (!user) {
      throw new HttpException("Invalid token", HttpStatus.UNAUTHORIZED);
    }
    return user;
  }

  private _createToken({ username, id, profileType }: UserDto): any {
    const expiresIn = process.env.EXPIRES_IN;

    const user: JwtPayload = { username, sub: id, profileType };
    const accessToken = this.jwtService.sign(user);

    return {
      expiresIn,
      expiresAt: new Date().getTime() + Number(expiresIn),
      accessToken,
    };
  }

  private badCredentialsError() {
    throw new HttpException(
      "Invalid credential provided.",
      HttpStatus.BAD_REQUEST
    );
  }

  private generateOAuthClient() {
    return new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.SERVER_APP_URL}/auth/google-oauth-callback`
    );
  }

  /**
   * @description Call Google Calendar API and get user events
   */
  public async getUserCalendarEvents() {
    try {
      let auth = this.generateOAuthClient();

      const content = readFileSync("userTokens.json", "utf8");
      const { refresh_token, access_token } = JSON.parse(content);

      auth.setCredentials({
        refresh_token,
        access_token,
      });

      const calendar = google.calendar({
        version: "v3",
        auth,
      });

      // just for testing purposes, return events from current month
      const events = await calendar.events.list(
        {
          calendarId: "primary",
          timeMin: new Date().toISOString(),
          singleEvents: true,
          maxResults: 10,
          orderBy: "startTime",
        },
        (err, res) => {
          if (err) return new Error("There was an error retrieving events");
          const events = res.data.items;
          console.log("events are finally: ", events);
          return events;
        }
      );
    } catch (e) {
      throw new Error(e);
    }
    // get user refresh token from DB!!!
  }

  /**
   * @description Exchange the user code for access_token and refresh_token.
   *              The refresh_token will only be returned once after
   *              first authorization (or after user revoking app permissions).
   * @param code (string)
   */
  public async getUserAccessToken(code: string): Promise<any> {
    try {
      const auth = this.generateOAuthClient();
      const { tokens } = await auth.getToken(code);

      if (tokens.access_token && tokens.refresh_token) {
        // @TODO Store refresh token and access token on the server
        writeFileSync("userTokens.json", JSON.stringify(tokens));
        return true;
      }
    } catch (err) {
      return false;
    }
  }

  /**
   * @description Generate url to sign-in user on mobile browser. After successful
   * authentication it should redirect the google response to our server.
   */
  public generateAuthUrl(scopes?: string): string {
    const scope = [
      "https://www.googleapis.com/auth/calendar.events.readonly",
      ...(scopes ? scopes.split(" ") : []),
    ];
    const auth = this.generateOAuthClient();
    const url = auth.generateAuthUrl({
      access_type: "offline",
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: `${process.env.SERVER_APP_URL}/auth/google-oauth-callback`,
      scope,
      include_granted_scopes: true,
      state: new Random().generateRandomString(10),
    });

    auth.on("tokens", (tokens) => {
      //@TODO Store the token in db?
      // check to which user we should assign the refresh token and access token
      console.log(tokens);

      if (tokens.refresh_token) {
      } else {
        // console.log(tokens);
      }
    });

    return url;
  }
}
