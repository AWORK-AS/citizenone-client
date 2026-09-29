import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenScaleScoreService extends BaseAPIService {
    async getScaleScores(citizenUuid: string, params: object): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/scale-scores`, 'GET', params)
    }

    async getDevelopment(citizenUuid: string, params: object): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/scale-scores/development`, 'GET', params)
    }

    async getGroupIterations(citizenUuid: string, params: object): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/group-iterations`, 'GET', params)
    }

    async saveScaleScore(citizenUuid: string, params: object): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/scale-scores`, 'POST', params)
    }

    // Only a measurement entered on its own; one from a report stays with it.
    async deleteScaleScore(citizenUuid: string, scoreUuid: string): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/scale-scores/${scoreUuid}`, 'DELETE')
    }
}

export const citizenScaleScoreService = new CitizenScaleScoreService()
