import BaseAPIService from '@/components/api/BaseAPIService'

class ConsentCompetenceCapacityService extends BaseAPIService {
    async getConsentCompetenceCapacities(params: object): Promise<any> {
        return await this.request(`/user/consent-competence-capacities`, 'GET', params)
    }

    async getConsentCompetenceCapacity(consentCompetenceCapacityUuid: any): Promise<any> {
        return await this.request(`/user/consent-competence-capacities/${consentCompetenceCapacityUuid}`, 'GET')
    }

    async saveConsentCompetenceCapacity(params: object): Promise<any> {
        return await this.request(`/user/consent-competence-capacities`, 'POST', params)
    }

    async updateConsentCompetenceCapacity(consentCompetenceCapacityUuid: any, params: object): Promise<any> {
        return await this.request(`/user/consent-competence-capacities/${consentCompetenceCapacityUuid}`, 'PUT', params)
    }

    async deleteConsentCompetenceCapacity(consentCompetenceCapacityUuid: any): Promise<any> {
        return await this.request(`/user/consent-competence-capacities/${consentCompetenceCapacityUuid}`, 'DELETE')
    }
}

export const consentCompetenceCapacityService = new ConsentCompetenceCapacityService()