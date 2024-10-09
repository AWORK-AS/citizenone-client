import BaseAPIService from '@/components/api/BaseAPIService'

class EmployeeDocumentService extends BaseAPIService {
    async getDocuments(params: object): Promise<any> {
        return await this.request(`/user/employee-documents`, 'GET', params)
    }

    async saveDocument(params: object): Promise<any> {
        return await this.request(`/user/employee-documents`, 'POST', params)
    }

    async updateDocument(documentUuid: any, params: object): Promise<any> {
        return await this.request(`/user/employee-documents/${documentUuid}`, 'PUT', params)
    }

    async deleteDocument(documentUuid: any): Promise<any> {
        return await this.request(`/user/employee-documents/${documentUuid}`, 'DELETE')
    }
}

export const employeeDocumentService = new EmployeeDocumentService()