/**
 * Guest join links for online meetings. The API stores only a hash of each
 * link, so a link can be shown once: in the answer to the call that made it.
 * This keeps those links in memory for the rest of the session (never in
 * storage) so the meeting page can offer "copy link" right after creating.
 */
const links = reactive<Record<string, Record<string, string>>>({})

export function useMeetingJoinLinks() {
    function remember(meeting: any) {
        for (const participant of meeting?.participants ?? []) {
            if (participant?.join_url) {
                links[meeting.uuid] ??= {}
                links[meeting.uuid][participant.uuid] = participant.join_url
            }
        }
    }

    function linkFor(meetingUuid: string, participantUuid: string): string | undefined {
        return links[meetingUuid]?.[participantUuid]
    }

    function set(meetingUuid: string, participantUuid: string, url: string) {
        links[meetingUuid] ??= {}
        links[meetingUuid][participantUuid] = url
    }

    return { remember, linkFor, set }
}
