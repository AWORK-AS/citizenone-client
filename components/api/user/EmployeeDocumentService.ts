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

    // Task #33: send an employment contract to the employee to sign.
    async requestSignature(documentUuid: any): Promise<any> {
        return await this.request(`/user/employee-documents/${documentUuid}/signature-request`, 'POST')
    }

    async withdrawSignatureRequest(documentUuid: any): Promise<any> {
        return await this.request(`/user/employee-documents/${documentUuid}/signature-request`, 'DELETE')
    }

    async downloadSignatureCertificate(documentUuid: any): Promise<Blob | null> {
        return await this.requestBlob(`/user/employee-documents/${documentUuid}/signature-certificate`, 'GET')
    }

    // The signed-in employee's own contracts to read and sign.
    async getMyContracts(): Promise<any> {
        return await this.request(`/user/my-contracts`, 'GET')
    }

    async viewMyContract(documentUuid: any): Promise<Blob | null> {
        return await this.requestBlob(`/user/my-contracts/${documentUuid}/file`, 'GET')
    }

    async signMyContract(documentUuid: any, params: { accepted: boolean, signed_name: string }): Promise<any> {
        return await this.request(`/user/my-contracts/${documentUuid}/sign`, 'POST', params)
    }

    async getExpiryOverview(): Promise<any> {
        return await this.request(`/user/certificates/expiry-overview`, 'GET')
    }

    // Per active employee, the required documents that are missing, expired or
    // expiring within 60 days. params: status, role_id, department_uuid.
    async getMissingOverview(params: object = {}): Promise<any> {
        return await this.request(`/user/certificates/missing-overview`, 'GET', params)
    }

    // Every employee document of the company. params: search, file_type, page.
    async searchDocuments(params: object): Promise<any> {
        return await this.request(`/user/certificates/document-search`, 'GET', params)
    }
}

export const employeeDocumentService = new EmployeeDocumentService()