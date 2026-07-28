import BaseAPIService from '@/components/api/BaseAPIService'

class MedicineMissedDoseService extends BaseAPIService {
    async getMissedDoses(params: object = {}): Promise<any> {
        return await this.request('/user/medicine-missed-doses', 'GET', params)
    }
}

export const medicineMissedDoseService = new MedicineMissedDoseService()
