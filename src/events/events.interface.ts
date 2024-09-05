export type SelectedDates = { [key: string]: number }
export type SelectedWeekDays = { [key: string]: any }

export interface EventAvailability {
  from: string
  to: string
  isFullyBooked: boolean
  maxDuration: number
  minDuration: number
  slots: EventSlot[]
}

export interface EventSlot {
  from: string
  duration: number
  isAvailable: boolean | "pending"
  bookingId: string // id of booking record (if any)
}

export interface Cancellation {
  fee: number // fee % based off of ADA cost
  window: number // cancellation window before event start date in hours
}
export type NetworkId = "Mainnet" | "Preprod"
