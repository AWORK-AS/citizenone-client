import BaseAPIService from '@/components/api/BaseAPIService'

class ChecklistService extends BaseAPIService {
    async getChecklistsByCitizen(citizenUuid: any, params: object): Promise<any> {
        return await this.request(`/user/checklists/citizen/${citizenUuid}`, 'GET', params)
    }

    async saveChecklist(params: object): Promise<any> {
        return await this.request(`/user/checklists`, 'POST', params)
    }

    async updateChecklist(uuid: any, params: object): Promise<any> {
        return await this.request(`/user/checklists/${uuid}`, 'PUT', params)
    }

    async deleteChecklist(uuid: any): Promise<any> {
        return await this.request(`/user/checklists/${uuid}`, 'DELETE')
    }

    async saveChecklistItem(checklistUuid: any, params: object): Promise<any> {
        return await this.request(`/user/checklists/${checklistUuid}/items`, 'POST', params)
    }

    async updateChecklistItem(uuid: any, params: object): Promise<any> {
        return await this.request(`/user/checklists/items/${uuid}`, 'PUT', params)
    }

    async toggleChecklistItemComplete(uuid: any): Promise<any> {
        return await this.request(`/user/checklists/items/${uuid}/complete`, 'POST')
    }

    async deleteChecklistItem(uuid: any): Promise<any> {
        return await this.request(`/user/checklists/items/${uuid}`, 'DELETE')
    }
}

export const checklistService = new ChecklistService()
