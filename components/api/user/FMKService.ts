import BaseAPIService from '@/components/api/BaseAPIService'

class FMKService extends BaseAPIService {
    async getFMK(params: object): Promise<any> {
        return await this.request(`/user/fmk`, 'GET', params)
    }

    /** The citizen's FMK medicine card lined up with their CitizenOne medicines. */
    async getMedicineCard(citizenUuid: string): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/fmk/medicine-card`, 'GET')
    }
}

export const fMKService = new FMKService()
