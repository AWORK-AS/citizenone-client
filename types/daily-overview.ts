export interface CalendarEventResponse {
    data: CalendarEvent[]
}

interface CalendarEvent {
    title: string
    description: string
    date_time_start: string
    date_time_end: string
}