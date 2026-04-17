import BaseAPIService from '@/components/api/BaseAPIService'

class GoogleDriveService extends BaseAPIService {

    async getGoogleDriveAuthUrl(): Promise<any> {
        return await this.request('/user/google-drive/auth-url', 'GET')
    }

    async completeGoogleDriveAuth(code: string): Promise<any> {
        return await this.request('/user/google-drive/callback', 'POST', { code })
    }

    async getGoogleDriveStatus(): Promise<any> {
        return await this.request('/user/google-drive/status', 'GET')
    }

    async getGoogleDriveFiles(parentFolderId?: string, search?: string): Promise<any> {
        return await this.request('/user/google-drive/files', 'GET', {
            ...(parentFolderId && { folder_id: parentFolderId }),
            ...(search && { search }),
        })
    }

    async getGoogleDriveFolders(parentFolderId?: string): Promise<any> {
        const response = await this.request('/user/google-drive/files', 'GET', {
            type: 'folder',
            ...(parentFolderId && { folder_id: parentFolderId }),
        })
        return response?.files ?? []
    }

    async uploadFileToGoogleDrive(file: File, parentFolderId?: string): Promise<any> {
        const formData = new FormData()
        formData.append('file', file)
        if (parentFolderId) formData.append('parent_id', parentFolderId)
        return await this.requestFormData('/user/google-drive/upload', formData)
    }

    async createGoogleDriveFolder(folderName: string, parentFolderId?: string): Promise<any> {
        return await this.request('/user/google-drive/create-folder', 'POST', {
            name: folderName,
            ...(parentFolderId && { parent_id: parentFolderId }),
        })
    }

    async deleteGoogleDriveFile(fileId: string): Promise<any> {
        return await this.request('/user/google-drive/delete', 'POST', { file_id: fileId })
    }

    async moveGoogleDriveFile(fileId: string, parentId: string): Promise<any> {
        return await this.request('/user/google-drive/move', 'POST', { file_id: fileId, new_parent_id: parentId })
    }

    async updateGoogleDriveFile(fileId: string, params: any): Promise<any> {
        return await this.request(`/user/google-drive/files/${fileId}`, 'PATCH', params)
    }

    async generateFormPdf(formUuid: string, responses: Record<string, any>, parentId?: string, uploadToDrive: boolean = true): Promise<any> {
        return await this.request('/user/google-drive/generate-form-pdf', 'POST', {
            form_uuid: formUuid,
            responses,
            parent_id: parentId,
            upload_to_drive: uploadToDrive,
        })
    }

    async generateFormPdfAndDownload(formUuid: string, responses: Record<string, any>, parentId?: string, uploadToDrive: boolean = true): Promise<Blob | null> {
        return await this.requestBlob('/user/google-drive/generate-form-pdf', 'POST', {
            form_uuid: formUuid,
            responses,
            parent_id: parentId,
            upload_to_drive: uploadToDrive,
        })
    }
}

export const googledriveService = new GoogleDriveService()
