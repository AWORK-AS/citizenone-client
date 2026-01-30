import BaseAPIService from '@/components/api/BaseAPIService'


class GoogleDriveService extends BaseAPIService {

    async getGoogleDriveAuthUrl(): Promise<any> {
        // Call the Nuxt server route instead of backend directly
        const token = localStorage.getItem('_token')
        const headers: Record<string, string> = {
            Accept: 'application/json',
        }

        if (token) {
            headers.Authorization = `Bearer ${token}`
        }

        return await $fetch('/api/google-drive/auth-url', {
            method: 'GET',
            headers,
        })
    }

    async completeGoogleDriveAuth(code: string): Promise<any> {
        // Call the Nuxt server route instead of backend directly
        const token = localStorage.getItem('_token')
        const headers: Record<string, string> = {
            Accept: 'application/json',
        }

        if (token) {
            headers.Authorization = `Bearer ${token}`
        }

        return await $fetch('/api/google-drive/callback', {
            method: 'POST',
            headers,
            body: { code },
        })
    }

    async getGoogleDriveStatus(): Promise<any> {
        // Check if Google Drive is actually connected
        const token = localStorage.getItem('_token')
        const headers: Record<string, string> = {
            Accept: 'application/json',
        }

        if (token) {
            headers.Authorization = `Bearer ${token}`
        }

        return await $fetch('/api/google-drive/status', {
            method: 'GET',
            headers,
        })
    }

    async getGoogleDriveFiles(parentFolderId?: string): Promise<any> {
        const token = localStorage.getItem('_token')
        const headers: Record<string, string> = {
            Accept: 'application/json',
        }

        if (token) {
            headers.Authorization = `Bearer ${token}`
        }

        return await $fetch('/api/google-drive/files', {
            method: 'GET',
            headers,
            query: parentFolderId ? { parent_id: parentFolderId, folder_id: parentFolderId } : undefined,
        })
    }

    async uploadFileToGoogleDrive(file: File, parentFolderId?: string): Promise<any> {
        const token = localStorage.getItem('_token')
        const formData = new FormData()
        formData.append('file', file)
        if (parentFolderId) {
            formData.append('parent_id', parentFolderId)
        }

        const headers: Record<string, string> = {}
        if (token) {
            headers.Authorization = `Bearer ${token}`
        }

        return await $fetch('/api/google-drive/upload', {
            method: 'POST',
            headers,
            body: formData,
        })
    }

    async createGoogleDriveFolder(folderName: string, parentFolderId?: string): Promise<any> {
        const token = localStorage.getItem('_token')
        const headers: Record<string, string> = {
            Accept: 'application/json',
        }

        if (token) {
            headers.Authorization = `Bearer ${token}`
        }

        return await $fetch('/api/google-drive/create-folder', {
            method: 'POST',
            headers,
            body: {
                name: folderName,
                ...(parentFolderId && { parent_id: parentFolderId })
            },
        })
    }

    async deleteGoogleDriveFile(fileId: string): Promise<any> {
        const token = localStorage.getItem('_token')
        const headers: Record<string, string> = {
            Accept: 'application/json',
        }

        if (token) {
            headers.Authorization = `Bearer ${token}`
        }

        return await $fetch('/api/google-drive/delete', {
            method: 'POST',
            headers,
            body: { file_id: fileId },
        })
    }

    async moveGoogleDriveFile(fileId: string, parentId: string): Promise<any> {
        const token = localStorage.getItem('_token')
        const headers: Record<string, string> = {
            Accept: 'application/json',
        }

        if (token) {
            headers.Authorization = `Bearer ${token}`
        }

        return await $fetch('/api/google-drive/move', {
            method: 'POST',
            headers,
            body: { file_id: fileId, parent_id: parentId, folder_id: parentId, new_parent_id: parentId },
        })
    }
}




export const googledriveService = new GoogleDriveService()