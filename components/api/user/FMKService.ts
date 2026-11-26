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
