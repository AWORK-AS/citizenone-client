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

    async archiveEmployee(employeeUuid: any): Promise<any> {
        return await this.request(`/user/employees/${employeeUuid}/archive`, 'PUT')
    }

    async assignCitizen(employeeUuid: any, params: object): Promise<any> {
        return await this.request(`/user/employees/${employeeUuid}/assign/citizen`, 'PUT', params)
    }

    async getArchivedEmployees(params: object): Promise<any> {
        return await this.request(`/user/employees/archived/list`, 'GET', params)
    }

    async deleteEmployee(employeeUuid: any): Promise<any> {
        return await this.request(`/user/employees/${employeeUuid}`, 'DELETE')
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
}

export const employeeService = new EmployeeService()