<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('consultantProfile.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ headerName }}</template>

            <ModulesUserEmployeeTabs />

            <div class="mt-8 space-y-5">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <!-- Whether this consultant can be put forward, and if not, why.
                     The same findings the matching step reads. -->
                <div class="rounded-lg border p-4"
                    :class="state.isReady ? 'border-[#1f9d6b]/30 bg-[#e6f6ee]' : 'border-[#f0c4b8] bg-[#fdf1ee]'">
                    <div class="flex items-start gap-3">
                        <Icon :name="state.isReady ? 'ph:check-circle' : 'ph:warning'" class="mt-0.5 size-5 shrink-0"
                            :class="state.isReady ? 'text-[#177a53]' : 'text-[#c0442c]'" />
                        <div class="min-w-0">
                            <p class="text-sm font-semibold"
                                :class="state.isReady ? 'text-[#177a53]' : 'text-[#c0442c]'">
                                {{ state.isReady ? $t('consultantProfile.ready') : $t('consultantProfile.notReady') }}
                            </p>
                            <ul v-if="state.readiness.length" class="mt-1.5 space-y-1">
                                <li v-for="(finding, index) in state.readiness" :key="index"
                                    class="flex items-start gap-2 text-[13px]"
                                    :class="finding.blocking ? 'text-[#c0442c]' : 'text-[#8a6208]'">
                                    <span class="mt-1.5 size-1.5 shrink-0 rounded-full"
                                        :class="finding.blocking ? 'bg-[#c0442c]' : 'bg-[#c98a12]'" />
                                    <span>{{ findingText(finding) }}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Profile -->
                <div class="rounded-lg border border-gray-200 bg-white p-4">
                    <p class="mb-4 text-sm font-semibold text-gray-900">
                        {{ $t('consultantProfile.sections.profile') }}
                    </p>
                    <div class="grid grid-cols-1 gap-x-4 gap-y-3.5 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <FormLabel for="municipality" :label="$t('consultantProfile.form.municipality')" />
                            <FormSelect id="municipality" v-model="state.form.municipality_uuid"
                                :options="municipalityOptions" />
                        </div>
                        <div>
                            <FormLabel for="region" :label="$t('consultantProfile.form.region')" />
                            <FormSelect id="region" v-model="state.form.region_uuid" :options="regionOptions" />
                        </div>
                        <div>
                            <FormLabel for="status" :label="$t('consultantProfile.form.status')" />
                            <FormSelect id="status" v-model="state.form.consultant_status" :options="statusOptions"
                                :searchable="false" />
                        </div>
                        <div>
                            <FormLabel for="onboarding" :label="$t('consultantProfile.form.onboarding')" />
                            <FormSelect id="onboarding" v-model="state.form.onboarding_status"
                                :options="onboardingOptions" :searchable="false" />
                        </div>
                        <div>
                            <FormLabel for="travel" :label="$t('consultantProfile.form.maxTravelKm')" />
                            <FormTextField id="travel" name="travel" v-model="state.form.max_travel_km"
                                placeholder="0" />
                        </div>
                        <div>
                            <FormLabel for="hours" :label="$t('consultantProfile.form.desiredWeeklyHours')" />
                            <FormTextField id="hours" name="hours" v-model="state.form.desired_weekly_hours"
                                placeholder="0" />
                        </div>
                        <div>
                            <FormLabel for="step" :label="$t('consultantProfile.form.stepAssessment')" />
                            <div class="flex flex-wrap gap-1.5">
                                <button v-for="step in 5" :key="step" type="button"
                                    class="size-9 rounded-lg border text-[13px] font-bold transition-colors"
                                    :class="Number(state.form.step_assessment) === step
                                        ? 'border-secondary bg-secondary text-white'
                                        : 'border-surface-200 bg-white text-slate-500 hover:bg-surface-50'"
                                    @click="state.form.step_assessment = Number(state.form.step_assessment) === step ? null : step">
                                    {{ step }}
                                </button>
                            </div>
                        </div>
                        <div class="flex items-end">
                            <div class="flex w-fit cursor-pointer items-center gap-2 pb-2.5"
                                @click="state.form.has_car = !state.form.has_car">
                                <FormCheckbox :value="!!state.form.has_car" />
                                <span class="text-sm">{{ $t('consultantProfile.form.hasCar') }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="mt-4 flex justify-end">
                        <FormButton type="button" buttonStyle="primary" :disabled="state.isSaving"
                            @click="saveProfile">
                            {{ $t('save') }}
                        </FormButton>
                    </div>
                </div>

                <!-- Skills -->
                <div class="rounded-lg border border-gray-200 bg-white p-4">
                    <p class="mb-1 text-sm font-semibold text-gray-900">
                        {{ $t('consultantProfile.sections.skills') }}
                    </p>
                    <p class="mb-4 text-xs text-gray-400">
                        {{ $t('consultantProfile.skillsHint') }}
                    </p>

                    <div v-for="type in TYPES" :key="type" class="mb-4 last:mb-0">
                        <FormLabel :for="`skills-${type}`"
                            :label="$t('consultantSkills.types.' + type + '.title')" />
                        <FormSelectMultiple :id="`skills-${type}`" :modelValue="selectedByType(type)"
                            :options="skillOptions(type)"
                            @update:modelValue="(value: any) => setSkillsForType(type, value)" />
                    </div>

                    <!-- A course certificate can run out, so the expiry sits next
                         to the course it belongs to rather than in a separate list. -->
                    <div v-if="chosenCourses.length" class="mt-4 space-y-2 border-t border-surface-100 pt-4">
                        <p class="text-xs font-bold text-slate-500">
                            {{ $t('consultantProfile.expiryHeading') }}
                        </p>
                        <div v-for="skill in chosenCourses" :key="skill.uuid"
                            class="flex flex-wrap items-end gap-3">
                            <p class="w-56 pb-2.5 text-[13px] text-slate-700">{{ skill.name }}</p>
                            <div class="w-44">
                                <FormDateField :id="`expiry-${skill.uuid}`" :name="`expiry-${skill.uuid}`"
                                    :placeholder="$t('consultantProfile.noExpiry')"
                                    :modelValue="expiryOf(skill.uuid)"
                                    @update:modelValue="(value: any) => setExpiry(skill.uuid, value)" />
                            </div>
                            <span v-if="isExpired(expiryOf(skill.uuid))"
                                class="mb-2.5 rounded-full bg-[#fbe9e5] px-2.5 py-[3px] text-[11.5px] font-bold text-[#c0442c]">
                                {{ $t('consultantProfile.expired') }}
                            </span>
                        </div>
                    </div>

                    <div class="mt-4 flex justify-end">
                        <FormButton type="button" buttonStyle="primary" :disabled="state.isSavingSkills"
                            @click="saveSkills">
                            {{ $t('save') }}
                        </FormButton>
                    </div>
                </div>

                <!-- Documents -->
                <div class="rounded-lg border border-gray-200 bg-white">
                    <p class="border-b border-gray-100 px-4 py-3 text-sm font-semibold text-gray-900">
                        {{ $t('consultantProfile.sections.documents') }}
                    </p>
                    <p v-if="!state.documents.length" class="px-4 py-5 text-sm text-gray-400">
                        {{ $t('consultantProfile.noDocuments') }}
                    </p>
                    <div v-for="doc in state.documents" :key="doc.uuid"
                        class="flex flex-wrap items-center gap-3 border-b border-gray-50 px-4 py-2.5 last:border-b-0">
                        <div class="min-w-0 flex-1">
                            <p class="truncate text-sm font-medium text-gray-900">{{ doc.name }}</p>
                            <p class="text-xs text-gray-400">
                                {{ $t('consultantProfile.documentTypes.' + doc.file_type) }}
                            </p>
                        </div>
                        <p class="text-[13px] text-slate-500">
                            {{ doc.expires_at ? formatDateToReadable(doc.expires_at) : $t('consultantProfile.noExpiry') }}
                        </p>
                        <span v-if="isExpired(doc.expires_at)"
                            class="rounded-full bg-[#fbe9e5] px-2.5 py-[3px] text-[11.5px] font-bold text-[#c0442c]">
                            {{ $t('consultantProfile.expired') }}
                        </span>
                        <span v-else-if="isExpiringSoon(doc.expires_at)"
                            class="rounded-full bg-[#fdf3df] px-2.5 py-[3px] text-[11.5px] font-bold text-[#8a6208]">
                            {{ $t('consultantProfile.expiringSoon') }}
                        </span>
                    </div>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { consultantSkillService } from '@/components/api/user/ConsultantSkillService'
import { municipalityService } from '@/components/api/user/MunicipalityService'
import { regionService } from '@/components/api/user/RegionService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const { successAlert, errorAlert } = useAlert()
const { t } = useI18n()
const { formatDateToReadable } = useDatetimeFormatter()

const TYPES = ['competence', 'course', 'topic']
const EXPIRING_SOON_DAYS = 60

const employeeUuid = String(route.params.employee_uuid)

const breadcrumbLinks = [
    {
        name: 'employees.employees',
        translate: true,
        href: '/employees',
    },
    {
        name: 'consultantProfile.title',
        translate: true,
        href: `/employees/${employeeUuid}/consultant-profile`,
    },
]

const state = reactive({
    error: {} as Error,
    catalogue: [] as any[],
    chosen: [] as any[],
    documents: [] as any[],
    isReady: true,
    isSaving: false,
    isSavingSkills: false,
    municipalities: [] as any[],
    name: '',
    readiness: [] as any[],
    regions: [] as any[],
    form: {
        municipality_uuid: null as string | null,
        region_uuid: null as string | null,
        has_car: false,
        max_travel_km: '',
        consultant_status: null as string | null,
        step_assessment: null as number | null,
        desired_weekly_hours: '',
        onboarding_status: null as string | null,
    },
})

const headerName = computed(() => state.name || t('consultantProfile.title'))

const municipalityOptions = computed(() =>
    state.municipalities.map((m: any) => ({ value: m.uuid, label: m.name }))
)
const regionOptions = computed(() =>
    state.regions.map((r: any) => ({ value: r.uuid, label: r.name }))
)
const statusOptions = computed(() =>
    ['available', 'partially_available', 'unavailable', 'inactive']
        .map((value) => ({ value, label: t('consultantProfile.statuses.' + value) }))
)
const onboardingOptions = computed(() =>
    ['not_started', 'in_progress', 'completed']
        .map((value) => ({ value, label: t('consultantProfile.onboardingStatuses.' + value) }))
)

// Only a course carries an expiry, so only chosen courses get a date field.
const chosenCourses = computed(() =>
    state.chosen
        .map((chosen: any) => state.catalogue.find((skill: any) => skill.uuid === chosen.uuid))
        .filter((skill: any) => skill?.type === 'course')
)

onMounted(() => {
    fetchProfile()
    fetchLookups()
})

function skillOptions(type: string) {
    return state.catalogue
        .filter((skill: any) => skill.type === type && skill.is_active)
        .map((skill: any) => ({ value: skill.uuid, label: skill.name }))
}

function selectedByType(type: string) {
    return state.chosen
        .filter((chosen: any) => state.catalogue.find((skill: any) => skill.uuid === chosen.uuid)?.type === type)
        .map((chosen: any) => chosen.uuid)
}

function setSkillsForType(type: string, uuids: string[]) {
    // Replace this type's selection and leave the other two alone, so editing one
    // dropdown cannot clear the others.
    const others = state.chosen.filter(
        (chosen: any) => state.catalogue.find((skill: any) => skill.uuid === chosen.uuid)?.type !== type
    )
    const kept = (uuids ?? []).map((uuid) => state.chosen.find((c: any) => c.uuid === uuid) ?? { uuid })

    state.chosen = [...others, ...kept]
}

function expiryOf(uuid: string) {
    return state.chosen.find((chosen: any) => chosen.uuid === uuid)?.expires_at ?? ''
}

function setExpiry(uuid: string, value: any) {
    state.chosen = state.chosen.map((chosen: any) =>
        chosen.uuid === uuid ? { ...chosen, expires_at: value || null } : chosen
    )
}

function isExpired(date: any) {
    if (!date) return false

    return new Date(date) < new Date(new Date().toDateString())
}

function isExpiringSoon(date: any) {
    if (!date || isExpired(date)) return false

    const limit = new Date()
    limit.setDate(limit.getDate() + EXPIRING_SOON_DAYS)

    return new Date(date) <= limit
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
        const [municipalities, regions] = await Promise.all([
            municipalityService.getAllMunicipalities(),
            regionService.getAllRegions(),
        ])
        state.municipalities = municipalities?.data ?? []
        state.regions = regions?.data ?? []
    } catch (_) {
        state.municipalities = []
        state.regions = []
    }
}

function applyProfile(data: any) {
    state.name = `${data.firstname ?? ''} ${data.lastname ?? ''}`.trim()
    state.documents = data.documents ?? []
    state.readiness = data.readiness ?? []
    state.isReady = !!data.is_ready
    state.chosen = (data.skills ?? []).map((skill: any) => ({
        uuid: skill.uuid,
        expires_at: skill.expires_at ?? null,
        note: skill.note ?? null,
    }))

    const profile = data.profile ?? {}
    state.form = {
        municipality_uuid: profile.municipality_uuid ?? null,
        region_uuid: profile.region_uuid ?? null,
        has_car: !!profile.has_car,
        max_travel_km: profile.max_travel_km === null || profile.max_travel_km === undefined ? '' : String(profile.max_travel_km),
        consultant_status: profile.consultant_status ?? null,
        step_assessment: profile.step_assessment ?? null,
        desired_weekly_hours: profile.desired_weekly_hours === null || profile.desired_weekly_hours === undefined ? '' : String(profile.desired_weekly_hours),
        onboarding_status: profile.onboarding_status ?? null,
    }
}

async function fetchProfile() {
    state.error = {}
    try {
        const [profile, catalogue] = await Promise.all([
            consultantSkillService.getProfile(employeeUuid),
            consultantSkillService.getSkills(),
        ])
        state.catalogue = catalogue?.data ?? []
        if (profile?.data) applyProfile(profile.data)
    } catch (error: any) {
        state.error = error
    }
}

async function saveProfile() {
    state.isSaving = true
    state.error = {}
    try {
        const response = await consultantSkillService.saveProfile(employeeUuid, {
            municipality_uuid: state.form.municipality_uuid,
            region_uuid: state.form.region_uuid,
            has_car: state.form.has_car,
            max_travel_km: state.form.max_travel_km === '' ? null : Number(state.form.max_travel_km),
            consultant_status: state.form.consultant_status,
            step_assessment: state.form.step_assessment,
            desired_weekly_hours: state.form.desired_weekly_hours === '' ? null : Number(state.form.desired_weekly_hours),
            onboarding_status: state.form.onboarding_status,
        })
        if (response?.data) applyProfile(response.data)
        successAlert(`${t('alert.success')}!`, `${t('consultantProfile.alert.saved')}.`)
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('consultantProfile.alert.saveFailed'))
    }
    state.isSaving = false
}

async function saveSkills() {
    state.isSavingSkills = true
    state.error = {}
    try {
        await consultantSkillService.saveConsultantSkills(employeeUuid, state.chosen)
        // Re-read rather than trusting the local list: the readiness findings
        // change with the skills, and they are computed on the server.
        await fetchProfile()
        successAlert(`${t('alert.success')}!`, `${t('consultantProfile.alert.skillsSaved')}.`)
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('consultantProfile.alert.saveFailed'))
    }
    state.isSavingSkills = false
}
</script>
