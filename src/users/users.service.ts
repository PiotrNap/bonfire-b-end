import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { FindManyOptions, Repository } from "typeorm"
import * as helios from "@hyperionbt/helios"
import { AddDeviceDTO } from "./dto/add-device.dto.js"
import { UserEntity } from "../model/user.entity.js"
import { DeviceCredentialEntity } from "../model/deviceCredential.entity.js"
import { JWTUserDto, UserDto } from "./dto/user.dto.js"
import { toUserDto } from "../common/mapper.js"
import { ChallengeResponseDTO } from "./dto/challenge-response.dto.js"
import { ChallengeResponseValidation } from "../common/challengeValidation.js"
import { PaginationRequestDto } from "../pagination/pagination-request.dto.js"
import { PaginationResult } from "../pagination/pagination-result.interface.js"

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>
  ) {}

  async findOne(options: any, toDto: boolean = true): Promise<UserDto> {
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
        for (let key in values) {
          user[`${key}`] = values[key]
        }
      }
      await this.userRepo.save(user)

      return {
        status: 201,
        message: "User record updated successfully",
        record: toUserDto(user),
      }
    } catch (e) {
      console.error(e)
      throw new HttpException(
        "Could not update the record.",
        HttpStatus.BAD_REQUEST
      )
    }
  }

  async challengeLogin(payload: ChallengeResponseDTO): Promise<UserDto> {
    const { signature, challengeString, userCredential } = payload
    const { id, publicKey } = userCredential
    const user: UserEntity = await this.userRepo.findOne(id)

    if (!user) {
      throw new HttpException("User not found", HttpStatus.UNAUTHORIZED)
    }

    // @TODO initial work-around. When user interrupts registration and publicKey
    // is empty
    if (!user.publicKey) {
      user.publicKey = publicKey
      console.log("saving new user ", user)
      await this.userRepo.save(user)
    }

    const valid = new ChallengeResponseValidation().validate(
      user,
      signature,
      challengeString,
      userCredential
    )
    if (!valid) {
      throw new HttpException("Invalid credentials", HttpStatus.UNAUTHORIZED)
    }
    return toUserDto(user)
  }

  async findByPayload({ payload }: any): Promise<any> {
    let users: UserEntity[] = await this.userRepo.find({
      where: { ...payload },
    })

    users.map((user: UserEntity) => {
      let userDto: UserDto = toUserDto(user)
      return userDto
    })

    return users
  }

  async register(newUserDto: UserDto): Promise<UserDto> {
    const { username } = newUserDto
    const user = await this.userRepo.findOne({ username })

    if (user) {
      throw new HttpException("User already exists", HttpStatus.BAD_REQUEST)
    }

    try {
      let newUser: any
      const {
        publicKey,
        hourlyRateAda,
        baseAddress,
        bio,
        profession,
        skills,
        jobTitle,
      } = newUserDto
      newUser = new UserEntity()
      newUser.username = username
      newUser.publicKey = publicKey
      newUser.hourlyRateAda = hourlyRateAda
      newUser.baseAddress = baseAddress
      newUser.bio = bio
      newUser.profession = profession
      newUser.skills = skills
      newUser.jobTitle = jobTitle

      newUser = await this.userRepo.save(newUser)

      return { username, id: newUser.id }
    } catch (e) {
      console.error(e)
      throw new HttpException(
        "Something went wrong while creating new user",
        HttpStatus.BAD_REQUEST
      )
    }
  }

  async deleteUser(uuid: string) {
    return this.userRepo.delete(uuid)
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
    let { bookedSlots, scheduledSlots, events }: UserEntity =
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
      let skip = (page - 1) * limit

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
