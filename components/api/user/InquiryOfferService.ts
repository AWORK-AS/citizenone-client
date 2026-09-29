import BaseAPIService from '@/components/api/BaseAPIService'

/**
 * The offer phase of an inquiry, and the company's price catalogue behind it.
 */
class InquiryOfferService extends BaseAPIService {
    async getOffers(inquiryUuid: string): Promise<any> {
        return await this.request(`/user/citizen-inquiries/${inquiryUuid}/offers`, 'GET')
    }

    async getContext(inquiryUuid: string): Promise<any> {
        return await this.request(`/user/citizen-inquiries/${inquiryUuid}/offers/context`, 'GET')
    }

    async calculate(inquiryUuid: string, params: object): Promise<any> {
        return await this.request(`/user/citizen-inquiries/${inquiryUuid}/offers/calculate`, 'POST', params)
    }

    async createOffer(inquiryUuid: string, params: object): Promise<any> {
        return await this.request(`/user/citizen-inquiries/${inquiryUuid}/offers`, 'POST', params)
    }

    async updateOffer(offerUuid: string, params: object): Promise<any> {
        return await this.request(`/user/inquiry-offers/${offerUuid}`, 'PUT', params)
    }

    async deleteOffer(offerUuid: string): Promise<any> {
        return await this.request(`/user/inquiry-offers/${offerUuid}`, 'DELETE')
    }

    async sendOffer(offerUuid: string, params: object): Promise<any> {
        return await this.request(`/user/inquiry-offers/${offerUuid}/send`, 'POST', params)
    }

    async respondToOffer(offerUuid: string, params: object): Promise<any> {
        return await this.request(`/user/inquiry-offers/${offerUuid}/respond`, 'POST', params)
    }

    async downloadPdf(offerUuid: string): Promise<Blob | null> {
        return await this.requestBlob(`/user/inquiry-offers/${offerUuid}/pdf`, 'GET')
    }

    async downloadDocx(offerUuid: string): Promise<Blob | null> {
        return await this.requestBlob(`/user/inquiry-offers/${offerUuid}/docx`, 'GET')
    }

    // Price catalogue

    async getSpecialLanguages(): Promise<any> {
        return await this.request(`/user/inquiry-pricing/special-languages`, 'GET')
    }

    async saveSpecialLanguages(spokenLanguageUuids: string[]): Promise<any> {
        return await this.request(`/user/inquiry-pricing/special-languages`, 'PUT', { spoken_language_uuids: spokenLanguageUuids })
    }

    async getPriceSettings(): Promise<any> {
        return await this.request(`/user/inquiry-pricing/price-settings`, 'GET')
    }

    async savePriceSetting(params: object): Promise<any> {
        return await this.request(`/user/inquiry-pricing/price-settings`, 'POST', params)
    }

    async updatePriceSetting(uuid: string, params: object): Promise<any> {
        return await this.request(`/user/inquiry-pricing/price-settings/${uuid}`, 'PUT', params)
    }

    async deletePriceSetting(uuid: string): Promise<any> {
        return await this.request(`/user/inquiry-pricing/price-settings/${uuid}`, 'DELETE')
    }

    async getRates(): Promise<any> {
        return await this.request(`/user/inquiry-pricing/rates`, 'GET')
    }

    async saveRate(params: object): Promise<any> {
        return await this.request(`/user/inquiry-pricing/rates`, 'POST', params)
    }

    async updateRate(uuid: string, params: object): Promise<any> {
        return await this.request(`/user/inquiry-pricing/rates/${uuid}`, 'PUT', params)
    }

    async deleteRate(uuid: string): Promise<any> {
        return await this.request(`/user/inquiry-pricing/rates/${uuid}`, 'DELETE')
    }

    async getTemplate(): Promise<any> {
        return await this.request(`/user/inquiry-pricing/template`, 'GET')
    }

    async saveTemplate(params: object): Promise<any> {
        return await this.request(`/user/inquiry-pricing/template`, 'PUT', params)
    }
}

export const inquiryOfferService = new InquiryOfferService()
