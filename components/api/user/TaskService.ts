import BaseAPIService from '@/components/api/BaseAPIService'

class TaskService extends BaseAPIService {
    async getBoards(): Promise<any> {
        return await this.request(`/user/tasks/boards`, 'GET')
    }

    async saveBoard(params: object): Promise<any> {
        return await this.request(`/user/tasks/boards`, 'POST', params)
    }

    async updateBoard(boardUuid: string, params: object): Promise<any> {
        return await this.request(`/user/tasks/boards/${boardUuid}`, 'PUT', params)
    }

    async deleteBoard(boardUuid: string): Promise<any> {
        return await this.request(`/user/tasks/boards/${boardUuid}`, 'DELETE')
    }

    async saveColumn(boardUuid: string, params: object): Promise<any> {
        return await this.request(`/user/tasks/boards/${boardUuid}/columns`, 'POST', params)
    }

    async updateColumn(columnUuid: string, params: object): Promise<any> {
        return await this.request(`/user/tasks/columns/${columnUuid}`, 'PUT', params)
    }

    async deleteColumn(columnUuid: string, params: object = {}): Promise<any> {
        return await this.request(`/user/tasks/columns/${columnUuid}`, 'DELETE', params)
    }

    async reorderColumns(boardUuid: string, uuids: string[]): Promise<any> {
        return await this.request(`/user/tasks/boards/${boardUuid}/columns/reorder`, 'PUT', { uuids })
    }

    async getTasks(boardUuid: string): Promise<any> {
        return await this.request(`/user/tasks/boards/${boardUuid}/tasks`, 'GET')
    }

    async getMyTasks(): Promise<any> {
        return await this.request(`/user/tasks/mine`, 'GET')
    }

    async saveTask(boardUuid: string, params: object): Promise<any> {
        return await this.request(`/user/tasks/boards/${boardUuid}/tasks`, 'POST', params)
    }

    async updateTask(taskUuid: string, params: object): Promise<any> {
        return await this.request(`/user/tasks/${taskUuid}`, 'PUT', params)
    }

    async moveTask(taskUuid: string, columnUuid: string): Promise<any> {
        return await this.request(`/user/tasks/${taskUuid}/move`, 'PUT', { column_uuid: columnUuid })
    }

    async deleteTask(taskUuid: string): Promise<any> {
        return await this.request(`/user/tasks/${taskUuid}`, 'DELETE')
    }

    async getTypes(): Promise<any> {
        return await this.request(`/user/tasks/types`, 'GET')
    }

    async saveType(params: object): Promise<any> {
        return await this.request(`/user/tasks/types`, 'POST', params)
    }

    async updateType(typeUuid: string, params: object): Promise<any> {
        return await this.request(`/user/tasks/types/${typeUuid}`, 'PUT', params)
    }

    async deleteType(typeUuid: string): Promise<any> {
        return await this.request(`/user/tasks/types/${typeUuid}`, 'DELETE')
    }

    async reorderTypes(uuids: string[]): Promise<any> {
        return await this.request(`/user/tasks/types/reorder`, 'PUT', { uuids })
    }

    async getRules(): Promise<any> {
        return await this.request(`/user/tasks/rules`, 'GET')
    }

    async saveRule(params: object): Promise<any> {
        return await this.request(`/user/tasks/rules`, 'POST', params)
    }

    async updateRule(ruleUuid: string, params: object): Promise<any> {
        return await this.request(`/user/tasks/rules/${ruleUuid}`, 'PUT', params)
    }

    async deleteRule(ruleUuid: string): Promise<any> {
        return await this.request(`/user/tasks/rules/${ruleUuid}`, 'DELETE')
    }
}

export const taskService = new TaskService()
