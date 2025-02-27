import BaseAPIService from '@/components/api/user/BaseAPIService'

class RiskLevelService extends BaseAPIService {
    async getAllRiskLevels(): Promise<any> {
        return await this.request(`/user/risk-levels/all/list`, 'GET')
    }
}

export const riskLevelService = new RiskLevelService()