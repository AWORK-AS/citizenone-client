import BaseAPIService from '@/components/api/BaseAPIService'

class MailPdfService extends BaseAPIService {
    async downloadPdf(params: object): Promise<Blob | null> {
        return await this.requestBlob('/user/emails/pdf/download', 'GET', params)
    }

    async saveToDrive(params: object): Promise<any> {
        return await this.request('/user/emails/pdf/save-to-drive', 'POST', params)
    }
}

export const mailPdfService = new MailPdfService()
