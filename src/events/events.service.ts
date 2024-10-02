import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, MoreThan, LessThan, Brackets, Not } from "typeorm"
import { EventEntity } from "../model/event.entity.js"
import { BookingSlotEntity } from "../model/bookingSlot.entity.js"
import { EventStatistics } from "../model/eventStatistics.entity.js"
import { UserEntity } from "../model/user.entity.js"
import { CreateEventDto } from "./dto/create-event.dto.js"
import {
  BookingPaginationDto,
  PaginationRequestDto,
} from "../pagination/pagination-request.dto.js"
import { PaginationResult } from "../pagination/pagination-result.interface.js"
import { EventPaginationDto } from "./dto/event-pagination.dto.js"
import { UpdateEventDto } from "./dto/update-event.dto.js"
import { SuccessMessage } from "../auth/interfaces/payload.interface.js"
import { EventAvailability, EventSlot } from "./events.interface.js"
import { NetworkId } from "src/utils/types.js"
import { EventBookingDto } from "./dto/event-booking.dto.js"

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
      fromDate,
      toDate,
      hourlyRate,
      visibility,
      eventCardColor,
      eventTitleColor,
      organizer: { id },
      cancellation,
      note,
      networkId,
    } = createEventDto
    try {
      const event: EventEntity = new EventEntity()
      const user: UserEntity = await this.userRepository.findOne({
        where: { id },
        relations: ["events"],
      })
      const { mainnet: mainnetAddr, testnet: testnetAddr } = user.baseAddresses

      /*
       * Create event record
       */
      event.isAvailable = true
      event.description = description
      event.title = title
      event.availabilities = availabilities
      event.fromDate = fromDate
      event.toDate = toDate
      event.hourlyRate = hourlyRate
      event.visibility = visibility
      event.eventCardColor = eventCardColor
      event.eventTitleColor = eventTitleColor
      event.organizerAlias = user.username
      event.cancellation = cancellation
      event.note = note
      event.organizerAddress = networkId === "Mainnet" ? mainnetAddr : testnetAddr
      event.cancellation = cancellation
      event.networkId = networkId
      user.events = [...user.events, event]
      await this.userRepository.save(user)

      /*
       * Create event statistics record
       */
      const stats = new EventStatistics()
      stats.id = event.id
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
    userId: string,
    paginationRequestDto: PaginationRequestDto
  ): Promise<PaginationResult<EventPaginationDto> | void> {
    try {
      let { limit, page, network_id } = paginationRequestDto
      page = Math.abs(Number(page))
      limit = Math.abs(Number(limit))
      if (limit < 10) limit = 10
      const skip = (page - 1) * limit
      const currentDate = new Date()

      const results = await this.eventsRepository.findAndCount({
        take: limit,
        skip,
        select: [
          "id",
          "description",
          "title",
          "fromDate",
          "toDate",
          "visibility",
          "cancellation",
          "eventCardColor",
          "eventTitleColor",
          "eventCardImage",
          "organizerId",
          "organizerAlias",
          "hourlyRate",
          "createDateTime",
        ],
        order: {
          createDateTime: "DESC",
        },
        where: {
          isAvailable: true,
          networkId: network_id,
          // for events that are still ongoing or the ones that will start in the future
          toDate: MoreThan(currentDate),
          ...(paginationRequestDto?.user_id
            ? { organizerId: paginationRequestDto.user_id }
            : { visibility: "public", organizerId: Not(userId) }),
        },
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
    return await this.eventsRepository.findOne(id, {
      select: [
        "visibility",
        "hourlyRate",
        "availabilities",
        "organizerAlias",
        "organizerAddress",
        "organizerId",
        "title",
        "description",
        "fromDate",
        "toDate",
        "id",
        "eventCardImage",
        "eventCardColor",
        "eventTitleColor",
        "cancellation",
      ],
    })
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
    const event = await this.eventsRepository.findOne(id, {
      relations: ["bookedSlots"],
      where: { organizerId: userId },
    })

    // let bs = await this.bookingSlotRepository.findOne(event.bookedSlots[0].id)
    // await this.bookingSlotRepository.remove(bs)
    if (!event) return this.noEventError()
    if (event.bookedSlots.length) return this.eventDeletionNotAllowed()

    const res = await this.eventsRepository.softDelete({ id: event.id })
    if (res)
      return {
        message: `Event removed successfully`,
        status: 201,
      }
  }

  async removeBookedEventSlot(
    eventBookingId: string,
    userId: string,
    unlockingTxHash: string,
    isOrganizer: boolean
  ): Promise<any | void> {
    // remove booking and make the availability be available again
    const bookingSlot: BookingSlotEntity = await this.bookingSlotRepository.findOneOrFail(
      eventBookingId
    )

    if (isOrganizer) {
      if (bookingSlot.organizerId !== userId)
        throw new UnauthorizedException("You're not allowed to change this record")
    } else {
      if (bookingSlot.attendeeId !== userId)
        throw new UnauthorizedException("You're not allowed to change this record")
    }

    bookingSlot.isActive = false
    bookingSlot.unlockingTxHash = unlockingTxHash

    const event = await this.eventsRepository.findOneOrFail(bookingSlot.eventId)
    event.availabilities = event.availabilities.map((availability: EventAvailability) => {
      // check which availability object contains current booking date
      if (
        new Date(availability.from) <= new Date(bookingSlot.fromDate) &&
        new Date(availability.to) >= new Date(bookingSlot.toDate)
      ) {
        availability.slots.map((slot) => {
          if (slot.bookingId === eventBookingId) {
            slot.isAvailable = true
            slot.bookingId = ""
          }
          return slot
        })
      }
      return availability
    })

    const newEvent = await this.eventsRepository.save(event)
    const newBookingSlot = await this.bookingSlotRepository.save(bookingSlot)

    return !!newEvent && !!newBookingSlot
  }

  async bookEvent(
    user: UserEntity,
    eventBookingDto: EventBookingDto
  ): Promise<string | void> {
    const { eventId, durationCost, duration, startDate, lockingTxHash, datumHash } =
      eventBookingDto

    try {
      let event = await this.eventsRepository.findOne({
        where: { id: eventId },
        relations: ["organizer"],
      })
      if (!event) this.noEventError()
      if (!event.isAvailable)
        throw new UnprocessableEntityException("This event is no longer available")

      user = await this.userRepository.findOne(user.id)
      if (!user) throw new HttpException("User not found", HttpStatus.UNAUTHORIZED)

      let eventAvailabilityIdx = -1
      let eventAvailability = (event.availabilities as EventAvailability[]).find(
        (availability, idx) => {
          if (
            new Date(availability.from) <= new Date(startDate) &&
            new Date(availability.to) >=
              new Date(new Date(startDate).getTime() + duration)
          ) {
            eventAvailabilityIdx = idx
            return availability
          }
        }
      )
      // 1. check if given start time is available
      // 2. check if given duration can be booked
      let isAvailableToBook = true
      let endDate = new Date(new Date(startDate).getTime() + duration)

      for (let [idx, slot] of eventAvailability.slots.entries()) {
        let slotDate = new Date(slot.from)

        if (slotDate >= endDate || slotDate < new Date(startDate)) continue

        if (!slot.isAvailable) {
          isAvailableToBook = false
          continue
        }

        // it's pending for a new booking ID
        eventAvailability.slots[idx].isAvailable = "pending"
        continue
      }

      if (!isAvailableToBook)
        throw new HttpException("Starting date is unavailable", HttpStatus.BAD_REQUEST)

      let bookingSlot = new BookingSlotEntity()

      bookingSlot.event = event
      bookingSlot.eventId = event.id
      bookingSlot.eventTitle = event.title
      bookingSlot.eventDescription = event.description
      bookingSlot.attendeeId = user.id
      bookingSlot.attendeeAlias = user.username
      bookingSlot.organizerAlias = event.organizer.username
      bookingSlot.organizerId = event.organizer.id
      bookingSlot.cancellation = event.cancellation
      bookingSlot.lockingTxHash = lockingTxHash
      bookingSlot.duration = duration
      bookingSlot.fromDate = startDate
      bookingSlot.toDate = new Date(
        new Date(startDate).getTime() + duration
      ).toISOString()
      bookingSlot.cost = durationCost
      bookingSlot.cancellation = event.cancellation
      bookingSlot.networkId = event.networkId
      bookingSlot.reservedAt = Date.now()
      bookingSlot.status = "reserved"
      bookingSlot.lockingTxHash = lockingTxHash
      bookingSlot.datumHash = datumHash
      bookingSlot.cancellation = event.cancellation
      bookingSlot.datumHash = datumHash
      bookingSlot.networkId = event.networkId

      bookingSlot = await this.bookingSlotRepository.save(bookingSlot)

      /** Check if the event is fully booked **/
      event.availabilities[eventAvailabilityIdx].slots = eventAvailability.slots.map(
        (slot) => {
          if (slot.isAvailable === "pending") {
            slot.isAvailable = false
            slot.bookingId = bookingSlot.id
          }
          return slot
        }
      )
      const isFullyBookedAvailability = !eventAvailability.slots
        .map((slot) => slot.isAvailable)
        .filter((v) => v).length
      if (isFullyBookedAvailability)
        event.availabilities[eventAvailabilityIdx].isFullyBooked = true

      // check if every availability slot is now fully booked or there are no future dates open
      const isFullyBookedEvent = event.availabilities.every(
        (availability) => availability.isFullyBooked
      )
      if (isFullyBookedEvent) event.isAvailable = false

      await this.eventsRepository.save(event)
      return bookingSlot.id

      ////////////////////////

      // book event on organizers or/and attendee Gcal
      //if (user.googleApiCredentials || createGoogleCalEvent) {
      //  const organizerOAuthToken = await new GoogleApiService().checkValidOauth(
      //    event.organizer
      //  )
      //  const attendeeOAuthToken = await new GoogleApiService().checkValidOauth(user)

      //  const gCalRequestBody = {
      //    //attendees: [
      //    //  {
      //    //    displayName: user.username,
      //    //    // id has to be alpanumeric only
      //    //    //TODO add transactions id
      //    //    comment: `txId: abc123, userId: ${user.id}`,
      //    //  },
      //    //],
      //    summary: event.title,
      //    description: event.description,
      //    end: {
      //      dateTime: dayjs(bookingSlot.bookedDate)
      //        .add(bookingSlot.bookedDuration, "milliseconds")
      //        .toISOString(),
      //      timeZone: "UTC",
      //    },
      //    start: {
      //      dateTime: bookingSlot.bookedDate,
      //      timeZone: "UTC",
      //    },
      //    id: Buffer.from(bookingSlot.id).toString("hex"),
      //    organizer: { displayName: event.organizerAlias },
      //  }

      //  if (
      //    organizerOAuthToken &&
      //    typeof organizerOAuthToken === "string" &&
      //    event.organizer.googleApiCredentials
      //  ) {
      //    const oldCred = JSON.parse(event.organizer.googleApiCredentials)
      //    user.googleApiCredentials = JSON.stringify({
      //      ...oldCred,
      //      access_token: organizerOAuthToken,
      //    })
      //    const organizerCalRes =
      //      await new GoogleApiService().createUserGoogleCalendarEvent(
      //        organizerOAuthToken,
      //        gCalRequestBody
      //      )
      //    console.log("google res organizer ", organizerCalRes)
      //  }
      //  if (
      //    attendeeOAuthToken &&
      //    typeof attendeeOAuthToken === "string" &&
      //    createGoogleCalEvent &&
      //    user.googleApiCredentials
      //  ) {
      //    if (createGoogleCalEvent) {
      //      const oldCred = JSON.parse(user.googleApiCredentials)
      //      user.googleApiCredentials = JSON.stringify({
      //        ...oldCred,
      //        access_token: attendeeOAuthToken,
      //      })
      //      const attendeeCalRes =
      //        await new GoogleApiService().createUserGoogleCalendarEvent(
      //          attendeeOAuthToken,
      //          gCalRequestBody
      //        )
      //      console.log("google res attendee ", attendeeCalRes)
      //    }
      //  }
      //}

      // if (event.organizer.messagingToken)
      //   await sendBookedEventMessage(
      //     event.organizer.messagingToken,
      //     user.username,
      //     event.title,
      //     event.id
      //   )
    } catch (e) {
      console.error(e)
      throw new HttpException(
        `Something went wrong while booking event with id ${eventId}`,
        HttpStatus.BAD_REQUEST
      )
    }
  }

  // userId is the person making request
  public getResults(searchQuery: string, userId: string, organizerId: string) {
    if (!searchQuery) return []
    const now = new Date()

    let queryBuilder = this.eventsRepository.createQueryBuilder("event_entity")

    if (organizerId) {
      return queryBuilder
        .where("event_entity.organizerId = :organizerId", { organizerId })
        .andWhere({ toDate: MoreThan(now) })
        .andWhere("event_entity.title ILIKE :searchQuery", {
          searchQuery: `%${searchQuery}%`,
        })
        .orWhere("event_entity.description ILIKE :searchQuery", {
          searchQuery: `%${searchQuery}%`,
        })
        .getMany()
    } else {
      return (
        queryBuilder
          .where("event_entity.title ILIKE :searchQuery", {
            searchQuery: `%${searchQuery}%`,
          })
          // Grouping the conditions related to the same entity for clarity
          .andWhere(
            new Brackets((qb) => {
              qb.where("event_entity.organizerId != :userId", { userId }).andWhere(
                "event_entity.toDate > :now",
                { now }
              )
            })
          )
          // Handle the OR condition separately and ensure it's properly grouped
          .orWhere("event_entity.description ILIKE :searchQuery", {
            searchQuery: `%${searchQuery}%`,
          })
          .getMany()
      )

      // return queryBuilder
      //   .where("event_entity.title ILIKE :searchQuery", {
      //     searchQuery: `%${searchQuery}%`,
      //   })
      //   .andWhere("event_entity.organizerId != :userId", { userId })
      //   .andWhere({ toDate: MoreThan(now) })
      //   .orWhere("event_entity.description ILIKE :searchQuery", {
      //     searchQuery: `%${searchQuery}%`,
      //   })
      //   .getMany()
    }
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

  public async getBookingSlotById(uuid: string) {
    return await this.bookingSlotRepository.findOneOrFail(uuid)
  }

  public async updateBookingSlotById(uuid: string, userId, updateDTO) {
    let slot = await this.bookingSlotRepository.findOneOrFail(uuid)
    if (!slot) throw new NotFoundException("Booking slot with a given ID do not exist.")
    if (slot.organizerId !== userId)
      throw new UnauthorizedException("You're not allowed to update this record")

    slot.isActive = false
    slot.unlockingTxHash = updateDTO.unlockingTxHash

    return await this.bookingSlotRepository.save(slot)
  }

  public async getBookingsByUserIdPaginated(query: BookingPaginationDto) {
    const { limit, page, organizer_id, attendee_id, network_id } = query
    if (!organizer_id && !attendee_id)
      throw new UnprocessableEntityException(
        "Missing one of the required user-id parameter"
      )

    const networkBasedAddress = network_id === "Mainnet" ? "mainnet" : "testnet"
    const userIdOption = organizer_id
      ? { organizerId: organizer_id }
      : { attendeeId: attendee_id }

    return await this.bookingSlotRepository
      .createQueryBuilder("bookingSlot")
      .leftJoinAndSelect("bookingSlot.organizer", "organizer")
      .leftJoinAndSelect("bookingSlot.attendee", "attendee")
      .leftJoinAndSelect("bookingSlot.event", "event")
      .select([
        "bookingSlot", // select all fields from bookingSlot
        `organizer.baseAddresses`,
        `attendee.baseAddresses`,
        "event.note",
      ])
      .where({
        ...userIdOption,
        toDate: MoreThan(new Date()),
        isActive: true,
        networkId: network_id,
      })
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount()
  }

  public async getPastBookingsByUserId(userId, networkId: NetworkId) {
    const now = new Date()
    return await this.bookingSlotRepository.findAndCount({
      where: { organizerId: userId, toDate: LessThan(now), isActive: true, networkId },
    })
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

  private eventDeletionNotAllowed() {
    throw new HttpException(
      "This event can't be removed as it has been already booked.",
      HttpStatus.FORBIDDEN
    )
  }

  private notAllowedError() {
    throw new HttpException("Permission denied.", HttpStatus.FORBIDDEN)
  }
}
