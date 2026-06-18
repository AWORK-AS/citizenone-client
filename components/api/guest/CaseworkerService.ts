import BaseAPIService from "@/components/api/BaseAPIService";

class CaseworkerService extends BaseAPIService {
  	async authenticateCaseworker(uuid: string, params: object): Promise<any> {
    	return await this.request(`/guest/caseworker/${uuid}/auth`, "POST", params);
  	}

  	async verifyCaseworker(uuid: string): Promise<any> {
    	return await this.request(`/guest/caseworker/${uuid}/verify`, "GET");
  	}

  	async getDashboard(uuid: string): Promise<any> {
    	return await this.request(`/guest/caseworker/${uuid}/dashboard`, "GET");
  	}

  	async getFolders(uuid: string): Promise<any> {
    	return await this.request(`/guest/caseworker/${uuid}/folders`, "GET");
  	}

  	async getFolderContents(uuid: string, folderId: string): Promise<any> {
    	return await this.request(`/guest/caseworker/${uuid}/folder/${folderId}`, "GET");
  	}

  	async getReports(uuid: string): Promise<any> {
    	return await this.request(`/guest/caseworker/${uuid}/reports`, "GET");
  	}

  	async getMessages(uuid: string): Promise<any> {
    	return await this.request(`/guest/caseworker/${uuid}/messages`, "GET");
  	}

  	async sendMessage(uuid: string, params: object): Promise<any> {
    	return await this.request(`/guest/caseworker/${uuid}/messages`, "POST", params);
  	}

  	async sendMessageWithFiles(uuid: string, formData: FormData): Promise<any> {
    	return await this.requestFormData(`/guest/caseworker/${uuid}/messages`, formData);
  	}

  	async downloadFile(uuid: string, fileUuid: string): Promise<Blob | null> {
    	return await this.requestBlob(`/guest/caseworker/${uuid}/download/${fileUuid}`, "GET");
  	}

  	async logout(uuid: string): Promise<any> {
    	return await this.request(`/guest/caseworker/${uuid}/logout`, "POST");
  	}

    // Guest portal manages its own auth state — never redirect or touch the main app token
    revokeAccess() { /* intentionally empty */ }
}

export const caseworkerService = new CaseworkerService();
