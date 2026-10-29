import BaseAPIService from '@/components/api/BaseAPIService'

export interface SignupDraft {
    uuid: string
    tool: string
    // Arbitrary JSON from the public tool. Render it as text only.
    data: unknown
    created_at: string
}

class SignupDraftService extends BaseAPIService {
    async getDrafts(): Promise<{ data: SignupDraft[] }> {
        return await this.request(`/signup-drafts`, 'GET')
    }

    async deleteDraft(uuid: string): Promise<any> {
        return await this.request(`/signup-drafts/${uuid}`, 'DELETE')
    }
}

export const signupDraftService = new SignupDraftService()
