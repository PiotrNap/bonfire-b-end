import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Equal, FindManyOptions, ILike, Repository } from "typeorm"
import { EventEntity } from "../model/event.entity.js"
import { BookingSlotEntity } from "../model/bookingSlot.entity.js"
import { EventStatistics } from "../model/eventStatistics.entity.js"
import { UserEntity } from "../model/user.entity.js"
import { CreateEventDto } from "./dto/create-event.dto.js"
import { PaginationRequestDto } from "../pagination/pagination-request.dto.js"
import { PaginationResult } from "../pagination/pagination-result.interface.js"
import { EventPaginationDto } from "./dto/event-pagination.dto.js"
import { UpdateEventDto } from "./dto/update-event.dto.js"
import { SuccessMessage } from "../auth/interfaces/payload.interface.js"
import { JWTUserDto } from "../users/dto/user.dto.js"
import { EventBookingDto } from "./dto/event-booking.dto.js"
import { GoogleApiService } from "../common/google/googleApiService.js"
import dayjs from "dayjs"

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventsRepository: Repository<EventEntity>,
    @InjectRepository(BookingSlotEntity)
    private readonly bookingSlotRepository: Repository<BookingSlotEntity>,
    @InjectRepository(EventStatistics)
    private readonly eventStatistics: Repository<EventStatistics>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  async create(createEventDto: CreateEventDto) {
    const {
      title,
      description,
      availabilities,
      selectedDays,
      tags,
      fromDate,
      toDate,
      hourlyRate,
      privateEvent,
      eventCardColor,
      eventTitleColor,
      organizer,
      gCalEventsBooking,
    } = createEventDto
    try {
      const event: EventEntity = new EventEntity()
      const user: UserEntity = await this.userRepository.findOne({
        where: { id: organizer.id },
        relations: ["events"],
      })

      /*
       * Create event record
       */
      event.description = description
      event.title = title
      event.availabilities = availabilities as any
      event.selectedDays = selectedDays
      event.tags = tags
      event.fromDate = fromDate
      event.toDate = toDate
      event.hourlyRate = hourlyRate
      event.privateEvent = privateEvent
      event.eventCardColor = eventCardColor
      event.eventTitleColor = eventTitleColor
      event.organizerAlias = user.username
      event.gCalEventsBooking = gCalEventsBooking
      user.events = [...user.events, event]
      await this.userRepository.save(user)

      /*
       * Create event statistics record
       */
      const stats = new EventStatistics()
      stats.eventId = event.id
      await this.eventStatistics.save(stats)

      return event.id
    } catch (e) {
      console.error(e)
      throw new HttpException(
        "Something went wrong while adding new event",
        HttpStatus.BAD_REQUEST
      )
    }
  }

  async findAll(): Promise<EventEntity[] | null> {
    return this.eventsRepository.find({
      relations: ["bookedSlots", "organizer"],
    })
  }

  async findAllWithPagination(
    paginationRequestDto: PaginationRequestDto,
    options?: FindManyOptions<EventEntity>
  ): Promise<PaginationResult<EventPaginationDto> | void> {
    try {
      let { limit, page } = paginationRequestDto
      page = Math.abs(Number(page))
      limit = Math.abs(Number(limit))
      if (limit < 10) limit = 10
      const skip = (page - 1) * limit

      const results = await this.eventsRepository.findAndCount({
        take: limit,
        skip,
        select: [
          "id",
          "description",
          "title",
          "fromDate",
          "toDate",
          "privateEvent",
          "eventCardColor",
          "eventTitleColor",
          "eventCardImage",
          "organizerId",
          "organizerAlias",
          "hourlyRate",
        ],
        order: {
          createDateTime: "ASC",
        },
        // select only available events
        where: {
          available: true,
          ...(paginationRequestDto?.user_id
            ? { organizerId: paginationRequestDto.user_id }
            : {}),
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

  async findOne(id: string): Promise<any | void> {
    const event = await this.eventsRepository.findOne(id, {
      select: [
        "privateEvent",
        "hourlyRate",
        "availabilities",
        "selectedDays",
        "organizerAlias",
        "title",
        "description",
        "fromDate",
        "toDate",
        "eventCardImage",
        "id",
        "organizerId",
        "organizerAlias",
        "eventCardColor",
        "eventTitleColor",
      ],
      relations: ["bookedSlots"],
    })
    //TODO based on `bookedSlots` calculate which days are still available for booking

    if (!event) this.noEventError()
    return { ...event, numOfBookedSlots: event.bookedSlots.length }
  }

  async update(
    id: string,
    userId: string,
    updateEventDto: UpdateEventDto
  ): Promise<SuccessMessage | void> {
    try {
      const oldEvent = await this.eventsRepository.findOne(id, {
        relations: ["organizer"],
      })
      if (oldEvent === undefined) this.noEventError()
      if (oldEvent.organizerId !== userId) this.notAllowedError()

      const newEvent = Object.assign({}, oldEvent, updateEventDto)
      await this.eventsRepository.save(newEvent)

      return {
        message: `Event updated successfully`,
        status: 201,
      }
    } catch (e) {
      if (e.response && e.status) throw new HttpException(e.response, e.status)
    }
  }

  async removeEvent(id: string, userId: string): Promise<any> {
    try {
      const event = await this.eventsRepository.findOne(id, {
        relations: ["bookedSlots"],
      })

      // let bs = await this.bookingSlotRepository.findOne(event.bookedSlots[0].id)
      // await this.bookingSlotRepository.remove(bs)
      if (!event) return this.noEventError()

      // TODO this should be only allowed by an event owner
      await this.eventsRepository.remove(event)
      return {
        message: `Event removed successfully`,
        status: 201,
      }
    } catch (e) {
      console.error(e)
      if (e.response && e.status) throw new HttpException(e.response, e.status)
    }
  }

  async removeBookedEventSlot(
    eventBookingId: string,
    userId: string
  ): Promise<any | void> {
    const event = await this.bookingSlotRepository.findOneOrFail(eventBookingId)

    if (!event) return this.noEventError()
    if (event.attendeeId !== userId) throw new UnauthorizedException()

    return
  }

  async bookEvent(
    user: UserEntity,
    eventBookingDto: EventBookingDto
  ): Promise<string | void> {
    const {
      txHash,
      bookedDuration,
      bookedDate,
      eventId,
      durationCost,
      createGoogleCalEvent,
    } = eventBookingDto

    try {
      const event = await this.eventsRepository.findOne({
        where: { id: eventId },
        relations: ["organizer", "bookedSlots", "bookedSlots.attendee"],
      })
      user = await this.userRepository.findOne(user.id)

      if (!user)
        throw new HttpException("User not found", HttpStatus.UNAUTHORIZED)
      if (event == undefined) this.noEventError()

      let hasExistingSlotInTimeFrame: boolean = false

      // prevent making new bookings at already scheduled time frame
      event.bookedSlots.forEach((slot) => {
        if (slot.attendee.id === user.id) {
          if (
            slot.bookedDate === eventBookingDto.bookedDate &&
            slot.bookedDuration >= eventBookingDto.bookedDuration
          )
            hasExistingSlotInTimeFrame = true
        }
      })

      if (hasExistingSlotInTimeFrame)
        throw new HttpException(
          "Booking slot with given time frame already exists",
          HttpStatus.BAD_REQUEST
        )

      let bookingSlot = new BookingSlotEntity()

      bookingSlot.event = event
      bookingSlot.eventId = event.id
      bookingSlot.eventTitle = event.title
      bookingSlot.eventDescription = event.description
      bookingSlot.attendeeId = user.id
      bookingSlot.attendeeAlias = user.username
      bookingSlot.organizerAlias = event.organizer.username
      bookingSlot.organizerId = event.organizer.id
      bookingSlot.bookedDuration = bookedDuration
      bookingSlot.bookedDate = bookedDate
      bookingSlot.durationCost = durationCost
      bookingSlot.txHash = txHash

      bookingSlot = await this.bookingSlotRepository.save(bookingSlot)

      console.log(user.googleApiCredentials, createGoogleCalEvent)

      // book event on organizers or/and attendee Gcal
      if (user.googleApiCredentials || createGoogleCalEvent) {
        const organizerOAuthToken =
          await new GoogleApiService().checkValidOauth(event.organizer)
        const attendeeOAuthToken = await new GoogleApiService().checkValidOauth(
          user
        )

        const gCalRequestBody = {
          //attendees: [
          //  {
          //    displayName: user.username,
          //    // id has to be alpanumeric only
          //    //TODO add transactions id
          //    comment: `txId: abc123, userId: ${user.id}`,
          //  },
          //],
          summary: event.title,
          description: event.description,
          end: {
            dateTime: dayjs(bookingSlot.bookedDate)
              .add(bookingSlot.bookedDuration, "milliseconds")
              .toISOString(),
            timeZone: "UTC",
          },
          start: {
            dateTime: bookingSlot.bookedDate,
            timeZone: "UTC",
          },
          id: Buffer.from(bookingSlot.id).toString("hex"),
          organizer: { displayName: event.organizerAlias },
        }

        if (
          organizerOAuthToken &&
          typeof organizerOAuthToken === "string" &&
          event.organizer.googleApiCredentials
        ) {
          const oldCred = JSON.parse(event.organizer.googleApiCredentials)
          user.googleApiCredentials = JSON.stringify({
            ...oldCred,
            access_token: organizerOAuthToken,
          })
          const organizerCalRes =
            await new GoogleApiService().createUserGoogleCalendarEvent(
              organizerOAuthToken,
              gCalRequestBody
            )
          console.log("google res organizer ", organizerCalRes)
        }
        if (
          attendeeOAuthToken &&
          typeof attendeeOAuthToken === "string" &&
          createGoogleCalEvent &&
          user.googleApiCredentials
        ) {
          if (createGoogleCalEvent) {
            const oldCred = JSON.parse(user.googleApiCredentials)
            user.googleApiCredentials = JSON.stringify({
              ...oldCred,
              access_token: attendeeOAuthToken,
            })
            const attendeeCalRes =
              await new GoogleApiService().createUserGoogleCalendarEvent(
                attendeeOAuthToken,
                gCalRequestBody
              )
            console.log("google res attendee ", attendeeCalRes)
          }
        }
      }

      // if (event.organizer.messagingToken)
      //   await sendBookedEventMessage(
      //     event.organizer.messagingToken,
      //     user.username,
      //     event.title,
      //     event.id
      //   )

      return bookingSlot.id
    } catch (e) {
      console.error(e)
      throw new HttpException(
        `Something went wrong while booking event with id ${eventId}`,
        HttpStatus.BAD_REQUEST
      )
    }
  }

  public getResults(searchQuery: string, organizerId: string) {
    const findParams = []

    if (searchQuery)
      findParams.push(
        {
          title: ILike(`%${searchQuery}%`),
        },
        {
          description: ILike(`%${searchQuery}%`),
        }
      )

    if (organizerId)
      findParams.push({
        organizerId: Equal(`${organizerId}`),
      })

    return this.eventsRepository.find({
      where: [...findParams],
    })
  }

  public async updateEventImage(
    file: Express.Multer.File,
    eventId: string,
    userId: string
  ) {
    const event = await this.eventsRepository.findOneOrFail(eventId)
    if (!event) this.noEventError()
    if (event.organizerId !== userId) return false

    return this.eventsRepository.update(eventId, {
      eventCardImage: file.buffer,
    })
  }

  public getBookingSlotById(uuid: string) {
    return this.bookingSlotRepository.findOneOrFail(uuid)
  }

  public async getEventBookings(uuid: string, userId: string) {
    const event = await this.eventsRepository.findOneOrFail(uuid, {
      relations: ["bookedSlots"],
    })

    if (event.organizerId !== userId) throw new UnauthorizedException()
    if (!event) return null

    return event.bookedSlots
  }

  public async getEventBookingsByUserId(uuid: string, userId: string) {
    const event = await this.eventsRepository.findOneOrFail(uuid, {
      relations: ["bookedSlots"],
    })

    if (!event) this.noEventError()

    return event.bookedSlots.filter((bs) => bs.attendeeId === userId)
  }

  private noEventError() {
    throw new HttpException("Event does not exists.", HttpStatus.NOT_FOUND)
  }

  private notAllowedError() {
    throw new HttpException("Permission denied.", HttpStatus.FORBIDDEN)
  }
}
