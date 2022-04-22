import { HttpException, HttpStatus, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { SuccessMessage } from "src/auth/interfaces/payload.interface"
import { EventEntity } from "src/model/event.entity"
import { BookingSlotEntity } from "src/model/bookingSlot.entity"
import { PaginationRequestDto, PaginationResult } from "src/pagination"
import { Equal, FindManyOptions, ILike, Repository } from "typeorm"
import { CreateEventDto } from "./dto/create-event.dto"
import { EventBookingDto } from "./dto/event-booking.dto"
import { UpdateEventDto } from "./dto/update-event.dto"
import { OrganizerEntity } from "src/model/organizer.entity"
import { EventPaginationDto } from "./dto/event-pagination.dto"
import { JWTUserDto } from "src/users/dto/user.dto"
import { UserEntity } from "src/model/user.entity"

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventsRepository: Repository<EventEntity>,
    @InjectRepository(BookingSlotEntity)
    private readonly bookingSlotRepository: Repository<BookingSlotEntity>,
    @InjectRepository(OrganizerEntity)
    private readonly organizerRepository: Repository<OrganizerEntity>
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
    } = createEventDto
    try {
      let event: EventEntity = new EventEntity()
      let user: OrganizerEntity = await this.organizerRepository.findOne({
        where: { id: organizer.id },
        relations: ["events"],
      })

      event.description = description
      event.title = title
      event.availabilities = availabilities as any
      event.selectedDays = selectedDays
      event.tags = tags
      event.fromDate = fromDate
      event.toDate = toDate
      event.hourlyRate = hourlyRate || user.hourlyRate
      event.privateEvent = privateEvent
      event.eventCardColor = eventCardColor
      event.eventTitleColor = eventTitleColor
      event.organizerAlias = user.username
      user.events = [...user.events, event]

      console.log("creating new event :", event)

      await this.organizerRepository.save(user)

      return event.id
    } catch (e) {
      console.error(e)
      throw new HttpException(
        "Something went wrong while adding new event.",
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
      let skip = (page - 1) * limit

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
        ],
        order: {
          createDateTime: "ASC",
        },
        // select only available events
        where: {
          available: true,
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

  findOne(id: string): Promise<any | void> {
    return this.eventsRepository.findOne(id, {
      select: [
        "privateEvent",
        "hourlyRate",
        "tags",
        "availabilities",
        "selectedDays",
        "organizerAlias",
      ],
    })
  }

  async update(
    id: string,
    userId: string,
    updateEventDto: UpdateEventDto
  ): Promise<SuccessMessage | void> {
    try {
      let oldEvent = await this.eventsRepository.findOne(id, {
        relations: ["organizer"],
      })
      if (oldEvent === undefined) this.noEventError()
      if (oldEvent.organizerId !== userId) this.notAllowedError()

      let newEvent = Object.assign({}, oldEvent, updateEventDto)
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
      let event = await this.eventsRepository.findOne(id, {
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
    user: UserEntity
  ): Promise<any | void> {
    return await this.bookingSlotRepository.softDelete(eventBookingId)
  }

  async bookEvent(
    user: JWTUserDto,
    eventBookingDto: EventBookingDto
  ): Promise<string | void> {
    const { txHash, bookedDuration, bookedDate, eventId, durationCost } =
      eventBookingDto

    try {
      const event = await this.eventsRepository.findOne({
        where: { id: eventId },
        relations: ["organizer", "bookedSlots", "bookedSlots.attendee"],
      })

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
    let findParams = []

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
    return this.eventsRepository.findOneOrFail(uuid)
  }

  private noEventError() {
    throw new HttpException("Event does not exists.", HttpStatus.NOT_FOUND)
  }

  private notAllowedError() {
    throw new HttpException("Permission denied.", HttpStatus.FORBIDDEN)
  }
}
