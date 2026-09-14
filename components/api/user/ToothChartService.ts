import BaseAPIService from '@/components/api/BaseAPIService'

class ToothChartService extends BaseAPIService {
    async getChart(citizenUuid: string): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/tooth-chart`, 'GET')
    }

    async getToothHistory(citizenUuid: string, toothUuid: string): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/tooth-chart/teeth/${toothUuid}/history`, 'GET')
    }

    async updateTooth(citizenUuid: string, toothUuid: string, params: object): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/tooth-chart/teeth/${toothUuid}`, 'PUT', params)
    }

    async updateCheckup(citizenUuid: string, params: object): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/tooth-chart/checkup`, 'PUT', params)
    }

    async updateGeneralNotes(citizenUuid: string, params: object): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/tooth-chart/general-notes`, 'PUT', params)
    }

    async uploadAttachment(citizenUuid: string, toothUuid: string, formData: FormData): Promise<any> {
        // Files go through the form-data path, which leaves the boundary to
        // the browser instead of forcing a JSON content type.
        return await this.requestFormData(
            `/user/citizens/${citizenUuid}/tooth-chart/teeth/${toothUuid}/attachments`,
            formData,
        )
    }

    async deleteAttachment(uuid: string): Promise<any> {
        return await this.request(`/user/tooth-attachments/${uuid}`, 'DELETE')
    }

    async downloadPdf(citizenUuid: string): Promise<Blob | null> {
        return await this.requestBlob(`/user/citizens/${citizenUuid}/tooth-chart/pdf`, 'GET')
    }
}

export const toothChartService = new ToothChartService()
