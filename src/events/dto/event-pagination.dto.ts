import { IsBoolean, IsObject, IsString, MaxLength } from "class-validator";
import { EventEntity } from "../../model/event.entity";
import { SelectedDays } from "../events.interface";

export class EventPaginationDto {
  constructor(event: EventEntity) {
    const {
      id,
      title,
      description,
      imageURI,
      privateEvent,
      eventCardColor,
      eventTitleColor,
      selectedDays,
      organizerId,
    } = event;
    console.log(event);

    this.id = id;
    this.title = title;
    this.description = description;
    this.imageURI = imageURI;
    this.privateEvent = privateEvent;
    this.eventCardColor = eventCardColor;
    this.eventTitleColor = eventTitleColor;
    this.selectedDays = selectedDays;
    this.organizerId = organizerId;
  }

  @IsString()
  id: string;

  @IsString()
  @MaxLength(40, { message: "Title should be max 40 chars." })
  title: string;

  @IsString()
  @MaxLength(150, { message: "Description should be max 150 chars." })
  description: string;

  @IsString()
  imageURI: string;

  @IsBoolean()
  privateEvent: boolean;

  @IsString()
  eventCardColor: string;

  @IsString()
  eventTitleColor: string;

  @IsObject()
  selectedDays: SelectedDays;

  @IsString()
  organizerId: string;
}
