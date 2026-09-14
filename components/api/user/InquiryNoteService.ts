import BaseAPIService from '@/components/api/BaseAPIService'

class InquiryNoteService extends BaseAPIService {
    async getNotes(inquiryUuid: string): Promise<any> {
        return await this.request(`/user/citizen-inquiries/${inquiryUuid}/notes`, 'GET')
    }

    async saveNote(inquiryUuid: string, content: string): Promise<any> {
        return await this.request(`/user/citizen-inquiries/${inquiryUuid}/notes`, 'POST', { content })
    }

    async updateNote(noteUuid: string, content: string): Promise<any> {
        return await this.request(`/user/inquiry-notes/${noteUuid}`, 'PUT', { content })
    }

    async deleteNote(noteUuid: string): Promise<any> {
        return await this.request(`/user/inquiry-notes/${noteUuid}`, 'DELETE')
    }
}

export const inquiryNoteService = new InquiryNoteService()
