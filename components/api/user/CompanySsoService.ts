import BaseAPIService from '@/components/api/BaseAPIService'

class CompanySsoService extends BaseAPIService {
    async getSettings(): Promise<any> {
        return await this.request(`/user/company-sso`, 'GET')
    }

    async saveTenant(tenantId: string | null): Promise<any> {
        return await this.request(`/user/company-sso`, 'PUT', { tenant_id: tenantId })
    }
}

export const companySsoService = new CompanySsoService()
