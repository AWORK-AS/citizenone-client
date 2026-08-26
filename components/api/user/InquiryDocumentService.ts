import BaseAPIService from '@/components/api/BaseAPIService'

class InquiryDocumentService extends BaseAPIService {
    async getDocuments(inquiryUuid: string): Promise<any> {
        return await this.request(`/user/citizen-inquiries/${inquiryUuid}/documents`, 'GET')
    }

    // Multipart rather than JSON: the file itself is the payload.
    async uploadDocument(inquiryUuid: string, file: File, name?: string): Promise<any> {
        const formData = new FormData()
        formData.append('file', file)
        if (name) formData.append('name', name)

        return await this.requestFormData(`/user/citizen-inquiries/${inquiryUuid}/documents`, formData)
    }

    async deleteDocument(documentUuid: string): Promise<any> {
        return await this.request(`/user/inquiry-documents/${documentUuid}`, 'DELETE')
    }
}

export const inquiryDocumentService = new InquiryDocumentService()
