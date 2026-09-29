import BaseAPIService from '@/components/api/BaseAPIService'

class EmployeeService extends BaseAPIService {
    async getEmployees(params: object): Promise<any> {
        return await this.request(`/user/employees`, 'GET', params)
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

    // Employees are archived (true) or restored (false), never deleted, so
    // their journals and history stay intact.
    async archiveEmployee(employeeUuid: any, archived: boolean): Promise<any> {
        return await this.request(`/user/employees/${employeeUuid}/archive`, 'PUT', { archived })
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

    async toggleBookingLicense(employeeUuid: any): Promise<any> {
        return await this.request(`/user/employees/${employeeUuid}/toggle/booking-license`, 'PUT')
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