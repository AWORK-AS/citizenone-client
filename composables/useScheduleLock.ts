import moment from 'moment'
import { useUserStore } from '@/store/user'

export function useScheduleLock() {
    const userStore = useUserStore() as any

    function scheduleLockCutoff(): moment.Moment | null {
        const company = userStore.getUser?.company
        if (!company?.is_lock_past_schedules) return null
        return company.lock_shifts_before_date
            ? moment(company.lock_shifts_before_date).startOf('day')
            : moment().startOf('week') // fallback for companies that haven't picked a date yet
    }

    function isDateLocked(date: string | Date, hasManageAccess: boolean): boolean {
        if (hasManageAccess) return false
        const cutoff = scheduleLockCutoff()
        if (!cutoff) return false
        return moment(date).isBefore(cutoff)
    }

    return { scheduleLockCutoff, isDateLocked }
}
