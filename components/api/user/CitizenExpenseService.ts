import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenExpenseService extends BaseAPIService {
    async getExpenses(params: object): Promise<any> {
        return await this.request(`/user/citizens/all/expenses`, 'GET', params)
    }

    async saveExpense(params: object): Promise<any> {
        return await this.request(`/user/expenses`, 'POST', params)
    }

    async updateExpense(expenseUuid: any, params: object): Promise<any> {
        return await this.request(`/user/expenses/${expenseUuid}/update`, 'POST', params)
    }

    async deleteExpense(expenseUuid: any): Promise<any> {
        return await this.request(`/user/expenses/${expenseUuid}`, 'DELETE')
    }

    async rejectExpense(expenseUuid: any): Promise<any> {
        return await this.request(`/user/expenses/${expenseUuid}/reject`, 'POST')
    }

    async reimburseExpense(expenseUuid: any, params: object): Promise<any> {
        return await this.request(`/user/expenses/${expenseUuid}/reimburse`, 'POST', params)
    }

    async downloadReceipt(expenseUuid: string): Promise<any> {
        return await this.request(`/user/expenses/${expenseUuid}/download`, 'GET')
    }
}

export const citizenExpenseService = new CitizenExpenseService()