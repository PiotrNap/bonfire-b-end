import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
} from "@nestjs/common";
import { roles, Roles } from "src/auth/roles/roles.decorator";
import { PaginationRequestDto } from "src/pagination";
import { CreateEventDto } from "./dto/create-event.dto";
import { EventBookingDto } from "./dto/event-booking.dto";
import { EventsService } from "./events.service";

@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  public async getEvents(@Query() query: PaginationRequestDto) {
    if (query.limit !== undefined)
      return this.eventsService.findAllWithPagination(query);
    return this.eventsService.findAll();
  }

  @Post()
  @Roles(roles.organizer)
  public async createEvent(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get(":uuid")
  public async getEventById(@Param("uuid", new ParseUUIDPipe()) uuid: string) {
    return this.eventsService.findOne(uuid);
  }

  @Put(":uuid")
  @Roles(roles.organizer)
  public async updateEvent(
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @Body() body: any,
    @Req() req: any
  ) {
    const { userId } = req.user;
    return await this.eventsService.update(uuid, userId, body);
  }

  @Delete(":uuid")
  @Roles(roles.organizer)
  public async removeEvent(
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @Req() req: any
  ): Promise<any> {
    const { userId } = req.user;
    return await this.eventsService.remove(uuid, userId);
  }

  // @TODO specify booking dto
  @Post("booking/:uuid")
  public async bookEvent(
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @Body() eventBookingDto: EventBookingDto,
    @Req() req: any
  ) {
    const { user } = req;
    return await this.eventsService.bookEvent(uuid, user, eventBookingDto);
  }

  @Put("booking/:uuid")
  public async updateBooking(
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @Body() body: EventBookingDto
  ) {
    return `Event with id ${uuid} updated with a payload of ${body}`;
  }

  @Delete("booking/:uuid")
  public async removeBooking(@Param("uuid", new ParseUUIDPipe()) uuid: string) {
    return `Event schedule with id ${uuid} removed successfully`;
  }
}
