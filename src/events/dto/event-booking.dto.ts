import { IsNumber, IsString, IsUUID } from "class-validator"

export class EventBookingReservationDto {
  @IsUUID()
  eventId: string

  @IsUUID()
  attendeeId: string

  @IsNumber()
  startDate: string

  @IsNumber()
  bookedDuration: number

  @IsNumber()
  durationCost: string

  @IsNumber()
  duration: number
}

export class EventBookingTxInfoDto {
  @IsUUID()
  id: string // id of the booking slot

  @IsString()
  lockingTxHash: string

  @IsString()
  datumHash: string
}
