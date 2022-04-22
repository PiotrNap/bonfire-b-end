import { Injectable, HttpException, HttpStatus } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { FindManyOptions, Repository } from "typeorm"
import { JWTUserDto, UserDto } from "./dto/user.dto"
import { UserEntity } from "../model/user.entity"
import { toUserDto } from "../common/mapper"
import { CreateUserDto } from "./dto/user-create.dto"
import { ChallengeResponseValidation } from "../common/challengeValidation"
import { ChallengeResponseDTO } from "./dto/challenge-response.dto"
import { PaginationRequestDto, PaginationResult } from "src/pagination"
import { OrganizerEntity } from "src/model/organizer.entity"
import { CreateOrganizerDto } from "./dto/organizer.dto"
import { AttendeeEntity } from "src/model/attendee.entity"

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(OrganizerEntity)
    private readonly organizerRepo: Repository<OrganizerEntity>,
    @InjectRepository(AttendeeEntity)
    private readonly attendeeRepo: Repository<AttendeeEntity>
  ) {}

  async findOne(options: any, toDto: boolean = true): Promise<UserDto> {
    const user = await this.userRepo.findOne({ where: { ...options } })

    if (toDto) return toUserDto(user)

    return user
  }

  async updateUserSettings(settings: any, id: string) {
    return await this.userRepo.update(id, { userSettings: settings })
  }

  async updateUser(
    values: any,
    id: string,
    profileType: UserEntity["profileType"]
  ): Promise<any> {
    const organizer = profileType === "organizer"
    const attendee = profileType === "attendee"
    let user: any

    try {
      if (organizer) user = await this.organizerRepo.findOne(id)
      if (attendee) user = await this.userRepo.findOne(id)

      if (typeof values === "object")
        for (let key in values) {
          user[`${key}`] = values[key]
        }

      if (organizer) await this.organizerRepo.save(user)
      if (attendee) await this.userRepo.save(user)

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
    var user: UserEntity = await this.userRepo.findOne({
      where: userCredential,
    })

    if (!user) {
      throw new HttpException("User not found", HttpStatus.UNAUTHORIZED)
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

  async register(
    newUserDto: CreateUserDto | CreateOrganizerDto
  ): Promise<UserDto> {
    const { username, profileType } = newUserDto
    const user = await this.userRepo.findOne({ username })

    if (user) {
      throw new HttpException("User already exists", HttpStatus.BAD_REQUEST)
    }

    try {
      let newUser: any
      const { name, publicKey } = newUserDto
      newUser = new UserEntity()
      newUser.name = name
      newUser.username = username
      newUser.publicKey = publicKey
      newUser.profileType = profileType

      if (profileType === "organizer") {
        await this.organizerRepo.save(newUser)
      } else if (profileType === "attendee") {
        await this.attendeeRepo.save(newUser)
      }

      const userDto = new CreateUserDto(
        newUser.name,
        newUser.username,
        newUser.publicKey,
        newUser.id,
        newUser.profileType
      )

      return userDto
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

  async getAllOrganizers(): Promise<OrganizerEntity[]> {
    const organizers = await this.organizerRepo.find({
      relations: ["events", "bookedSlots", "scheduledSlots"],
    })

    return organizers
  }

  async getAllAttendees(): Promise<AttendeeEntity[]> {
    const attendees = await this.attendeeRepo.find({
      relations: ["bookedSlots"],
    })

    return attendees
  }

  async getCalendarEvents(
    id: string,
    profileType: string,
    date: Date
  ): Promise<any | void> {
    if (profileType === "organizer") {
      let { bookedSlots, scheduledSlots, events }: OrganizerEntity =
        await this.organizerRepo.findOne(id, {
          relations: ["bookedSlots", "scheduledSlots", "events"],
        })

      const filterByDate = (entities: any[]) => {
        return entities.filter((entity) => {
          const searchYear = new Date(date).getFullYear()
          const searchMonth = new Date(date).getMonth()

          const searchFrom = new Date(searchYear, searchMonth)
          const searchTo = new Date(
            searchYear,
            new Date(date).getMonth() + 1,
            0
          )
          if (entity.bookedDate)
            return (
              entity.bookedDate > searchFrom && entity.bookedDate < searchTo
            )

          return entity.fromDate > searchFrom
        })
      }

      return {
        bookedSlots: filterByDate(bookedSlots),
        scheduledSlots: filterByDate(scheduledSlots),
        events: filterByDate(events),
      }
    }

    if (profileType === "attendee") {
      const { bookedSlots }: AttendeeEntity = await this.attendeeRepo.findOne(
        id,
        {
          relations: ["bookedSlots"],
        }
      )

      return bookedSlots
    }
  }

  async getWithPagination(
    paginationRequestDto: PaginationRequestDto,
    options?: FindManyOptions<UserEntity>,
    repositoryName?: "organizer" | "attendee"
  ): Promise<PaginationResult<any> | void> {
    let repo: any

    if (repositoryName === "organizer") {
      repo = this.organizerRepo
    } else if (repositoryName === "attendee") {
      repo = this.attendeeRepo
    } else {
      repo = this.userRepo
    }

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
    const userEntity: UserEntity = await this.userRepo.findOne(user.id)
    userEntity.profileImage = file.buffer
    const { profileImage } = await this.userRepo.save(userEntity)

    return profileImage
  }

  async removeProfileImage(uuid: string, user: UserEntity) {
    user.profileImage = null
    const update = await this.userRepo.update(uuid, user)
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

  async getUserBookingSlots(
    uuid: string,
    profileType: "organizer" | "attendee"
  ) {
    if (profileType === "attendee")
      return await this.attendeeRepo
        .findOne(uuid, {
          relations: ["bookedSlots"],
        })
        .then((res) => res.bookedSlots)
    return await this.organizerRepo
      .findOne(uuid, {
        relations: ["bookedSlots"],
      })
      .then((res) => res.bookedSlots)
  }
}
