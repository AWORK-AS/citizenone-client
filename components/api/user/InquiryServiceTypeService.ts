import BaseAPIService from '@/components/api/BaseAPIService'

class InquiryServiceTypeService extends BaseAPIService {
    async getServiceTypes(): Promise<any> {
        return await this.request(`/user/inquiry-service-types/all/list`, 'GET')
    }

    async saveServiceType(params: object): Promise<any> {
        return await this.request(`/user/inquiry-service-types`, 'POST', params)
    }

    async updateServiceType(uuid: string, params: object): Promise<any> {
        return await this.request(`/user/inquiry-service-types/${uuid}`, 'PUT', params)
    }

    async deleteServiceType(uuid: string): Promise<any> {
        return await this.request(`/user/inquiry-service-types/${uuid}`, 'DELETE')
    }

    async reorderServiceTypes(uuids: string[]): Promise<any> {
        return await this.request(`/user/inquiry-service-types/reorder`, 'PUT', { uuids })
    }
}

export const inquiryServiceTypeService = new InquiryServiceTypeService()
