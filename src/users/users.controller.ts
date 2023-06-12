import {
  Body,
  Controller,
  Delete,
  Get,
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
import { Express } from "express"
import { UsersService } from "./users.service"
import { CreateUserDto } from "../users/dto/user-create.dto"
import { UserDto } from "./dto/user.dto"
import { UpdateUserDto } from "./dto/user-update.dto"
import { Public } from "src/common/decorators/public.decorator"
import { PaginationRequestDto, PaginationResult } from "src/pagination"
import { UserEntity } from "src/model/user.entity"
import { CreateOrganizerDto } from "./dto/organizer.dto"
import { FileInterceptor } from "@nestjs/platform-express"
import { isNSFW } from "src/common/utils"
import { checkIfAuthorized } from "src/auth/auth.helpers"

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
  public async registerUser(
    @Body() body: CreateUserDto | CreateOrganizerDto
  ): Promise<UserDto> {
    return await this.usersService.register(body)
  }

  @Get("attendees")
  public async getAttendees(
    @Query() query: PaginationRequestDto
  ): Promise<any> {
    let attendees: any

    if (Object.keys(query).length) {
      attendees = this.usersService.getWithPagination(
        query,
        undefined,
        "attendee"
      )
    } else {
      // TODO this shouldn't be in production
      attendees = await this.usersService.getAllAttendees()
    }

    if (!attendees) return new NotFoundException()

    return attendees
  }

  @Get("organizers")
  public async getOrganizers(
    @Query() query: PaginationRequestDto
  ): Promise<any> {
    let organizers: any

    if (Object.keys(query).length) {
      organizers = this.usersService.getWithPagination(
        query,
        undefined,
        "organizer"
      )
    } else {
      // TODO this shouldn't be in production
      organizers = await this.usersService.getAllOrganizers()
    }

    if (!organizers) return new NotFoundException()

    return organizers
  }

  @Post("files/profile-image")
  @UseInterceptors(FileInterceptor("file"))
  public async uploadImage(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (await isNSFW(file)) throw new UnprocessableEntityException()

    const updated = await this.usersService.updateUserProfileImage(
      file,
      req.user
    )
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
    console.log(req.user)
    const { user } = req
    checkIfAuthorized(user.id, uuid)

    return await this.usersService.updateUser(body, uuid, user.profileType)
  }

  //TODO needs to be tested
  // Puts user record as in-active
  @Delete(":uuid")
  public deleteUser(
    @Param("uuid", ParseUUIDPipe) uuid: string,
    @Req() req: any
  ) {
    const { user } = req
    checkIfAuthorized(user.id, uuid)

    return this.usersService.deleteUser(uuid)
  }

  @Get(":uuid/events")
  public async getCalendarEvents(
    @Param("uuid", ParseUUIDPipe) uuid: string,
    @Query() query: any,
    @Req() req: any
  ): Promise<any> {
    const { user } = req
    console.log(user, uuid)
    checkIfAuthorized(user.id, uuid)

    const events = await this.usersService.getCalendarEvents(
      uuid,
      user.profileType,
      query.date || new Date()
    )

    if (!events) throw new UnprocessableEntityException()

    return events
  }

  @Get(":uuid/booking")
  public async getUserBookingSlots(
    @Param("uuid", ParseUUIDPipe) uuid: string,
    @Req() req: any
  ) {
    const { user } = req
    checkIfAuthorized(user.id, uuid)
    const slots = await this.usersService.getUserBookingSlots(uuid, user.id)

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
}
