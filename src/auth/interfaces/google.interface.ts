export class GoogleCalendarScopes {
  Calendar = "https=//www.googleapis.com/auth/calendar"
  CalendarEvents = "https=//www.googleapis.com/auth/calendar.events"
  CalendarEventsRead =
    "https=//www.googleapis.com/auth/calendar.events.readonly"
  CalendarRead = "https=//www.googleapis.com/auth/calendar.readonly"
  CalendarSettings =
    "https=//www.googleapis.com/auth/calendar.settings.readonly"
}

export interface Credentials {
  refresh_token?: string | null
  expiry_date?: number | null
  access_token?: string | null
  token_type?: string | null
  id_token?: string | null
  scope?: string
}
