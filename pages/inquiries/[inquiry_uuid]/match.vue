<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('consultantMatch.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('consultantMatch.title') }}</template>

            <div class="space-y-5">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <p class="max-w-3xl text-sm text-gray-500">
                    {{ $t('consultantMatch.description') }}
                </p>

                <div class="grid grid-cols-1 gap-5 lg:grid-cols-3">
                    <!-- What the case needs -->
                    <div class="rounded-lg border border-gray-200 bg-white p-4">
                        <p class="mb-4 text-sm font-semibold text-gray-900">
                            {{ $t('consultantMatch.criteria') }}
                        </p>

                        <div class="space-y-3.5">
                            <div v-for="type in SKILL_TYPES" :key="type">
                                <FormLabel :for="`crit-${type}`"
                                    :label="$t('consultantSkills.types.' + type + '.title')" />
                                <FormSelectMultiple :id="`crit-${type}`" :modelValue="selectedSkills(type)"
                                    :options="skillOptions(type)"
                                    @update:modelValue="(value: any) => setSkills(type, value)" />
                            </div>

                            <div>
                                <FormLabel for="crit-primary-language"
                                    :label="$t('inquiryMatchNeeds.primaryLanguage')" />
                                <FormSelect id="crit-primary-language" searchable
                                    v-model="state.form.primary_spoken_language_uuid" :options="languageOptions" />
                            </div>

                            <div>
                                <FormLabel for="crit-secondary-language"
                                    :label="$t('inquiryMatchNeeds.secondaryLanguage')" />
                                <FormSelect id="crit-secondary-language" searchable
                                    v-model="state.form.secondary_spoken_language_uuid"
                                    :options="languageOptions.filter((o: any) => o.value !== state.form.primary_spoken_language_uuid)" />
                                <p class="mt-1 text-[11px] text-slate-400">{{ $t('consultantMatch.form.secondaryHint') }}</p>
                            </div>

                            <div>
                                <FormLabel for="crit-languages"
                                    :label="$t('consultantMatch.form.spokenLanguages')" />
                                <FormSelectMultiple id="crit-languages" v-model="state.form.spoken_language_uuids"
                                    :options="languageOptions" />
                            </div>

                            <div>
                                <FormLabel for="crit-municipality"
                                    :label="$t('consultantProfile.form.municipality')" />
                                <FormSelect id="crit-municipality" v-model="state.form.municipality_uuid"
                                    :options="municipalityOptions" />
                            </div>

                            <div>
                                <FormLabel for="crit-region" :label="$t('consultantProfile.form.region')" />
                                <FormSelect id="crit-region" v-model="state.form.region_uuid"
                                    :options="regionOptions" />
                            </div>

                            <div>
                                <FormLabel for="crit-status" :label="$t('consultantProfile.form.status')" />
                                <FormSelectMultiple id="crit-status" v-model="state.form.consultant_status"
                                    :options="statusOptions" />
                            </div>

                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <FormLabel for="crit-km" :label="$t('consultantMatch.form.minTravelKm')" />
                                    <FormTextField id="crit-km" name="crit-km" v-model="state.form.min_travel_km"
                                        placeholder="0" />
                                </div>
                                <div>
                                    <FormLabel for="crit-hours" :label="$t('consultantMatch.form.minWeeklyHours')" />
                                    <FormTextField id="crit-hours" name="crit-hours"
                                        v-model="state.form.min_weekly_hours" placeholder="0" />
                                </div>
                            </div>

                            <div>
                                <FormLabel for="crit-step" :label="$t('consultantMatch.form.minStep')" />
                                <div class="flex flex-wrap gap-1.5">
                                    <button v-for="step in stepAssessmentMax" :key="step" type="button"
                                        class="size-9 rounded-lg border text-[13px] font-bold transition-colors"
                                        :class="Number(state.form.min_step_assessment) === step
                                            ? 'border-secondary bg-secondary text-white'
                                            : 'border-surface-200 bg-white text-slate-500 hover:bg-surface-50'"
                                        @click="state.form.min_step_assessment = Number(state.form.min_step_assessment) === step ? null : step">
                                        {{ step }}
                                    </button>
                                </div>
                            </div>

                            <!-- Where the case takes place comes from the inquiry itself;
                                 distances are measured from there. -->
                            <div class="rounded-lg border border-surface-200 bg-surface-50 px-3 py-2.5">
                                <p class="text-xs font-bold text-slate-500">{{ $t('inquiryMatchNeeds.location') }}</p>
                                <p class="mt-0.5 text-[13px] text-slate-700">
                                    {{ inquiryLocation || $t('consultantMatch.location.none') }}
                                </p>
                                <p v-if="inquiryLocation" class="mt-0.5 text-[11px] text-slate-400">{{ locationStatus }}</p>
                                <div v-if="state.inquiry?.location_geocoded"
                                    class="mt-2 flex w-fit cursor-pointer items-center gap-2"
                                    @click="state.form.within_travel_range_only = !state.form.within_travel_range_only">
                                    <FormCheckbox :value="state.form.within_travel_range_only" />
                                    <span class="text-sm">{{ $t('consultantMatch.form.withinTravelRangeOnly') }}</span>
                                </div>
                            </div>

                            <div class="flex w-fit cursor-pointer items-center gap-2"
                                @click="state.form.has_car = state.form.has_car ? null : true">
                                <FormCheckbox :value="!!state.form.has_car" />
                                <span class="text-sm">{{ $t('consultantMatch.form.needsCar') }}</span>
                            </div>
                        </div>

                        <div class="mt-4 flex items-center justify-between gap-2">
                            <FormButton type="button" buttonStyle="cancel" @click="reset">
                                {{ $t('consultantMatch.clear') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="primary" :disabled="state.isSearching"
                                @click="search">
                                <Icon name="ph:magnifying-glass" class="size-4" />
                                {{ state.isSearching ? $t('consultantMatch.searching') : $t('consultantMatch.search') }}
                            </FormButton>
                        </div>
                    </div>

                    <!-- Who fits, and how well -->
                    <div class="space-y-3 lg:col-span-2">
                        <div v-if="state.hasSearched" class="flex flex-wrap items-center justify-between gap-3">
                            <p class="text-xs text-slate-400">
                                {{ $t('consultantMatch.resultSummary', {
                                    total: state.results.length,
                                    full: fullCount,
                                    criteria: state.criteriaAsked.length,
                                }) }}
                            </p>
                            <div v-if="state.inquiry?.location_geocoded"
                                class="flex items-center gap-1 rounded-lg border border-surface-200 bg-white p-0.5">
                                <button v-for="option in ['match', 'distance']" :key="option" type="button"
                                    class="rounded-md px-2.5 py-1 text-[12px] font-semibold transition-colors"
                                    :class="state.form.sort === option ? 'bg-secondary text-white' : 'text-slate-500 hover:bg-surface-50'"
                                    @click="setSort(option)">
                                    {{ $t('consultantMatch.sort.' + option) }}
                                </button>
                            </div>
                            <FormButton v-if="state.picked.length" type="button" buttonStyle="primary"
                                :disabled="state.isInviting" @click="invite">
                                <Icon name="ph:paper-plane-tilt" class="size-4" />
                                {{ $t('consultantMatch.askSelected', { count: state.picked.length }) }}
                            </FormButton>
                        </div>

                        <p v-if="state.hasSearched && !state.results.length"
                            class="rounded-lg border border-gray-200 bg-white px-4 py-6 text-sm text-gray-400">
                            {{ $t('consultantMatch.noConsultants') }}
                        </p>

                        <div v-for="result in state.results" :key="result.uuid"
                            class="rounded-lg border bg-white p-4"
                            :class="result.match === 'full' ? 'border-[#1f9d6b]/40' : 'border-gray-200'">
                            <div class="flex flex-wrap items-start justify-between gap-3">
                                <div class="flex min-w-0 items-start gap-3">
                                    <!-- Asking is a decision per consultant, so each
                                         one is picked rather than the whole result set. -->
                                    <div class="mt-0.5 shrink-0 cursor-pointer" @click="togglePick(result.uuid)">
                                        <FormCheckbox :value="state.picked.includes(result.uuid)" />
                                    </div>
                                    <div class="min-w-0">
                                    <div class="flex flex-wrap items-center gap-2">
                                        <p class="text-sm font-semibold text-gray-900">
                                            {{ (result.firstname || '') + ' ' + (result.lastname || '') }}
                                        </p>
                                        <span class="rounded-full px-2.5 py-[3px] text-[11.5px] font-bold"
                                            :class="matchClass(result.match)">
                                            {{ $t('consultantMatch.matches.' + result.match, {
                                                met: result.met.length,
                                                asked: state.criteriaAsked.length,
                                            }) }}
                                        </span>
                                        <span v-if="!result.is_ready"
                                            class="rounded-full bg-[#fbe9e5] px-2.5 py-[3px] text-[11.5px] font-bold text-[#c0442c]">
                                            {{ $t('consultantMatch.notReady') }}
                                        </span>
                                        <!-- Distance from the case to her home; approximate
                                             when her home is only known by postal code. -->
                                        <span v-if="state.locationGeocoded"
                                            class="inline-flex items-center gap-1 rounded-full px-2.5 py-[3px] text-[11.5px] font-bold"
                                            :class="distanceClass(result)">
                                            <Icon name="ph:map-pin" class="size-3" />
                                            {{ distanceText(result) }}
                                        </span>
                                        <!-- The secondary language is a plus, never a miss,
                                             so only having it is shown. -->
                                        <span v-if="result.secondary_language_match === true"
                                            class="rounded-full bg-[#e6f6ee] px-2.5 py-[3px] text-[11.5px] font-bold text-[#177a53]">
                                            {{ $t('consultantMatch.secondaryLanguageMet', { language: secondaryLanguageName }) }}
                                        </span>
                                    </div>
                                        <p class="mt-1 text-xs text-slate-500">{{ profileLine(result) }}</p>
                                    </div>
                                </div>
                                <NuxtLink :to="`/employees/${result.uuid}/consultant-profile`"
                                    class="shrink-0 text-[13px] font-semibold text-secondary hover:underline">
                                    {{ $t('consultantMatch.openProfile') }}
                                </NuxtLink>
                            </div>

                            <!-- What she does not meet is the reason she is not a
                                 full match, so it is stated rather than implied. -->
                            <div v-if="result.unmet.length" class="mt-3 flex flex-wrap gap-1.5">
                                <span v-for="key in result.unmet" :key="key"
                                    class="rounded-full bg-surface-100 px-2.5 py-[3px] text-[11.5px] font-semibold text-slate-500">
                                    {{ $t('consultantMatch.criteriaNames.' + key) }}
                                </span>
                            </div>

                            <ul v-if="result.readiness.length" class="mt-3 space-y-1 border-t border-surface-100 pt-3">
                                <li v-for="(finding, index) in result.readiness" :key="index"
                                    class="flex items-start gap-2 text-[12.5px]"
                                    :class="finding.blocking ? 'text-[#c0442c]' : 'text-[#8a6208]'">
                                    <span class="mt-1.5 size-1.5 shrink-0 rounded-full"
                                        :class="finding.blocking ? 'bg-[#c0442c]' : 'bg-[#c98a12]'" />
                                    <span>{{ findingText(finding) }}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'require-page', requiredPage: 'Inquiries', requiredCompanyFlag: 'inquiry_pipeline_enabled' })

import { citizenInquiryService } from '@/components/api/user/CitizenInquiryService'
import { consultantSkillService } from '@/components/api/user/ConsultantSkillService'
import { inquiryConsultantInvitationService } from '@/components/api/user/InquiryConsultantInvitationService'
import { municipalityService } from '@/components/api/user/MunicipalityService'
import { regionService } from '@/components/api/user/RegionService'
import { spokenLanguageService } from '@/components/api/user/SpokenLanguageService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const { t } = useI18n()
const { successAlert, errorAlert } = useAlert()
const userStore = useUserStore() as any

// Same reasoning as the consultant profile page: a company's step scale
// isn't always 5.
const stepAssessmentMax = computed(() => {
    const max = Number(userStore.getUser?.company?.onboarding_preferences?.consultant_step_count)
    return Number.isInteger(max) && max >= 1 && max <= 10 ? max : 5
})

const SKILL_TYPES = ['competence', 'course', 'topic']

const inquiryUuid = String(route.params.inquiry_uuid)

const breadcrumbLinks = [
    {
        name: 'inquiries.inquiries',
        translate: true,
        href: '/inquiries',
    },
    {
        name: 'consultantMatch.title',
        translate: true,
        href: `/inquiries/${inquiryUuid}/match`,
    },
]

function emptyForm() {
    return {
        skill_uuids: [] as string[],
        spoken_language_uuids: [] as string[],
        municipality_uuid: null as string | null,
        region_uuid: null as string | null,
        has_car: null as boolean | null,
        min_travel_km: '',
        consultant_status: [] as string[],
        min_step_assessment: null as number | null,
        min_weekly_hours: '',
        primary_spoken_language_uuid: null as string | null,
        secondary_spoken_language_uuid: null as string | null,
        within_travel_range_only: false,
        sort: 'match' as 'match' | 'distance',
    }
}

// The inquiry's own language needs, as the starting point of a search.
function prefillFromInquiry() {
    state.form.primary_spoken_language_uuid = state.inquiry?.primary_spoken_language?.uuid ?? null
    state.form.secondary_spoken_language_uuid = state.inquiry?.secondary_spoken_language?.uuid ?? null
}

const state = reactive({
    error: {} as Error,
    catalogue: [] as any[],
    criteriaAsked: [] as string[],
    hasSearched: false,
    isSearching: false,
    languages: [] as any[],
    municipalities: [] as any[],
    regions: [] as any[],
    results: [] as any[],
    picked: [] as string[],
    isInviting: false,
    inquiry: null as any,
    locationGeocoded: false,
    form: emptyForm(),
})

const inquiryLocation = computed(() =>
    [state.inquiry?.location_address, state.inquiry?.location_postal_code].filter(Boolean).join(', ')
)

const locationStatus = computed(() => {
    if (state.inquiry?.location_geocoded) {
        return t('inquiryMatchNeeds.geocoded.' + (state.inquiry.location_geocode_source || 'address'))
    }

    return state.inquiry?.location_geocoded_at ? t('inquiryMatchNeeds.notFound') : t('inquiryMatchNeeds.pending')
})

const secondaryLanguageName = computed(() =>
    state.languages.find((l: any) => l.uuid === state.form.secondary_spoken_language_uuid)?.name ?? ''
)

function distanceText(result: any) {
    if (result.distance_km === null || result.distance_km === undefined) {
        return t('consultantMatch.distance.unknown')
    }

    const km = Number(result.distance_km).toLocaleString('da-DK', { maximumFractionDigits: 1 })

    return result.distance_basis === 'postal_code'
        ? t('consultantMatch.distance.approx', { km })
        : t('consultantMatch.distance.km', { km })
}

function distanceClass(result: any) {
    if (result.distance_km === null || result.distance_km === undefined) return 'bg-surface-100 text-slate-500'

    return result.unmet.includes('within_travel_range')
        ? 'bg-[#fdf3df] text-[#8a6208]'
        : 'bg-[#eef6fb] text-secondary'
}

function setSort(sort: 'match' | 'distance') {
    if (state.form.sort === sort) return
    state.form.sort = sort
    if (state.hasSearched) search()
}

const fullCount = computed(() => state.results.filter((r: any) => r.match === 'full').length)

const municipalityOptions = computed(() =>
    state.municipalities.map((m: any) => ({ value: m.uuid, label: m.name }))
)
const regionOptions = computed(() => state.regions.map((r: any) => ({ value: r.uuid, label: r.name })))
const languageOptions = computed(() => state.languages.map((l: any) => ({ value: l.uuid, label: l.name })))
const statusOptions = computed(() =>
    ['available', 'partially_available', 'unavailable', 'inactive']
        .map((value) => ({ value, label: t('consultantProfile.statuses.' + value) }))
)

onMounted(() => {
    fetchLookups()
    fetchInquiry()
})

async function fetchInquiry() {
    try {
        const response = await citizenInquiryService.getSelectedInquiry(inquiryUuid)
        state.inquiry = response?.data ?? null
        prefillFromInquiry()
    } catch (error: any) {
        state.error = error
    }
}

function skillOptions(type: string) {
    return state.catalogue
        .filter((skill: any) => skill.type === type && skill.is_active)
        .map((skill: any) => ({ value: skill.uuid, label: skill.name }))
}

function selectedSkills(type: string) {
    return state.form.skill_uuids.filter(
        (uuid) => state.catalogue.find((skill: any) => skill.uuid === uuid)?.type === type
    )
}

function setSkills(type: string, uuids: string[]) {
    // Replace this type's selection and leave the others alone, so picking a
    // course cannot clear the competences.
    const others = state.form.skill_uuids.filter(
        (uuid) => state.catalogue.find((skill: any) => skill.uuid === uuid)?.type !== type
    )
    state.form.skill_uuids = [...others, ...(uuids ?? [])]
}

function togglePick(uuid: string) {
    state.picked = state.picked.includes(uuid)
        ? state.picked.filter((picked) => picked !== uuid)
        : [...state.picked, uuid]
}

async function invite() {
    state.isInviting = true
    try {
        const response = await inquiryConsultantInvitationService.invite(inquiryUuid, state.picked)
        state.picked = []
        successAlert(`${t('alert.success')}!`, response?.message ?? t('consultantMatch.asked'))
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('consultantMatch.askFailed'))
    }
    state.isInviting = false
}

function matchClass(match: string) {
    if (match === 'full') return 'bg-[#e6f6ee] text-[#177a53]'
    if (match === 'partial') return 'bg-[#fdf3df] text-[#8a6208]'

    return 'bg-surface-100 text-slate-500'
}

function profileLine(result: any) {
    const p = result.profile ?? {}

    return [
        p.municipality_name,
        p.consultant_status ? t('consultantProfile.statuses.' + p.consultant_status) : '',
        p.has_car ? t('consultantProfile.form.hasCar') : '',
        p.max_travel_km ? `${p.max_travel_km} km` : '',
        p.desired_weekly_hours ? `${p.desired_weekly_hours} t/uge` : '',
        p.step_assessment ? `${t('consultantProfile.form.stepAssessment')} ${p.step_assessment}` : '',
    ].filter(Boolean).join(' · ')
}

function findingText(finding: any) {
    if (finding.code === 'skill_expired') {
        return t('consultantProfile.findings.skill_expired', { skill: finding.skill, date: finding.expires_at })
    }

    if (finding.document_type) {
        return t('consultantProfile.findings.' + finding.code, {
            document: t('consultantProfile.documentTypes.' + finding.document_type),
            date: finding.expires_at ?? '',
        })
    }

    return t('consultantProfile.findings.' + finding.code)
}

async function fetchLookups() {
    try {
        const [catalogue, municipalities, regions, languages] = await Promise.all([
            consultantSkillService.getSkills(),
            municipalityService.getAllMunicipalities(),
            regionService.getAllRegions(),
            spokenLanguageService.getSpokenLanguages(),
        ])
        state.catalogue = catalogue?.data ?? []
        state.municipalities = municipalities?.data ?? []
        state.regions = regions?.data ?? []
        state.languages = languages?.data ?? []
    } catch (error: any) {
        state.error = error
    }
}

function reset() {
    state.form = emptyForm()
    prefillFromInquiry()
    state.results = []
    state.criteriaAsked = []
    state.hasSearched = false
}

async function search() {
    state.isSearching = true
    state.error = {}
    try {
        // Only what was actually filled in is sent: an empty criterion must not
        // become a requirement nobody can meet.
        // The case being matched: its location is where distances run from.
        const payload: Record<string, any> = { inquiry_uuid: inquiryUuid, sort: state.form.sort }
        if (state.form.primary_spoken_language_uuid) payload.primary_spoken_language_uuid = state.form.primary_spoken_language_uuid
        if (state.form.secondary_spoken_language_uuid) payload.secondary_spoken_language_uuid = state.form.secondary_spoken_language_uuid
        if (state.form.within_travel_range_only) payload.within_travel_range_only = true
        if (state.form.skill_uuids.length) payload.skill_uuids = state.form.skill_uuids
        if (state.form.spoken_language_uuids.length) payload.spoken_language_uuids = state.form.spoken_language_uuids
        if (state.form.municipality_uuid) payload.municipality_uuid = state.form.municipality_uuid
        if (state.form.region_uuid) payload.region_uuid = state.form.region_uuid
        if (state.form.has_car !== null) payload.has_car = state.form.has_car
        if (state.form.min_travel_km !== '') payload.min_travel_km = Number(state.form.min_travel_km)
        if (state.form.consultant_status.length) payload.consultant_status = state.form.consultant_status
        if (state.form.min_step_assessment !== null) payload.min_step_assessment = state.form.min_step_assessment
        if (state.form.min_weekly_hours !== '') payload.min_weekly_hours = Number(state.form.min_weekly_hours)

        const response = await consultantSkillService.match(payload)
        state.results = response?.data ?? []
        state.criteriaAsked = response?.meta?.criteria_asked ?? []
        state.locationGeocoded = !!response?.meta?.location?.geocoded
        state.hasSearched = true
        // A new result set makes an old selection meaningless.
        state.picked = []
    } catch (error: any) {
        state.error = error
    }
    state.isSearching = false
}
</script>
