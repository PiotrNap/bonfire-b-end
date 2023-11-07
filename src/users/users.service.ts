import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { FindManyOptions, Repository } from "typeorm"
import { AddDeviceDTO } from "./dto/add-device.dto.js"
import { UserEntity } from "../model/user.entity.js"
import { DeviceCredentialEntity } from "../model/deviceCredential.entity.js"
import { JWTUserDto, UserDto } from "./dto/user.dto.js"
import { toUserDto } from "../common/mapper.js"
import { ChallengeResponseDTO } from "./dto/challenge-response.dto.js"
import { ChallengeResponseValidation } from "../common/challengeValidation.js"
import { PaginationRequestDto } from "../pagination/pagination-request.dto.js"
import { PaginationResult } from "../pagination/pagination-result.interface.js"
import * as helios from "@hyperionbt/helios"
import { EventEntity } from "../model/event.entity.js"
import { BetaTestersEntity } from "../model/betaTesters.entity.js"
import { mintBetaTesterToken } from "../utils/cardano.js"

const { Signature } = helios

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(BetaTestersEntity)
    private readonly betaTestersRepo: Repository<BetaTestersEntity>,
    @InjectRepository(EventEntity)
    private readonly eventsRepo: Repository<EventEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(DeviceCredentialEntity)
    private readonly deviceCredentialsRepo: Repository<DeviceCredentialEntity>
  ) {}

  async findOne(options: any, toDto = true): Promise<UserDto> {
    const user = await this.userRepo.findOne({ where: { ...options } })
    if (user && toDto) return toUserDto(user)
  }

  async updateUserSettings(settings: any, id: string) {
    return await this.userRepo.update(id, { userSettings: settings })
  }

  async updateUser(values: any, id: string): Promise<any> {
    let user: any

    try {
      user = this.userRepo.findOne(id)

      if (typeof values === "object") {
        for (const key in values) {
          user[`${key}`] = values[key]
        }
      }

      if (!user.isActive) throw new UnauthorizedException()
      await this.userRepo.save(user)

      return {
        status: 201,
        message: "User record updated successfully",
        record: toUserDto(user),
      }
    } catch (e) {
      console.error(e)
      throw new HttpException("Could not update the record.", HttpStatus.BAD_REQUEST)
    }
  }

  async challengeLogin(payload: ChallengeResponseDTO): Promise<UserDto> {
    const { signature, challenge, id, deviceID } = payload
    const user: UserEntity = await this.userRepo.findOne(id)
    console.log(user)

    if (!user) {
      throw new HttpException("User not found", HttpStatus.UNAUTHORIZED)
    }
    if (!user.isActive) throw new UnauthorizedException()

    const deviceCredential: DeviceCredentialEntity =
      await this.deviceCredentialsRepo.findOne(deviceID)
    if (!deviceCredential) {
      throw new HttpException(
        "No device credential found for given user",
        HttpStatus.NOT_FOUND
      )
    }

    const valid = new ChallengeResponseValidation().validate(
      deviceCredential,
      signature,
      challenge
    )
    if (!valid) {
      throw new HttpException("Invalid credentials", HttpStatus.UNAUTHORIZED)
    }
    return toUserDto(user)
  }

  async findByPayload({ payload }: any): Promise<any> {
    const users: UserEntity[] = await this.userRepo.find({
      where: { ...payload },
    })

    users.map((user: UserEntity) => {
      const userDto: UserDto = toUserDto(user)
      return userDto
    })

    return users
  }

  async registerDevice(payload: AddDeviceDTO): Promise<any> {
    const { walletPublicKey, devicePubKey } = payload

    const user = await this.userRepo.findOne({ where: { walletPublicKey } })
    if (!user.isActive) throw new UnauthorizedException()
    if (!user) throw NotFoundException

    let deviceCredential = new DeviceCredentialEntity()
    deviceCredential.userID = user.id
    deviceCredential.publicKey = devicePubKey

    deviceCredential = await this.deviceCredentialsRepo.save(deviceCredential)

    console.log("added new device credential...")
    console.log(deviceCredential)

    return { ...toUserDto(user), deviceID: deviceCredential.id }
  }

  async register(newUserDto: UserDto): Promise<UserDto> {
    console.log("new user dto ", newUserDto)
    try {
      const {
        hourlyRateAda = 0,
        timeZone,
        bio,
        profession,
        skills,
        jobTitle,
        username,
        baseAddress,
        walletPublicKey,
        publicKey,
      } = newUserDto
      let newUser = new UserEntity()
      newUser.username = username
      newUser.hourlyRateAda = hourlyRateAda ? Number(hourlyRateAda) : 0
      newUser.baseAddress = baseAddress
      newUser.bio = bio
      newUser.profession = profession
      newUser.skills = skills
      newUser.jobTitle = jobTitle
      newUser.timeZone = timeZone
      newUser.walletPublicKey = walletPublicKey

      newUser = await this.userRepo.save(newUser)

      let deviceCredential = new DeviceCredentialEntity()
      deviceCredential.userID = newUser.id
      deviceCredential.publicKey = publicKey
      deviceCredential.messagingToken = ""

      deviceCredential = await this.deviceCredentialsRepo.save(deviceCredential)
      this.userRepo.findOne

      return { username, id: newUser.id, deviceID: deviceCredential.id, baseAddress }
    } catch (e) {
      console.error(e)
      throw new HttpException(
        "Something went wrong while creating new user",
        HttpStatus.BAD_REQUEST
      )
    }
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    const user = await this.userRepo.findOne({ username })
    return !user
  }

  async getUserByPublicKey(
    publickey: string
  ): Promise<{ username: string; baseAddress: string } | void> {
    return await this.userRepo.findOne({
      select: ["username", "baseAddress"],
      where: {
        walletPublicKey: publickey,
      },
    })
  }

  // returns true if there are BetaTokens still to be claimed
  async checkIfBetaTesterRegistrationStillOpen(): Promise<boolean> {
    return !!(await this.betaTestersRepo.find({ where: { redeemed: false } })).length
  }

  async registerBetaTester(betaTesterCode: string, baseAddress: string) {
    const allTokens: BetaTestersEntity[] = await this.betaTestersRepo.find() // returns all records
    const claimedTokens = allTokens.filter((t) => t.redeemed === true)
    let currentlyClaiming = allTokens.find((t) => t.key === betaTesterCode)

    if (!currentlyClaiming)
      throw new HttpException(
        "This beta-tester code doesn't exists!",
        HttpStatus.UNPROCESSABLE_ENTITY
      )

    if (currentlyClaiming.redeemed)
      throw new HttpException(
        "This beta-tester code was already claimed!",
        HttpStatus.UNPROCESSABLE_ENTITY
      )

    const txHash = await mintBetaTesterToken(baseAddress, claimedTokens.length + 1)
    if (!txHash)
      throw new HttpException(
        "Something went wrong on our end. Please reach out for further help.",
        HttpStatus.CONFLICT
      )

    currentlyClaiming.redeemed = true
    currentlyClaiming.txHash = txHash
    currentlyClaiming = await this.betaTestersRepo.save(currentlyClaiming)
    return { ...currentlyClaiming, txHash }
  }

  async deactivateUser(uuid: string) {
    // deactivate user's profile:
    // 1. set account as in-active
    // 2. set current open events as in-active
    var user = await this.userRepo.findOne(uuid, { relations: ["events"] })
    var events = user.events
    user.isActive = false
    events.forEach((e) => (e.isActive = false))

    await this.userRepo.save(user)
    await this.eventsRepo.save(user.events)
    return
  }

  async getAll(options?: FindManyOptions<UserEntity>): Promise<UserEntity[]> {
    const users = await this.userRepo.find()

    return users
  }

  // async getAllOrganizers(): Promise<OrganizerEntity[]> {
  //   const organizers = await this.organizerRepo.find({
  //     relations: ["events", "bookedSlots", "scheduledSlots"],
  //   })

  //   return organizers
  // }

  // async getAllAttendees(): Promise<AttendeeEntity[]> {
  //   const attendees = await this.attendeeRepo.find({
  //     relations: ["bookedSlots"],
  //   })

  //   return attendees
  // }

  async getCalendarEvents(id: string, date: Date): Promise<any | void> {
    const { bookedSlots, scheduledSlots, events }: UserEntity =
      await this.userRepo.findOne(id, {
        relations: ["bookedSlots", "scheduledSlots", "events"],
      })

    const filterByDate = (entities: any[]) => {
      return entities.filter((entity) => {
        const searchYear = new Date(date).getFullYear()
        const searchMonth = new Date(date).getMonth()

        const searchFrom = new Date(searchYear, searchMonth)
        const searchTo = new Date(searchYear, new Date(date).getMonth() + 1, 0)
        if (entity.bookedDate)
          return entity.bookedDate > searchFrom && entity.bookedDate < searchTo

        return entity.fromDate > searchFrom
      })
    }

    return {
      bookedSlots: filterByDate(bookedSlots),
      scheduledSlots: filterByDate(scheduledSlots),
      events: filterByDate(events),
    }
  }

  async getWithPagination(
    paginationRequestDto: PaginationRequestDto,
    options?: FindManyOptions<UserEntity>
  ): Promise<PaginationResult<any> | void> {
    let repo: any

    repo = this.userRepo
    try {
      let { limit, page } = paginationRequestDto
      page = Math.abs(Number(page))
      limit = Math.abs(Number(limit))
      if (limit < 10) limit = 10
      const skip = (page - 1) * limit

      const results = await repo.findAndCount({
        take: limit,
        skip,
        order: {
          createDateTime: "ASC",
        },
        // default cache time = 1s
        cache: true,
        ...options,
      })

      if (results == null) throw new Error()

      return {
        result: results[0],
        count: results[1],
        limit,
        page,
      }
    } catch (e) {
      console.error(e)
      throw new HttpException("Something went wrong", HttpStatus.BAD_REQUEST)
    }
  }

  async updateUserProfileImage(file: Express.Multer.File, user: JWTUserDto) {
    return await this.userRepo.update(user.id, { profileImage: file.buffer })
  }

  async removeProfileImage(uuid: string, user: UserEntity) {
    const update = await this.userRepo.update(uuid, { profileImage: null })
    if (!update) return false

    return {
      status: 201,
      message: "User record updated successfully",
      record: toUserDto(user),
    }
  }

  async getUserProfileImage(uuid: string) {
    const user = await this.userRepo.findOne(uuid, { select: ["profileImage"] })
    if (!user?.profileImage) return false

    return user.profileImage
  }

  async getUserBookingSlots(uuid: string) {
    return await this.userRepo
      .findOne(uuid, {
        relations: ["bookedSlots"],
      })
      .then((res) => res.bookedSlots)
  }
}
