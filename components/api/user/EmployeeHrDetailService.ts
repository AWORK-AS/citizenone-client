import BaseAPIService from '@/components/api/BaseAPIService'

export type HrGender = 'female' | 'male' | 'other'
export type HrTaxCardType = 'main' | 'secondary' | 'self_employed'

export interface HrDetailLookup {
    uuid: string
    name: string
}

export interface EmployeeHrDetails {
    private_email: string | null
    private_phone: string | null
    work_phone: string | null
    gender: HrGender | null
    nationality: HrDetailLookup | null
    manager: HrDetailLookup | null
    pension_start_date: string | null
    lunch_scheme: string | null
    flex_job: string | null
    section_56: boolean | null
    days_per_week: number | null
    termination_reason: string | null
    three_month_interview_at: string | null
    other_work: string | null
    working_hours_comment: string | null
    not_work_with: string | null
    sim_card: string | null
    // Only present when the backend allows the caller to see bank data.
    can_see_bank?: boolean
    tax_card_type?: HrTaxCardType | null
    bank_reg_no?: string | null
    bank_account_no?: string | null
    cvr?: string | null
}

// A subset of the fields, written as the backend names them. A key left out is
// unchanged and null clears it.
export type EmployeeHrDetailsPayload = Partial<Omit<EmployeeHrDetails, 'nationality' | 'manager' | 'can_see_bank'>> & {
    nationality_country_uuid?: string | null
    manager_uuid?: string | null
}

class EmployeeHrDetailService extends BaseAPIService {
    async getHrDetails(employeeUuid: string): Promise<{ data: EmployeeHrDetails }> {
        return await this.request(`/user/employees/${employeeUuid}/hr-details`, 'GET')
    }

    async updateHrDetails(employeeUuid: string, params: EmployeeHrDetailsPayload): Promise<{ data: EmployeeHrDetails }> {
        return await this.request(`/user/employees/${employeeUuid}/hr-details`, 'PUT', params)
    }
}

export const employeeHrDetailService = new EmployeeHrDetailService()
