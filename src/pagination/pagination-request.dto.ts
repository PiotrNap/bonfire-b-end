export interface PaginationRequestDto {
  limit: number
  page: number
  user_id: string
}

export interface BookingPaginationDto extends PaginationRequestDto {
  past_bookings: boolean
  attendee_id?: string
  organizer_id?: string
}
