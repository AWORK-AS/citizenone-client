import BaseAPIService from '@/components/api/user/BaseAPIService'

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

    async archiveUnarchiveDocument(documentUuid: any): Promise<any> {
        return await this.request(`/user/employee-documents/${documentUuid}/archive`, 'PUT')
    }

    async downloadDocument(documentUuid: any): Promise<any> {
        return await this.request(`/user/employee-documents/${documentUuid}/download`, 'GET')
    }
}

export const employeeDocumentService = new EmployeeDocumentService()