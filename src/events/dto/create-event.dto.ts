import {
  IsBoolean,
  IsDate,
  IsJSON,
  IsNumber,
  IsObject,
  IsString,
  MaxLength,
} from "class-validator"
import { EventUser, EventVisibility } from "src/model/event.entity.js"
import { Cancellation, EventAvailability, SelectedDates } from "../events.interface.js"

export class CreateEventDto {
  @IsString()
  @MaxLength(40, { message: "Title should be max 40 chars." })
  title: string

  @IsString()
  @MaxLength(150, { message: "Description should be max 150 chars." })
  description: string

  @IsJSON()
  availabilities: EventAvailability[]

  @IsObject()
  selectedDates: string[]

  @IsDate()
  fromDate: Date

  @IsDate()
  toDate: Date

  @IsNumber()
  timeZoneOffset?: number

  @IsNumber()
  hourlyRate: number

  @IsBoolean()
  visibility: EventVisibility

  @IsString()
  eventCardColor: string

  @IsString()
  eventTitleColor: string

  @IsObject()
  organizer: EventUser

  @IsBoolean()
  gCalEventsBooking: boolean

  @IsObject()
  cancellation: Cancellation

  @IsString()
  note: string
}
