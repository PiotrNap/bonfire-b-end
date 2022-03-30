import { IsNumber, IsString, IsUUID } from "class-validator"

export class EventBookingDto {
  @IsUUID()
  eventId: string

  @IsUUID()
  attendeeId: string

  @IsString()
  txHash?: string

  @IsNumber()
  bookedDate: Date

  @IsNumber()
  bookedDuration: number
}
