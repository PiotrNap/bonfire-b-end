import {
  IsArray,
  IsBoolean,
  IsJSON,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { EventUser } from "src/model/event.entity";
import { EventAvailability, SelectedDays } from "../events.interface";

export class CreateEventDto {
  @IsString()
  @MaxLength(40, { message: "Title should be max 40 chars." })
  title: string;

  @IsString()
  @MaxLength(150, { message: "Description should be max 150 chars." })
  description: string;

  @IsJSON()
  availabilities: EventAvailability;

  @IsObject()
  selectedDays: SelectedDays;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsNumber()
  hourlyRate: number;

  @IsString()
  imageURI: string;

  @IsBoolean()
  privateEvent: boolean;

  @IsString()
  eventCardColor: string;

  @IsObject()
  organizer: EventUser;
}
