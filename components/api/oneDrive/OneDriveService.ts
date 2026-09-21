import BaseAPIService from '@/components/api/BaseAPIService'

export default class OneDriveService extends BaseAPIService {

  async getFiles(folderId?: string): Promise<any> {
    return folderId
      ? await this.request(`/user/onedrive/folder/${folderId}`, 'GET')
      : await this.request('/user/onedrive/files', 'GET')
  }

  async downloadOriginalFile(fileId: string): Promise<Blob> {
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('_token');
    const response = await fetch(`/api/user/onedrive/download/${fileId}`, {
      method: 'GET',
      headers: {
        'X-User-Id': String(userId),
        'Authorization': 'Bearer ' + token,
      },
    });
    if (!response.ok) {
      throw new Error('Kunne ikke hente originalfilen fra OneDrive');
    }
    return await response.blob();
  }

  async createFolder(folderName: string, userId: string, parentId?: string): Promise<any> {
    const body: any = { name: folderName };
    if (parentId) body.parent_id = parentId;
    return await $fetch('/api/user/onedrive/new-folder', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'X-User-Id': String(userId),
        'Authorization': 'Bearer ' + localStorage.getItem('_token')
      },
      body,
    });
  }

  async createDocument(documentName: string, userId: string, parentId?: string): Promise<any> {
    const body: any = { name: documentName };
    if (parentId) body.parent_id = parentId;
    return await $fetch('/api/user/onedrive/new-document', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'X-User-Id': String(userId),
        'Authorization': 'Bearer ' + localStorage.getItem('_token')
      },
      body,
    });
  }

  async renameFile(fileId: string, newName: string): Promise<any> {
    const userId = localStorage.getItem('user_id');
    return await $fetch('/api/user/onedrive/rename-file', {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'X-User-Id': userId || '',
        'Authorization': 'Bearer ' + localStorage.getItem('_token')
      },
      body: { fileId, newName },
    });
  }

  async getAccessToken(): Promise<string> {
    throw new Error('Not implemented')
  }

  async disconnectOneDrive(): Promise<any> {
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('_token');
    return await $fetch('/api/user/onedrive/disconnect', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'X-User-Id': String(userId),
        'Authorization': 'Bearer ' + token,
      },
    });
  }

  async getOneDriveAuthUrl(): Promise<any> {
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('_token');
    return await $fetch('/api/user/onedrive/auth-url', {
      method: 'GET',
      headers: {
        'X-User-Id': String(userId),
        'Authorization': 'Bearer ' + token,
      },
    });
  }

  /**
   * Starts the per-user Microsoft OAuth consent flow. Microsoft's COOP
   * headers block window.close() from a popup, so this leaves the page
   * rather than opening one - oauth.vue sends the user back to
   * `returnTo` (localStorage, since the redirect round-trips through
   * Microsoft) once consent completes.
   */
  async connectOneDrive(userId?: string | number, returnTo: string = '/apps?onedrive_connected=1'): Promise<void> {
    const response = await this.getOneDriveAuthUrl();
    const authUrl = response?.authUrl || response?.auth_url;
    if (!authUrl) {
      throw new Error('Could not start OneDrive connection');
    }
    if (userId) {
      localStorage.setItem('user_id', String(userId));
    }
    localStorage.setItem('onedrive_return_to', returnTo);
    window.location.href = authUrl;
  }

  async listFiles(folderId: string = 'root'): Promise<any> {
    const token = await this.getAccessToken()
    return await this.requestExternal(
      `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}/children`,
      'GET',
      null,
      { Authorization: `Bearer ${token}` }
    )
  }

  async uploadFile(folderId: string, file: File): Promise<any> {
    const userId = localStorage.getItem('user_id');
    const formData = new FormData();
    formData.append('file', file);

    return await $fetch(`/api/user/onedrive/upload-to-folder/${folderId || 'root'}`, {
      method: 'POST',
      headers: {
        'X-User-Id': String(userId),
        'Authorization': 'Bearer ' + localStorage.getItem('_token')
      },
      body: formData,
    });
  }

  async uploadeDocument(file: File): Promise<any> {
    const userId = localStorage.getItem('user_id');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);
    return await $fetch('/api/user/onedrive/uploade-document', {
      method: 'POST',
      headers: {
        'X-User-Id': String(userId),
        'Authorization': 'Bearer ' + localStorage.getItem('_token')
      },
      body: formData,
    });
  }

  async downloadFile(fileId: string): Promise<Blob> {
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('_token');
    const response = await fetch(`/api/user/onedrive/download-pdf/${fileId}`, {
      method: 'GET',
      headers: {
        'X-User-Id': String(userId),
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/pdf',
      },
    });
    if (response.ok) {
      return await response.blob();
    } else if (response.status === 406 || response.status === 415) {
      return await this.downloadOriginalFile(fileId);
    } else {
      throw new Error('Kunne ikke hente PDF fra OneDrive');
    }
  }

  async deleteFile(fileId: string): Promise<any> {
    const token = await this.getAccessToken()
    return await this.requestExternal(
      `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}`,
      'DELETE',
      null,
      { Authorization: `Bearer ${token}` }
    )
  }

  async requestExternal(url: string, method: string, data?: any, headers?: any) {
    throw new Error('Not implemented')
  }

  async moveFile(fileId: string, targetFolderId: string): Promise<any> {
    const userId = localStorage.getItem('user_id');
    return await $fetch('/api/user/onedrive/move-file', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'X-User-Id': userId || '',
        'Authorization': 'Bearer ' + localStorage.getItem('_token')
      },
      body: { fileId, targetFolderId },
    });
  }

  async searchFiles(query: string, userId: string): Promise<any> {
    return await $fetch('/api/user/onedrive/search', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-User-Id': String(userId),
        'Authorization': 'Bearer ' + localStorage.getItem('_token')
      },
      params: { q: query },
    });
  }

  async searchAllOneDrive(query: string, userId: string): Promise<any> {
    return await $fetch('/api/user/onedrive/search-all', {
      method: 'GET',
      headers: {
        'X-User-Id': String(userId),
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('_token')
      },
      params: { query },
    });
  }

  async searchAllOneDriveContent(query: string, userId: string): Promise<any> {
    return await $fetch('/api/user/onedrive/search-all-content', {
      method: 'GET',
      headers: {
        'X-User-Id': String(userId),
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('_token')
      },
      params: { query },
    });
  }
}
