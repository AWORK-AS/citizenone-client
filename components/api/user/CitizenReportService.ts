import BaseAPIService from '@/components/api/BaseAPIService'
import APIError from '@/components/api/user/APIError'

class CitizenReportService extends BaseAPIService {
    async getReports(params: object): Promise<any> {
        return await this.request(`/user/reports`, 'GET', params)
    }

    async getReportsByCitizen(citizenUuid: any, params: object): Promise<any> {
        return await this.request(`/user/reports/citizen/${citizenUuid}`, 'GET', params)
    }

    async getReport(uuid: any): Promise<any> {
        return await this.request(`/user/reports/${uuid}`, 'GET')
    }

    async saveReport(params: object): Promise<any> {
        return await this.request(`/user/reports`, 'POST', params)
    }

    async updateReport(uuid: any, params: object): Promise<any> {
        return await this.request(`/user/reports/${uuid}`, 'PUT', params)
    }

    async finalizeReport(uuid: any): Promise<any> {
        return await this.request(`/user/reports/${uuid}/finalize`, 'POST')
    }

    async deleteReport(uuid: any): Promise<any> {
        return await this.request(`/user/reports/${uuid}`, 'DELETE')
    }

    async getPublicReport(token: any): Promise<any> {
        const runtimeConfig = useRuntimeConfig()
        try {
            return await $fetch(`/reports/public/${token}`, {
                baseURL: runtimeConfig.public.apiBaseURL,
                method: 'GET',
                headers: { Accept: 'application/json' },
            })
        } catch (error: any) {
            throw new APIError(error.response?._data ?? { message: 'Report not found.' })
        }
    }
}

export const citizenReportService = new CitizenReportService()
