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
import { roles, Roles } from "src/auth/roles/roles.decorator"
import { Public } from "src/common/decorators/public.decorator"
import { isNSFW } from "src/common/utils"
import { PaginationRequestDto } from "src/pagination"
import { CreateEventDto } from "./dto/create-event.dto"
import { EventBookingDto } from "./dto/event-booking.dto"
import { EventsService } from "./events.service"

@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @Public()
  public async getEvents(@Query() query: PaginationRequestDto) {
    let events: any

    if (query.limit !== undefined) {
      events = await this.eventsService.findAllWithPagination(query)
    } else {
      events = await this.eventsService.findAll()
    }

    if (!events) {
      throw new NotFoundException()
    }
    return events
  }

  @Get("results")
  public async getResults(@Query() query: any) {
    const { search_query, organizer_id } = query
    try {
      const result = await this.eventsService.getResults(
        search_query,
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
  public async bookEvent(
    @Body() eventBookingDto: EventBookingDto,
    @Req() req: any
  ) {
    const { user } = req
    const confirmation = await this.eventsService.bookEvent(
      user,
      eventBookingDto
    )

    if (!confirmation) {
      throw new UnprocessableEntityException()
    }

    return confirmation
  }

  @Get("booking/:uuid")
  public async getBookingSlotById(@Param("uuid", ParseUUIDPipe) uuid: string) {
    const slot = await this.eventsService.getBookingSlotById(uuid)
    console.log(slot)
    if (!slot) throw new NotFoundException()

    return slot
  }

  @Delete("booking/:uuid")
  public async removeEventBooking(
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @Req() req: any
  ): Promise<any> {
    const res = this.eventsService.removeBookedEventSlot(uuid, req.user)
    return res
  }

  @Put("booking/:uuid")
  public async updateBooking(@Param("uuid", new ParseUUIDPipe()) uuid: string) {
    return `Booking with id ${uuid} updated successfully.`
  }

  @Get(":uuid")
  public async getEventById(@Param("uuid", new ParseUUIDPipe()) uuid: string) {
    return await this.eventsService.findOne(uuid)
  }

  @Post()
  @Roles(roles.organizer)
  public async createEvent(@Body() createEventDto: CreateEventDto) {
    return await this.eventsService.create(createEventDto)
  }

  @Put(":uuid")
  @Roles(roles.organizer)
  public async updateEvent(
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @Body() body: any,
    @Req() req: any
  ) {
    const { id } = req.user
    return await this.eventsService.update(uuid, id, body)
  }

  @Delete(":uuid")
  @Roles(roles.organizer)
  public async removeEvent(
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @Req() req: any
  ): Promise<any> {
    const { userId } = req.user
    return await this.eventsService.removeEvent(uuid, userId)
  }

  @Post(":uuid/image")
  @UseInterceptors(FileInterceptor("file"))
  public async uploadImage(
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (await isNSFW(file)) throw new UnprocessableEntityException()

    const success = await this.eventsService.updateEventImage(
      file,
      uuid,
      req.user.id
    )
    if (!success) throw new UnauthorizedException()
    return
  }

  /**
   * Returns event bookings (scheduled meetings)
   */
  @Roles(roles.organizer)
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
    const bookings = this.eventsService.getEventBookingsByUserId(
      eventUuid,
      user.id
    )

    if (!bookings) throw new NotFoundException()

    return bookings
  }
}
