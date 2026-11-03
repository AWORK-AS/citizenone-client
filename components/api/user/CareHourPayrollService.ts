
import BaseAPIService from '@/components/api/BaseAPIService'

// Months closed for payroll (Indsatstimer). Admin only, and only when the
// company switched the payroll lock on; the server answers 404 otherwise.
class CareHourPayrollService extends BaseAPIService {
    async getPayrollMonths(): Promise<any> {
        return await this.request(`/user/care-hour-payroll-periods`, 'GET')
    }

    async closePayrollMonth(month: string): Promise<any> {
        return await this.request(`/user/care-hour-payroll-periods`, 'POST', { month })
    }

    async reopenPayrollMonth(month: string): Promise<any> {
        return await this.request(`/user/care-hour-payroll-periods/${month}`, 'DELETE')
    }
}

export const careHourPayrollService = new CareHourPayrollService()
