<template>
    <div data-search-exclude>
        <LoadingSpinner :isActive="state.isPageLoading">
            <Alert type="danger" :text="state?.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />
            <div class="grid grid-cols-12 gap-6 relative">
                <div :class="[
                    ['citizens-uuid-medicine-journals', 'citizens-uuid-journals'].includes($route.name as any) ? 'col-span-12 lg:col-span-9' : 'col-span-12',
                    'w-full bg-white ring-1 ring-gray-200 rounded-md p-5 border-l-4 border-secondary'
                ]">
                    <div class="md:flex md:items-start md:gap-x-8">
                        <div class="flex justify-center flex-shrink-0">
                            <Tooltip :text="$t('citizens.riskHistory.title')">
                                <button type="button" class="relative" @click="state.modal.isRiskHistoryOpen = true">
                                    <img :src="state.selectedCitizen?.data?.image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${state.selectedCitizen?.data?.firstname + ' ' + state.selectedCitizen?.data?.lastname}`"
                                        :class="[
                                            state.selectedCitizen?.data?.latest_risk_assessment === null && 'border-secondary',
                                            state.selectedCitizen?.data?.latest_risk_assessment?.assessment === 'no risk' && 'border-green-700',
                                            state.selectedCitizen?.data?.latest_risk_assessment?.assessment === 'increased risk' && 'border-yellow-500',
                                            state.selectedCitizen?.data?.latest_risk_assessment?.assessment === 'acute increased risk' && 'border-red-600',
                                            'rounded-full w-28 h-28 object-cover border-2'
                                        ]" />
                                    <span class="absolute inset-0 rounded-full shadow-inner" aria-hidden="true" />
                                </button>
                            </Tooltip>
                        </div>
                        <div class="w-full pt-1.5 space-y-3">
                            <div class="text-center md:text-left">
                                <div class="flex justify-between">
                                    <div>
                                        <div class="flex items-center gap-x-1">
                                            <h1 class="text-2xl font-bold text-gray-900 gr">
                                                {{ state.selectedCitizen?.data?.firstname }}
                                                {{ state.selectedCitizen?.data?.lastname }}
                                            </h1>
                                            <Tooltip :text="$t('citizens.table.actions.edit')"
                                                v-if="userStore.getUser?.roles?.[0]?.name === 'Admin' || userStore.user?.permissions?.find((p: any) => p.name === 'update_citizen')">
                                                <Icon name="ph:pencil-simple"
                                                    class="w-6 h-6 cursor-pointer text-primary"
                                                    @click="navigateTo(`/citizens/${state.selectedCitizen?.data?.uuid}/view-edit`)" />
                                            </Tooltip>
                                            <!-- Follow-ups belong to care plans. A dental clinic
                                                 writes none, and the bell sat on every patient. -->
                                            <Tooltip :text="$t('plansandgoals.followUps')" v-if="hasCarePlans">
                                                <div class="relative inline-flex mx-1 cursor-pointer"
                                                    @click="state.modal.isFollowUpNotificationsOpen = true">
                                                    <Icon name="ph:bell-ringing-light" class="w-6 h-6 text-primary" />
                                                    <span v-if="state.followUpReminderCount > 0"
                                                        class="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full">
                                                        {{ state.followUpReminderCount }}
                                                    </span>
                                                </div>
                                            </Tooltip>
                                            <span v-if="isBirthdayToday"
                                                class="inline-flex items-center gap-x-1 rounded-full bg-secondary-50 px-2.5 py-1 text-xs font-semibold text-secondary ring-1 ring-secondary-100">
                                                <Icon name="ph:cake" class="h-4 w-4" aria-hidden="true" />
                                                {{ $t('citizens.birthdayToday') }}
                                            </span>
                                            <span v-if="state.selectedCitizen?.data?.requires_interpreter"
                                                class="inline-flex items-center gap-x-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
                                                <Icon name="ph:translate" class="h-4 w-4" aria-hidden="true" />
                                                {{ $t('citizens.form.requiresInterpreter') }}
                                            </span>
                                            <!-- Whether this patient can reach the portal, on the
                                                 screen the clinician actually works from. -->
                                            <button v-if="hasPatientPortal" type="button"
                                                class="inline-flex items-center gap-x-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1"
                                                :class="hasPortalAccess
                                                    ? 'bg-green-50 text-green-800 ring-green-200 hover:bg-green-100'
                                                    : 'bg-gray-50 text-gray-600 ring-gray-200 hover:bg-gray-100'"
                                                :title="$t('patient.staff.portalBadgeHelp')"
                                                @click="navigateTo(`/citizens/${state.selectedCitizen?.data?.uuid}/view-edit`)">
                                                <Icon :name="hasPortalAccess ? 'ph:device-mobile-speaker' : 'ph:device-mobile-slash'"
                                                    class="h-4 w-4" aria-hidden="true" />
                                                {{ hasPortalAccess ? $t('patient.staff.portalActive') : $t('patient.staff.portalInactive') }}
                                            </button>

                                        </div>
                                        <p class="text-sm font-medium text-gray-700"
                                            v-if="hasSocialSecurityNumberAccess()">
                                            {{ state.selectedCitizen?.data?.social_security_number }}
                                        </p>
                                    </div>
                                    <div>
                                        <LoadingSpinner :isActive="state.isPageLoading">
                                            <div v-if="isInterventionCheckinEnabled"
                                                class="bg-white rounded-md flex items-center justify-between gap-x-2 px-4">
                                                <p class="text-sm text-primary font-bold">
                                                    {{ state.selectedCitizen?.data?.is_checked_in ?
                                                        $t('timeRegistration.checkOut') :
                                                        $t('timeRegistration.checkIn') }}
                                                </p>
                                                <div class="flex items-center gap-x-1">
                                                    <FormSwitch
                                                        :value="state.selectedCitizen?.data?.is_checked_in ?? false"
                                                        @toggleSwitch="toggleLogin" />
                                                </div>
                                            </div>
                                            <div class="w-fit flex items-center gap-x-1 cursor-pointer px-4"
                                                @click="state.modal.isViewPatienCareHoursOpen = true"
                                                v-if="hasInterventionHoursAccess()">
                                                <Tooltip :text="$t('citizens.interventionHours.interventionHours')"
                                                    class="flex items-center">
                                                    <Icon name="ph:clock" class="h-4 w-4" aria-hidden="true" />
                                                </Tooltip>
                                                <p class="text-sm font-medium text-gray-700">
                                                    {{ formatNumber(language.locale.value,
                                                        state.selectedCitizen?.data?.patient_care_hours) }}
                                                </p>
                                            </div>
                                        </LoadingSpinner>
                                    </div>
                                </div>
                                <div class="flex items-center gap-x-1" v-if="(state.selectedCitizen?.data?.address?.street ||
                                    state.selectedCitizen?.data?.address?.region ||
                                    state.selectedCitizen?.data?.address?.municipality ||
                                    state.selectedCitizen?.data?.address?.city ||
                                    state.selectedCitizen?.data?.address?.post_code) && hasAddressAccess()">
                                    <Tooltip :text="$t('citizens.address')" class="flex items-center">
                                        <Icon name="ph:map-pin" class="h-4 w-4" aria-hidden="true" />
                                    </Tooltip>
                                    <p class="text-sm font-medium text-gray-700">
                                        <span v-if="state.selectedCitizen?.data?.address?.street">
                                            {{ state.selectedCitizen?.data?.address?.street }},
                                        </span>
                                        <span v-if="state.selectedCitizen?.data?.address?.region?.name">
                                            {{ state.selectedCitizen?.data?.address?.region?.name }},
                                        </span>
                                        <span v-if="state.selectedCitizen?.data?.address?.municipality">
                                            {{ state.selectedCitizen?.data?.address?.municipality?.name }},
                                        </span>
                                        <span v-if="state.selectedCitizen?.data?.address?.city">
                                            {{ state.selectedCitizen?.data?.address?.city }},
                                        </span>
                                        <span v-if="state.selectedCitizen?.data?.address?.post_code">
                                            {{ state.selectedCitizen?.data?.address?.post_code }}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-5">
                                <div class="space-y-1">
                                    <div class="flex items-center gap-x-1"
                                        v-if="state.selectedCitizen?.data?.birthday && hasBirthdayAccess()">
                                        <Tooltip :text="$t('citizens.form.birthday')" class="flex items-center">
                                            <Icon name="ph:cake" class="h-4 w-4" aria-hidden="true" />
                                        </Tooltip>
                                        <p class="text-sm font-medium text-gray-700">
                                            {{ formatDateToReadable(state.selectedCitizen?.data?.birthday) }}
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-x-1"
                                        v-if="state.selectedCitizen?.data?.email && hasEmailAddressAccess()">
                                        <Tooltip :text="$t('citizens.form.emailAddress')" class="flex items-center">
                                            <Icon name="ph:envelope-open" class="h-4 w-4" aria-hidden="true" />
                                        </Tooltip>
                                        <p class="text-sm font-medium text-gray-700">
                                            {{ state.selectedCitizen?.data?.email }}
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-x-1" v-if="state.selectedCitizen?.data?.phone">
                                        <Tooltip :text="$t('citizens.form.phone')" class="flex items-center">
                                            <Icon name="ph:phone" class="h-4 w-4" aria-hidden="true" />
                                        </Tooltip>
                                        <p class="text-sm font-medium text-gray-700">
                                            {{ state.selectedCitizen?.data?.phone }}
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-x-1" v-if="spokenLanguagesSummary">
                                        <Tooltip :text="$t('citizens.form.spokenLanguages')" class="flex items-center">
                                            <Icon name="ph:translate" class="h-4 w-4" aria-hidden="true" />
                                        </Tooltip>
                                        <p class="text-sm font-medium text-gray-700">
                                            {{ spokenLanguagesSummary }}
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-x-1"
                                        v-if="primaryCaseworkerName">
                                        <Tooltip :text="term('caseworker', $t('citizens.form.primaryCaseworker'))"
                                            class="flex items-center">
                                            <Icon name="ph:user" class="h-4 w-4" aria-hidden="true" />
                                        </Tooltip>
                                        <p class="text-sm font-medium text-gray-700">
                                            {{ term('caseworker', $t('citizens.form.primaryCaseworker')) }}:
                                            {{ primaryCaseworkerName }}
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-x-1"
                                        v-if="state.selectedCitizen?.data?.date_admitted && hasDateAdmittedAccess()">
                                        <Tooltip :text="$t('citizens.form.dateAdmitted')" class="flex items-center">
                                            <Icon name="ph:calendar" class="h-4 w-4" aria-hidden="true" />
                                        </Tooltip>
                                        <p class="text-sm font-medium text-gray-700">
                                            {{ $t('citizens.form.dateAdmitted') }}:
                                            {{ formatDateToReadable(state.selectedCitizen?.data?.date_admitted) }}
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-x-1"
                                        v-if="state.selectedCitizen?.data?.date_discharged && hasDateDischargedAccess()">
                                        <Tooltip :text="$t('citizens.form.dateDischarged')" class="flex items-center">
                                            <Icon name="ph:calendar" class="h-4 w-4" aria-hidden="true" />
                                        </Tooltip>
                                        <p class="text-sm font-medium text-gray-700">
                                            {{ $t('citizens.form.dateDischarged') }}:
                                            {{ formatDateToReadable(state.selectedCitizen?.data?.date_discharged) }}
                                        </p>
                                    </div>
                                    <button
                                        class="flex items-center gap-x-1 text-sm font-medium text-gray-700 outline-none hover:text-primary"
                                        @click="state.modal.isInquiryStayDataOpen = true"
                                        v-if="userStore.getUser?.company?.industry?.system_name === 'social_welfare' && ['Crisis center', 'Shelter'].includes(userStore.getUser?.company?.facility_type?.en_name)">
                                        <div class="flex items-center">
                                            <Icon name="ph:file" class="h-4 w-4" aria-hidden="true" />
                                        </div>
                                        {{ $t('citizens.inquiryStayData.inquiryAndStayData') }}
                                    </button>
                                    <button
                                        class="flex items-center gap-x-1 text-sm font-medium text-gray-700 outline-none hover:text-primary"
                                        @click="state.modal.isDevelopmentGraphOpen = true"
                                        v-if="userStore.getUser?.company?.industry?.system_name === 'employment_services'">
                                        <div class="flex items-center">
                                            <Icon name="ph:chart-bar" class="h-4 w-4" aria-hidden="true" />
                                        </div>
                                        {{ $t('citizens.developmentGraph.title') }}
                                    </button>
                                    <button
                                        class="flex items-center gap-x-1 text-sm font-medium text-gray-700 outline-none hover:text-primary"
                                        @click="state.modal.isEmploymentProgramOpen = true"
                                        v-if="userStore.getUser?.company?.industry?.system_name === 'employment_services'">
                                        <div class="flex items-center">
                                            <Icon name="ph:briefcase" class="h-4 w-4" aria-hidden="true" />
                                        </div>
                                        {{ $t('citizens.sections.employmentProgram') }}
                                    </button>
                                </div>
                                <div class="space-y-1">
                                    <div class="flex items-center gap-x-1"
                                        v-if="state.selectedCitizen?.data?.ean_number && hasEANNumberAccess()">
                                        <Tooltip :text="$t('citizens.form.eanNumber')" class="flex items-center">
                                            <Icon name="ph:file" class="h-4 w-4" aria-hidden="true" />
                                        </Tooltip>
                                        <p class="text-sm font-medium text-gray-700">
                                            EAN:
                                            {{ state.selectedCitizen?.data?.ean_number }}
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-x-1"
                                        v-if="state.selectedCitizen?.data?.pricing && hasPricingAccess()">
                                        <Tooltip :text="$t('citizens.form.pricing')" class="flex items-center">
                                            <Icon name="ph:money" class="h-4 w-4" aria-hidden="true" />
                                        </Tooltip>
                                        <p class="text-sm font-medium text-gray-700">
                                            {{ $t('citizens.form.pricing') }}:
                                            {{ formatNumber(language.locale.value,
                                                state.selectedCitizen?.data?.pricing) }}
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-x-1"
                                        v-if="state.selectedCitizen?.data?.pricing_start_date">
                                        <Tooltip :text="$t('citizens.form.pricingStartDate')" class="flex items-center">
                                            <Icon name="ph:calendar" class="h-4 w-4" aria-hidden="true" />
                                        </Tooltip>
                                        <p class="text-sm font-medium text-gray-700">
                                            {{ $t('citizens.form.pricingStartDate') }}:
                                            {{ state.selectedCitizen?.data?.pricing_start_date }}
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-x-1"
                                        v-if="state.selectedCitizen?.data?.paying_municipality && hasPayingMunicipalityAccess()">
                                        <Tooltip :text="$t('citizens.form.payingMunicipality')"
                                            class="flex items-center">
                                            <Icon name="ph:map-pin" class="h-4 w-4" aria-hidden="true" />
                                        </Tooltip>
                                        <p class="text-sm font-medium text-gray-700">
                                            {{ $t('citizens.form.payingMunicipality') }}:
                                            {{ state.selectedCitizen?.data?.paying_municipality?.name }}
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-x-1"
                                        v-if="state.selectedCitizen?.data?.assessment_municipality && hasAssessmentMunicipalityAccess()">
                                        <Tooltip :text="$t('citizens.form.assessmentMunicipality')"
                                            class="flex items-center">
                                            <Icon name="ph:map-pin" class="h-4 w-4" aria-hidden="true" />
                                        </Tooltip>
                                        <p class="text-sm font-medium text-gray-700">
                                            {{ $t('citizens.form.assessmentMunicipality') }}:
                                            {{ state.selectedCitizen?.data?.assessment_municipality?.name }}
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-x-1"
                                        v-if="state.selectedCitizen?.data?.responsible_municipality && hasResponsibleMunicipalityAccess()">
                                        <Tooltip :text="$t('citizens.form.responsibleMunicipality')"
                                            class="flex items-center">
                                            <Icon name="ph:map-pin" class="h-4 w-4" aria-hidden="true" />
                                        </Tooltip>
                                        <p class="text-sm font-medium text-gray-700">
                                            {{ $t('citizens.form.responsibleMunicipality') }}:
                                            {{ state.selectedCitizen?.data?.responsible_municipality?.name }}
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-x-1"
                                        v-if="state.selectedCitizen?.data?.transportation && hasTransportationAccess()">
                                        <Tooltip :text="$t('citizens.form.transportation')" class="flex items-center">
                                            <Icon name="ph:bus" class="h-4 w-4" aria-hidden="true" />
                                        </Tooltip>
                                        <p class="text-sm font-medium text-gray-700">
                                            {{ state.selectedCitizen?.data?.transportation }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div class="space-y-1.5">
                                <div class="text-xs flex items-center flex-wrap gap-1"
                                    v-if="state.selectedCitizen?.data?.departments?.length > 0 && hasDepartmentAccess()">
                                    <p>{{ $t('citizens.departments') }}:</p>
                                    <span v-for="(department, index) in state.selectedCitizen?.data?.departments"
                                        :key=index class="bg-primary p-1 text-white rounded-md text-xxs">
                                        {{ department?.name }}
                                    </span>
                                </div>
                                <div class="text-xs flex items-center flex-wrap gap-1"
                                    v-if="state.selectedCitizen?.data?.addictions?.length > 0 && hasAddictionsAccess()">
                                    <p>
                                        {{ customPagesStore.getCustomPagesName?.addictions }}:
                                    </p>
                                    <span v-for="(addiction, index) in state.selectedCitizen?.data?.addictions"
                                        :key=index class="bg-primary p-1 text-white rounded-md text-xxs">
                                        {{ addiction?.name }}
                                    </span>
                                </div>
                                <div class="text-xs flex items-center flex-wrap gap-1"
                                    v-if="state.selectedCitizen?.data?.diagnoses?.length > 0 && hasDiagnosesAccess()">
                                    <p>{{ $t('citizens.diagnoses') }}:</p>
                                    <span v-for="(diagnosis, index) in state.selectedCitizen?.data?.diagnoses"
                                        :key=index class="bg-primary p-1 text-white rounded-md text-xxs">
                                        {{ diagnosis?.name }}
                                    </span>
                                </div>
                                <div class="text-xs flex items-center flex-wrap gap-1"
                                    v-if="state.selectedCitizen?.data?.allergies?.length > 0 && hasMedicationAllergiesAccess()">
                                    <p>{{ $t('citizens.medicationAllergies') }}:</p>
                                    <span v-for="(allergy, index) in state.selectedCitizen?.data?.allergies" :key=index
                                        class="bg-primary p-1 text-white rounded-md text-xxs">
                                        {{ allergy?.name }}
                                    </span>
                                </div>
                                <div class="text-xs flex items-center flex-wrap gap-1"
                                    v-if="state.selectedCitizen?.data?.rooms?.length > 0 && hasRoomsAccess() &&
                                        userStore.getUser?.company?.industry?.system_name === 'social_welfare' && ['Crisis center', 'Shelter'].includes(userStore.getUser?.company?.facility_type?.en_name)">
                                    <p>{{ $t('citizens.rooms') }}:</p>
                                    <span v-for="(room, index) in state.selectedCitizen?.data?.rooms" :key=index
                                        class="bg-primary p-1 text-white rounded-md text-xxs">
                                        {{ room?.name }}
                                    </span>
                                </div>
                            </div>
                            <div ref="noteContentRef" class="text-sm text-gray-700"
                                :class="state.showExpandedNote ? '' : 'line-clamp-1'"
                                v-if="hasNoteAccess() && state.selectedCitizen?.data?.note">
                                <div v-html="state.selectedCitizen?.data?.note" class="content" />
                            </div>
                            <button @click="state.showExpandedNote = !state.showExpandedNote"
                                class="text-primary text-xs hover:text-primary-700"
                                v-if="hasNoteAccess() && state.noteOverflows">
                                {{ state.showExpandedNote ? $t('showLess') : $t('showMore') }}
                            </button>
                            <div class="space-y-1">
                                <button @click="toggleTimeline" class="text-primary text-xs hover:text-primary-700"
                                    v-if="state.timelineEntries.length > 0">
                                    {{
                                        state.showTimeline ? $t('showLess') : $t('showMore') }} {{
                                        $t('citizens.tabs.timeline')
                                    }}
                                </button>
                                <div v-if="state.showTimeline">
                                    <LoadingSpinner :isActive="state.isTimelineLoading">
                                        <div class="max-h-96 overflow-y-auto">
                                            <ModulesUserCitizenTimelineEntryList :timeline="state.timelineEntries"
                                                @delete="handleTimelineDelete" />
                                        </div>
                                    </LoadingSpinner>
                                    <NuxtLink :to="`/citizens/${citizenUuid}/timeline`"
                                        class="text-primary text-xs hover:text-primary-700">
                                        {{ $t('citizens.timeline.viewFullTimeline') }}
                                    </NuxtLink>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-span-12 lg:col-span-3 flex flex-col justify-start gap-6 pt-1 h-full">
                    <ModulesUserCitizenMedicineQrHeader :selectedCitizen="state.selectedCitizen"
                        v-if="$route.name === 'citizens-uuid-medicine-journals'" />
                    <div v-if="$route.name === 'citizens-uuid-journals'"
                        class="flex h-full flex-col gap-4 rounded-md border-l-4 border-red-300 bg-white p-5 ring-1 ring-gray-200">
                        <ModulesUserCitizenUseOfForceHeader :selectedCitizen="state.selectedCitizen"
                            v-if="userStore?.getUser?.industry !== 'Dentists and dental hygienists' && userStore?.getUser?.company?.onboarding_preferences?.modules?.useOfForce !== false" />
                        <hr class="border-gray-200"
                            v-if="userStore?.getUser?.industry !== 'Dentists and dental hygienists' && userStore?.getUser?.company?.onboarding_preferences?.modules?.useOfForce !== false" />
                        <ModulesUserCitizenIncidentsHeader />
                        <p class="w-full text-center text-xs text-primary hover:text-secondary-700 cursor-pointer mt-auto pt-2"
                            @click="state.modal.isViewRelevantHelpLinksOpen = true">
                            {{
                                $t('citizens.useOfForce.relevantHelpLinksForWorkingWithUseOfForceAndIncidentReports.relevantHelpLinksForWorkingWithUseOfForceAndIncidentReports')
                            }}
                        </p>
                    </div>
                </div>
            </div>

            <ModulesUserCitizenPlanStatusTemplateModalFollowUpNotifications
                :isModalOpen="state.modal.isFollowUpNotificationsOpen" :citizenUuid="citizenUuid"
                @close="state.modal.isFollowUpNotificationsOpen = false" @refreshCount="fetchFollowUpReminderCount" />
            <ModulesUserCitizenInquiryStayDataModalView :isModalOpen="state.modal.isInquiryStayDataOpen"
                @close="state.modal.isInquiryStayDataOpen = false" :selectedCitizen="state.selectedCitizen" />
            <ModulesUserCitizenEmploymentProgramModalView :isModalOpen="state.modal.isEmploymentProgramOpen"
                @close="state.modal.isEmploymentProgramOpen = false" :selectedCitizen="state.selectedCitizen" />
            <ModulesUserCitizenInterventionHoursModalView :isModalOpen="state.modal.isViewPatienCareHoursOpen"
                @close="state.modal.isViewPatienCareHoursOpen = false" @refreshCitizenDetails="fetchCitizen()"
                @openTimeLogs="switchToTimeLogs" />
            <ModulesUserCitizenTimeLogsModalView :isModalOpen="state.modal.isViewTimeLogsOpen"
                :citizenUuid="citizenUuid" @close="state.modal.isViewTimeLogsOpen = false"
                @openInterventionHours="switchToInterventionHours" />
            <ModulesUserCitizenUseOfForceModalRelevantHelpLinks :isModalOpen="state.modal.isViewRelevantHelpLinksOpen"
                @close="state.modal.isViewRelevantHelpLinksOpen = false" />
            <ModulesUserCitizenDevelopmentGraphModalView :isModalOpen="state.modal.isDevelopmentGraphOpen"
                @close="state.modal.isDevelopmentGraphOpen = false" />
            <ModulesUserCitizenRiskHistoryModalView :isModalOpen="state.modal.isRiskHistoryOpen"
                :citizenUuid="citizenUuid" @close="state.modal.isRiskHistoryOpen = false" />
            <ModulesUserCitizenTimeRegistrationModalType :isModalOpen="state.modal.isTimeInTypeModalOpen"
                @close="state.modal.isTimeInTypeModalOpen = false" @openTransport="openTransportLogin"
                @open-work="workLogin" />
            <ModulesUserCitizenTimeRegistrationModalTransport type="login"
                :isModalOpen="state.modal.isTransportLoginOpen" @transportLogin="transportLogin"
                @close="state.modal.isTransportLoginOpen = false" @submitTransportLogin="transportLogin" />
            <ModulesUserCitizenTimeRegistrationModalTransport type="logout"
                :isModalOpen="state.modal.isTransportLogoutOpen" @transportLogout="transportLogout"
                @close="state.modal.isTransportLogoutOpen = false" @submitTransportLogout="transportLogout" />

            <!-- Arrival Confirmation Modal -->
            <ModulesUserCitizenTimeRegistrationModalConfirmArrival :isModalOpen="state.modal.isConfirmArrivalOpen"
                :citizenName="`${state.selectedCitizen?.data?.firstname || ''} ${state.selectedCitizen?.data?.lastname || ''}`"
                :citizenAddress="state.selectedCitizen?.data?.address?.street || ''"
                :distanceInMeters="state.arrivalDistance" :totalDistanceKm="locationTracking.getTotalDistanceKm()"
                @close="state.modal.isConfirmArrivalOpen = false" @confirmed="onArrivalConfirmed"
                @dismissed="onArrivalDismissed" />

            <!-- Work Confirmation Modal -->
            <ModulesUserCitizenTimeRegistrationModalConfirmWorking :isModalOpen="state.modal.isConfirmWorkingOpen"
                :citizenName="`${state.selectedCitizen?.data?.firstname || ''} ${state.selectedCitizen?.data?.lastname || ''}`"
                :workingMinutes="state.workingMinutes" @close="state.modal.isConfirmWorkingOpen = false"
                @confirmed="onWorkConfirmed" @dismissed="onWorkDismissed" />
        </LoadingSpinner>
    </div>
</template>

<script setup lang="ts">
import { citizenService } from '@/components/api/user/CitizenService'
import { interventionHoursService } from '@/components/api/user/InterventionHoursService'
import { reportService } from '@/components/api/user/ReportService'
import { timelineService } from '@/components/api/user/TimelineService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useCitizenStore } from '@/store/citizen'
import { useUserStore } from '@/store/user'
import { usePermissions } from '@/composables/usePermissions'
import { useConfetti } from '@/composables/useConfetti'
import { useRecentCitizens } from '@/composables/useRecentCitizens'
import { useContinuity } from '@/composables/useContinuity'
import { useNumberFormatter } from '@/composables/numberFormatter'
import { useTerminology } from '@/composables/useTerminology'
import { useSpokenLanguages } from '@/composables/useSpokenLanguages'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const router = useRouter()
const { formatDateToReadable } = useDatetimeFormatter()
const { formatNumber } = useNumberFormatter()
const language = useI18n()
const { t } = useI18n()
const { term } = useTerminology()
const customPagesStore = useCustomPagesStore() as any
const citizenStore = useCitizenStore() as any
const userStore = useUserStore() as any

// Care plans, their follow-ups and the score that feeds the development graph. Off for an
// industry that writes no care plans; the company can switch it back on under "What do you use?".
const hasCarePlans = computed(() => userStore.getUser?.company?.onboarding_preferences?.modules?.carePlans !== false)
const { isAtLeast, can } = usePermissions()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as string

const locationTracking = useLocationTracking()
const workTimeTracking = useWorkTimeTracking()

const noteContentRef = ref<HTMLElement | null>(null)

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    followUpReminderCount: 0,
    modal: {
        isFollowUpNotificationsOpen: false,
        isInquiryStayDataOpen: false,
        isViewPatienCareHoursOpen: false,
        isViewRelevantHelpLinksOpen: false,
        isViewTimeLogsOpen: false,
        isTimeInTypeModalOpen: false,
        isTransportLoginOpen: false,
        isTransportLogoutOpen: false,
        isConfirmArrivalOpen: false,
        isConfirmWorkingOpen: false,
        isDevelopmentGraphOpen: false,
        isEmploymentProgramOpen: false,
        isRiskHistoryOpen: false,
    },
    selectedCitizen: {} as any,
    showExpandedNote: false,
    noteOverflows: false,
    showTimeline: false,
    timelineEntries: [] as any[],
    isTimelineLoading: false,
    arrivalDistance: 0,
    workingMinutes: 0,
})
// Patient portal status, shown as a chip on the header for clinics that run it.
const hasPatientPortal = computed(() => !!userStore.getUser?.has_patient_app)
const hasPortalAccess = computed(() => !!state.selectedCitizen?.data?.has_system_access)

const arrivalCheckState = reactive({
    hasShownPrompt: false,
    isCheckingArrival: false,
})

const workCheckState = reactive({
    hasShownPrompt: false,
})

const isTransportRegistrationEnabled = computed(() => {
    return userStore.getUser?.can_register_transport === true
})

const isInterventionCheckinEnabled = computed(() => {
    return userStore.getUser?.company?.intervention_checkin_enabled === true
})

const primaryCaseworkerName = computed(() => {
    const caseworker = state.selectedCitizen?.data?.primary_case_worker
    if (!caseworker?.firstname && !caseworker?.lastname) return null
    return [caseworker?.firstname, caseworker?.lastname].filter(Boolean).join(' ')
})

const { celebrate } = useConfetti()
const { recordVisit } = useRecentCitizens()
const { reportContinuity } = useContinuity()
let birthdayCelebrated = false

function isTodaysBirthday(birthday?: string | null) {
    if (!birthday) return false
    const now = new Date()
    const todayMonthDay = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    return String(birthday).slice(5, 10) === todayMonthDay
}

// Tells the user why the confetti fired, right on the citizen's header.
const isBirthdayToday = computed(() => isTodaysBirthday(state.selectedCitizen?.data?.birthday))

// Which languages the citizen speaks, mother tongue first, so staff can see it
// before starting a conversation.
const { summarise: summariseSpokenLanguages } = useSpokenLanguages()
const spokenLanguagesSummary = computed(() =>
    summariseSpokenLanguages(state.selectedCitizen?.data?.spoken_languages, t('citizens.form.motherTongue').toLowerCase())
)

// A little 🎂 confetti when you open a citizen on their birthday.
function celebrateBirthdayIfToday(birthday?: string | null) {
    if (birthdayCelebrated || !isTodaysBirthday(birthday)) return
    birthdayCelebrated = true
    celebrate()
}

onMounted(() => {
    fetchCitizen()
    fetchFollowUpReminderCount()
    fetchTimeline()

    if (isTransportRegistrationEnabled.value) {
        const savedLocationState = locationTracking.getSavedTrackingState()
        if (savedLocationState && savedLocationState.isTracking && savedLocationState.careHourUuid && savedLocationState.citizenUuid === citizenUuid) {
            nextTick(() => {
                if (state.selectedCitizen?.data?.is_checked_in && savedLocationState.careHourUuid) {
                    arrivalCheckState.hasShownPrompt = locationTracking.getArrivalPromptShown()
                    startLocationTracking(savedLocationState.careHourUuid)
                }
            })
        }
    }

    const savedWorkState = workTimeTracking.getSavedWorkTimeState()
    if (savedWorkState && savedWorkState.isWorking && savedWorkState.careHourUuid && savedWorkState.citizenUuid === citizenUuid) {

        nextTick(() => {
            if (state.selectedCitizen?.data?.is_checked_in && !state.selectedCitizen?.data?.current_care_hour?.is_transportation) {
                workTimeTracking.restoreFromState(savedWorkState, showWorkPrompt)
            }
        })
    }
})

watch(
    () => locationTracking.currentLocation.value,
    (newLocation) => {
        if (!isTransportRegistrationEnabled.value) return
        if (!newLocation || !state.selectedCitizen?.data?.is_checked_in) return
        if (!state.selectedCitizen?.data?.current_care_hour?.is_transportation) return
        if (arrivalCheckState.hasShownPrompt) return

        checkIfNearCitizen(newLocation)
    }
)

function checkIfNearCitizen(userLocation: { lat: number; lng: number }) {
    const citizen = state.selectedCitizen?.data
    if (!citizen?.address?.latitude || !citizen?.address?.longitude) return

    const destination = {
        lat: Number(citizen.address.latitude),
        lng: Number(citizen.address.longitude),
    }

    const { isNear, distance } = locationTracking.isNearDestination(destination, 150)

    if (isNear && !arrivalCheckState.hasShownPrompt) {
        arrivalCheckState.hasShownPrompt = true
        arrivalCheckState.isCheckingArrival = true
        state.modal.isConfirmArrivalOpen = true
        state.arrivalDistance = distance
        locationTracking.setArrivalPromptShown(true)
    }
}

function showWorkPrompt() {
    if (workCheckState.hasShownPrompt) return

    workCheckState.hasShownPrompt = true
    state.workingMinutes = workTimeTracking.getWorkingMinutes()
    state.modal.isConfirmWorkingOpen = true
}

async function onArrivalConfirmed() {
    await locationTracking.logCurrentLocation()

    const currentLat = locationTracking.currentLocation.value?.lat
    const currentLng = locationTracking.currentLocation.value?.lng
    const totalDistanceKm = locationTracking.getTotalDistanceKm()

    let arrivalAddress = ''
    if (currentLat && currentLng) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentLat}&lon=${currentLng}&zoom=18&addressdetails=1`,
                {
                    headers: {
                        'Accept-Language': 'da,en',
                    }
                }
            )
            const data = await response.json()
            if (data && data.display_name) {
                arrivalAddress = data.display_name
            }
        } catch (error) {
            console.error('Failed to get arrival address:', error)
            arrivalAddress = `${currentLat}, ${currentLng}`
        }
    }

    state.error = {}
    state.isPageLoading = true
    try {
        if (state.selectedCitizen?.data?.is_checked_in) {
            await stopLocationTracking()

            const params = {
                is_transportation: true,
                geo_end_lat: currentLat,
                geo_end_lng: currentLng,
                end_address: arrivalAddress,
                note: `${t('citizens.timeRegistration.confirmArrival.arrivedAt')} ${arrivalAddress}. ${t('citizens.timeRegistration.confirmArrival.totalDistance')}: ${totalDistanceKm.toFixed(2)}km`
            }

            const response = await interventionHoursService.checkout(citizenUuid, params)
            if (response?.data) {
                await fetchCitizen()
                state.modal.isConfirmArrivalOpen = false
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function onArrivalDismissed() {
    arrivalCheckState.hasShownPrompt = false
    state.modal.isConfirmArrivalOpen = false
    locationTracking.setArrivalPromptShown(false)
}

function onWorkConfirmed() {
    workCheckState.hasShownPrompt = false
    state.modal.isConfirmWorkingOpen = false
}

function onWorkDismissed() {
    workLogout()
}

function startLocationTracking(careHourUuid: string) {
    if (!isTransportRegistrationEnabled.value) return

    arrivalCheckState.hasShownPrompt = locationTracking.getArrivalPromptShown()

    locationTracking.startTracking(
        careHourUuid,
        (location) => {

        },
        (error) => {

        },
        30000,
        state.selectedCitizen?.data?.uuid,
        `${state.selectedCitizen?.data?.firstname} ${state.selectedCitizen?.data?.lastname}`,
        state.selectedCitizen?.data?.address?.street,
        Number(state.selectedCitizen?.data?.address?.latitude),
        Number(state.selectedCitizen?.data?.address?.longitude)
    )
}

async function stopLocationTracking() {
    await locationTracking.stopTracking()
    arrivalCheckState.hasShownPrompt = false
    arrivalCheckState.isCheckingArrival = false
}

async function fetchCitizen() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await citizenService.getCitizen(citizenUuid)
        if (response) {
            state.selectedCitizen = response
            citizenStore.setSelectedCitizen(response?.data)
            recordVisit(response?.data)
            reportContinuity('citizen', response?.data?.uuid, `${response?.data?.firstname ?? ''} ${response?.data?.lastname ?? ''}`)
            celebrateBirthdayIfToday(response?.data?.birthday)
            await nextTick()
            state.noteOverflows = noteContentRef.value
                ? noteContentRef.value.scrollHeight > noteContentRef.value.clientHeight + 2
                : false
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function toggleTimeline() {
    state.showTimeline = !state.showTimeline
}

async function fetchTimeline() {
    state.isTimelineLoading = true
    try {
        const response = await timelineService.getTimeline(citizenUuid)
        state.timelineEntries = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isTimelineLoading = false
}

async function handleTimelineDelete(uuid: string) {
    try {
        await timelineService.deleteEvent(uuid)
        fetchTimeline()
    } catch (error: any) {
        state.error = error
    }
}

watch(() => language.locale.value, () => {
    state.timelineEntries = []
    if (state.showTimeline) {
        fetchTimeline()
    }
})

async function fetchFollowUpReminderCount() {
    try {
        const response = await reportService.getUserReportFollowUpByCitizen(citizenUuid)
        if (response?.data) {
            state.followUpReminderCount = response.data.length
        }
    } catch {
    }
}

function selectTimeInType() {
    if (!isTransportRegistrationEnabled.value) {
        workLogin()
        return
    }

    state.modal.isTimeInTypeModalOpen = true
}

async function workLogin() {
    state.error = {}
    state.isPageLoading = true
    try {
        if (!state.selectedCitizen?.data?.is_checked_in) {
            const params = {}
            const response = await interventionHoursService.checkin(citizenUuid, params)
            if (response?.data) {
                const careHourUuid = response.data.uuid || response.data.citizen_care_hour_uuid

                await fetchCitizen()

                if (careHourUuid) {
                    workTimeTracking.startTracking(
                        careHourUuid,
                        showWorkPrompt,
                        state.selectedCitizen?.data?.uuid,
                        `${state.selectedCitizen?.data?.firstname} ${state.selectedCitizen?.data?.lastname}`
                    )
                }
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function openTransportLogin() {
    if (!isTransportRegistrationEnabled.value) {
        console.warn('Transport registration is disabled')
        return
    }

    state.modal.isTimeInTypeModalOpen = false
    state.modal.isTransportLoginOpen = true
}

function openTransportLogout() {
    if (!isTransportRegistrationEnabled.value) {
        console.warn('Transport registration is disabled')
        return
    }

    state.modal.isTimeInTypeModalOpen = false
    state.modal.isTransportLogoutOpen = true
}

async function transportLogin(transportLoginDetails: any) {
    if (!isTransportRegistrationEnabled.value) {
        console.error('Transport registration is disabled')
        return
    }

    state.error = {}
    state.isPageLoading = true
    try {
        if (!state.selectedCitizen?.data?.is_checked_in) {
            const params = {
                is_transportation: true,
                geo_start_lat: transportLoginDetails.geo_start_lat,
                geo_start_lng: transportLoginDetails.geo_start_lng,
                start_address: transportLoginDetails.start_address,
                note: transportLoginDetails.note
            }
            const response = await interventionHoursService.checkin(citizenUuid, params)
            if (response?.data) {
                const careHourUuid = response.data.uuid || response.data.citizen_care_hour_uuid

                await fetchCitizen()
                state.modal.isTransportLoginOpen = false

                if (careHourUuid) {
                    startLocationTracking(careHourUuid)
                }
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function toggleLogin() {
    if (!state.selectedCitizen?.data?.is_checked_in) {
        selectTimeInType()
    } else {
        if (state.selectedCitizen?.data?.current_care_hour?.is_transportation && isTransportRegistrationEnabled.value) {
            openTransportLogout()
        } else {
            workLogout()
        }
    }
}

async function workLogout() {
    state.error = {}
    state.isPageLoading = true
    try {
        workTimeTracking.stopTracking()

        const params = {}
        const response = await interventionHoursService.checkout(citizenUuid, params)
        if (response?.data) {
            fetchCitizen()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function transportLogout(transportLogoutDetails: any) {
    if (!isTransportRegistrationEnabled.value) {
        console.error('Transport registration is disabled')
        return
    }

    state.error = {}
    state.isPageLoading = true
    try {
        if (state.selectedCitizen?.data?.is_checked_in) {
            await stopLocationTracking()

            const params = {
                is_transportation: true,
                geo_end_lat: transportLogoutDetails.geo_end_lat,
                geo_end_lng: transportLogoutDetails.geo_end_lng,
                end_address: transportLogoutDetails.end_address,
                note: transportLogoutDetails.note
            }
            const response = await interventionHoursService.checkout(citizenUuid, params)
            if (response?.data) {
                fetchCitizen()
                state.modal.isTransportLogoutOpen = false
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function switchToTimeLogs() {
    state.modal.isViewPatienCareHoursOpen = false
    state.modal.isViewTimeLogsOpen = true
}

function switchToInterventionHours() {
    state.modal.isViewTimeLogsOpen = false
    state.modal.isViewPatienCareHoursOpen = true
}

/**
 * Which of the citizen's fields this company shows.
 *
 * Every one of these used to start with `isAtLeast('Admin') ||`, which meant the
 * setting had no effect on the person most likely to be looking at it: an admin
 * saw every field whatever the company had chosen, so a dental clinic met
 * Indsats timer, EAN-nummer and Visitationskommune on every patient however it
 * configured itself. An admin now sees what the company configured, and can
 * change it in settings.
 *
 * A company that has never configured the list keeps exactly what it has today -
 * admins see everything, everyone else sees nothing - because reading the empty
 * list as "show everything" would hand social security numbers and diagnoses to
 * staff who cannot see them now.
 */
function showsCitizenField(name: string): boolean {
    const displays = userStore.getUser?.company?.citizen_displays
    const configured = Array.isArray(displays) && displays.length > 0
    if (!configured) return isAtLeast('Admin')
    return displays.some((display: any) => display.en_name === name)
}

function hasSocialSecurityNumberAccess() {
    return showsCitizenField('Social security number')
}

function hasAddressAccess() {
    return showsCitizenField('Address')
}

function hasInterventionHoursAccess() {
    return showsCitizenField('Intervention hours')
}

function hasBirthdayAccess() {
    return showsCitizenField('Birthday')
}

function hasEmailAddressAccess() {
    return showsCitizenField('Email address')
}

function hasDateAdmittedAccess() {
    return showsCitizenField('Date admitted')
}

function hasDateDischargedAccess() {
    return showsCitizenField('Date discharged')
}

function hasEANNumberAccess() {
    return showsCitizenField('EAN number')
}

function hasPricingAccess() {
    return showsCitizenField('Pricing')
}

function hasPayingMunicipalityAccess() {
    return showsCitizenField('Paying municipality')
}

function hasAssessmentMunicipalityAccess() {
    return showsCitizenField('Assessment municipality')
}

function hasResponsibleMunicipalityAccess() {
    return showsCitizenField('Responsible municipality')
}

function hasTransportationAccess() {
    return showsCitizenField('Transportation')
}

function hasDepartmentAccess() {
    return showsCitizenField('Department')
}

function hasAddictionsAccess() {
    return showsCitizenField('Addictions')
}

function hasDiagnosesAccess() {
    return showsCitizenField('Diagnoses')
}

function hasMedicationAllergiesAccess() {
    return showsCitizenField('Medication allergies')
}

function hasRoomsAccess() {
    return showsCitizenField('Rooms')
}

function hasNoteAccess() {
    return showsCitizenField('Note')
}
</script>