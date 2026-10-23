import BaseAPIService from '@/components/api/BaseAPIService'

export interface InactiveEmployee {
    uuid: string
    name: string
    role: string | null
    /** ISO string, or null when the employee never logged in. */
    last_seen_at: string | null
    never_logged_in: boolean
    inactive_days: number
}

/** "Employees who have been inactive for 3 months". See the inactive-employees routes in the backend. */
class InactiveEmployeeService extends BaseAPIService {
    /** 403 for anybody who is not an admin: callers treat that as "nothing to show". */
    async getPrompt(): Promise<{ data: { show: boolean, employees: InactiveEmployee[] } }> {
        return await this.request('/user/inactive-employees/prompt', 'GET')
    }

    /** "Keep active": hides this employee for 3 months. */
    async dismiss(employeeUuid: string): Promise<{ data: { dismissed: boolean } }> {
        return await this.request(`/user/inactive-employees/${employeeUuid}/dismiss`, 'POST')
    }

    /** "Remind me later": hides the pop-up for 7 days. */
    async snooze(): Promise<{ data: { snoozed_until: string } }> {
        return await this.request('/user/inactive-employees/prompt/snooze', 'POST')
    }
}

export const inactiveEmployeeService = new InactiveEmployeeService()
