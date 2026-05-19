import BaseAPIService from '@/components/api/BaseAPIService'

class ProductService extends BaseAPIService {
    async getPlanSettings(): Promise<any> {
        return await this.request('/superadmin/products/plans', 'GET')
    }
    async createPlan(params: object): Promise<any> {
        return await this.request('/superadmin/products/plans', 'POST', params)
    }
    async updatePlan(planKey: string, params: object): Promise<any> {
        return await this.request(`/superadmin/products/plans/${planKey}`, 'PUT', params)
    }
    async deletePlan(planKey: string): Promise<any> {
        return await this.request(`/superadmin/products/plans/${planKey}`, 'DELETE')
    }
    async getAddonPrices(): Promise<any> {
        return await this.request('/superadmin/products/addon-prices', 'GET')
    }
    async updateAddonPrices(params: object): Promise<any> {
        return await this.request('/superadmin/products/addon-prices', 'PUT', params)
    }
}

export const productService = new ProductService()
