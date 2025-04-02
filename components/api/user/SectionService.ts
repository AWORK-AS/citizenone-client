import BaseAPIService from '@/components/api/BaseAPIService'

class SectionService extends BaseAPIService {
    async getSections(params: object): Promise<any> {
        return await this.request(`/user/sections`, 'GET', params)
    }

    async getSection(sectionUuid: any): Promise<any> {
        return await this.request(`/user/sections/${sectionUuid}`, 'GET')
    }

    async saveSection(params: object): Promise<any> {
        return await this.request(`/user/sections`, 'POST', params)
    }

    async updateSection(sectionUuid: any, params: object): Promise<any> {
        return await this.request(`/user/sections/${sectionUuid}`, 'PUT', params)
    }

    async deleteSection(sectionUuid: any): Promise<any> {
        return await this.request(`/user/sections/${sectionUuid}`, 'DELETE')
    }

    async getAllSections(): Promise<any> {
        return await this.request(`/user/sections/all/list`, 'GET')
    }
}

export const sectionService = new SectionService()