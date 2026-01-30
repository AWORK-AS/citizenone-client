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

    async reimburseExpense(expenseUuid: any, params: object): Promise<any> {
        return await this.request(`/user/expenses/${expenseUuid}/reimburse`, 'POST', params)
    }

    async unReimburseExpense(expenseUuid: any): Promise<any> {
        return await this.request(`/user/expenses/${expenseUuid}/unreimburse`, 'POST')
    }

    async deleteExpense(expenseUuid: any): Promise<any> {
        return await this.request(`/user/expenses/${expenseUuid}`, 'DELETE')
    }
}

export const expenseService = new ExpenseService()