/**
 * Unit tests for utils/citizenUpdateFormData.ts -- the body both citizen edit
 * pages send to POST /user/citizens/{uuid}/update (TKT-000138: the pencil
 * inside the citizen, view-edit.vue, left out 33 fields).
 *
 *   node --test tests/unit/citizenUpdateFormData.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const { buildCitizenUpdateFormData } = await import('../../utils/citizenUpdateFormData.ts')
const { useNumberFormatter } = await import('../../composables/numberFormatter.ts')
const { parseLocaleNumber } = useNumberFormatter()

// The 33 fields view-edit.vue did not send before TKT-000138.
const ADDED_FOR_VIEW_EDIT = [
    'activation_deadline', 'auto_reminder', 'case_end_date', 'case_start_date', 'checkup_interval_months',
    'danmark_group', 'employment_case_type_uuid', 'employment_status_type_uuid', 'financial_support_basis',
    'internship_company', 'is_foreign_patient', 'is_member_of_sygeforsikring_danmark', 'last_checkup_date',
    'latitude', 'longitude', 'municipal_subsidy', 'patient_number', 'primary_consultant_uuid', 'recall_channel',
    'referral_date', 'referral_reason', 'referrer_email', 'referrer_name', 'referrer_organization', 'referrer_phone',
    'reporting_requirements', 'risk_profile', 'risk_profile_note', 'secondary_case_worker_uuid',
    'secondary_consultant_uuid', 'sygesikring_group', 'total_weeks', 'weeks_used',
]

function citizen(overrides = {}) {
    return {
        image: '', firstname: 'A', lastname: 'B', gender: 'female', email: '', social_security_number: '',
        case_number: '', birthday: '', phone: '', departments: ['d1'], rooms: [], street: '', region: 'reg',
        municipality: 'mun', city: '', post_code: '', latitude: '55.67', longitude: '12.56', is_foreign_city: false,
        origin: 'o1', spoken_languages: [], primary_spoken_language: '', requires_interpreter: false,
        has_special_language: false, diagnoses: [], medication_allergies: [], addictions: [], date_admitted: '',
        date_discharged: '', is_discharge_reminded: false, section: '', pricing: '1.234,50', pricing_start_date: '',
        primary_case_worker_uuid: 'cw-1', secondary_case_worker_uuid: 'cw-2', paying_municipality: '',
        assessment_municipality: '', responsible_municipality: '', ean_number: '', transportation: '',
        hourly_rate: '', allocated_daily_hours: '', allocated_weekly_hours: '', allocated_monthly_hours: '',
        note: '', green: '', yellow: '', red: '', has_system_access: false, has_chat_access: false,
        has_patient_journal_access: false, has_duty_schedule_access: false, has_bullet_board_access: false,
        inquiryData: { inquiry_date: '', inquirer_name: '', outcome: '', purpose: '', conversation_summary: '' },
        stayData: {
            accommodation_end_date: '', accommodation_start_date: '', journal_number: '', contract_price: '',
            contract_hours: '', contract_hours_interval: 'weekly', primary_split_percentage: '',
            accompanying_children: [], residence_before_uuid: '', residence_after_uuid: '', discharge_reason: '',
            discharge_reason_uuid: null, consent_declarations: [], photo: false, parent_collaboration: false,
            student_collaboration: false, general_consent: false, personal_guardianship: false,
            financial_guardianship: false,
        },
        employmentData: {
            employment_case_type_uuid: 'ct', employment_status_type_uuid: 'st', financial_support_basis: 'f',
            primary_consultant_uuid: 'pc', secondary_consultant_uuid: 'sc', referrer_name: 'rn', referrer_phone: 'rp',
            referrer_email: 're', referrer_organization: 'ro', referral_date: '2026-01-02', case_start_date: 'Invalid date',
            case_end_date: '', total_weeks: '10', weeks_used: '2', reporting_requirements: 'rr',
            activation_deadline: '2026-03-04', referral_reason: 'rs', internship_company: 'ic',
        },
        dentalData: {
            is_member_of_sygeforsikring_danmark: true, danmark_group: 'g1', sygesikring_group: '1',
            is_foreign_patient: false, risk_profile: 'green', risk_profile_note: 'n', recall_channel: 'sms',
            auto_reminder: true, patient_number: 'p1', municipal_subsidy: 'm', last_checkup_date: '2026-05-06',
            checkup_interval_months: '6',
        },
        ...overrides,
    }
}

const build = (details, extra = {}) => buildCitizenUpdateFormData(details, { locale: 'dk', parseLocaleNumber, ...extra })

describe('buildCitizenUpdateFormData', () => {
    test('sends every field view-edit.vue used to leave out', () => {
        const fd = build(citizen(), { sendEmptyPricing: true })
        for (const key of ADDED_FOR_VIEW_EDIT) {
            assert.ok(fd.has(key), `missing ${key}`)
        }
    })

    test('the secondary case worker goes out as picked (the Birketoften case)', () => {
        assert.equal(build(citizen()).get('secondary_case_worker_uuid'), 'cw-2')
    })

    test('amounts are read in the UI language', () => {
        assert.equal(build(citizen()).get('pricing'), '1234.5')
        assert.equal(build(citizen({ pricing: '1,234.50' }), { locale: 'en' }).get('pricing'), '1234.5')
    })

    test('an emptied price: left out by default (edit.vue), sent empty with sendEmptyPricing (view-edit.vue)', () => {
        assert.equal(build(citizen({ pricing: '' })).has('pricing'), false)
        assert.equal(build(citizen({ pricing: '' }), { sendEmptyPricing: true }).get('pricing'), '')
    })

    test('"Invalid date" goes out empty', () => {
        assert.equal(build(citizen()).get('case_start_date'), '')
    })

    test('the map position is only sent as a pair', () => {
        const fd = build(citizen({ latitude: '', longitude: '12.56' }))
        assert.equal(fd.has('latitude'), false)
        assert.equal(fd.has('longitude'), false)
    })

    test('no employment or dental block, no employment or dental keys', () => {
        const fd = build(citizen({ employmentData: undefined, dentalData: undefined }))
        assert.equal(fd.has('employment_case_type_uuid'), false)
        assert.equal(fd.has('patient_number'), false)
    })
})

describe('both edit pages', () => {
    const page = name => readFileSync(new URL(`../../pages/citizens/[uuid]/${name}`, import.meta.url), 'utf8')

    test('build the body with the shared helper', () => {
        for (const name of ['edit.vue', 'view-edit.vue']) {
            const src = page(name)
            assert.match(src, /buildCitizenUpdateFormData\(citizenDetails/, name)
            assert.doesNotMatch(src, /new FormData\(\)/, name)
        }
    })

    // A field that is sent but not loaded goes out empty and clears what is stored.
    test('view-edit.vue loads every field it now sends, as edit.vue does', () => {
        const fetch = page('view-edit.vue').split('async function fetchCitizen')[1].split('async function updateCitizen')[0]
        for (const key of ADDED_FOR_VIEW_EDIT) {
            assert.match(fetch, new RegExp(`\\b${key}: response\\?\\.data\\?\\.`), `view-edit.vue does not load ${key}`)
        }
    })
})
