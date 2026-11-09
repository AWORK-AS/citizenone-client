import BaseAPIService from '@/components/api/BaseAPIService'

/**
 * Treatment photos: one service for both sides of the API. The staff methods
 * work on a citizen's record (`/user/citizens/{uuid}/...`), the `patient*`
 * methods on the signed-in patient's own photos (`/patient/...`).
 */
class TreatmentPhotoService extends BaseAPIService {
    // ---- Staff -----------------------------------------------------------

    async getPhotos(citizenUuid: string): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/treatment-photos`, 'GET')
    }

    async uploadPhotos(citizenUuid: string, formData: FormData): Promise<any> {
        // Files go through the form-data path, which leaves the boundary to
        // the browser instead of forcing a JSON content type.
        return await this.requestFormData(`/user/citizens/${citizenUuid}/treatment-photos`, formData)
    }

    async updatePhoto(citizenUuid: string, photoUuid: string, params: object): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/treatment-photos/${photoUuid}`, 'PATCH', params)
    }

    async deletePhoto(citizenUuid: string, photoUuid: string): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/treatment-photos/${photoUuid}`, 'DELETE')
    }

    async getPhotoFile(citizenUuid: string, photoUuid: string): Promise<Blob | null> {
        return await this.requestBlob(`/user/citizens/${citizenUuid}/treatment-photos/${photoUuid}/file`, 'GET')
    }

    async suggestMilestone(citizenUuid: string, takenAt: string): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/treatment-photos/suggest-milestone`, 'GET', {
            taken_at: takenAt,
        })
    }

    async updateTreatmentStart(citizenUuid: string, treatmentStartedAt: string | null): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/treatment-start`, 'PATCH', {
            treatment_started_at: treatmentStartedAt,
        })
    }

    /** Moves an existing document into (or back out of) Treatment photos. */
    async setFileCategory(citizenUuid: string, fileUuid: string, params: object): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/files/${fileUuid}/category`, 'PATCH', params)
    }

    async getMilestones(): Promise<any> {
        return await this.request(`/user/treatment-photo-milestones`, 'GET')
    }

    // ---- Patient ---------------------------------------------------------

    async getPatientPhotos(): Promise<any> {
        return await this.request(`/patient/treatment-photos`, 'GET')
    }

    async uploadPatientPhotos(formData: FormData): Promise<any> {
        return await this.requestFormData(`/patient/treatment-photos`, formData)
    }

    async deletePatientPhoto(photoUuid: string): Promise<any> {
        return await this.request(`/patient/treatment-photos/${photoUuid}`, 'DELETE')
    }

    async getPatientPhotoFile(photoUuid: string): Promise<Blob | null> {
        return await this.requestBlob(`/patient/treatment-photos/${photoUuid}/file`, 'GET')
    }

    async getPatientMilestones(): Promise<any> {
        return await this.request(`/patient/treatment-photo-milestones`, 'GET')
    }

    // ---- Helpers ---------------------------------------------------------

    /** Object URL for a downloaded image; pair every call with revokeObjectUrl. */
    createObjectUrl(blob: Blob): string {
        return URL.createObjectURL(blob)
    }

    revokeObjectUrl(url: string): void {
        try {
            URL.revokeObjectURL(url)
        } catch {
            // Nothing to release.
        }
    }
}

export const treatmentPhotoService = new TreatmentPhotoService()
