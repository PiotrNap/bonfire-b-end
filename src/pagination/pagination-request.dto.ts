import { NetworkId } from "src/utils/types.js"

export interface PaginationRequestDto {
  limit: number
  page: number
  user_id: string
  network_id: NetworkId
}

export interface BookingPaginationDto extends PaginationRequestDto {
  past_bookings: boolean
  network_id: NetworkId
  attendee_id?: string
  organizer_id?: string
}
