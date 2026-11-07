import BaseAPIService from '@/components/api/BaseAPIService'

/** The Info Screen app, admin side: screens, pairing and pictures. */
class InfoScreenService extends BaseAPIService {
    async getScreens(): Promise<any> {
        return await this.request(`/user/info-screens`, 'GET')
    }

    async createScreen(params: object): Promise<any> {
        return await this.request(`/user/info-screens`, 'POST', params)
    }

    async updateScreen(uuid: string, params: object): Promise<any> {
        return await this.request(`/user/info-screens/${uuid}`, 'PUT', params)
    }

    async deleteScreen(uuid: string): Promise<any> {
        return await this.request(`/user/info-screens/${uuid}`, 'DELETE')
    }

    async createPairingCode(uuid: string): Promise<any> {
        return await this.request(`/user/info-screens/${uuid}/pairing-code`, 'POST')
    }

    async unpair(uuid: string): Promise<any> {
        return await this.request(`/user/info-screens/${uuid}/unpair`, 'POST')
    }

    async uploadSlide(uuid: string, file: File): Promise<any> {
        const formData = new FormData()
        formData.append('image', file)

        return await this.requestFormData(`/user/info-screens/${uuid}/slides`, formData)
    }

    async deleteSlide(uuid: string, slideUuid: string): Promise<any> {
        return await this.request(`/user/info-screens/${uuid}/slides/${slideUuid}`, 'DELETE')
    }
}

export const infoScreenService = new InfoScreenService()
