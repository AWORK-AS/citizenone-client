import BaseAPIService from "@/components/api/BaseAPIService";

class LicenseService extends BaseAPIService {
	async getLicenses(params: object): Promise<any> {
		return await this.request(`/user/licenses`, "GET", params);
	}

	async getCaseworkerLicenses(params: object): Promise<any> {
		return await this.request(`/user/licenses/all/caseworker`, "GET", params);
	}

	async getLicensesCount(): Promise<any> {
		return await this.request(`/user/licenses/all/count`, "GET");
	}

	async getDepartmentLicenses(params: object): Promise<any> {
		return await this.request(`/user/departments/settings/list`, "GET", params);
	}

	async getCaseworkerLicenseConfig(subscriptionUuid: string): Promise<any> {
		return await this.request(`/user/caseworker-licenses/${subscriptionUuid}`, "GET");
	}

	async updateCaseworkerLicenseConfig(subscriptionUuid: string, payload: object): Promise<any> {
		return await this.request(`/user/caseworker-licenses/${subscriptionUuid}`, "PUT", payload);
	}

	async addCaseworkerFolders(subscriptionUuid: string, payload: object): Promise<any> {
		return await this.request(`/user/caseworker-licenses/${subscriptionUuid}/folders/add`, "POST", payload);
	}

	async removeCaseworkerFolders(subscriptionUuid: string, payload: object): Promise<any> {
		return await this.request(`/user/caseworker-licenses/${subscriptionUuid}/folders/remove`, "POST", payload);
	}

	async addCaseworkerFiles(subscriptionUuid: string, payload: object): Promise<any> {
		return await this.request(`/user/caseworker-licenses/${subscriptionUuid}/files/add`, "POST", payload);
	}

	async removeCaseworkerFiles(subscriptionUuid: string, payload: object): Promise<any> {
		return await this.request(`/user/caseworker-licenses/${subscriptionUuid}/files/remove`, "POST", payload);
	}

	async setCaseworkerFolderAccess(subscriptionUuid: string, payload: object): Promise<any> {
		return await this.request(`/user/caseworker-licenses/${subscriptionUuid}/folder-access`, "POST", payload);
	}
}

export const licenseService = new LicenseService();
