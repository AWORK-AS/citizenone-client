import BaseAPIService from '@/components/api/BaseAPIService'

class FormAssignmentService extends BaseAPIService {
    async getAssignments(formUuid: any, params: object = {}): Promise<any> {
        return await this.request(`/user/forms/${formUuid}/assignments`, 'GET', params)
    }

    async saveAssignment(formUuid: any, params: object): Promise<any> {
        return await this.request(`/user/forms/${formUuid}/assignments`, 'POST', params)
    }

    async getAssignment(formUuid: any, assignmentUuid: any): Promise<any> {
        return await this.request(`/user/forms/${formUuid}/assignments/${assignmentUuid}`, 'GET')
    }

    async deleteAssignment(formUuid: any, assignmentUuid: any): Promise<any> {
        return await this.request(`/user/forms/${formUuid}/assignments/${assignmentUuid}`, 'DELETE')
    }
}

export const formAssignmentService = new FormAssignmentService()
