// The built-in inquiry fields, labelled with the same strings the forms
// themselves use rather than a second set that can drift away from them.
export const CORE_FIELD_LABELS: Record<string, string> = {
    inquiry_date: 'inquiries.form.dateOfInquiry',
    department_uuid: 'department.department',
    company_contact: 'inquiryContact.label',
    inquirer_name: 'inquiries.form.inquirerName',
    contacted_by: 'inquiries.form.crisisCenter.fields.contactedBy',

    first_name: 'inquiries.form.firstname',
    last_name: 'inquiries.form.lastname',
    cpr: 'inquiries.form.cpr',
    cpr_missing_reason: 'inquiries.form.shelter.fields.cprMissingReason',

    purpose: 'inquiries.form.purpose',
    outcome: 'inquiries.form.outcome',
    conversation_summary: 'inquiries.form.conversationSummary',
    notes: 'inquiries.form.notes',
    topic: 'inquiries.form.crisisCenter.fields.topic',
    guidance: 'inquiries.form.crisisCenter.fields.guidance',
    assessment: 'inquiries.form.crisisCenter.fields.assessment',
    assessment_reason: 'inquiries.form.crisisCenter.fields.notOfferedInterview',

    received_visit: 'inquiries.form.crisisCenter.fields.receivedVisit',

    in_shelter_target_group: 'inquiries.form.shelter.fields.inShelterTargetGroup',
    fits_in_target_group: 'inquiries.form.shelter.fields.fitsInTargetGroup',
    vacant_place_available: 'inquiries.form.shelter.fields.vacantPlaceAvailable',
    non_admission_reason: 'inquiries.form.shelter.fields.nonAdmissionReason',
    not_in_service_target_group_reason: 'inquiries.form.shelter.fields.notInServiceTargetGroupReason',
    referral_destination: 'inquiries.form.shelter.fields.referralDestination',
}
