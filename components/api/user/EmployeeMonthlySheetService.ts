import BaseAPIService from '@/components/api/BaseAPIService'

class EmployeeMonthlySheetService extends BaseAPIService {
    /** The sheet of one employee for a month ("YYYY-MM"): a day row for every day, and the month totals. */
    async get(employeeUuid: any, month: string): Promise<any> {
        return await this.request(`/user/employees/${employeeUuid}/monthly-sheet`, 'GET', { month })
    }

    /** The same sheet as a PDF or an Excel file. */
    async download(employeeUuid: any, month: string, type: 'pdf' | 'xlsx'): Promise<Blob | null> {
        return await this.requestBlob(`/user/employees/${employeeUuid}/monthly-sheet/download`, 'GET', { month, type })
    }
}

export const employeeMonthlySheetService = new EmployeeMonthlySheetService()
