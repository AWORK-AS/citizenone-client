import BaseAPIService from '@/components/api/BaseAPIService'
import { formService } from '@/components/api/user/FormService'
import { surveyService } from '@/components/api/user/SurveyService'

export interface QuestionnaireInboxCounts {
    to_review: number
    awaiting: number
}

// Returned forms and surveys, in one list for staff to review. `type` is 'form' or 'survey'.
class QuestionnaireInboxService extends BaseAPIService {
    // `params.review_status` may be 'awaiting': sent and not answered yet. That tab also takes
    // `only_expired` (1) and `sort` ('oldest' | 'newest').
    async getQuestionnaires(params: object = {}): Promise<any> {
        return await this.request(`/user/questionnaire-inbox`, 'GET', params)
    }

    // The raw answer: { data: { to_review, awaiting } }. Kept for the callers that read it as it is.
    async getToReviewCount(): Promise<any> {
        return await this.request(`/user/questionnaire-inbox/count`, 'GET')
    }

    // Both numbers, always numbers (an older server that only knows to_review gives awaiting 0).
    async getCount(): Promise<QuestionnaireInboxCounts> {
        const response = await this.getToReviewCount()
        return {
            to_review: Number(response?.data?.to_review ?? 0),
            awaiting: Number(response?.data?.awaiting ?? 0),
        }
    }

    // What can be sent to this patient, and what is already waiting for an answer.
    async getSendOptions(citizenUuid: string): Promise<any> {
        return await this.request(`/user/questionnaire-inbox/send-options`, 'GET', { citizen_uuid: citizenUuid })
    }

    // Forms only: a new link for an assignment sent by email or SMS.
    async resend(assignmentUuid: string, params: object = {}): Promise<any> {
        return await formService.resendFormLink(assignmentUuid, params)
    }

    // A form is withdrawn by its assignment; a survey by its survey and assignment.
    async withdraw(type: string, assignmentUuid: string, questionnaireUuid?: string): Promise<any> {
        if (type === 'survey') {
            return await surveyService.deleteAssignment(questionnaireUuid, assignmentUuid)
        }
        return await formService.withdrawFormAssignment(assignmentUuid)
    }

    async getQuestionnaire(type: string, uuid: string): Promise<any> {
        return await this.request(`/user/questionnaire-inbox/${type}/${uuid}`, 'GET')
    }

    async approve(type: string, uuid: string, params: object = {}): Promise<any> {
        return await this.request(`/user/questionnaire-inbox/${type}/${uuid}/approve`, 'POST', params)
    }

    async decline(type: string, uuid: string, params: object): Promise<any> {
        return await this.request(`/user/questionnaire-inbox/${type}/${uuid}/decline`, 'POST', params)
    }

    async reopen(type: string, uuid: string): Promise<any> {
        return await this.request(`/user/questionnaire-inbox/${type}/${uuid}/reopen`, 'POST')
    }
}

export const questionnaireInboxService = new QuestionnaireInboxService()
