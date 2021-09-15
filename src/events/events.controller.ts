import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
} from "@nestjs/common";
import { roles, Roles } from "src/auth/roles/roles.decorator";
import { CreateEventDto } from "./dto/create-event.dto";
import { EventsService } from "./events.service";

@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  public async getEvents() {
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
    @Param("uuid", new ParseUUIDPipe()) uuid: string
  ): Promise<any> {
    return await this.eventsService.remove(uuid);
  }
}
