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

    async updateGeneralNotes(citizenUuid: string, params: object): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/tooth-chart/general-notes`, 'PUT', params)
    }

    async downloadPdf(citizenUuid: string): Promise<Blob | null> {
        return await this.requestBlob(`/user/citizens/${citizenUuid}/tooth-chart/pdf`, 'GET')
    }
}

export const toothChartService = new ToothChartService()
