import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SuccessMessage } from "src/auth/interfaces/payload.interface";
import { EventEntity } from "src/model/event.entity";
import { Repository } from "typeorm";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventsRepository: Repository<EventEntity>
  ) {}

  async create(createEventDto: CreateEventDto) {
    try {
      let event: EventEntity = new EventEntity();

      let {
        title,
        description,
        availabilities,
        selectedDays,
        tags,
        hourlyRate,
        imageURI,
        privateEvent,
        eventCardColor,
        organizer,
      } = createEventDto;

      event.description = description;
      event.title = title;
      event.availabilities = availabilities as any;
      event.selectedDays = selectedDays;
      event.tags = tags;
      event.hourlyRate = hourlyRate;
      event.imageURI = imageURI;
      event.privateEvent = privateEvent;
      event.eventCardColor = eventCardColor;
      event.organizer = organizer;

      event = await this.eventsRepository.save(event);
      console.log("New event added: ", event);

      return {
        status: 201,
        messages: "New event created successfully.",
        eventID: event.id,
      };
    } catch (e) {
      throw new Error(e);
      // throw new HttpException(
      //   "Something went wrong while adding new event.",
      //   HttpStatus.BAD_REQUEST
      // );
    }
  }

  async findAll(): Promise<EventEntity[]> {
    try {
      const events: EventEntity[] = await this.eventsRepository.find();
      return events;
    } catch (e) {
      throw new Error(e);
    }
  }

  async findOne(id: string): Promise<EventEntity | void> {
    try {
      const event = await this.eventsRepository.findOne({ where: { id } });
      return event;
    } catch (e) {
      throw new Error(e);
    }
  }

  async update(
    id: string,
    userId: string,
    updateEventDto: UpdateEventDto
  ): Promise<SuccessMessage | void> {
    try {
      let oldEvent = await this.eventsRepository.findOne({ where: { id } });
      if (oldEvent === undefined) this.noEventError();
      if (oldEvent.organizer.id !== userId) this.notAllowedError();

      let newEvent = Object.assign({}, oldEvent, updateEventDto);
      await this.eventsRepository.save(newEvent);

      return {
        message: `Event with id ${id}, updated successfully.`,
        status: 201,
      };
    } catch (e) {
      console.error(e);
      throw new Error(
        `Something went wrong while updating event with id ${id}`
      );
    }
  }

  async remove(id: string): Promise<SuccessMessage | void> {
    console.log("id is: ", id);
    try {
      let event = await this.eventsRepository.findOne({ where: { id } });
      if (event == undefined) this.noEventError();
      await this.eventsRepository.remove(event);

      return {
        message: `Event with id ${id}, removed successfully.`,
        status: 201,
      };
    } catch (e) {
      console.error(e);
      throw new HttpException(
        "The event with a given id does not exists.",
        HttpStatus.NOT_FOUND
      );
    }
  }

  private noEventError() {
    throw new Error("Event does not exists");
  }

  private notAllowedError() {}
}
