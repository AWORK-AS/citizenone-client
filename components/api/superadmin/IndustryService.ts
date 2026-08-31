import BaseAPIService from '@/components/api/BaseAPIService'

class IndustryService extends BaseAPIService {
    async getAllIndustries(): Promise<any> {
        return await this.request(`/superadmin/industries/all/list`, 'GET')
    }

    /**
     * Every industry with the words and page set superadmin has given it, plus the full page
     * list. The pages come along here rather than from /superadmin/pages, which paginates at a
     * fixed size with no per_page, so the screen would have shown ten of seventeen checkboxes
     * and looked complete.
     */
    async getIndustryDefaults(): Promise<any> {
        return await this.request(`/superadmin/industries/defaults`, 'GET')
    }

    async updateIndustryDefaults(uuid: string, params: any): Promise<any> {
        return await this.request(`/superadmin/industries/${uuid}/defaults`, 'PUT', params)
    }
}

export const industryService = new IndustryService()
