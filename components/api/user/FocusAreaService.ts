import BaseAPIService from '@/components/api/BaseAPIService'

class FocusAreaService extends BaseAPIService {
    // The VUM catalogue: themes, each with its category as `group`.
    async getVumThemes(): Promise<any> {
        return await this.request(`/user/focus-areas/all/list`, 'GET')
    }
}

export const focusAreaService = new FocusAreaService()
