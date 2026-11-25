import BaseAPIService from '@/components/api/BaseAPIService'

class FMKService extends BaseAPIService {
    async getFMK(params: object): Promise<any> {
        return await this.request(`/user/fmk`, 'GET', params)
    }

    /** The citizen's FMK medicine card lined up with their CitizenOne medicines. */
    async getMedicineCard(citizenUuid: string): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/fmk/medicine-card`, 'GET')
    }

    /** MitID Erhverv login via SEB: where to send the browser. */
    async startLogin(returnPath: string): Promise<any> {
        return await this.request(`/user/fmk-login`, 'POST', { return_path: returnPath })
    }

    async getLoginSession(): Promise<any> {
        return await this.request(`/user/fmk-login/session`, 'GET')
    }

    async chooseLoginRole(key: string): Promise<any> {
        return await this.request(`/user/fmk-login/session/role`, 'POST', { key })
    }

    async getSettings(): Promise<any> {
        return await this.request(`/user/fmk-settings`, 'GET')
    }

    async saveSettings(settings: object): Promise<any> {
        return await this.request(`/user/fmk-settings`, 'PUT', settings)
    }

    async logout(): Promise<any> {
        return await this.request(`/user/fmk-login/session`, 'DELETE')
    }
}

export const fMKService = new FMKService()
