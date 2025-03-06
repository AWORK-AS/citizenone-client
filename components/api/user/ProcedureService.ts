import BaseAPIService from '@/components/api/BaseAPIService'

class ProcedureService extends BaseAPIService {
    async getProcedures(params: object): Promise<any> {
        return await this.request(`/user/procedures`, 'GET', params)
    }

    async getProceduresProgress(): Promise<any> {
        return await this.request(`/user/procedures/total/average/progress`, 'GET')
    }

    async getProcedure(procedureUuid: any): Promise<any> {
        return await this.request(`/user/procedures/${procedureUuid}`, 'GET')
    }

    async getEmployeeProgress(procedureUuid: any): Promise<any> {
        return await this.request(`/user/procedures/${procedureUuid}/progress`, 'GET')
    }

    async saveProcedure(params: object): Promise<any> {
        return await this.request(`/user/procedures`, 'POST', params)
    }

    async updateProcedure(procedureUuid: any, params: object): Promise<any> {
        return await this.request(`/user/procedures/${procedureUuid}`, 'PUT', params)
    }

    async getAllProcedures(): Promise<any> {
        return await this.request(`/user/procedures/all/list`, 'GET')
    }

    async uploadFile(params: object): Promise<any> {
        return await this.request(`/user/procedure-attachments`, 'POST', params)
    }
}

export const procedureService = new ProcedureService()