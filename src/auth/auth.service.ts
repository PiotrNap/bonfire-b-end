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

const fs = require("fs");

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

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

  private _refreshToken = null;
  private googleOauthEndPoint = "https://oauth2.googleapis.com/token?";
  private oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.SERVER_APP_URL}/auth/google`
  );

  /**
   * @description Call Google Calendar API and get user events
   */
  public async getUserCalendarEvents() {
    const calendar = google.calendar({
      version: "v3",
      auth: this.oauth2Client,
    });

    await fs.readFile("userTokens.json", (err, content) => {
      if (err) return new Error("Error while reading userTokens.json");
      this.oauth2Client.setCredentials(JSON.parse(content));
    });

    // just for testing purposes, return events from current month
    calendar.events.list(
      {
        calendarId: "primary",
        timeMin: new Date(
          new Date().getFullYear(),
          new Date().getMonth()
        ).toISOString(),
        timeMax: new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1
        ).toISOString(),
        orderBy: "startTime",
      },
      (err, res) => {
        console.log("res", res);
        if (err) return new Error("There was an error retrieving events");
        const events = res.data.items;
        return events;
      }
    );
  }

  /**
   * @description Exchange the user code for access_token and refresh_token
   * @param code (string)
   */
  public async getUserAccessToken(code: string): Promise<boolean> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);

      if (tokens.access_token && tokens.refresh_token) {
        //@TODO Store refresh token and access token on the server
        return true;
      } else {
        return false;
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
      "email",
      "profile",
      "openid",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      ...(scopes ? scopes.split(" ") : []),
    ];

    const url = this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: `${process.env.SERVER_APP_URL}/auth/google`,
      scope,
      include_granted_scopes: true,
      state: new Random().generateRandomString(10),
    });

    this.oauth2Client.on("tokens", (tokens) => {
      //@TODO Store the token in db?
      if (tokens.refresh_token) {
        fs.writeFile("userTokens.json", JSON.stringify(tokens), (err) => {
          if (err) return console.log("There was an error writing file");
          console.log("New userTokens.json created");
        });

        console.log("New refresh token!");
        this._refreshToken = tokens.refresh_token;
      } else {
        console.log(tokens);
      }
    });

    return url;
  }
}
