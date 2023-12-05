import { IsBoolean, IsObject, IsString, MaxLength } from "class-validator"
import { EventEntity, EventVisibility } from "../../model/event.entity.js"

export class EventPaginationDto {
  constructor(event: EventEntity) {
    const {
      id,
      title,
      description,
      visibility,
      eventCardColor,
      eventCardImage,
      eventTitleColor,
      organizerId,
    } = event

    this.id = id
    this.title = title
    this.description = description
    this.eventCardImage = eventCardImage
    this.visibility = visibility
    this.eventCardColor = eventCardColor
    this.eventTitleColor = eventTitleColor
    this.organizerId = organizerId
  }

  @IsString()
  id: string

  @IsString()
  @MaxLength(40, { message: "Title should be max 40 chars." })
  title: string

  @IsString()
  @MaxLength(150, { message: "Description should be max 150 chars." })
  description: string

  @IsString()
  eventCardImage?: Buffer

  @IsString()
  visibility: EventVisibility

  @IsString()
  eventCardColor: string

  @IsString()
  eventTitleColor: string

  @IsString()
  organizerId: string
}
