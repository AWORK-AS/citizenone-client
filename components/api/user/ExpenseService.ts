import BaseAPIService from '@/components/api/BaseAPIService'

class ExpenseService extends BaseAPIService {
    async getExpenses(params: object): Promise<any> {
        return await this.request(`/user/expenses`, 'GET', params)
    }

    async getExpense(expenseUuid: any): Promise<any> {
        return await this.request(`/user/expenses/${expenseUuid}`, 'GET')
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
}

export const expenseService = new ExpenseService()