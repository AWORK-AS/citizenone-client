import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenInvoiceService extends BaseAPIService {
    async getReport(params: object): Promise<any> {
        return await this.request(`/user/invoice-reports`, 'GET', params)
    }

    async exportReport(params: object): Promise<Blob | null> {
        return await this.requestBlob(`/user/invoice-reports/export`, 'GET', params)
    }

    async getPaymentStatus(): Promise<any> {
        return await this.request(`/user/payment-links/status`, 'GET')
    }

    async startPaymentOnboarding(params: object = {}): Promise<any> {
        return await this.request(`/user/payment-links/onboarding`, 'POST', params)
    }

    async createPaymentLink(uuid: string): Promise<any> {
        return await this.request(`/user/citizen-invoices/${uuid}/payment-link`, 'POST')
    }

    async getSettings(): Promise<any> {
        return await this.request(`/user/invoice-settings`, 'GET')
    }

    async updateSettings(params: object): Promise<any> {
        return await this.request(`/user/invoice-settings`, 'PUT', params)
    }

    async previewPdf(templateUuid: string | null = null): Promise<Blob | null> {
        return await this.requestBlob(`/user/invoice-preview`, 'GET', templateUuid ? { template: templateUuid } : {})
    }

    async getTemplates(): Promise<any> {
        return await this.request(`/user/invoice-templates`, 'GET')
    }

    async createTemplate(params: object): Promise<any> {
        return await this.request(`/user/invoice-templates`, 'POST', params)
    }

    async updateTemplate(uuid: string, params: object): Promise<any> {
        return await this.request(`/user/invoice-templates/${uuid}`, 'PUT', params)
    }

    async deleteTemplate(uuid: string): Promise<any> {
        return await this.request(`/user/invoice-templates/${uuid}`, 'DELETE')
    }

    async getServiceCategories(): Promise<any> {
        return await this.request(`/user/service-categories`, 'GET')
    }

    async createServiceCategory(params: object): Promise<any> {
        return await this.request(`/user/service-categories`, 'POST', params)
    }

    async updateServiceCategory(uuid: string, params: object): Promise<any> {
        return await this.request(`/user/service-categories/${uuid}`, 'PUT', params)
    }

    async deleteServiceCategory(uuid: string): Promise<any> {
        return await this.request(`/user/service-categories/${uuid}`, 'DELETE')
    }

    async getServices(): Promise<any> {
        return await this.request(`/user/services`, 'GET')
    }

    async createService(params: object): Promise<any> {
        return await this.request(`/user/services`, 'POST', params)
    }

    async updateService(uuid: string, params: object): Promise<any> {
        return await this.request(`/user/services/${uuid}`, 'PUT', params)
    }

    async deleteService(uuid: string): Promise<any> {
        return await this.request(`/user/services/${uuid}`, 'DELETE')
    }

    async getForCitizen(citizenUuid: string): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/invoices`, 'GET')
    }

    async getForCompany(params: object): Promise<any> {
        return await this.request(`/user/citizen-invoices`, 'GET', params)
    }

    async createInvoice(citizenUuid: string, params: object): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/invoices`, 'POST', params)
    }

    async updateInvoice(uuid: string, params: object): Promise<any> {
        return await this.request(`/user/citizen-invoices/${uuid}`, 'PUT', params)
    }

    async updateStatus(uuid: string, params: object): Promise<any> {
        return await this.request(`/user/citizen-invoices/${uuid}/status`, 'PUT', params)
    }

    async addPayment(uuid: string, params: object): Promise<any> {
        return await this.request(`/user/citizen-invoices/${uuid}/payments`, 'POST', params)
    }

    async createFromEstimate(citizenUuid: string, estimateUuid: string): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/invoices/from-estimate/${estimateUuid}`, 'POST')
    }

    async sendInvoice(uuid: string): Promise<any> {
        return await this.request(`/user/citizen-invoices/${uuid}/send`, 'POST')
    }

    async createCreditNote(uuid: string, params: object = {}): Promise<any> {
        return await this.request(`/user/citizen-invoices/${uuid}/credit-note`, 'POST', params)
    }

    async downloadPdf(uuid: string): Promise<Blob | null> {
        return await this.requestBlob(`/user/citizen-invoices/${uuid}/pdf`, 'GET')
    }

    async deleteInvoice(uuid: string): Promise<any> {
        return await this.request(`/user/citizen-invoices/${uuid}`, 'DELETE')
    }
}

export const citizenInvoiceService = new CitizenInvoiceService()
