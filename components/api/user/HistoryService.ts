import BaseAPIService from '@/components/api/BaseAPIService'

class HistoryService extends BaseAPIService {
    // Universal record history ("time machine"). type is an allow-listed key
    // on the backend (journal, incident, medicine-history, employee-document, ...).
    async getRecordHistory(type: string, uuid: string): Promise<any> {
        return await this.request(`/user/history/${type}/${uuid}`, 'GET')
    }
}

export const historyService = new HistoryService()
