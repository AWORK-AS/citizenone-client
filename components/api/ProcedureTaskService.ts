import BaseAPIService from '@/components/api/BaseAPIService'

class ProcedureTaskService extends BaseAPIService {
    async getProcedureTasks(params: object): Promise<any> {
        return await this.request(`/user/procedure-tasks`, 'GET', params)
    }

    async getProcedureTask(procedureTaskUuid: any): Promise<any> {
        return await this.request(`/user/procedure-tasks/${procedureTaskUuid}`, 'GET')
    }

    async getProcedureTaskProgress(procedureTaskUuid: any): Promise<any> {
        return await this.request(`/user/procedure-tasks/${procedureTaskUuid}/progress`, 'GET')
    }

    async saveProcedureTask(params: object): Promise<any> {
        return await this.request(`/user/procedure-tasks`, 'POST', params)
    }

    async updateProcedureTask(procedureTaskUuid: any, params: object): Promise<any> {
        return await this.request(`/user/procedure-tasks/${procedureTaskUuid}`, 'PUT', params)
    }

    async getAllProcedureTasks(): Promise<any> {
        return await this.request(`/user/procedure-tasks/all/list`, 'GET')
    }

    async uploadFile(params: object): Promise<any> {
        return await this.request(`/user/procedure-task-attachments`, 'POST', params)
    }
}

export const procedureTaskService = new ProcedureTaskService()