import BaseAPIService from '@/components/api/BaseAPIService'

class DutyScheduleFavoriteEmployeeService extends BaseAPIService {
    async getFavoriteEmployees(): Promise<any> {
        return await this.request(`/user/duty-schedules/employee/favorites`, 'GET')
    }

    async addFavoriteEmployee(employeeUuid: string): Promise<any> {
        return await this.request(`/user/duty-schedules/employee/favorites`, 'POST', { employee_uuid: employeeUuid })
    }

    async removeFavoriteEmployee(employeeUuid: string): Promise<any> {
        return await this.request(`/user/duty-schedules/employee/favorites/${employeeUuid}`, 'DELETE')
    }
}

export const dutyScheduleFavoriteEmployeeService = new DutyScheduleFavoriteEmployeeService()
