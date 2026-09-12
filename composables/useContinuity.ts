import { continuityService } from '@/components/api/user/ContinuityService'

// "Fortsæt hvor du slap": reports the last citizen/chat viewed, so opening
// the app on a different device can offer to jump back to it. Debounced and
// fire-and-forget on purpose - this is a nice-to-have prompt, never worth
// blocking navigation for or surfacing an error over.
let reportTimeout: ReturnType<typeof setTimeout> | null = null

function deviceName(): 'desktop' | 'web' {
    return (typeof window !== 'undefined' && (window as any).citizenOneDesktop?.isDesktop) ? 'desktop' : 'web'
}

export function useContinuity() {
    function reportContinuity(type: 'citizen' | 'chat', subjectUuid: string | undefined | null, label: string) {
        if (!subjectUuid || !label.trim()) return
        if (reportTimeout) clearTimeout(reportTimeout)
        reportTimeout = setTimeout(() => {
            continuityService.put({ type, subject_uuid: subjectUuid, label: label.trim(), device: deviceName() }).catch(() => {})
        }, 2000)
    }

    return { reportContinuity }
}
