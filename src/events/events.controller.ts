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
} from "@nestjs/common";
import { roles, Roles } from "src/auth/roles/roles.decorator";
import { Public } from "src/common/decorators/public.decorator";
import { PaginationRequestDto } from "src/pagination";
import { CreateEventDto } from "./dto/create-event.dto";
import { EventBookingDto } from "./dto/event-booking.dto";
import { EventsService } from "./events.service";

@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @Public()
  public async getEvents(@Query() query: PaginationRequestDto) {
    let events: any;

    if (query.limit !== undefined) {
      events = await this.eventsService.findAllWithPagination(query);
    } else {
      events = await this.eventsService.findAll();
    }

    if (!events) {
      throw new NotFoundException();
    }
    return events;
  }

  @Get("results")
  public async getResults(@Query() query: any) {
    const { search_query } = query;
    try {
      const result = await this.eventsService.getResults(search_query);

      return {
        result,
      };
    } catch (e) {
      console.error(e);
    }
  }

  @Get(":uuid")
  public async getEventById(@Param("uuid", new ParseUUIDPipe()) uuid: string) {
    return this.eventsService.findOne(uuid);
  }

  @Post()
  @Roles(roles.organizer)
  public async createEvent(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  // @TODO specify booking dto
  @Post("booking/:uuid")
  public async bookEvent(
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @Body() eventBookingDto: EventBookingDto,
    @Req() req: any
  ) {
    const { user } = req;
    return `Event with id ${uuid} booked successfully`;
    // return await this.eventsService.bookEvent(uuid, user, eventBookingDto);
  }

  @Put(":uuid")
  @Roles(roles.organizer)
  public async updateEvent(
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @Body() body: any,
    @Req() req: any
  ) {
    const { id } = req.user;
    return await this.eventsService.update(uuid, id, body);
  }

  @Put("booking/:uuid")
  public async updateBooking(
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @Body() body: EventBookingDto
  ) {
    return `Event with id ${uuid} updated successfully.`;
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

  @Delete("booking/:uuid")
  public async removeBooking(@Param("uuid", new ParseUUIDPipe()) uuid: string) {
    return `Event schedule with id ${uuid} removed successfully`;
  }
}
