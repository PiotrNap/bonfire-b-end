import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SuccessMessage } from "src/auth/interfaces/payload.interface";
import { BookingSlotEntity } from "src/model/bookingSlot.entity";
import { EventEntity } from "src/model/event.entity";
import { UserEntity } from "src/model/user.entity";
import { Repository } from "typeorm";
import { CreateEventDto } from "./dto/create-event.dto";
import { EventBookingDto } from "./dto/event-booking.dto";
import { UpdateEventDto } from "./dto/update-event.dto";

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventsRepository: Repository<EventEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>
  ) {}

  async create(createEventDto: CreateEventDto) {
    const {
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
    try {
      let event: EventEntity = new EventEntity();
      let user: UserEntity = await this.usersRepository.findOne({
        where: { id: organizer.id },
      });

      event.description = description;
      event.title = title;
      event.availabilities = availabilities as any;
      event.selectedDays = selectedDays;
      event.tags = tags;
      event.hourlyRate = hourlyRate;
      event.imageURI = imageURI;
      event.privateEvent = privateEvent;
      event.eventCardColor = eventCardColor;
      event.organizer = user;

      event = await this.eventsRepository.save(event);
      console.log("New event added: ", event);

      return {
        status: 201,
        messages: "New event created successfully.",
        eventID: event.id,
      };
    } catch (e) {
      throw new HttpException(
        "Something went wrong while adding new event.",
        HttpStatus.BAD_REQUEST
      );
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

  async findOne(id: string): Promise<any | void> {
    try {
      const event = await this.eventsRepository.findOne(id);
      return event.organizerId;
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
      let oldEvent = await this.eventsRepository.findOne(id, {
        relations: ["organizer"],
      });
      if (oldEvent === undefined) this.noEventError();
      if (oldEvent.organizerId !== userId) this.notAllowedError();

      let newEvent = Object.assign({}, oldEvent, updateEventDto);
      await this.eventsRepository.save(newEvent);

      return {
        message: `Event with id ${id}, updated successfully.`,
        status: 201,
      };
    } catch (e) {
      if (e.response && e.status) throw new HttpException(e.response, e.status);
    }
  }

  async remove(id: string, userId: string): Promise<SuccessMessage | void> {
    try {
      let event = await this.eventsRepository.findOne({ where: { id } });
      if (event == undefined) this.noEventError();
      if (event.organizerId !== userId) this.notAllowedError();

      await this.eventsRepository.remove(event);

      return {
        message: `Event with id ${id}, removed successfully.`,
        status: 201,
      };
    } catch (e) {
      if (e.response && e.status) throw new HttpException(e.response, e.status);
    }
  }

  async bookEvent(
    eventId: string,
    user: UserEntity,
    eventBookingDto: EventBookingDto
  ) {
    try {
      const event = await this.eventsRepository.findOne({
        where: { id: eventId },
      });

      if (event == undefined) this.noEventError();

      const { txHash, bookedDay, bookedTimeSlot, bookedDuration } =
        eventBookingDto;
      let bookingSlot = new BookingSlotEntity();
      bookingSlot.event = event;
      bookingSlot.attendee = user;
      bookingSlot.bookedDuration = bookedDuration;
      bookingSlot.bookedDay = bookedDay;
      bookingSlot.bookedTimeSlot = bookedTimeSlot;
      bookingSlot.txHash = txHash;

      event.bookedSlots.push(bookingSlot);

      await this.eventsRepository.save(event);
    } catch (e) {
      throw new HttpException(
        `Something went wrong while booking event with id ${eventId}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  private noEventError() {
    throw new HttpException("Event does not exists.", HttpStatus.NOT_FOUND);
  }

  private notAllowedError() {
    throw new HttpException("Permission denied.", HttpStatus.FORBIDDEN);
  }
}
