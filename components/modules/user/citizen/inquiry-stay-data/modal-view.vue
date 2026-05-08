<template>
    <div>
        <Modal size="xl" :title="$t('citizens.inquiryStayData.inquiryAndStayData')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div class="space-y-4">

                    <!-- ── Inquiry Data ── -->
                    <div class="rounded-lg border border-gray-200 overflow-hidden">
                        <div class="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
                            <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                {{ $t('citizens.inquiryStayData.inquiryData.inquiryData') }}
                            </h3>
                        </div>
                        <dl class="divide-y divide-gray-100">
                            <!-- Date of inquiry -->
                            <div v-if="props?.selectedCitizen?.data?.inquiry_data?.inquiry_date"
                                class="grid grid-cols-5 px-4 py-2.5">
                                <dt class="col-span-2 text-xs text-gray-500 self-center">{{ $t('citizens.inquiryStayData.inquiryData.dateOfInquiry') }}</dt>
                                <dd class="col-span-3 text-sm text-gray-800 font-medium">{{ formatDateToReadable(props?.selectedCitizen?.data?.inquiry_data?.inquiry_date) }}</dd>
                            </div>
                            <!-- CPR -->
                            <div v-if="props?.selectedCitizen?.data?.inquiry_data?.cpr"
                                class="grid grid-cols-5 px-4 py-2.5">
                                <dt class="col-span-2 text-xs text-gray-500 self-center">{{ $t('inquiries.form.cpr') }}</dt>
                                <dd class="col-span-3 text-sm text-gray-800 font-medium">{{ props?.selectedCitizen?.data?.inquiry_data?.cpr }}</dd>
                            </div>
                            <!-- CPR Missing Reason (Shelter only) -->
                            <div v-if="isShelterInquiry && props?.selectedCitizen?.data?.inquiry_data?.cpr_missing_reason"
                                class="grid grid-cols-5 px-4 py-2.5">
                                <dt class="col-span-2 text-xs text-gray-500 self-center">{{ $t('inquiries.form.shelter.fields.cprMissingReason') }}</dt>
                                <dd class="col-span-3 text-sm text-gray-800 font-medium">{{ state.options.cprMissingReason.find((o: any) => o.value === props?.selectedCitizen?.data?.inquiry_data?.cpr_missing_reason)?.label }}</dd>
                            </div>
                            <!-- First name -->
                            <div v-if="props?.selectedCitizen?.data?.inquiry_data?.firstname"
                                class="grid grid-cols-5 px-4 py-2.5">
                                <dt class="col-span-2 text-xs text-gray-500 self-center">{{ $t('inquiries.form.firstname') }}</dt>
                                <dd class="col-span-3 text-sm text-gray-800 font-medium">{{ props?.selectedCitizen?.data?.inquiry_data?.firstname }}</dd>
                            </div>
                            <!-- Last name -->
                            <div v-if="props?.selectedCitizen?.data?.inquiry_data?.lastname"
                                class="grid grid-cols-5 px-4 py-2.5">
                                <dt class="col-span-2 text-xs text-gray-500 self-center">{{ $t('inquiries.form.lastname') }}</dt>
                                <dd class="col-span-3 text-sm text-gray-800 font-medium">{{ props?.selectedCitizen?.data?.inquiry_data?.lastname }}</dd>
                            </div>
                            <!-- Inquirer name -->
                            <div v-if="props?.selectedCitizen?.data?.inquiry_data?.inquirer_name"
                                class="grid grid-cols-5 px-4 py-2.5">
                                <dt class="col-span-2 text-xs text-gray-500 self-center">{{ $t('citizens.inquiryStayData.inquiryData.inquirerName') }}</dt>
                                <dd class="col-span-3 text-sm text-gray-800 font-medium">{{ props?.selectedCitizen?.data?.inquiry_data?.inquirer_name }}</dd>
                            </div>

                            <!-- Crisis Center fields -->
                            <template v-if="isCrisisCenterInquiry">
                                <div v-if="props?.selectedCitizen?.data?.inquiry_data?.contacted_by"
                                    class="grid grid-cols-5 px-4 py-2.5">
                                    <dt class="col-span-2 text-xs text-gray-500 self-center">{{ $t('inquiries.form.crisisCenter.fields.contactedBy') }}</dt>
                                    <dd class="col-span-3 text-sm text-gray-800 font-medium">{{ state.options.contactedBy.find((o: any) => o.value === props?.selectedCitizen?.data?.inquiry_data?.contacted_by)?.label }}</dd>
                                </div>
                                <div v-if="topics" class="grid grid-cols-5 px-4 py-2.5">
                                    <dt class="col-span-2 text-xs text-gray-500 self-center">{{ $t('inquiries.form.crisisCenter.fields.topic') }}</dt>
                                    <dd class="col-span-3 text-sm text-gray-800 font-medium">{{ topics }}</dd>
                                </div>
                                <div v-if="props?.selectedCitizen?.data?.inquiry_data?.target_group_crisis_center"
                                    class="grid grid-cols-5 px-4 py-2.5">
                                    <dt class="col-span-2 text-xs text-gray-500 self-center">{{ $t('inquiries.form.crisisCenter.fields.assessment') }}</dt>
                                    <dd class="col-span-3 text-sm text-gray-800 font-medium">{{ state.options.assessment.find((o: any) => o.value === props?.selectedCitizen?.data?.inquiry_data?.target_group_crisis_center)?.label }}</dd>
                                </div>
                                <div v-if="props?.selectedCitizen?.data?.inquiry_data?.received_visit !== null && props?.selectedCitizen?.data?.inquiry_data?.received_visit !== undefined"
                                    class="grid grid-cols-5 px-4 py-2.5">
                                    <dt class="col-span-2 text-xs text-gray-500 self-center">{{ $t('inquiries.form.crisisCenter.fields.receivedVisit') }}</dt>
                                    <dd class="col-span-3">
                                        <span :class="props?.selectedCitizen?.data?.inquiry_data?.received_visit ? 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700' : 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600'">{{ props?.selectedCitizen?.data?.inquiry_data?.received_visit ? $t('yes') : $t('no') }}</span>
                                    </dd>
                                </div>
                                <div v-if="noAssessmentReasons" class="grid grid-cols-5 px-4 py-2.5">
                                    <dt class="col-span-2 text-xs text-gray-500 self-center">{{ $t('inquiries.form.crisisCenter.fields.notOfferedInterview') }}</dt>
                                    <dd class="col-span-3 text-sm text-gray-800 font-medium">{{ noAssessmentReasons }}</dd>
                                </div>
                                <div v-if="guidances" class="grid grid-cols-5 px-4 py-2.5">
                                    <dt class="col-span-2 text-xs text-gray-500 self-center">{{ $t('inquiries.form.crisisCenter.fields.guidance') }}</dt>
                                    <dd class="col-span-3 text-sm text-gray-800 font-medium">{{ guidances }}</dd>
                                </div>
                            </template>

                            <!-- Shelter fields -->
                            <template v-if="isShelterInquiry">
                                <div v-if="props?.selectedCitizen?.data?.inquiry_data?.vacant_place_available !== null && props?.selectedCitizen?.data?.inquiry_data?.vacant_place_available !== undefined"
                                    class="grid grid-cols-5 px-4 py-2.5">
                                    <dt class="col-span-2 text-xs text-gray-500 self-center">{{ $t('inquiries.form.shelter.fields.vacantPlaceAvailable') }}</dt>
                                    <dd class="col-span-3">
                                        <span :class="props?.selectedCitizen?.data?.inquiry_data?.vacant_place_available ? 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700' : 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600'">{{ props?.selectedCitizen?.data?.inquiry_data?.vacant_place_available ? $t('yes') : $t('no') }}</span>
                                    </dd>
                                </div>
                                <div v-if="props?.selectedCitizen?.data?.inquiry_data?.in_shelter_target_group !== null && props?.selectedCitizen?.data?.inquiry_data?.in_shelter_target_group !== undefined"
                                    class="grid grid-cols-5 px-4 py-2.5">
                                    <dt class="col-span-2 text-xs text-gray-500 self-center">{{ $t('inquiries.form.shelter.fields.inShelterTargetGroup') }}</dt>
                                    <dd class="col-span-3">
                                        <span :class="props?.selectedCitizen?.data?.inquiry_data?.in_shelter_target_group ? 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700' : 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600'">{{ props?.selectedCitizen?.data?.inquiry_data?.in_shelter_target_group ? $t('yes') : $t('no') }}</span>
                                    </dd>
                                </div>
                                <div v-if="props?.selectedCitizen?.data?.inquiry_data?.fits_in_target_group !== null && props?.selectedCitizen?.data?.inquiry_data?.fits_in_target_group !== undefined"
                                    class="grid grid-cols-5 px-4 py-2.5">
                                    <dt class="col-span-2 text-xs text-gray-500 self-center">{{ $t('inquiries.form.shelter.fields.fitsInTargetGroup') }}</dt>
                                    <dd class="col-span-3">
                                        <span :class="props?.selectedCitizen?.data?.inquiry_data?.fits_in_target_group ? 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700' : 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600'">{{ props?.selectedCitizen?.data?.inquiry_data?.fits_in_target_group ? $t('yes') : $t('no') }}</span>
                                    </dd>
                                </div>
                                <div v-if="props?.selectedCitizen?.data?.inquiry_data?.non_admission_reason"
                                    class="grid grid-cols-5 px-4 py-2.5">
                                    <dt class="col-span-2 text-xs text-gray-500 self-center">{{ $t('inquiries.form.shelter.fields.nonAdmissionReason') }}</dt>
                                    <dd class="col-span-3 text-sm text-gray-800 font-medium">{{ state.options.nonAdmissionReason.find((o: any) => o.value === props?.selectedCitizen?.data?.inquiry_data?.non_admission_reason)?.label }}</dd>
                                </div>
                                <div v-if="props?.selectedCitizen?.data?.inquiry_data?.not_in_service_target_group_reason"
                                    class="grid grid-cols-5 px-4 py-2.5">
                                    <dt class="col-span-2 text-xs text-gray-500 self-center">{{ $t('inquiries.form.shelter.fields.notInServiceTargetGroupReason') }}</dt>
                                    <dd class="col-span-3 text-sm text-gray-800 font-medium">{{ state.options.notInServiceTargetGroupReason.find((o: any) => o.value === props?.selectedCitizen?.data?.inquiry_data?.not_in_service_target_group_reason)?.label }}</dd>
                                </div>
                                <div v-if="props?.selectedCitizen?.data?.inquiry_data?.referral_destination"
                                    class="grid grid-cols-5 px-4 py-2.5">
                                    <dt class="col-span-2 text-xs text-gray-500 self-center">{{ $t('inquiries.form.shelter.fields.referralDestination') }}</dt>
                                    <dd class="col-span-3 text-sm text-gray-800 font-medium">{{ state.options.referralDestination.find((o: any) => o.value === props?.selectedCitizen?.data?.inquiry_data?.referral_destination)?.label }}</dd>
                                </div>
                            </template>

                            <!-- Notes -->
                            <div v-if="props?.selectedCitizen?.data?.inquiry_data?.notes"
                                class="px-4 py-2.5 space-y-1">
                                <dt class="text-xs text-gray-500">{{ $t('inquiries.form.notes') }}</dt>
                                <dd class="text-sm text-gray-800 bg-gray-50 rounded-md px-3 py-2">{{ props?.selectedCitizen?.data?.inquiry_data?.notes }}</dd>
                            </div>
                            <!-- Outcome -->
                            <div v-if="props?.selectedCitizen?.data?.inquiry_data?.outcome"
                                class="grid grid-cols-5 px-4 py-2.5">
                                <dt class="col-span-2 text-xs text-gray-500 self-center">{{ $t('citizens.inquiryStayData.inquiryData.outcome') }}</dt>
                                <dd class="col-span-3 text-sm text-gray-800 font-medium">{{ props?.selectedCitizen?.data?.inquiry_data?.outcome }}</dd>
                            </div>
                            <!-- Purpose -->
                            <div v-if="props?.selectedCitizen?.data?.inquiry_data?.purpose"
                                class="grid grid-cols-5 px-4 py-2.5">
                                <dt class="col-span-2 text-xs text-gray-500 self-center">{{ $t('citizens.inquiryStayData.inquiryData.purpose') }}</dt>
                                <dd class="col-span-3 text-sm text-gray-800 font-medium">{{ props?.selectedCitizen?.data?.inquiry_data?.purpose }}</dd>
                            </div>
                            <!-- Conversation Summary -->
                            <div v-if="props?.selectedCitizen?.data?.inquiry_data?.conversation_summary"
                                class="px-4 py-2.5 space-y-1">
                                <dt class="text-xs text-gray-500">{{ $t('citizens.inquiryStayData.inquiryData.conversationSummary') }}</dt>
                                <dd class="text-sm text-gray-800 bg-gray-50 rounded-md px-3 py-2">{{ props?.selectedCitizen?.data?.inquiry_data?.conversation_summary }}</dd>
                            </div>
                        </dl>
                    </div>

                    <!-- ── Stay Data ── -->
                    <div v-if="props?.selectedCitizen?.data?.stay_data" class="rounded-lg border border-gray-200 overflow-hidden">
                        <div class="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
                            <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                {{ $t('citizens.inquiryStayData.stayData.stayData') }}
                            </h3>
                        </div>
                        <dl class="divide-y divide-gray-100">
                            <div v-if="props?.selectedCitizen?.data?.stay_data?.journal_number"
                                class="grid grid-cols-5 px-4 py-2.5">
                                <dt class="col-span-2 text-xs text-gray-500 self-center">{{ $t('citizens.inquiryStayData.stayData.journalNumber') }}</dt>
                                <dd class="col-span-3 text-sm text-gray-800 font-medium">{{ props?.selectedCitizen?.data?.stay_data?.journal_number }}</dd>
                            </div>
                            <div v-if="props?.selectedCitizen?.data?.stay_data?.start_date"
                                class="grid grid-cols-5 px-4 py-2.5">
                                <dt class="col-span-2 text-xs text-gray-500 self-center">{{ $t('citizens.inquiryStayData.stayData.accommodationStartDate') }}</dt>
                                <dd class="col-span-3 text-sm text-gray-800 font-medium">{{ formatDateToReadable(props?.selectedCitizen?.data?.stay_data?.start_date) }}</dd>
                            </div>
                            <div v-if="props?.selectedCitizen?.data?.stay_data?.end_date"
                                class="grid grid-cols-5 px-4 py-2.5">
                                <dt class="col-span-2 text-xs text-gray-500 self-center">{{ $t('citizens.inquiryStayData.stayData.accommodationEndDate') }}</dt>
                                <dd class="col-span-3 text-sm text-gray-800 font-medium">{{ formatDateToReadable(props?.selectedCitizen?.data?.stay_data?.end_date) }}</dd>
                            </div>
                            <div v-if="props?.selectedCitizen?.data?.stay_data?.residence_before_municipality?.name"
                                class="grid grid-cols-5 px-4 py-2.5">
                                <dt class="col-span-2 text-xs text-gray-500 self-center">{{ $t('citizens.inquiryStayData.stayData.municipalityOfResidenceBefore') }}</dt>
                                <dd class="col-span-3 text-sm text-gray-800 font-medium">{{ props?.selectedCitizen?.data?.stay_data?.residence_before_municipality?.name }}</dd>
                            </div>
                            <div v-if="props?.selectedCitizen?.data?.stay_data?.residence_after_municipality?.name"
                                class="grid grid-cols-5 px-4 py-2.5">
                                <dt class="col-span-2 text-xs text-gray-500 self-center">{{ $t('citizens.inquiryStayData.stayData.municipalityOfResidenceAfter') }}</dt>
                                <dd class="col-span-3 text-sm text-gray-800 font-medium">{{ props?.selectedCitizen?.data?.stay_data?.residence_after_municipality?.name }}</dd>
                            </div>
                            <div v-if="props?.selectedCitizen?.data?.stay_data?.discharge_reason"
                                class="grid grid-cols-5 px-4 py-2.5">
                                <dt class="col-span-2 text-xs text-gray-500 self-center">{{ $t('citizens.inquiryStayData.stayData.dischargeReason') }}</dt>
                                <dd class="col-span-3 text-sm text-gray-800 font-medium">{{ props?.selectedCitizen?.data?.stay_data?.discharge_reason }}</dd>
                            </div>

                            <!-- ── Consent sub-section ── -->
                            <div class="px-4 py-2.5 bg-gray-50/60">
                                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">{{ $t('citizens.inquiryStayData.stayData.consentFields') }}</p>
                            </div>
                            <div v-if="props?.selectedCitizen?.data?.stay_data?.photo !== null && props?.selectedCitizen?.data?.stay_data?.photo !== undefined"
                                class="grid grid-cols-5 px-4 py-2.5 pl-6">
                                <dt class="col-span-2 text-xs text-gray-500 self-center">{{ $t('citizens.inquiryStayData.stayData.photo') }}</dt>
                                <dd class="col-span-3"><span :class="props?.selectedCitizen?.data?.stay_data?.photo ? 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700' : 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600'">{{ props?.selectedCitizen?.data?.stay_data?.photo ? $t('yes') : $t('no') }}</span></dd>
                            </div>
                            <div v-if="props?.selectedCitizen?.data?.stay_data?.parent_collaboration !== null && props?.selectedCitizen?.data?.stay_data?.parent_collaboration !== undefined"
                                class="grid grid-cols-5 px-4 py-2.5 pl-6">
                                <dt class="col-span-2 text-xs text-gray-500 self-center">{{ $t('citizens.inquiryStayData.stayData.parentCollaboration') }}</dt>
                                <dd class="col-span-3"><span :class="props?.selectedCitizen?.data?.stay_data?.parent_collaboration ? 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700' : 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600'">{{ props?.selectedCitizen?.data?.stay_data?.parent_collaboration ? $t('yes') : $t('no') }}</span></dd>
                            </div>
                            <div v-if="props?.selectedCitizen?.data?.stay_data?.student_collaboration !== null && props?.selectedCitizen?.data?.stay_data?.student_collaboration !== undefined"
                                class="grid grid-cols-5 px-4 py-2.5 pl-6">
                                <dt class="col-span-2 text-xs text-gray-500 self-center">{{ $t('citizens.inquiryStayData.stayData.studentCollaboration') }}</dt>
                                <dd class="col-span-3"><span :class="props?.selectedCitizen?.data?.stay_data?.student_collaboration ? 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700' : 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600'">{{ props?.selectedCitizen?.data?.stay_data?.student_collaboration ? $t('yes') : $t('no') }}</span></dd>
                            </div>
                            <div v-if="props?.selectedCitizen?.data?.stay_data?.general_consent !== null && props?.selectedCitizen?.data?.stay_data?.general_consent !== undefined"
                                class="grid grid-cols-5 px-4 py-2.5 pl-6">
                                <dt class="col-span-2 text-xs text-gray-500 self-center">{{ $t('citizens.inquiryStayData.stayData.generalConsent') }}</dt>
                                <dd class="col-span-3"><span :class="props?.selectedCitizen?.data?.stay_data?.general_consent ? 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700' : 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600'">{{ props?.selectedCitizen?.data?.stay_data?.general_consent ? $t('yes') : $t('no') }}</span></dd>
                            </div>
                            <template v-if="props?.selectedCitizen?.data?.stay_data?.consent_declarations?.length > 0">
                                <div v-for="declaration in props?.selectedCitizen?.data?.stay_data?.consent_declarations"
                                    :key="declaration.consent_declaration_type_id"
                                    class="grid grid-cols-5 px-4 py-2.5 pl-6">
                                    <dt class="col-span-2 text-xs text-gray-500 self-center">{{ declaration.name }}</dt>
                                    <dd class="col-span-3"><span :class="declaration.value ? 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700' : 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600'">{{ declaration.value ? $t('yes') : $t('no') }}</span></dd>
                                </div>
                            </template>

                            <!-- ── Guardianship sub-section ── -->
                            <div class="px-4 py-2.5 bg-gray-50/60">
                                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">{{ $t('citizens.inquiryStayData.stayData.guardianship') }}</p>
                            </div>
                            <div v-if="props?.selectedCitizen?.data?.stay_data?.personal_guardianship !== null && props?.selectedCitizen?.data?.stay_data?.personal_guardianship !== undefined"
                                class="grid grid-cols-5 px-4 py-2.5 pl-6">
                                <dt class="col-span-2 text-xs text-gray-500 self-center">{{ $t('citizens.inquiryStayData.stayData.personalGuardianship') }}</dt>
                                <dd class="col-span-3"><span :class="props?.selectedCitizen?.data?.stay_data?.personal_guardianship ? 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700' : 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600'">{{ props?.selectedCitizen?.data?.stay_data?.personal_guardianship ? $t('yes') : $t('no') }}</span></dd>
                            </div>
                            <div v-if="props?.selectedCitizen?.data?.stay_data?.financial_guardianship !== null && props?.selectedCitizen?.data?.stay_data?.financial_guardianship !== undefined"
                                class="grid grid-cols-5 px-4 py-2.5 pl-6">
                                <dt class="col-span-2 text-xs text-gray-500 self-center">{{ $t('citizens.inquiryStayData.stayData.financialGuardianship') }}</dt>
                                <dd class="col-span-3"><span :class="props?.selectedCitizen?.data?.stay_data?.financial_guardianship ? 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700' : 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600'">{{ props?.selectedCitizen?.data?.stay_data?.financial_guardianship ? $t('yes') : $t('no') }}</span></dd>
                            </div>

                            <!-- ── Accompanying Children ── -->
                            <template v-if="props?.selectedCitizen?.data?.stay_data?.accompanying_children?.length > 0">
                                <div class="px-4 py-2.5 bg-gray-50/60">
                                    <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">{{ $t('citizens.inquiryStayData.stayData.accompanyingChildren.accompanyingChildren') }}</p>
                                </div>
                                <div class="px-4 py-3 space-y-2">
                                    <div v-for="(child, index) in props?.selectedCitizen?.data?.stay_data?.accompanying_children"
                                        :key="index"
                                        class="rounded-md border border-gray-200 overflow-hidden">
                                        <div class="bg-gray-50 px-3 py-1.5 border-b border-gray-200">
                                            <p class="text-xs font-medium text-gray-600">
                                                {{ child?.firstname }} {{ child?.lastname ?? '' }}
                                            </p>
                                        </div>
                                        <dl class="divide-y divide-gray-100">
                                            <div class="grid grid-cols-5 px-3 py-2">
                                                <dt class="col-span-2 text-xs text-gray-500 self-center">{{ $t('citizens.inquiryStayData.stayData.accompanyingChildren.gender') }}</dt>
                                                <dd class="col-span-3 text-sm text-gray-800 font-medium">
                                                    <span v-if="child?.gender === 'male'">{{ $t('gender.male') }}</span>
                                                    <span v-else-if="child?.gender === 'female'">{{ $t('gender.female') }}</span>
                                                    <span v-else-if="child?.gender === 'non_binary'">{{ $t('gender.nonbinary') }}</span>
                                                    <span v-else-if="child?.gender === 'will_not_disclose'">{{ $t('gender.willNotDisclose') }}</span>
                                                </dd>
                                            </div>
                                            <div v-if="getAgeFromBirthday(child?.birthday) !== null" class="grid grid-cols-5 px-3 py-2">
                                                <dt class="col-span-2 text-xs text-gray-500 self-center">{{ $t('citizens.inquiryStayData.stayData.accompanyingChildren.age') }}</dt>
                                                <dd class="col-span-3 text-sm text-gray-800 font-medium">{{ getAgeFromBirthday(child?.birthday) }}</dd>
                                            </div>
                                            <div v-if="child?.origin" class="grid grid-cols-5 px-3 py-2">
                                                <dt class="col-span-2 text-xs text-gray-500 self-center">{{ $t('citizens.inquiryStayData.stayData.accompanyingChildren.origin') }}</dt>
                                                <dd class="col-span-3 text-sm text-gray-800 font-medium">{{ child?.origin }}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>
                            </template>
                        </dl>
                    </div>

                </div>
            </template>
        </Modal>
    </div>

</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useI18n } from "vue-i18n"

const { formatDateToReadable } = useDatetimeFormatter()

function getAgeFromBirthday(birthday: string | null | undefined): number | null {
    if (!birthday) return null
    const birth = new Date(birthday)
    if (isNaN(birth.getTime())) return null
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
    }
    return age
}

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedCitizen: {
        type: Object,
        required: true,
    }
})

const { t, locale } = useI18n()

const state = reactive({
    options: {
        inquiry_type: [
            { value: 'shelter', label: `${t('inquiries.form.options.inquiryType.shelter')}` },
            { value: 'crisis_center', label: `${t('inquiries.form.options.inquiryType.crisisCenter')}` }
        ],
        contactedBy: [
            { value: 'the_citizen_themselves', label: `${t('inquiries.form.options.contactedBy.theCitizenThemselves')}` },
            { value: 'family_friend_neighbor_colleague_acquaintance', label: `${t('inquiries.form.options.contactedBy.familyFriends')}` },
            { value: 'municipal_employee', label: `${t('inquiries.form.options.contactedBy.municipalEmployee')}` },
            { value: 'police_prison_and_probation_service', label: `${t('inquiries.form.options.contactedBy.police')}` },
            { value: 'healthcare_professional', label: `${t('inquiries.form.options.contactedBy.healthcareProfessional')}` },
            { value: 'employee_from_another_crisis_center', label: `${t('inquiries.form.options.contactedBy.employeeFromAnotherCrisisCenter')}` },
            { value: 'other', label: `${t('inquiries.form.options.contactedBy.other')}` },
        ] as any,
        about_list: [] as any,
        assessment: [
            { value: 'yes', label: `${t('inquiries.form.options.assessment.yes')}` },
            { value: 'no', label: `${t('inquiries.form.options.assessment.no')}` },
            { value: 'unknown', label: `${t('inquiries.form.options.assessment.unknown')}` },
        ],
        assessment_reason_list: [] as any,
        guidance_list: [] as any,
        yesNo: [
            { value: 'yes', label: `${t('inquiries.form.options.yesNo.yes')}` },
            { value: 'no', label: `${t('inquiries.form.options.yesNo.no')}` },
        ],
        cprMissingReason: [
            { value: 'citizen_does_not_have_cpr_number', label: `${t('inquiries.form.options.cprMissingReason.citizenDoesNotHaveCprNumber')}` },
            { value: 'shelter_does_not_know_citizen_cpr_number', label: `${t('inquiries.form.options.cprMissingReason.shelterDoesntHaveNumber')}` },
        ],
        nonAdmissionReason: [
            { value: 'expelled_due_to_violent_behavior', label: `${t('inquiries.form.options.nonAdmissionReason.expelledDueToViolentBehavior')}` },
            { value: 'citizen_declined_offer', label: `${t('inquiries.form.options.nonAdmissionReason.citizenDeclinedOffer')}` },
            { value: 'other', label: `${t('inquiries.form.options.nonAdmissionReason.other')}` },
        ],
        notInServiceTargetGroupReason: [
            { value: 'active_substance_abuse_problem', label: `${t('inquiries.form.options.notInServiceTargetGroupReason.activeSubstanceAbuseProblem')}` },
            { value: 'inactive_substance_abuse_problem', label: `${t('inquiries.form.options.notInServiceTargetGroupReason.inactiveSubstanceAbuseProblem')}` },
            { value: 'mental_difficulties', label: `${t('inquiries.form.options.notInServiceTargetGroupReason.mentalDifficulties')}` },
            { value: 'mental_functional_impairment', label: `${t('inquiries.form.options.notInServiceTargetGroupReason.mentalFunctionalImpairment')}` },
            { value: 'expose_to_violence', label: `${t('inquiries.form.options.notInServiceTargetGroupReason.exposeToViolence')}` },
            { value: 'unexposed_to_violence', label: `${t('inquiries.form.options.notInServiceTargetGroupReason.unexposeToViolence')}` },
            { value: 'children_accompany', label: `${t('inquiries.form.options.notInServiceTargetGroupReason.childrenAccompany')}` },
            { value: 'pets_accompany', label: `${t('inquiries.form.options.notInServiceTargetGroupReason.petsAccompany')}` },
            { value: 'not_within_gender_framework', label: `${t('inquiries.form.options.notInServiceTargetGroupReason.notWithinGenderFramework')}` },
            { value: 'not_within_age_framework', label: `${t('inquiries.form.options.notInServiceTargetGroupReason.notWithinAgeFramework')}` },
            { value: 'physical_functional_impairment', label: `${t('inquiries.form.options.notInServiceTargetGroupReason.physicalFunctionalImpairment')}` },
            { value: 'not_within_service_target_group', label: `${t('inquiries.form.options.notInServiceTargetGroupReason.notWithinServiceTargetGroup')}` },
        ],
        referralDestination: [
            { value: 'shelter_via_vacancy_overview', label: `${t('inquiries.form.options.referralDestination.shelterViaVacancyOverview')}` },
            { value: 'shelter_unused_vacancy_overview', label: `${t('inquiries.form.options.referralDestination.shelterUnusedVacancyOverview')}` },
            { value: 'night_cafe_warming_center', label: `${t('inquiries.form.options.referralDestination.nightCafeWarmingCenter')}` },
            { value: 'boarding_house_hostel', label: `${t('inquiries.form.options.referralDestination.boardingHouseHostel')}` },
            { value: 'womens_crisis_center', label: `${t('inquiries.form.options.referralDestination.womensCrisisCenter')}` },
            { value: 'self_solution', label: `${t('inquiries.form.options.referralDestination.selfSolution')}` },
            { value: 'other', label: `${t('inquiries.form.options.referralDestination.other')}` },
        ],
    },
})

const emit = defineEmits(['close'])

function closeModal() {
    emit('close')
}

// Computed properties to determine inquiry type
const isCrisisCenterInquiry = computed(() => {
    return props?.selectedCitizen?.data?.inquiry_data?.inquiry_type === 'crisis_center'
})

const isShelterInquiry = computed(() => {
    return props?.selectedCitizen?.data?.inquiry_data?.inquiry_type === 'shelter'
})

// Crisis Center - Topics (multiple selection)
const topics = computed(() => {
    if (!isCrisisCenterInquiry.value) return ''

    const topicsData = props?.selectedCitizen?.data?.inquiry_data?.topics
    if (!topicsData || topicsData.length === 0) return ''

    const topicLabels = topicsData?.map((topicValue: any) => {
        return locale.value === 'dk'
            ? topicValue?.dk_name
            : topicValue?.en_name
    })
    return topicLabels ? topicLabels.join(', ') : ''
})

// Crisis Center - No Assessment Reasons (multiple selection)
const noAssessmentReasons = computed(() => {
    if (!isCrisisCenterInquiry.value) return ''

    const assessmentData = props?.selectedCitizen?.data?.inquiry_data?.no_assessment_reasons
    if (!assessmentData || assessmentData.length === 0) return ''

    const reasonLabels = assessmentData?.map((reasonValue: any) => {
        return locale.value === 'dk'
            ? reasonValue?.dk_name
            : reasonValue?.en_name
    })
    return reasonLabels ? reasonLabels.join(', ') : ''
})

// Crisis Center - Guidances (multiple selection)
const guidances = computed(() => {
    if (!isCrisisCenterInquiry.value) return ''

    const guidanceData = props?.selectedCitizen?.data?.inquiry_data?.guidances
    if (!guidanceData || guidanceData.length === 0) return ''

    const guidanceLabels = guidanceData?.map((guidanceValue: any) => {
        return locale.value === 'dk'
            ? guidanceValue?.dk_name
            : guidanceValue?.en_name
    })
    return guidanceLabels ? guidanceLabels.join(', ') : ''
})
</script>