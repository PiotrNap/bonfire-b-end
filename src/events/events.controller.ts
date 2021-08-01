import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import {
  CreateEventDTO,
  UpdateEventDTO,
  EventResponseDTO,
} from "./dto/event.dto";

const EXAMPLE_EVENT={ id: "example 1", event: {location:"here or there", time:"noonish"} }

@Controller("events")
export class EventsController {
  @Get()
  getEvents(): EventResponseDTO[] {
    return [EXAMPLE_EVENT,{ id: "example 2", event: {location:"patio", time:"noonish"} },];
  }
  @Get("/:eventID")
  getEventByID(@Param("eventID") eventID: string): EventResponseDTO {
    return EXAMPLE_EVENT
  }
  @Post()
  createEvent(@Body() body: CreateEventDTO) {
    return `created ${JSON.stringify(body)}`;
  }
  @Put("/:eventID/:authString")
  updateEventByID(
    @Param("eventID") eventID: string,
    @Body() body: UpdateEventDTO
  ) {
    return `Update ${eventID} with data of ${JSON.stringify(body)}`;
  }
}
