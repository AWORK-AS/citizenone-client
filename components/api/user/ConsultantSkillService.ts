import BaseAPIService from '@/components/api/BaseAPIService'

class ConsultantSkillService extends BaseAPIService {
    async getSkills(params: object = {}): Promise<any> {
        return await this.request(`/user/consultant-skills/all/list`, 'GET', params)
    }

    async saveSkill(params: object): Promise<any> {
        return await this.request(`/user/consultant-skills`, 'POST', params)
    }

    async updateSkill(skillUuid: string, params: object): Promise<any> {
        return await this.request(`/user/consultant-skills/${skillUuid}`, 'PUT', params)
    }

    async deleteSkill(skillUuid: string): Promise<any> {
        return await this.request(`/user/consultant-skills/${skillUuid}`, 'DELETE')
    }

    // One consultant: what they can do, and whether they can be put forward.
    async getConsultantSkills(userUuid: string): Promise<any> {
        return await this.request(`/user/consultant-skills/consultant/${userUuid}`, 'GET')
    }

    async saveConsultantSkills(userUuid: string, skills: object[]): Promise<any> {
        return await this.request(`/user/consultant-skills/consultant/${userUuid}`, 'PUT', { skills })
    }

    async getProfile(userUuid: string): Promise<any> {
        return await this.request(`/user/consultant-skills/consultant/${userUuid}/profile`, 'GET')
    }

    async saveProfile(userUuid: string, params: object): Promise<any> {
        return await this.request(`/user/consultant-skills/consultant/${userUuid}/profile`, 'PUT', params)
    }

    // Consultants against what a case needs. Everyone comes back, with what
    // each one meets and misses.
    async match(criteria: object): Promise<any> {
        return await this.request(`/user/consultant-skills/match`, 'POST', criteria)
    }
}

export const consultantSkillService = new ConsultantSkillService()
