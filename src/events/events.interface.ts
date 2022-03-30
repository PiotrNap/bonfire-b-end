export type SelectedDays = { [key: string]: number }
export type SelectedWeekDays = { [key: string]: any }

export interface EventAvailability {
  from: Date | number
  to: Date | number
  maxDuration: number
  minDuration: number
  localeTimeOffset?: number
}
