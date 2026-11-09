import BaseAPIService from '@/components/api/BaseAPIService'

/**
 * Standard documents: company files an Admin has chosen to show every patient,
 * read-only. Staff flag them from Drive; staff and patients read them through
 * the lists below. Also holds the staff "Move to Treatment photos" call, which
 * belongs to the patient's documents.
 */
class StandardDocumentService extends BaseAPIService {
    // Drive (Admin only). `uuid` is a company file or folder.
    async setPatientStandard(uuid: string, isPatientStandard: boolean): Promise<any> {
        return await this.request(`/user/company-file-folders/${uuid}/patient-standard`, 'PATCH', {
            is_patient_standard: isPatientStandard,
        })
    }

    // How many patients will see a standard document, for the confirmation text.
    async getPatientStandardCount(): Promise<any> {
        return await this.request(`/user/company-file-folders/all/patient-standard-count`, 'GET')
    }

    // Staff, inside a patient's record.
    async listForCitizen(citizenUuid: string): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/standard-documents`, 'GET')
    }

    async downloadForCitizen(citizenUuid: string, docUuid: string): Promise<Blob | null> {
        return await this.requestBlob(`/user/citizens/${citizenUuid}/standard-documents/${docUuid}/download`, 'GET')
    }

    async viewForCitizen(citizenUuid: string, docUuid: string): Promise<Blob | null> {
        return await this.requestBlob(`/user/citizens/${citizenUuid}/standard-documents/${docUuid}/view`, 'GET')
    }

    // Patient portal.
    async listForPatient(): Promise<any> {
        return await this.request(`/patient/standard-documents`, 'GET')
    }

    async downloadForPatient(docUuid: string): Promise<Blob | null> {
        return await this.requestBlob(`/patient/standard-documents/${docUuid}/download`, 'GET')
    }

    async viewForPatient(docUuid: string): Promise<Blob | null> {
        return await this.requestBlob(`/patient/standard-documents/${docUuid}/view`, 'GET')
    }

    // Staff: turns an existing image document into a treatment photo.
    async moveToTreatmentPhotos(citizenUuid: string, fileUuid: string, body: object = { category: 'treatment_photo' }): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/files/${fileUuid}/category`, 'PATCH', body)
    }
}

export const standardDocumentService = new StandardDocumentService()
