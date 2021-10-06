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
import { ChallengeDTO } from "src/users/dto/challenge.dto";
import { ChallengeResponseDTO } from "src/users/dto/challenge-response.dto";
import { JwtPayload } from "./interfaces/payload.interface";
import { JwtService } from "@nestjs/jwt";
import { google } from "googleapis";
import { readFileSync, writeFileSync } from "fs";
import { UserEntity } from "src/model/user.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { generateSecretState } from "./auth.helpers";
import { validateSecretState } from "./auth.helpers";
import { Buffer } from "buffer";
import * as qs from "qs";
import { Credentials } from "./interfaces/google.interface";

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>
  ) {}

  private baseGoogleScope = ["https://www.googleapis.com/auth/calendar.events"];

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

  async login(payload: ChallengeResponseDTO): Promise<LoginStatus> {
    const user = await this.usersService.challengeLogin(payload);

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

  /**
   * @description Call Google Calendar API and get user events
   */
  public getUserCalendarEvents(query: any) {
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
    const timeMin = (
      query?.fromTime ? new Date(Number(query.fromTime)) : new Date()
    ).toISOString();
    const timeMax = (
      query?.toTime ? new Date(Number(query.toTime)) : new Date()
    ).toISOString();

    return new Promise((res, rej) => {
      calendar.events.list(
        {
          calendarId: "primary",
          timeMin,
          timeMax,
          singleEvents: true,
          orderBy: "startTime",
        },
        (err, response) => {
          if (err) rej(new Error("There was an error retrieving events"));
          res(response.data.items);
        }
      );
    });
  }

  /**
   * @description Exchange the user code for access_token and refresh_token.
   *              The refresh_token will only be returned once after
   *              first authorization (or after user revoke app permissions).
   * @param code (string)
   */
  public async getUserAccessToken(
    code: string,
    user: UserEntity
  ): Promise<any> {
    try {
      const auth = this.generateOAuthClient();
      const credentials = await auth.getToken(code);

      if (credentials.tokens) {
        let missingScope = false;
        let scopes = credentials.tokens.scope.split(" ");
        this.baseGoogleScope.map((val) =>
          !scopes.includes(val) ? (missingScope = true) : {}
        );
        if (missingScope) return null;

        user.googleApiCredentials = JSON.stringify(credentials.tokens);
        if (credentials.tokens.refresh_token)
          user.lastUsedRefreshToken = new Date();
        console.log(user);
        await this.userRepo.save(user);

        return true;
      }
    } catch (err) {
      console.error(err.stack);
      return null;
    }
  }

  public async handleGoogleOauthCallback(query: any): Promise<any> {
    if (query.error != null && query.error === "access_denied")
      return this.buildRedirectURL({
        success: false,
        message: "access denied",
      });

    const { code, state } = query;

    const [hash, id] = state.split("_");
    const user = await this.userRepo.findOneOrFail(id);
    const validState = validateSecretState(hash, id, user.verificationNonce);

    if (!validState) {
      return this.buildRedirectURL({
        success: false,
        message: "state validation failed",
      });
    }

    const accessToken = await this.getUserAccessToken(code, user);

    if (!accessToken)
      return this.buildRedirectURL({
        success: false,
        message: "unable to obtain access",
      });

    return this.buildRedirectURL({ success: true });
  }

  /**
   * @description Generate url to sign-in user on mobile browser. After successful
   * authentication it should redirect the google response to our server.
   */
  public async generateAuthUrl(
    user: UserEntity,
    scopes?: string
  ): Promise<string> {
    const { id } = user;
    const scope = [
      ...this.baseGoogleScope,
      ...(scopes ? scopes.split(" ") : []),
    ];
    const auth = this.generateOAuthClient();
    const { nonce, state } = generateSecretState(id);
    const url = auth.generateAuthUrl({
      access_type: "offline",
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: `${process.env.SERVER_APP_URL}/auth/google-oauth-callback`,
      scope,
      include_granted_scopes: true,
      state,
    });

    user.verificationNonce = nonce;
    await this.userRepo.save(user);

    //auth.on("tokens", (tokens) => {
    //  //@TODO Store the token in db?
    //  // check to which user we should assign the refresh token and access token
    //  console.log(tokens);

    //  if (tokens.refresh_token) {
    //  } else {
    //    // console.log(tokens);
    //  }
    //});
    //console.log("url is: ", url);

    return url;
  }

  public async checkValidOauth(user: UserEntity) {
    if (
      user.googleApiCredentials !== "undefined" &&
      user.googleApiCredentials !== null
    ) {
      if (user.lastUsedRefreshToken !== null) {
        const current = new Date();
        const sixMonthsFrom = new Date(user.lastUsedRefreshToken);
        sixMonthsFrom.setMonth(sixMonthsFrom.getMonth() + 6);
        return current < sixMonthsFrom;
      }
    }

    return false;
  }

  private buildRedirectURL(
    queryObj: { [key: string]: any },
    path?: string
  ): string {
    const queryString = qs.stringify(queryObj);
    const base = process.env.MOBILE_APP_SCHEMA;

    if (!path) return base + `?${queryString}`;
    return base + path + queryString;
  }
}
