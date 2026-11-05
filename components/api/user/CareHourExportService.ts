import BaseAPIService from '@/components/api/BaseAPIService'

// Download history for Indsatstimer (kind 'hours') and Kørselsregnskab
// (kind 'mileage'): each report downloaded from Settings, ticked "Behandlet"
// once salary or mileage is paid, and downloadable again. Admins and users
// with the "read" permission, like the downloads themselves.
class CareHourExportService extends BaseAPIService {
    async getExports(params: { kind: 'hours' | 'mileage'; page?: number }): Promise<any> {
        return await this.request(`/user/care-hour-exports`, 'GET', params)
    }

    async setProcessed(exportUuid: string, processed: boolean): Promise<any> {
        return await this.request(`/user/care-hour-exports/${exportUuid}/processed`, 'PUT', { processed })
    }

    async downloadExport(exportUuid: string): Promise<any> {
        return await this.request(`/user/care-hour-exports/${exportUuid}/download`, 'GET')
    }
}

export const careHourExportService = new CareHourExportService()
