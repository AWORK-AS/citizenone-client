/**
 * The body of POST /user/citizens/{uuid}/update, built from what the citizen
 * form (components/modules/user/citizen/details/form.vue) emits on submit.
 *
 * Both edit pages build it here: pages/citizens/[uuid]/edit.vue (the citizen
 * list's pencil) and pages/citizens/[uuid]/view-edit.vue (the pencil inside
 * the citizen). They used to build it each on their own, and view-edit left
 * out 33 fields the form shows (secondary case worker, consultants, the
 * employment and dental fields, the map position). The backend keeps the
 * stored value of a field that is not sent, so a change to any of them was
 * dropped without a word (TKT-000138).
 *
 * Everything sent must also be loaded into the form when the page opens, or
 * an untouched field goes out empty and clears what was stored.
 */

export type ParseLocaleNumber = (language: string, value: any) => number

export interface CitizenUpdateFormDataOptions {
    /** The UI language, for reading amounts typed as 1.234,50 or 1,234.50. */
    locale: string
    parseLocaleNumber: ParseLocaleNumber
    /**
     * An emptied price: false leaves pricing out (the backend keeps the stored
     * price), true sends it empty (the backend clears it). edit.vue has always
     * left it out and view-edit.vue has always sent it; each keeps its way.
     */
    sendEmptyPricing?: boolean
}

export function buildCitizenUpdateFormData(citizenDetails: any, options: CitizenUpdateFormDataOptions): FormData {
    const { locale, parseLocaleNumber, sendEmptyPricing = false } = options
    const pricingStr = citizenDetails.pricing

    const params = new FormData()
    params.append('image', citizenDetails.image)
    params.append('firstname', citizenDetails.firstname)
    params.append('lastname', citizenDetails.lastname)
    params.append('gender', citizenDetails.gender)
    params.append('email', citizenDetails.email)
    params.append('social_security_number', citizenDetails.social_security_number)
    params.append('case_number', citizenDetails.case_number ?? '')
    // Sent even when empty: clearing the frequency is how a reporting
    // requirement is lifted, and the reminder goes with it.
    params.append('reporting_frequency', citizenDetails.reporting_frequency ?? '')
    params.append('reporting_starts_on', citizenDetails.reporting_starts_on ?? '')
    // Only meaningful with a frequency; cleared with it.
    params.append('report_draft_days_before', citizenDetails.reporting_frequency ? (citizenDetails.report_draft_days_before ?? '') : '')
    params.append('birthday', citizenDetails.birthday)
    params.append('phone', citizenDetails.phone)
    params.append('departments_uuid', JSON.stringify(citizenDetails.departments))
    if (citizenDetails.rooms) {
        params.append('room_uuid', JSON.stringify(citizenDetails.rooms))
    }
    params.append('street', citizenDetails.street)
    if (citizenDetails.region) {
        params.append('region_uuid', citizenDetails.region)
    } else {
        params.append('region_uuid', '')
    }
    if (citizenDetails.municipality) {
        params.append('municipality_uuid', citizenDetails.municipality)
    } else {
        params.append('municipality_uuid', '')
    }
    params.append('city', citizenDetails.city)
    params.append('post_code', citizenDetails.post_code)
    if (citizenDetails.latitude && citizenDetails.longitude) {
        params.append('latitude', citizenDetails.latitude)
        params.append('longitude', citizenDetails.longitude)
    }
    if (citizenDetails.is_foreign_city) {
        params.append('foreign_city_uuid', citizenDetails.foreign_city)
    } else {
        params.append('origin_uuid', citizenDetails.origin)
    }
    params.append('spoken_languages_uuid', JSON.stringify(citizenDetails.spoken_languages ?? []))
    params.append('primary_spoken_language_uuid', citizenDetails.primary_spoken_language ?? '')
    params.append('requires_interpreter', citizenDetails.requires_interpreter ? 'true' : 'false')
    params.append('has_special_language', citizenDetails.has_special_language ? 'true' : 'false')
    params.append('diagnoses_uuid', JSON.stringify(citizenDetails.diagnoses))
    params.append('medication_allergies_uuid', JSON.stringify(citizenDetails.medication_allergies))
    params.append('addictions_uuid', JSON.stringify(citizenDetails.addictions))
    params.append('date_admitted', citizenDetails.date_admitted != 'Invalid date' ? citizenDetails.date_admitted : '')
    params.append('date_discharged', citizenDetails.date_discharged != 'Invalid date' ? citizenDetails.date_discharged : '')
    params.append('is_discharge_reminded', citizenDetails.is_discharge_reminded)
    params.append('section', citizenDetails.section)

    if (citizenDetails.pricing) {
        const normalizedPricing = parseLocaleNumber(locale, pricingStr) as any
        params.append('pricing', normalizedPricing)
    } else if (sendEmptyPricing) {
        params.append('pricing', citizenDetails.pricing)
    }

    params.append('pricing_start_date', citizenDetails.pricing_start_date)
    params.append('primary_case_worker_uuid', citizenDetails.primary_case_worker_uuid)
    params.append('secondary_case_worker_uuid', citizenDetails.secondary_case_worker_uuid)
    params.append('paying_municipality', citizenDetails.paying_municipality)
    params.append('assessment_municipality', citizenDetails.assessment_municipality)
    params.append('responsible_municipality', citizenDetails.responsible_municipality)
    params.append('ean_number', citizenDetails.ean_number)
    params.append('transportation', citizenDetails.transportation)
    params.append('hourly_rate', citizenDetails.hourly_rate ? parseLocaleNumber(locale, citizenDetails.hourly_rate) as any : citizenDetails.hourly_rate)
    params.append('allocated_daily_hours', citizenDetails.allocated_daily_hours)
    params.append('allocated_weekly_hours', citizenDetails.allocated_weekly_hours)
    params.append('allocated_monthly_hours', citizenDetails.allocated_monthly_hours)
    params.append('note', citizenDetails.note)
    params.append('green', citizenDetails.green)
    params.append('yellow', citizenDetails.yellow)
    params.append('red', citizenDetails.red)
    params.append('has_system_access', citizenDetails.has_system_access)
    params.append('has_chat_access', citizenDetails.has_chat_access)
    params.append('has_patient_journal_access', citizenDetails.has_patient_journal_access ?? false)
    params.append('has_duty_schedule_access', citizenDetails.has_duty_schedule_access)
    params.append('has_bullet_board_access', citizenDetails.has_bullet_board_access)
    params.append('inquiry_date', citizenDetails.inquiryData.inquiry_date)
    params.append('inquirer_name', citizenDetails.inquiryData.inquirer_name)
    params.append('outcome', citizenDetails.inquiryData.outcome)
    params.append('purpose', citizenDetails.inquiryData.purpose)
    params.append('conversation_summary', citizenDetails.inquiryData.conversation_summary)
    params.append('end_date', citizenDetails.stayData.accommodation_end_date)
    params.append('start_date', citizenDetails.stayData.accommodation_start_date)
    params.append('journal_number', citizenDetails.stayData.journal_number)
    params.append('contract_price', citizenDetails.stayData.contract_price ? parseLocaleNumber(locale, citizenDetails.stayData.contract_price) as any : citizenDetails.stayData.contract_price)
    params.append('contract_hours', citizenDetails.stayData.contract_hours ?? '')
    params.append('contract_hours_interval', citizenDetails.stayData.contract_hours_interval ?? '')
    params.append('primary_split_percentage', citizenDetails.stayData.primary_split_percentage)
    params.append('accompanying_children', JSON.stringify(citizenDetails.stayData.accompanying_children))
    if (citizenDetails.stayData.residence_before_uuid) {
        params.append('residence_before_uuid', citizenDetails.stayData.residence_before_uuid)
    }
    if (citizenDetails.stayData.residence_after_uuid) {
        params.append('residence_after_uuid', citizenDetails.stayData.residence_after_uuid)
    }
    params.append('discharge_reason', citizenDetails.stayData.discharge_reason)
    params.append('discharge_reason_uuid', citizenDetails.stayData.discharge_reason_uuid ?? '')
    params.append('consent_declarations', JSON.stringify(citizenDetails.stayData.consent_declarations))
    params.append('photo', citizenDetails.stayData.photo)
    params.append('parent_collaboration', citizenDetails.stayData.parent_collaboration)
    params.append('student_collaboration', citizenDetails.stayData.student_collaboration)
    params.append('general_consent', citizenDetails.stayData.general_consent)
    params.append('personal_guardianship', citizenDetails.stayData.personal_guardianship)
    params.append('financial_guardianship', citizenDetails.stayData.financial_guardianship)
    if (citizenDetails.employmentData) {
        params.append('employment_case_type_uuid', citizenDetails.employmentData.employment_case_type_uuid)
        params.append('employment_status_type_uuid', citizenDetails.employmentData.employment_status_type_uuid)
        params.append('financial_support_basis', citizenDetails.employmentData.financial_support_basis)
        params.append('primary_consultant_uuid', citizenDetails.employmentData.primary_consultant_uuid)
        params.append('secondary_consultant_uuid', citizenDetails.employmentData.secondary_consultant_uuid)
        params.append('referrer_name', citizenDetails.employmentData.referrer_name)
        params.append('referrer_phone', citizenDetails.employmentData.referrer_phone)
        params.append('referrer_email', citizenDetails.employmentData.referrer_email)
        params.append('referrer_organization', citizenDetails.employmentData.referrer_organization)
        params.append('referral_date', citizenDetails.employmentData.referral_date != 'Invalid date' ? citizenDetails.employmentData.referral_date : '')
        params.append('case_start_date', citizenDetails.employmentData.case_start_date != 'Invalid date' ? citizenDetails.employmentData.case_start_date : '')
        params.append('case_end_date', citizenDetails.employmentData.case_end_date != 'Invalid date' ? citizenDetails.employmentData.case_end_date : '')
        params.append('total_weeks', citizenDetails.employmentData.total_weeks)
        params.append('weeks_used', citizenDetails.employmentData.weeks_used)
        params.append('reporting_requirements', citizenDetails.employmentData.reporting_requirements)
        params.append('activation_deadline', citizenDetails.employmentData.activation_deadline != 'Invalid date' ? citizenDetails.employmentData.activation_deadline : '')
        params.append('referral_reason', citizenDetails.employmentData.referral_reason)
        params.append('internship_company', citizenDetails.employmentData.internship_company)
    }
    if (citizenDetails.dentalData) {
        params.append('is_member_of_sygeforsikring_danmark', citizenDetails.dentalData.is_member_of_sygeforsikring_danmark)
        params.append('sygesikring_group', citizenDetails.dentalData.sygesikring_group)
        params.append('patient_number', citizenDetails.dentalData.patient_number)
        params.append('municipal_subsidy', citizenDetails.dentalData.municipal_subsidy)
        params.append('last_checkup_date', citizenDetails.dentalData.last_checkup_date != 'Invalid date' ? citizenDetails.dentalData.last_checkup_date : '')
        params.append('checkup_interval_months', citizenDetails.dentalData.checkup_interval_months)
        params.append('danmark_group', citizenDetails.dentalData.danmark_group)
        params.append('is_foreign_patient', citizenDetails.dentalData.is_foreign_patient)
        params.append('risk_profile', citizenDetails.dentalData.risk_profile)
        params.append('risk_profile_note', citizenDetails.dentalData.risk_profile_note)
        params.append('recall_channel', citizenDetails.dentalData.recall_channel)
        params.append('auto_reminder', citizenDetails.dentalData.auto_reminder)
    }
    return params
}
