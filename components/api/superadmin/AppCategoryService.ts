import BaseAPIService from '@/components/api/BaseAPIService'

class AppCategoryService extends BaseAPIService {
    async getCategories(params?: object): Promise<any> {
        return await this.request('/superadmin/application-categories', 'GET', params)
    }
    async getCategory(uuid: string): Promise<any> {
        return await this.request(`/superadmin/application-categories/${uuid}`, 'GET')
    }
    async saveCategory(params: object): Promise<any> {
        return await this.request('/superadmin/application-categories', 'POST', params)
    }
    async updateCategory(uuid: string, params: object): Promise<any> {
        return await this.request(`/superadmin/application-categories/${uuid}`, 'PUT', params)
    }
    async deleteCategory(uuid: string): Promise<any> {
        return await this.request(`/superadmin/application-categories/${uuid}`, 'DELETE')
    }
}

export const appCategoryService = new AppCategoryService()
