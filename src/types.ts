export interface Error {
    message?: string
    errors?: {
        [key: string]: string[];
    }
}

export interface CalendarEventResponse {
    data: CalendarEvent[]
}

export interface CitizenResponse {
    data: Citizen[]
}

interface CalendarEvent {
    title: string
    description: string
    date_time_start: string
    date_time_end: string
}

interface CitizenJournal {
    title: string
    content: string
    date: string
}

interface Citizen {
    citizen_journal: CitizenJournal
}