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
  UnauthorizedException,
  UnprocessableEntityException,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import { isNSFW } from "../common/utils.js"
import {
  BookingPaginationDto,
  PaginationRequestDto,
} from "../pagination/pagination-request.dto.js"
import { CreateEventDto } from "./dto/create-event.dto.js"
import { EventBookingDto } from "./dto/event-booking.dto.js"
import { EventsService } from "./events.service.js"

@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  public async getEvents(@Query() query: PaginationRequestDto, @Req() req: any) {
    const { user } = req
    if (query.user_id && query.user_id !== user.id)
      throw new UnauthorizedException("You're not allowed to fetch events for this user")
    if (query.network_id !== "Mainnet" && query.network_id !== "Preprod")
      throw new UnprocessableEntityException("Network ID is wrong or missing")

    let events = await this.eventsService.findAllWithPagination(user.id, query)

    if (!events) {
      throw new NotFoundException()
    }

    return events
  }

  @Get("results")
  public async getResults(@Query() query: any, @Req() req: any) {
    const { user } = req
    const { search_query, organizer_id } = query

    if (organizer_id && user.id !== organizer_id)
      throw new UnauthorizedException("You are not allowed to fetch this user events.")

    try {
      const result = await this.eventsService.getResults(
        search_query,
        user.id,
        organizer_id
      )

      return {
        result,
      }
    } catch (e) {
      console.error(e)
    }
  }

  @Post("booking")
  public async bookEvent(@Body() eventBookingDto: EventBookingDto, @Req() req: any) {
    const { user } = req
    const confirmation = await this.eventsService.bookEvent(user, eventBookingDto)

    if (!confirmation) {
      throw new UnprocessableEntityException()
    }

    return confirmation
  }

  /**
   * This will return all bookings for a given user ID
   */
  @Get("bookings")
  public async getBookingByQuery(@Query() query: BookingPaginationDto, @Req() req: any) {
    const { user } = req
    let eventsRepoResults

    if (user.id !== (query.organizer_id || query.attendee_id))
      throw new UnauthorizedException("You are not allowed to access this resources")
    if (query.network_id !== "Mainnet" && query.network_id !== "Preprod")
      throw new UnprocessableEntityException("Network ID is wrong or missing")

    if (query.past_bookings) {
      // this returns bookings that are meant to be used for payouts withdraw
      eventsRepoResults = await this.eventsService.getPastBookingsByUserId(
        query.organizer_id,
        query.network_id
      )
    } else {
      // this returns bookings used to be displayed on user main page
      eventsRepoResults = await this.eventsService.getBookingsByUserIdPaginated(query)
    }

    if (!eventsRepoResults) {
      throw new UnprocessableEntityException()
    }

    return eventsRepoResults
  }

  @Get("booking/:uuid")
  public async getBookingSlotById(@Param("uuid", ParseUUIDPipe) uuid: string) {
    const slot = await this.eventsService.getBookingSlotById(uuid)
    if (!slot) throw new NotFoundException()

    return slot
  }

  @Put("booking/:uuid")
  public async updateBookingSlotById(
    @Req() req: any,
    @Param("uuid", ParseUUIDPipe) uuid: string,
    @Body() bookingUpdateDTO: any
  ) {
    const { user } = req
    if (bookingUpdateDTO.id !== uuid) throw new NotFoundException()

    const updated = await this.eventsService.updateBookingSlotById(
      uuid,
      user.id,
      bookingUpdateDTO
    )

    if (!updated) throw new UnprocessableEntityException()

    return updated
  }

  @Delete("booking/:uuid")
  public async removeEventBooking(
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @Req() req: any,
    @Query() query: any
  ): Promise<any> {
    const { organizer_id, attendee_id, txHash } = query
    if ((!organizer_id && !attendee_id) || (organizer_id && attendee_id) || !txHash)
      throw new UnprocessableEntityException("Missing or too much query paramaters")

    const queryingUserId = organizer_id ?? attendee_id
    if (queryingUserId !== req.user.id) throw new UnauthorizedException()

    return await this.eventsService.removeBookedEventSlot(
      uuid,
      req.user.id,
      txHash, // unlocking transaction
      !!organizer_id ? true : false // last param is to check who exactly is the user
    )
  }

  @Get(":uuid")
  public async getEventById(@Param("uuid", new ParseUUIDPipe()) uuid: string) {
    return await this.eventsService.findOne(uuid)
  }

  @Post()
  public async createEvent(@Body() createEventDto: CreateEventDto) {
    return await this.eventsService.create(createEventDto)
  }

  @Put(":uuid")
  public async updateEvent(
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @Body() body: any,
    @Req() req: any
  ) {
    const { id } = req.user
    return await this.eventsService.update(uuid, id, body)
  }

  @Delete(":uuid")
  public async removeEvent(
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @Req() req: any
  ): Promise<any> {
    const { id } = req.user
    return await this.eventsService.removeEvent(uuid, id)
  }

  @Post(":uuid/image")
  @UseInterceptors(FileInterceptor("file"))
  public async uploadImage(
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (await isNSFW(file)) throw new UnprocessableEntityException()

    const success = await this.eventsService.updateEventImage(file, uuid, req.user.id)
    if (!success) throw new UnauthorizedException()
    return
  }

  /**
   * Returns event bookings for a given event ID
   */
  @Get(":uuid/booking")
  public async getEventBookings(
    @Param("uuid", ParseUUIDPipe) uuid: string,
    @Req() req: any
  ) {
    const { user } = req
    const bookings = await this.eventsService.getEventBookings(uuid, user.id)
    if (!bookings) return new NotFoundException()
    return bookings
  }

  /**
   * Returns all bookings for a given event-id and a specific user-id.
   * (which is extracted from request object)
   */
  @Get(":eventUuid/booking/user")
  public async getEventBookingsByUserId(
    @Param("eventUuid", ParseUUIDPipe) eventUuid: string,
    @Req() req: any
  ) {
    const { user } = req
    const bookings = this.eventsService.getEventBookingsByUserId(eventUuid, user.id)

    if (!bookings) throw new NotFoundException()

    return bookings
  }
}
