<template>
    <div>
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
                            <div class="relative">
                                <img :src="state.selectedCitizen?.data?.image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${state.selectedCitizen?.data?.firstname + ' ' + state.selectedCitizen?.data?.lastname}`"
                                    :class="[
                                        state.selectedCitizen?.data?.latest_risk_assessment === null && 'border-secondary',
                                        state.selectedCitizen?.data?.latest_risk_assessment?.assessment === 'no risk' && 'border-green-700',
                                        state.selectedCitizen?.data?.latest_risk_assessment?.assessment === 'increased risk' && 'border-yellow-500',
                                        state.selectedCitizen?.data?.latest_risk_assessment?.assessment === 'acute increased risk' && 'border-red-600',
                                        'rounded-full w-28 h-28 object-cover border-2'
                                    ]" />
                                <span class="absolute inset-0 rounded-full shadow-inner" aria-hidden="true" />
                            </div>
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
                                            <Tooltip :text="$t('citizens.table.actions.edit')">
                                                <Icon name="ph:pencil-simple"
                                                    class="w-6 h-6 cursor-pointer text-primary"
                                                    @click="navigateTo(`/citizens/${state.selectedCitizen?.data?.uuid}/view-edit`)"
                                                    v-if="userStore.getUser?.roles?.[0]?.name === 'Admin'" />
                                            </Tooltip>
                                            <Tooltip :text="$t('plansandgoals.followUps')">
                                                <div class="relative inline-flex mx-1 cursor-pointer"
                                                    @click="state.modal.isFollowUpNotificationsOpen = true">
                                                    <Icon name="ph:bell-ringing-light" class="w-6 h-6 text-primary" />
                                                    <span v-if="state.followUpReminderCount > 0"
                                                        class="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full">
                                                        {{ state.followUpReminderCount }}
                                                    </span>
                                                </div>
                                            </Tooltip>

                                        </div>
                                        <p class="text-sm font-medium text-gray-700"
                                            v-if="hasSocialSecurityNumberAccess()">
                                            {{ state.selectedCitizen?.data?.social_security_number }}
                                        </p>
                                    </div>
                                    <div>
                                        <LoadingSpinner :isActive="state.isPageLoading">
                                            <div
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
                                    <div class="flex items-center gap-x-1"
                                        v-if="state.selectedCitizen?.data?.caseworker_name">
                                        <Tooltip :text="$t('citizens.form.primaryCaseworker')"
                                            class="flex items-center">
                                            <Icon name="ph:user" class="h-4 w-4" aria-hidden="true" />
                                        </Tooltip>
                                        <p class="text-sm font-medium text-gray-700">
                                            {{ $t('citizens.form.primaryCaseworker') }}:
                                            {{ state.selectedCitizen?.data?.caseworker_name }}
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
                            <div class="text-xs font-medium text-gray-700"
                                :class="state.showExpandedNote ? '' : 'line-clamp-2'" v-if="hasNoteAccess()">
                                {{ state.selectedCitizen?.data?.note }}
                            </div>
                            <button @click="state.showExpandedNote = !state.showExpandedNote"
                                class="text-primary text-xs hover:text-primary-700" v-if="hasNoteAccess()">
                                {{ state.showExpandedNote ? $t('showLess') : $t('showMore') }}
                            </button>
                        </div>
                    </div>
                </div>
                <div class="col-span-12 lg:col-span-3 flex flex-col justify-center lg:gap-8">
                    <ModulesUserCitizenMedicineQrHeader :selectedCitizen="state.selectedCitizen"
                        v-if="$route.name === 'citizens-uuid-medicine-journals'" />
                    <div class="flex flex-col items-center gap-y-3 md:gap-y-10">
                        <ModulesUserCitizenUseOfForceHeader :selectedCitizen="state.selectedCitizen"
                            v-if="$route.name === 'citizens-uuid-journals' && userStore?.getUser?.industry !== 'Dentists and dental hygienists'" />
                        <ModulesUserCitizenIncidentsHeader v-if="$route.name === 'citizens-uuid-journals'" />
                        <p class="w-60 text-center text-xs text-primary hover:text-secondary-700 cursor-pointer"
                            @click="state.modal.isViewRelevantHelpLinksOpen = true"
                            v-if="$route.name === 'citizens-uuid-journals'">
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
            <ModulesUserCitizenInterventionHoursModalView :isModalOpen="state.modal.isViewPatienCareHoursOpen"
                @close="state.modal.isViewPatienCareHoursOpen = false" @refreshCitizenDetails="fetchCitizen()" />
            <ModulesUserCitizenUseOfForceModalRelevantHelpLinks :isModalOpen="state.modal.isViewRelevantHelpLinksOpen"
                @close="state.modal.isViewRelevantHelpLinksOpen = false" />
            <ModulesUserCitizenTimeRegistrationModalType :isModalOpen="state.modal.isTimeInTypeModalOpen"
                @close="state.modal.isTimeInTypeModalOpen = false" @openTransport="openTransport" @open-work="workLogin" />
            <ModulesUserCitizenTimeRegistrationModalTransport :isModalOpen="state.modal.isTransportLoginOpen" @transportLogin="transportLogin"
                @close="state.modal.isTransportLoginOpen = false" @submitTransport="transportLogin" />
        </LoadingSpinner>
    </div>
</template>

<script setup lang="ts">
import { citizenService } from '@/components/api/user/CitizenService'
import { interventionHoursService } from '@/components/api/user/InterventionHoursService'
import { reportService } from '@/components/api/user/ReportService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useCitizenStore } from '@/store/citizen'
import { useUserStore } from '@/store/user'
import { useNumberFormatter } from '@/composables/numberFormatter'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const router = useRouter()
const { formatDateToReadable } = useDatetimeFormatter()
const { formatNumber } = useNumberFormatter()
const language = useI18n()
const customPagesStore = useCustomPagesStore() as any
const citizenStore = useCitizenStore() as any
const userStore = useUserStore() as any
const citizenUuid = router?.currentRoute?.value?.params?.uuid as string

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    followUpReminderCount: 0,
    modal: {
        isFollowUpNotificationsOpen: false,
        isInquiryStayDataOpen: false,
        isViewPatienCareHoursOpen: false,
        isViewRelevantHelpLinksOpen: false,
        isTimeInTypeModalOpen: false,
        isTransportLoginOpen: false
    },
    selectedCitizen: {} as any,
    showExpandedNote: false,
})

onMounted(() => {
    fetchCitizen()
    fetchFollowUpReminderCount()
})

async function fetchCitizen() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await citizenService.getCitizen(citizenUuid)
        if (response) {
            state.selectedCitizen = response
            citizenStore.setSelectedCitizen(response?.data)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

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
                fetchCitizen()
            }
        } else {
            const params = {}
            const response = await interventionHoursService.checkout(citizenUuid, params)
            if (response?.data) {
                fetchCitizen()
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function openTransport() {
    state.modal.isTimeInTypeModalOpen = false
    state.modal.isTransportLoginOpen = true
}

async function transportLogin(transportLoginDetails: any) {
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
                fetchCitizen()
                state.modal.isTransportLoginOpen = false
                
            }
        } else {
            const params = {}
            const response = await interventionHoursService.checkout(citizenUuid, params)
            if (response?.data) {
                fetchCitizen()
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
        if (state.selectedCitizen?.data?.current_care_hour?.is_transportation) {
            // transportLogout
            workCheckout()
        } else {
            workCheckout()
        }
    }
}

async function workCheckout() {
    state.error = {}
    state.isPageLoading = true
    try {
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

function isAdmin(roles: any) {
    return roles && roles.some((role: any) => role.name === 'Admin')
}

function hasSocialSecurityNumberAccess() {
    return isAdmin(userStore.getUser?.roles) ||
        userStore.getUser?.company?.citizen_displays?.some((display: any) => display.en_name === 'Social security number')
}

function hasAddressAccess() {
    return isAdmin(userStore.getUser?.roles) ||
        userStore.getUser?.company?.citizen_displays?.some((display: any) => display.en_name === 'Address')
}

function hasInterventionHoursAccess() {
    return isAdmin(userStore.getUser?.roles) ||
        userStore.getUser?.company?.citizen_displays?.some((display: any) => display.en_name === 'Intervention hours')
}

function hasBirthdayAccess() {
    return isAdmin(userStore.getUser?.roles) ||
        userStore.getUser?.company?.citizen_displays?.some((display: any) => display.en_name === 'Birthday')
}

function hasEmailAddressAccess() {
    return isAdmin(userStore.getUser?.roles) ||
        userStore.getUser?.company?.citizen_displays?.some((display: any) => display.en_name === 'Email address')
}

function hasDateAdmittedAccess() {
    return isAdmin(userStore.getUser?.roles) ||
        userStore.getUser?.company?.citizen_displays?.some((display: any) => display.en_name === 'Date admitted')
}

function hasDateDischargedAccess() {
    return isAdmin(userStore.getUser?.roles) ||
        userStore.getUser?.company?.citizen_displays?.some((display: any) => display.en_name === 'Date discharged')
}

function hasEANNumberAccess() {
    return isAdmin(userStore.getUser?.roles) ||
        userStore.getUser?.company?.citizen_displays?.some((display: any) => display.en_name === 'EAN number')
}

function hasPricingAccess() {
    return isAdmin(userStore.getUser?.roles) ||
        userStore.getUser?.company?.citizen_displays?.some((display: any) => display.en_name === 'Pricing')
}

function hasPayingMunicipalityAccess() {
    return isAdmin(userStore.getUser?.roles) ||
        userStore.getUser?.company?.citizen_displays?.some((display: any) => display.en_name === 'Paying municipality')
}

function hasAssessmentMunicipalityAccess() {
    return isAdmin(userStore.getUser?.roles) ||
        userStore.getUser?.company?.citizen_displays?.some((display: any) => display.en_name === 'Assessment municipality')
}

function hasResponsibleMunicipalityAccess() {
    return isAdmin(userStore.getUser?.roles) ||
        userStore.getUser?.company?.citizen_displays?.some((display: any) => display.en_name === 'Responsible municipality')
}

function hasTransportationAccess() {
    return isAdmin(userStore.getUser?.roles) ||
        userStore.getUser?.company?.citizen_displays?.some((display: any) => display.en_name === 'Transportation')
}

function hasDepartmentAccess() {
    return isAdmin(userStore.getUser?.roles) ||
        userStore.getUser?.company?.citizen_displays?.some((display: any) => display.en_name === 'Department')
}

function hasAddictionsAccess() {
    return isAdmin(userStore.getUser?.roles) ||
        userStore.getUser?.company?.citizen_displays?.some((display: any) => display.en_name === 'Addictions')
}

function hasDiagnosesAccess() {
    return isAdmin(userStore.getUser?.roles) ||
        userStore.getUser?.company?.citizen_displays?.some((display: any) => display.en_name === 'Diagnoses')
}

function hasMedicationAllergiesAccess() {
    return isAdmin(userStore.getUser?.roles) ||
        userStore.getUser?.company?.citizen_displays?.some((display: any) => display.en_name === 'Medication allergies')
}

function hasRoomsAccess() {
    return isAdmin(userStore.getUser?.roles) ||
        userStore.getUser?.company?.citizen_displays?.some((display: any) => display.en_name === 'Rooms')
}

function hasNoteAccess() {
    return isAdmin(userStore.getUser?.roles) ||
        userStore.getUser?.company?.citizen_displays?.some((display: any) => display.en_name === 'Note')
}
</script>