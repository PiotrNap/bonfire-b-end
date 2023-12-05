import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  UnprocessableEntityException,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express/multer/index.js"
import { Express } from "express"
import { checkIfAuthorized } from "../auth/auth.helpers.js"
import { Public } from "../common/decorators/public.decorator.js"
import { isNSFW } from "../common/utils.js"
import { UserEntity } from "../model/user.entity.js"
import { PaginationRequestDto } from "../pagination/pagination-request.dto.js"
import { PaginationResult } from "../pagination/pagination-result.interface.js"
import { AddDeviceDTO } from "./dto/add-device.dto.js"
import { CreateUserDto } from "./dto/user-create.dto.js"
import { UpdateUserDto } from "./dto/user-update.dto.js"
import { UserDto } from "./dto/user.dto.js"
import { UsersService } from "./users.service.js"

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // TODO This SHOULD NOT be public
  @Public()
  @Get()
  async getUsers(
    @Query() query: PaginationRequestDto,
    @Body() body: any
  ): Promise<PaginationResult<UserEntity> | UserEntity[] | void> {
    let users: any

    if (Object.keys(query).length) {
      users = await this.usersService.getWithPagination(query)
    }

    if (Object.keys(body).length) {
      users = await this.usersService.findByPayload(body)
    }

    // TODO this shouldn't be in production
    users = await this.usersService.getAll()

    if (!users) throw new NotFoundException()

    return users
  }

  @Public()
  @Post("register")
  public async registerUser(@Body() body: CreateUserDto): Promise<UserDto> {
    let newUser = await this.usersService.register(body)
    let betaTesterRecord: any
    if (body.betaTesterCode) {
      betaTesterRecord = await this.usersService.registerBetaTester(
        body.betaTesterCode,
        newUser.baseAddress
      )
    }
    return { ...newUser, ...betaTesterRecord }
  }

  // used during new account registration
  @Public()
  @Get("check-username")
  async checkUsername(@Query("username") username: string) {
    const isAvailable = await this.usersService.isUsernameAvailable(username)
    return isAvailable
  }

  // used during log-in process, maps given public key to a potentialy existsing user
  @Public()
  @Get("check-publickey")
  async checkPublicKey(@Query("publickey") username: string) {
    const res = await this.usersService.getUserByPublicKey(username)
    if (!res)
      throw new HttpException(
        "No user exists for a given wallet credentials.",
        HttpStatus.NOT_FOUND
      )

    return res // returns only baseAddress + username to complete sign-in on front-end
  }

  @Public()
  @Get("beta-tokens")
  public async getBetaTesterRegistration() {
    return await this.usersService.checkIfBetaTesterRegistrationStillOpen()
  }

  @Public()
  @Get("beta-tokens/:betaTesterCode/:baseAddress")
  public async registerBetaTester(
    @Param("betaTesterCode") betaTesterCode: string,
    @Param("baseAddress") baseAddress: string
  ) {
    return await this.usersService.registerBetaTester(betaTesterCode, baseAddress)
  }

  @Public()
  @Post("register-device")
  public async registerDevice(@Body() body: AddDeviceDTO): Promise<string> {
    return await this.usersService.registerDevice(body)
  }

  //TODO is it good that it's public??
  @Public()
  @Get("base-address/:baseAddress")
  public async getUserByBaseAddress(@Param("baseAddress") baseAddress: string) {
    return await this.usersService.findOne({ baseAddress }, true)
  }

  @Post("files/profile-image")
  @UseInterceptors(FileInterceptor("file"))
  public async uploadImage(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    if (await isNSFW(file)) throw new UnprocessableEntityException()

    const updated = await this.usersService.updateUserProfileImage(file, req.user)
    if (!updated) throw new NotFoundException()

    return
  }

  @Public()
  @Get("files/profile-image/:uuid")
  public async getUserProfileImage(@Param("uuid", ParseUUIDPipe) uuid: string) {
    const profileImage = await this.usersService.getUserProfileImage(uuid)
    if (!profileImage) throw new NotFoundException()

    return profileImage
  }

  @Delete("files/profile-image/:uuid")
  public async removeUserProfileImage(
    @Param("uuid", ParseUUIDPipe) uuid: string,
    @Req() req: any
  ) {
    const { user } = req
    checkIfAuthorized(user.id, uuid)
    const success = this.usersService.removeProfileImage(uuid, user)

    if (!success) throw new NotFoundException()
  }

  @Get(":uuid")
  public async getUserById(@Param("uuid", ParseUUIDPipe) uuid: string) {
    const user = await this.usersService.findOne({ id: uuid }, true)

    if (!user) throw new NotFoundException()
    return user
  }

  @Put(":uuid")
  public async updateUser(
    @Body() body: UpdateUserDto,
    @Param("uuid", ParseUUIDPipe) uuid: string,
    @Req() req: any
  ): Promise<any> {
    const { user } = req
    checkIfAuthorized(user.id, uuid)

    return await this.usersService.updateUser(body, uuid)
  }

  //TODO needs to be tested
  // Puts user record as in-active
  @Delete(":uuid")
  public deleteUser(@Param("uuid", ParseUUIDPipe) uuid: string, @Req() req: any) {
    const { user } = req
    checkIfAuthorized(user.id, uuid)

    return this.usersService.deactivateUser(uuid)
  }

  @Get(":uuid/events")
  public async getCalendarEvents(
    @Param("uuid", ParseUUIDPipe) uuid: string,
    @Query() query: any,
    @Req() req: any
  ): Promise<any> {
    const { user } = req
    checkIfAuthorized(user.id, uuid)

    const events = await this.usersService.getCalendarEvents(
      uuid,
      query.date || new Date()
    )

    if (!events) throw new UnprocessableEntityException()

    return events
  }

  @Get(":uuid/schedulings")
  public async getUserScheduledSlots(
    @Param("uuid", ParseUUIDPipe) uuid: string,
    @Req() req: any
  ) {
    const { user } = req
    checkIfAuthorized(user.id, uuid)
    const slots = await this.usersService.getUserScheduledSlots(uuid)

    if (!slots) throw new UnprocessableEntityException()

    return slots
  }

  @Get(":uuid/booking")
  public async getUserBookingSlots(
    @Param("uuid", ParseUUIDPipe) uuid: string,
    @Req() req: any
  ) {
    const { user } = req
    checkIfAuthorized(user.id, uuid)
    const slots = await this.usersService.getUserBookingSlots(uuid)

    if (!slots) throw new UnprocessableEntityException()

    return slots
  }

  @Put(":uuid/settings")
  public async updateUserSettings(
    @Param("uuid", ParseUUIDPipe) uuid: string,
    @Req() req: any
  ) {
    const { user, body } = req
    checkIfAuthorized(user.id, uuid)

    const updated = await this.usersService.updateUserSettings(body, user.id)
    if (!updated) throw new UnprocessableEntityException()

    return
  }

  @Get(":uuid/tx/plutus-scripts")
  public async attachPlutusScript(
    @Param("uuid", ParseUUIDPipe) uuid: string,
    @Req() req: any
  ) {
    // const { body } = req
    const user = await this.usersService.findOne({ id: uuid })

    checkIfAuthorized(user.id, uuid)

    //@ts-ignore
    return await createUnlockingTx(user)
  }
}
