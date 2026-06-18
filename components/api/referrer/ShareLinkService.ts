import BaseAPIService from '@/components/api/BaseAPIService'

class ShareLinkService extends BaseAPIService {
    async getShareLink(uuid: string): Promise<any> {
        return await this.request(`/referrer/share-links/${uuid}`, 'GET')
    }
}

export const shareLinkService = new ShareLinkService()
