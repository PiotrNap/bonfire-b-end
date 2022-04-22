import {
  IsArray,
  IsBoolean,
  IsDate,
  IsJSON,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator"
import { EventUser } from "src/model/event.entity"
import { EventAvailability, SelectedDays } from "../events.interface"

export class CreateEventDto {
  @IsString()
  @MaxLength(40, { message: "Title should be max 40 chars." })
  title: string

  @IsString()
  @MaxLength(150, { message: "Description should be max 150 chars." })
  description: string

  @IsJSON()
  availabilities: EventAvailability

  @IsObject()
  selectedDays: SelectedDays

  @IsDate()
  fromDate: Date

  @IsDate()
  toDate: Date

  @IsOptional()
  @IsArray()
  tags?: string[]

  @IsNumber()
  hourlyRate: number

  @IsBoolean()
  privateEvent: boolean

  @IsString()
  eventCardColor: string

  @IsString()
  eventTitleColor: string

  @IsObject()
  organizer: EventUser
}
