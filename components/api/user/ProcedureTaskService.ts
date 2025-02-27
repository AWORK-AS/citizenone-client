import BaseAPIService from '@/components/api/user/BaseAPIService'

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

    async toggleProcedureTask(procedureTaskUuid: any): Promise<any> {
        return await this.request(`/user/procedure-tasks/${procedureTaskUuid}/toggle/progress`, 'POST')
    }

    async getAllProcedureTasks(): Promise<any> {
        return await this.request(`/user/procedure-tasks/all/list`, 'GET')
    }

    async uploadFile(params: object): Promise<any> {
        return await this.request(`/user/procedure-task-attachments`, 'POST', params)
    }
}

export const procedureTaskService = new ProcedureTaskService()