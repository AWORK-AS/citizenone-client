import BaseAPIService from '@/components/api/BaseAPIService'

class EmployeeService extends BaseAPIService {
    async getEmployees(params: object): Promise<any> {
        return await this.request(`/user/employees`, 'GET', params)
    }

    // Roadmap #301: the colleague gets the "Forgot password" link by email.
    async sendPasswordReset(employeeUuid: string): Promise<any> {
        return await this.request(`/user/employees/${employeeUuid}/send-password-reset`, 'POST')
    }

    async getEmployee(employeeUuid: any): Promise<any> {
        return await this.request(`/user/employees/${employeeUuid}`, 'GET')
    }

    async saveEmployee(params: object): Promise<any> {
        return await this.request(`/user/employees`, 'POST', params)
    }

    async updateEmployee(employeeUuid: any, params: object): Promise<any> {
        return await this.request(`/user/employees/${employeeUuid}/update`, 'POST', params)
    }

    async bulkUpdateEmployees(params: object): Promise<any> {
        return await this.request(`/user/employees/bulk-update`, 'POST', params)
    }

    // Employees are archived (true) or restored (false). Permanently deleting
    // one (below) is separate and only reachable from the archive - it scrubs
    // their identifying details but never removes the row, so their journals
    // and history stay intact.
    async archiveEmployee(employeeUuid: any, archived: boolean): Promise<any> {
        return await this.request(`/user/employees/${employeeUuid}/archive`, 'PUT', { archived })
    }

    // How many free user licences the employee's company has, asked before
    // reopening them so the admin knows whether they will get one.
    async getReopenSeats(employeeUuid: any): Promise<any> {
        return await this.request(`/user/employees/${employeeUuid}/reopen-seats`, 'GET')
    }

    async permanentlyDeleteEmployee(employeeUuid: any): Promise<any> {
        return await this.request(`/user/employees/${employeeUuid}/permanent-delete`, 'DELETE')
    }

    async assignCitizen(employeeUuid: any, params: object): Promise<any> {
        return await this.request(`/user/employees/${employeeUuid}/assign/citizen`, 'PUT', params)
    }

    async getArchivedEmployees(params: object): Promise<any> {
        return await this.request(`/user/employees/archived/list`, 'GET', params)
    }

    async toggleAILicense(employeeUuid: any): Promise<any> {
        return await this.request(`/user/ai/${employeeUuid}/set-license`, 'PUT')
    }

    async toggleSecureMailLicense(employeeUuid: any): Promise<any> {
        return await this.request(`/user/employees/${employeeUuid}/toggle/secure-mail-license`, 'PUT')
    }

    // Online Meetings is priced per host: a seat lets the employee create meetings.
    async toggleMeetingsLicense(employeeUuid: any): Promise<any> {
        return await this.request(`/user/employees/${employeeUuid}/toggle/meetings-license`, 'PUT')
    }

    async moveMeetingsLicense(fromUuid: string, toUuid: string): Promise<any> {
        return await this.request(`/user/employees/${fromUuid}/meetings-license/move`, 'PUT', { to_user_uuid: toUuid })
    }

    async toggleBookingLicense(employeeUuid: any): Promise<any> {
        return await this.request(`/user/employees/${employeeUuid}/toggle/booking-license`, 'PUT')
    }

    // Who has signed in after being invited, and a nudge for those who have not.
    async getOnboardingStatus(): Promise<any> {
        return await this.request(`/user/employees/onboarding-status`, 'GET')
    }

    async resendInvites(params: { uuids?: string[] }): Promise<any> {
        return await this.request(`/user/employees/resend-invites`, 'POST', params)
    }

    async inviteEmployee(params: object): Promise<any> {
        return await this.request(`/user/employees/company/send-admin-invitation`, 'POST', params)
    }

    async importEmployees(params: object): Promise<any> {
        return await this.request(`/user/employees/imports/template`, 'POST', params)
    }

    async exportEmployees(params: object): Promise<any> {
        return await this.request(`/user/employees/export/download`, 'GET', params)
    }

    async downloadImportEmployeesTemplate(): Promise<any> {
        return await this.request(`/user/employees/imports/download/template`, 'GET')
    }
}

export const employeeService = new EmployeeService()