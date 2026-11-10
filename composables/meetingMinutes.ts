import { meetingService, type MeetingService } from '@/components/api/user/MeetingService'

/**
 * Downloads a meeting's minutes as a PDF: from a recording's summary, from
 * the summary on screen, or (with neither) from the agenda and notes.
 */
export async function downloadMeetingMinutes(uuid: string, source: { recording_uuid?: string, summary?: string } = {}, api: MeetingService = meetingService) {
    let fileName = 'minutes.pdf'
    const blob = await api.minutesPdf(uuid, source, (headers) => {
        const match = /filename="?([^";]+)"?/i.exec(headers.get('content-disposition') ?? '')
        if (match?.[1]) fileName = match[1]
    })
    if (!blob) return

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
}
