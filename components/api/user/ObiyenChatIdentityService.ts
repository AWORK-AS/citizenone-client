import BaseAPIService from '@/components/api/BaseAPIService'

class ObiyenChatIdentityService extends BaseAPIService {
    /**
     * Who we are, signed, for the embedded Obiyen support chat.
     *
     * The signature is made on our server with a secret that never leaves it,
     * so this is the only place the widget can get one. `enabled: false` means
     * the environment has no secret configured - the chat still works, it just
     * talks to an anonymous visitor.
     */
    async getIdentity(): Promise<any> {
        return await this.request(`/user/obiyen-chat/identity`, 'GET')
    }
}

export const obiyenChatIdentityService = new ObiyenChatIdentityService()
