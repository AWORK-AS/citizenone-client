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

    async archiveUnarchiveDocument(documentUuid: any): Promise<any> {
        return await this.request(`/user/employee-documents/${documentUuid}/archive`, 'PUT')
    }

    // As a blob whatever the file is: a plain request() hands text files back as
    // a string, which saveAs and the viewer can't use.
    async downloadDocument(documentUuid: any): Promise<Blob | null> {
        return await this.requestBlob(`/user/employee-documents/${documentUuid}/download`, 'GET')
    }

    async viewDocument(documentUuid: any): Promise<Blob | null> {
        return await this.requestBlob(`/user/employee-documents/${documentUuid}/view`, 'GET')
    }

    async getExpiryOverview(): Promise<any> {
        return await this.request(`/user/certificates/expiry-overview`, 'GET')
    }
}

export const employeeDocumentService = new EmployeeDocumentService()