import BaseAPIService from '@/components/api/BaseAPIService'

class PatientJournalService extends BaseAPIService {
    async getJournals(params: object): Promise<any> {
        return await this.request(`/patient/journals`, 'GET', params)
    }
}

export const patientJournalService = new PatientJournalService()
