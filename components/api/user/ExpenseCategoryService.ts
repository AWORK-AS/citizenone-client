import BaseAPIService from '@/components/api/BaseAPIService'

class ExpenseCategoryService extends BaseAPIService {
    async getExpenseCategories(params: object): Promise<any> {
        return await this.request(`/user/expense-categories`, 'GET', params)
    }

    async getExpenseCategory(expenseCategoryUuid: any): Promise<any> {
        return await this.request(`/user/expense-categories/${expenseCategoryUuid}`, 'GET')
    }

    async saveExpenseCategory(params: object): Promise<any> {
        return await this.request(`/user/expense-categories`, 'POST', params)
    }

    async updateExpenseCategory(expenseCategoryUuid: any, params: object): Promise<any> {
        return await this.request(`/user/expense-categories/${expenseCategoryUuid}`, 'PUT', params)
    }

    async deleteExpenseCategory(expenseCategoryUuid: any): Promise<any> {
        return await this.request(`/user/expense-categories/${expenseCategoryUuid}`, 'DELETE')
    }

    async getAllExpenseCategories(): Promise<any> {
        return await this.request(`/user/expense-categories/all/list`, 'GET')
    }
}

export const expenseCategoryService = new ExpenseCategoryService()