import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SuccessMessage } from "src/auth/interfaces/payload.interface";
import { EventEntity } from "src/model/event.entity";
import { UserEntity } from "src/model/user.entity";
import { BookingSlotEntity } from "src/model/bookingSlot.entity";
import { PaginationRequestDto, PaginationResult } from "src/pagination";
import { FindManyOptions, ILike, Repository } from "typeorm";
import { CreateEventDto } from "./dto/create-event.dto";
import { EventBookingDto } from "./dto/event-booking.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { OrganizerEntity } from "src/model/organizer.entity";

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventsRepository: Repository<EventEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(OrganizerEntity)
    private readonly organizersRepository: Repository<OrganizerEntity>
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
      let user: OrganizerEntity = await this.organizersRepository.findOne({
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
      console.error(e);
      throw new HttpException(
        "Something went wrong while adding new event.",
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async findAll(): Promise<EventEntity[] | null> {
    return this.eventsRepository.find();
  }

  async findAllWithPagination(
    paginationRequestDto: PaginationRequestDto,
    options?: FindManyOptions<EventEntity>
  ): Promise<PaginationResult<EventEntity> | void> {
    try {
      let { limit, page } = paginationRequestDto;
      page = Math.abs(Number(page));
      limit = Math.abs(Number(limit));
      if (limit < 10) limit = 10;
      let skip = (page - 1) * limit;

      const results = await this.eventsRepository.findAndCount({
        take: limit,
        skip,
        select: [
          "id",
          "description",
          "title",
          "privateEvent",
          "eventCardColor",
          "imageURI",
          "organizerId",
          "selectedDays",
        ],
        order: {
          createDateTime: "ASC",
        },
        // default cache time = 1s
        cache: true,
        ...options,
      });

      if (results == null) throw new Error();

      return {
        result: results[0],
        count: results[1],
        limit,
        page,
      };
    } catch (e) {
      console.error(e);
      throw new HttpException("Something went wrong", HttpStatus.BAD_REQUEST);
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
      // if (event == undefined) this.noEventError();
      // if (event.organizerId !== userId) this.notAllowedError();

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
      bookingSlot.attendeeId = user.id;
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

  public getResults(searchQuery: string) {
    return this.eventsRepository.find({
      where: [
        {
          title: ILike(`%${searchQuery}%`),
        },
        {
          description: ILike(`%${searchQuery}%`),
        },
      ],
    });
  }

  private noEventError() {
    throw new HttpException("Event does not exists.", HttpStatus.NOT_FOUND);
  }

  private notAllowedError() {
    throw new HttpException("Permission denied.", HttpStatus.FORBIDDEN);
  }
}
