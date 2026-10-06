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

    // Copies attachments from a mail in the user's own connected mailbox onto
    // the inquiry. The server reads the mail itself; only names are sent.
    async addFromMail(inquiryUuid: string, params: { message_id: string, folder?: string, attachments: string[] }): Promise<any> {
        return await this.request(`/user/citizen-inquiries/${inquiryUuid}/documents/from-mail`, 'POST', params)
    }

    // Through the API rather than the stored file's public address, so opening
    // a document goes through the same checks as listing them.
    async viewDocument(documentUuid: string): Promise<Blob | null> {
        return await this.requestBlob(`/user/inquiry-documents/${documentUuid}/view`, 'GET')
    }

    // Needs the download_documents permission; the server answers 403 without it.
    async downloadDocument(documentUuid: string): Promise<Blob | null> {
        return await this.requestBlob(`/user/inquiry-documents/${documentUuid}/download`, 'GET')
    }

    async deleteDocument(documentUuid: string): Promise<any> {
        return await this.request(`/user/inquiry-documents/${documentUuid}`, 'DELETE')
    }
}

export const inquiryDocumentService = new InquiryDocumentService()
