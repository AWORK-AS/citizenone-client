import BaseAPIService from '@/components/api/BaseAPIService'

class AppService extends BaseAPIService {
    async getApps(params: object): Promise<any> {
        return await this.request(`/user/apps`, 'GET', params)
    }

    async getApp(appUuid: any): Promise<any> {
        return await this.request(`/user/apps/${appUuid}`, 'GET')
    }

    // The app page. Addressed by slug so the same link works on the website.
    async getAppBySlug(slug: string): Promise<any> {
        return await this.request(`/user/app-store/${slug}`, 'GET')
    }

    async activateApp(appUuid: object, params: object): Promise<any> {
        return await this.request(`/user/apps/${appUuid}/purchase`, 'POST', params)
    }

    async activateFreeApp(params: object): Promise<any> {
        return await this.request(`/user/company/activate/free-apps`, 'PUT', params)
    }

    async validatePurchase(paymentId: any): Promise<any> {
        return await this.request(`/user/apps/${paymentId}/verify-payment`, 'POST')
    }

    // Trials: a card is saved through the same Nexi checkout a purchase uses,
    // nothing is charged at start, and the trial converts when it ends.
    async startTrial(appUuid: string, params: { frequency: 'monthly' | 'yearly', seats?: number }): Promise<any> {
        return await this.request(`/user/apps/${appUuid}/trial`, 'POST', params)
    }

    async verifyTrial(paymentId: string): Promise<any> {
        return await this.request(`/user/apps/${paymentId}/trial/verify`, 'POST')
    }

    async cancelTrial(appUuid: string): Promise<any> {
        return await this.request(`/user/apps/${appUuid}/trial/cancel`, 'POST')
    }

    async undoCancelTrial(appUuid: string): Promise<any> {
        return await this.request(`/user/apps/${appUuid}/trial/cancel`, 'DELETE')
    }

    async getCategories(): Promise<any> {
        return await this.request(`/user/app-categories`, 'GET')
    }
}

export const appService = new AppService()