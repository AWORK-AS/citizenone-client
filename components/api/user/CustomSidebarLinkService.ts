import BaseAPIService from '@/components/api/BaseAPIService'

class CustomSidebarLinkService extends BaseAPIService {
    async getCustomSidebarLinks(params: object): Promise<any> {
        return await this.request(`/user/custom-sidebar-links`, 'GET', params)
    }

    async getCustomSidebarLink(uuid: any): Promise<any> {
        return await this.request(`/user/custom-sidebar-links/${uuid}`, 'GET')
    }

    async saveCustomSidebarLink(params: object): Promise<any> {
        return await this.request(`/user/custom-sidebar-links`, 'POST', params)
    }

    async updateCustomSidebarLink(uuid: any, params: object): Promise<any> {
        return await this.request(`/user/custom-sidebar-links/${uuid}`, 'PUT', params)
    }

    async deleteCustomSidebarLink(uuid: any): Promise<any> {
        return await this.request(`/user/custom-sidebar-links/${uuid}`, 'DELETE')
    }

    // Links visible to the current user (server filters by role/visibility).
    async getSidebarList(): Promise<any> {
        return await this.request(`/user/custom-sidebar-links/sidebar/list`, 'GET')
    }
}

export const customSidebarLinkService = new CustomSidebarLinkService()
