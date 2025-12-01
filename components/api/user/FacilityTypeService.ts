import BaseAPIService from '@/components/api/BaseAPIService'

class FacilityTypeService extends BaseAPIService {
    async getAllFacilityTypes(): Promise<any> {
        return await this.request(`/user/facility-types/all/list`, 'GET')
    }

    async getAllFacilityTypesWithoutAuthentication(): Promise<any> {
        return await this.request(`/facility-types/all/list`, 'GET')
    }
}

export const facilityTypeService = new FacilityTypeService()