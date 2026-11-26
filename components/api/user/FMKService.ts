import BaseAPIService from '@/components/api/BaseAPIService'

class FMKService extends BaseAPIService {
    async getFMK(params: object): Promise<any> {
        return await this.request(`/user/fmk`, 'GET', params)
    }

    /** The citizen's FMK medicine card lined up with their CitizenOne medicines. */
    /** includeWithdrawn: also withdrawn and expired drug medications (GK 3.9). */
    async getMedicineCard(citizenUuid: string, includeWithdrawn = false): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/fmk/medicine-card`, 'GET', includeWithdrawn ? { include_withdrawn: 1 } : undefined)
    }

    /** Takes a drug medication from FMK over into CitizenOne (as a draft). */
    /** GK 4.3: the card including privacy-marked medication, on the citizen's consent or værdispring. */
    async getMedicineCardWithNegativeConsent(citizenUuid: string, reason: 'consent' | 'emergency'): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/fmk/medicine-card/negative-consent`, 'POST', { reason })
    }

    /** GK 7.3: the dose dispensing card, current and coming periods (only when staff ask). */
    async getDoseDispensingCard(citizenUuid: string): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/fmk/dose-dispensing-card`, 'GET')
    }

    /** GK 16.3: prescription requests sent for the citizen. */
    async getPrescriptionRequests(citizenUuid: string): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/fmk/prescription-requests`, 'GET')
    }

    /** GK 16.1: ask a doctor for a new prescription for one drug medication. */
    async requestPrescription(citizenUuid: string, payload: object): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/fmk/prescription-requests`, 'POST', payload)
    }

    /** GK 16.4: cancel an own request ("Receptanmodning fortrudt"). */
    async cancelPrescriptionRequest(citizenUuid: string, requestId: string): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/fmk/prescription-requests/${requestId}`, 'DELETE')
    }

    /** GK 16.5: the order basket. */
    async getBasket(citizenUuid: string): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/fmk/basket`, 'GET')
    }

    async addToBasket(citizenUuid: string, fmkDrugMedicationId: string): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/fmk/basket`, 'POST', { fmk_drug_medication_id: fmkDrugMedicationId })
    }

    async removeFromBasket(citizenUuid: string, itemUuid: string): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/fmk/basket/${itemUuid}`, 'DELETE')
    }

    /** GK 16.2/16.5: one order to the pharmacy for the ready items. */
    async orderBasket(citizenUuid: string, payload: object): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/fmk/basket/order`, 'POST', payload)
    }

    /** GK 12.6: FMK's PDF print of the card ("læge" or "borger"). */
    async getMedicineCardPdf(citizenUuid: string, type: 'læge' | 'borger' = 'læge'): Promise<Blob | null> {
        return await this.requestBlob(`/user/citizens/${citizenUuid}/fmk/medicine-card/pdf${type === 'borger' ? '?type=borger' : ''}`, 'GET')
    }

    async takeOver(citizenUuid: string, fmkDrugMedicationId: string): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/fmk/take-over`, 'POST', { fmk_drug_medication_id: fmkDrugMedicationId })
    }

    /** Staff have checked what changed in FMK since the medicine was taken over. */
    async acknowledge(citizenUuid: string, fmkDrugMedicationId: string): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/fmk/acknowledge`, 'POST', { fmk_drug_medication_id: fmkDrugMedicationId })
    }

    /** MitID Erhverv login via SEB: where to send the browser. */
    /** One drug medication's versions in FMK, to show what changed (only when staff ask). */
    async getDrugMedicationHistory(citizenUuid: string, fmkDrugMedicationId: string): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/fmk/drug-medications/${fmkDrugMedicationId}/history`, 'GET')
    }

    async startLogin(returnPath: string): Promise<any> {
        return await this.request(`/user/fmk-login`, 'POST', { return_path: returnPath })
    }

    async getLoginSession(): Promise<any> {
        return await this.request(`/user/fmk-login/session`, 'GET')
    }

    async chooseLoginRole(key: string): Promise<any> {
        return await this.request(`/user/fmk-login/session/role`, 'POST', { key })
    }

    async getSettings(): Promise<any> {
        return await this.request(`/user/fmk-settings`, 'GET')
    }

    async saveSettings(settings: object): Promise<any> {
        return await this.request(`/user/fmk-settings`, 'PUT', settings)
    }

    async getLicences(): Promise<any> {
        return await this.request(`/user/fmk-settings/licences`, 'GET')
    }

    async assignLicence(userUuid: string): Promise<any> {
        return await this.request(`/user/fmk-settings/licences`, 'POST', { user_uuid: userUuid })
    }

    async releaseLicence(userUuid: string): Promise<any> {
        return await this.request(`/user/fmk-settings/licences/${userUuid}`, 'DELETE')
    }

    async logout(): Promise<any> {
        return await this.request(`/user/fmk-login/session`, 'DELETE')
    }
}

export const fMKService = new FMKService()
