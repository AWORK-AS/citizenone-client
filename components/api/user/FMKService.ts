import BaseAPIService from '@/components/api/BaseAPIService'

export interface MedicineCardParams {
    orgCvr: string
    cpr: string
    role?: string
}

class FMKService extends BaseAPIService {
    // POST /user/fmk — auth is the normal authenticated session (BaseAPIService
    // adds the Bearer token). No token query param.
    async getMedicineCard(params: MedicineCardParams): Promise<any> {
        return await this.request(`/user/fmk`, 'POST', params)
    }

    // GET /user/fmk/last-sync/{citizenUuid} — last successful FMK sync for a citizen.
    async getLastSync(citizenUuid: string): Promise<any> {
        return await this.request(`/user/fmk/last-sync/${citizenUuid}`, 'GET')
    }
}

export const fMKService = new FMKService()
