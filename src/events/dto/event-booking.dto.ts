import { IsNumber, IsString, IsUUID } from "class-validator"

export class EventBookingDto {
  @IsUUID()
  eventId: string

  @IsUUID()
  attendeeId: string

  @IsString()
  lockingTxHash: string

  @IsNumber()
  startDate: string

  @IsNumber()
  bookedDuration: number

  @IsNumber()
  durationCost: string

  @IsNumber()
  duration: number

  @IsString()
  datumHash: string
}
