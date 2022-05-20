import { google } from "googleapis"
import { getRepository, Repository } from "typeorm"
import dayjs from "dayjs"

import { generateSecretState } from "../../auth/auth.helpers"
import { validateSecretState } from "../../auth/auth.helpers"
import { buildRedirectURL } from "../utils"
import { UserEntity } from "src/model/user.entity"

export class GoogleApiService {
  userRepo: Repository<UserEntity>

  constructor() {
    this.userRepo = getRepository(UserEntity)
  }

  private baseGoogleScope = ["https://www.googleapis.com/auth/calendar.events"]
  private generateOAuthClient() {
    return new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.SERVER_APP_URL}/auth/google-oauth-callback`
    )
  }

  /**
   * @description Exchange the user code for access_token and refresh_token.
   *              The refresh_token will only be returned once after
   *              first authorization (or after user revoke app permissions).
   * @param code (string)
   */
  public async getUserAccessToken(
    code: string,
    user: UserEntity,
    refresh_token?: string
  ): Promise<any> {
    try {
      const auth = this.generateOAuthClient()
      if (refresh_token) auth.setCredentials({ refresh_token })
      const credentials = await auth.getToken(code)

      if (credentials.tokens) {
        console.log("got new credentials")
        let missingScope = false
        let scopes = credentials.tokens.scope.split(" ")
        this.baseGoogleScope.map((val) =>
          !scopes.includes(val) ? (missingScope = true) : {}
        )
        if (missingScope) return null

        const oldCredentials = JSON.parse(user.googleApiCredentials)
        if (!credentials.tokens.refresh_token && oldCredentials?.refresh_token)
          credentials.tokens.refresh_token = oldCredentials.refresh_token

        user.googleApiCredentials = JSON.stringify(credentials.tokens)
        if (credentials.tokens.refresh_token)
          user.lastUsedRefreshToken = new Date()

        await this.userRepo.save(user)

        return true
      }
    } catch (err) {
      console.error(err.stack)
      return null
    }
  }

  public async handleGoogleOauthCallback(query: any): Promise<any> {
    const { code, state } = query
    console.log(query)
    const [hash, id] = state.split("_")
    const user = await this.userRepo.findOneOrFail(id)
    const path = user.deepLinkingCallbackUri
    const validState = validateSecretState(hash, id, user.verificationNonce)
    const accessToken = await this.getUserAccessToken(code, user)

    user.verificationNonce = null
    user.deepLinkingCallbackUri = null
    await this.userRepo.save(user)

    if (query.error != null && query.error === "access_denied")
      return buildRedirectURL(
        {
          success: false,
          message: "access denied",
        },
        path
      )

    if (!validState)
      return buildRedirectURL(
        {
          success: false,
          message: "state validation failed",
        },
        path
      )

    if (!accessToken)
      return buildRedirectURL(
        {
          success: false,
          message: "unable to obtain access",
        },
        path
      )

    return buildRedirectURL({ success: true }, path)
  }

  /**
   * @description Generates url to sign-in by user on mobile browser.
   * After successful authentication it should redirect the google's
   * response to our server.
   */
  public async generateAuthUrl(
    user: UserEntity,
    callbackUri: string,
    scopes?: string
  ): Promise<string> {
    const { id } = user
    const scope = [
      ...this.baseGoogleScope,
      ...(scopes ? scopes.split(" ") : []),
    ]
    const auth = this.generateOAuthClient()
    const { nonce, state } = generateSecretState(id)
    const url = auth.generateAuthUrl({
      access_type: "offline",
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: `${process.env.SERVER_APP_URL}/auth/google-oauth-callback`,
      scope,
      include_granted_scopes: true,
      state,
    })

    user.verificationNonce = nonce
    user.deepLinkingCallbackUri = callbackUri
    await this.userRepo.save(user)

    return url
  }

  public async checkValidOauth(user: UserEntity) {
    if (user.googleApiCredentials) {
      const { expiry_date, refresh_token } = JSON.parse(
        user.googleApiCredentials
      )

      if (!refresh_token) return false
      if (dayjs(expiry_date).toDate() < dayjs().toDate()) {
        this.getUserAccessToken
      }

      if (user.lastUsedRefreshToken !== null) {
        const current = new Date()
        const sixMonthsFrom = new Date(user.lastUsedRefreshToken)
        sixMonthsFrom.setMonth(sixMonthsFrom.getMonth() + 6)
        return current < sixMonthsFrom
      }
    }

    return false
  }

  /**
   * @description returns Gcal events by given from-to dates
   * of a specific user
   */
  public getUserGoogleCalendarEvents(query: any, userId: string) {
    let auth = this.generateOAuthClient()

    // const content = readFileSync("userTokens.json", "utf8")
    // const { refresh_token, access_token } = JSON.parse(content)

    // auth.setCredentials({
    //   refresh_token,
    //   access_token,
    // })
    const calendar = google.calendar({
      version: "v3",
      auth,
    })
    const timeMin = (
      query?.fromTime ? new Date(Number(query.fromTime)) : new Date()
    ).toISOString()
    const timeMax = (
      query?.toTime ? new Date(Number(query.toTime)) : new Date()
    ).toISOString()

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
          if (err) rej(new Error("There was an error retrieving events"))
          res(response.data.items)
        }
      )
    })
  }

  public createUserGoogleCalendarEvent() {
    let auth = this.generateOAuthClient()
  }
}
