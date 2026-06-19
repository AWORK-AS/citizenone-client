<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('settings.tabs.company') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('settings.tabs.company') }}</template>

            <ModulesUserSettingsTab />

            <LoadingSpinner :isActive="state.isPageLoading">
                <form @submit.prevent="submitForm()" class="mt-8 max-w-4xl">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="grid grid-cols-1 gap-3">
                        <div class="space-y-1">
                            <div class="flex gap-x-4 items-center">
                                <FormLabel :label="$t('settings.company.form.companyLogo')" />
                                <Tooltip v-if="logoPreviewUrl" :text="$t('settings.company.form.remove')">
                                    <Icon name="ph:trash"
                                        class="p-2 size-4 cursor-pointer text-red-500 text-sm hover:text-red-700"
                                        @click="removeLogo" />
                                </Tooltip>
                            </div>
                            <input type="file" ref="logoInput" @change="onLogoChange"
                                accept="image/png,image/jpeg,image/svg+xml" class="hidden" />
                            <div class="flex items-center gap-4">
                                <div class="relative cursor-pointer" @click="triggerLogoInput">
                                    <div v-if="!logoPreviewUrl"
                                        class="w-32 h-32 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center hover:border-primary hover:bg-gray-100 transition-colors">
                                        <Icon name="ph:upload-simple" class="w-8 h-8 text-gray-400" />
                                    </div>
                                    <template v-else>
                                        <img :src="logoPreviewUrl" alt="Company logo"
                                            class="w-32 h-32 rounded-md object-contain border-2 border-gray-200 bg-white" />
                                        <div
                                            class="rounded-md absolute inset-0 bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span class="text-xs">{{ $t('changeImage') }}</span>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-1">
                            <FormLabel for="name" :label="$t('settings.company.form.companyName')" />
                            <FormTextField id="name" name="name" :placeholder="$t('settings.company.form.companyName')"
                                v-model="state.formCompany.name" />
                            <FormError :error="v$?.formCompany?.name?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.name?.[0]" />
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div class="space-y-1">
                                <FormLabel for="cvr" :label="$t('settings.company.form.cvr')" />
                                <FormTextField id="cvr" name="cvr" :placeholder="$t('settings.company.form.cvr')"
                                    v-model="state.formCompany.cvr" :maxLength="8" @input="validateCVR" />
                                <FormError :error="v$?.formCompany?.cvr?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.cvr?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="website" :label="$t('settings.company.form.website')" />
                                <FormTextField id="website" name="website"
                                    :placeholder="$t('settings.company.form.website')"
                                    v-model="state.formCompany.website" />
                                <FormError :error="v$?.formCompany?.website?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.website?.[0]" />
                            </div>
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="accountant_email" :label="$t('settings.company.form.accountantEmail')" />
                            <FormTextField id="accountant_email" name="accountant_email"
                                :placeholder="$t('settings.company.form.accountantEmail')"
                                v-model="state.formCompany.accountant_email" />
                            <FormError :error="v$?.formCompany?.accountant_email?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.accountant_email?.[0]" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="phone" :label="$t('settings.company.form.phone')" />
                            <FormTextField id="phone" name="phone" :placeholder="$t('settings.company.form.phone')"
                                v-model="state.formCompany.phone" />
                            <FormError :error="v$?.formCompany?.phone?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.phone?.[0]" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="street" :label="$t('settings.company.form.street')" />
                            <FormTextField id="street" name="street" :placeholder="$t('settings.company.form.street')"
                                v-model="state.formCompany.street" />
                            <FormError :error="v$?.formCompany?.street?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.street?.[0]" />
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div class="space-y-1">
                                <FormLabel for="region" :label="$t('settings.company.form.region')" />
                                <FormSelect id="region" :options="state.options.regions"
                                    v-model="state.formCompany.region" @change="changeSelectedRegion" />
                                <FormError :error="v$?.formCompany?.region?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.region_uuid?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="municipality" :label="$t('settings.company.form.municipality')" />
                                <FormSelect id="municipality" :options="state.options.municipalities"
                                    v-model="state.formCompany.municipality" />
                                <FormError :error="v$?.formCompany?.municipality?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.municipality_uuid?.[0]" />
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div class="space-y-1">
                                <FormLabel for="city" :label="$t('settings.company.form.city')" />
                                <FormTextField id="city" name="city" :placeholder="$t('settings.company.form.city')"
                                    v-model="state.formCompany.city" />
                                <FormError :error="v$?.formCompany?.city?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.city?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="post_code" :label="$t('settings.company.form.postCode')" />
                                <FormTextField id="post_code" name="post_code"
                                    :placeholder="$t('settings.company.form.postCode')"
                                    v-model="state.formCompany.post_code" />
                                <FormError :error="v$?.formCompany?.post_code?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.post_code?.[0]" />
                            </div>
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="citizen_display_uuid"
                                :label="$t('settings.company.form.citizensDisplay')" />
                            <FormSelectMultiple id="citizen_display_uuid" :options="state.options.citizen_displays"
                                v-model="state.formCompany.citizen_display_uuid" />
                            <FormError
                                :error="v$?.formCompany?.citizen_display_uuid?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.citizen_display_uuid?.[0]" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="intervention_notification_hours"
                                :label="$t('settings.company.form.interventionNotificationHours')" />
                            <FormTextField id="intervention_notification_hours" name="intervention_notification_hours"
                                :placeholder="$t('settings.company.form.interventionNotificationHours')"
                                v-model="state.formCompany.intervention_notification_hours" />
                            <FormError
                                :error="v$?.formCompany?.intervention_notification_hours?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.intervention_notification_hours?.[0]" />
                        </div>
                        <div class="space-y-1 flex items-center gap-x-2">
                            <FormSwitch :value="state.formCompany.is_2fa_enabled"
                                @toggleSwitch="state.formCompany.is_2fa_enabled = !state.formCompany.is_2fa_enabled" />
                            <p>
                                {{ $t('settings.company.form.2fa') }}
                            </p>
                        </div>
                        <div class="space-y-1 flex items-center gap-x-2">
                            <FormSwitch :value="state.formCompany.group_chat_enabled"
                                @toggleSwitch="state.formCompany.group_chat_enabled = !state.formCompany.group_chat_enabled" />
                            <p>
                                {{ $t('settings.company.form.groupChat') }}
                            </p>
                        </div>
                        <div class="space-y-1 flex items-center gap-x-2">
                            <FormSwitch :value="state.formCompany.checkin_enabled"
                                @toggleSwitch="state.formCompany.checkin_enabled = !state.formCompany.checkin_enabled" />
                            <p>
                                {{ $t('settings.company.form.checkinOut') }}
                            </p>
                        </div>
                        <div class="space-y-1 flex items-center gap-x-2">
                            <FormSwitch :value="state.formCompany.intervention_checkin_enabled"
                                @toggleSwitch="state.formCompany.intervention_checkin_enabled = !state.formCompany.intervention_checkin_enabled" />
                            <p>
                                {{ $t('settings.company.form.interventionCheckinOut') }}
                            </p>
                        </div>
                        <div class="space-y-1 flex items-center gap-x-2">
                            <FormSwitch :value="state.formCompany.change_password_enabled"
                                @toggleSwitch="state.formCompany.change_password_enabled = !state.formCompany.change_password_enabled" />
                            <p>
                                {{ $t('settings.company.form.allowChangePassword') }}
                            </p>
                        </div>
                        <div class="space-y-1 flex items-center gap-x-2">
                            <FormSwitch :value="state.formCompany.plans_enabled"
                                @toggleSwitch="state.formCompany.plans_enabled = !state.formCompany.plans_enabled" />
                            <p>
                                {{ $t('settings.company.form.allowPlans') }}
                            </p>
                        </div>
                        <div class="space-y-1 flex items-center gap-x-2">
                            <FormSwitch :value="state.formCompany.goals_enabled"
                                @toggleSwitch="state.formCompany.goals_enabled = !state.formCompany.goals_enabled" />
                            <p>
                                {{ $t('settings.company.form.allowGoals') }}
                            </p>
                        </div>
                        <div class="space-y-1 flex items-center gap-x-2">
                            <FormSwitch :value="state.formCompany.subgoals_enabled"
                                @toggleSwitch="state.formCompany.subgoals_enabled = !state.formCompany.subgoals_enabled" />
                            <p>
                                {{ $t('settings.company.form.allowSubGoals') }}
                            </p>
                        </div>
                        <div class="space-y-1 flex items-center gap-x-2">
                            <FormSwitch :value="state.formCompany.is_lock_past_schedules"
                                @toggleSwitch="state.formCompany.is_lock_past_schedules = !state.formCompany.is_lock_past_schedules" />
                            <p>
                                {{ $t('settings.company.form.lockPastSchedules') }}
                            </p>
                        </div>
                        <div class="space-y-1 flex items-center gap-x-2">
                            <FormSwitch :value="state.formCompany.warning_13_hour_shift_enabled"
                                @toggleSwitch="state.formCompany.warning_13_hour_shift_enabled = !state.formCompany.warning_13_hour_shift_enabled" />
                            <p>
                                {{ $t('settings.company.form.warning13HourShift') }}
                            </p>
                        </div>
                        <div class="space-y-1 flex items-center gap-x-2">
                            <FormSwitch :value="state.formCompany.warning_11_hour_rest_enabled"
                                @toggleSwitch="state.formCompany.warning_11_hour_rest_enabled = !state.formCompany.warning_11_hour_rest_enabled" />
                            <p>
                                {{ $t('settings.company.form.warning11HourRest') }}
                            </p>
                        </div>
                        <div class="space-y-1 flex items-center gap-x-2">
                            <FormSwitch :value="state.formCompany.warning_48_hour_rule_enabled"
                                @toggleSwitch="state.formCompany.warning_48_hour_rule_enabled = !state.formCompany.warning_48_hour_rule_enabled" />
                            <p>
                                {{ $t('settings.company.form.warning48HourRule') }}
                            </p>
                        </div>
                        <div class="space-y-1 flex items-center gap-x-2">
                            <FormSwitch :value="state.formCompany.transfer_norm_hours_enabled"
                                @toggleSwitch="state.formCompany.transfer_norm_hours_enabled = !state.formCompany.transfer_norm_hours_enabled" />
                            <p>
                                {{ $t('settings.company.form.transferNormHours') }}
                            </p>
                        </div>
                        <div class="space-y-1 flex items-center gap-x-2">
                            <FormSwitch :value="state.formCompany.is_sort_by_status"
                                @toggleSwitch="state.formCompany.is_sort_by_status = !state.formCompany.is_sort_by_status" />
                            <p>
                                {{ $t('settings.company.form.isSortByStatus') }}
                            </p>
                        </div>
                        <div class="space-y-1 flex items-center gap-x-2">
                            <FormSwitch :value="state.formCompany.social_og_boligstyrelsen"
                                @toggleSwitch="state.formCompany.social_og_boligstyrelsen = !state.formCompany.social_og_boligstyrelsen" />
                            <p>
                                Social- og Boligstyrelsen
                            </p>
                        </div>
                        <div class="space-y-1 flex items-center gap-x-2">
                            <FormSwitch :value="state.formCompany.quick_risk_assessment_enabled"
                                @toggleSwitch="state.formCompany.quick_risk_assessment_enabled = !state.formCompany.quick_risk_assessment_enabled" />
                            <p>
                                {{ $t('settings.company.form.quickRiskAssessment') }}
                            </p>
                        </div>
                        <div class="space-y-1 flex items-center gap-x-2">
                            <FormSwitch :value="state.formCompany.register_transport_enabled"
                                @toggleSwitch="state.formCompany.register_transport_enabled = !state.formCompany.register_transport_enabled" />
                            <p>
                                {{ $t('settings.company.form.registerTransport') }}
                            </p>
                        </div>
                        <div class="space-y-1 flex items-center gap-x-2">
                            <FormSwitch :value="state.formCompany.holiday_non_sunday_hours_enabled"
                                @toggleSwitch="state.formCompany.holiday_non_sunday_hours_enabled = !state.formCompany.holiday_non_sunday_hours_enabled" />
                            <p>
                                {{ $t('settings.company.form.holidayNonSundayHours') }}
                            </p>
                        </div>

                    </div>

                    <div class="mt-6 border-t border-gray-200 pt-6 space-y-4">
                        <h3 class="text-sm font-semibold text-gray-700">{{ $t('settings.company.form.ipRestriction') }}</h3>
                        <div class="space-y-1 flex items-center gap-x-2">
                            <FormSwitch :value="state.formCompany.is_ip_restriction_enabled"
                                @toggleSwitch="state.formCompany.is_ip_restriction_enabled = !state.formCompany.is_ip_restriction_enabled" />
                            <p>{{ $t('settings.company.form.enableIpRestriction') }}</p>
                        </div>
                        <template v-if="state.formCompany.is_ip_restriction_enabled">
                            <div class="space-y-1 max-w-xs">
                                <FormLabel :label="$t('settings.company.form.ipRestrictionAction')" />
                                <FormSelect
                                    :options="[{ value: 'block', label: $t('settings.company.form.actionBlock') }, { value: 'otp', label: $t('settings.company.form.actionOtp') }]"
                                    v-model="state.formCompany.ip_restriction_action" />
                            </div>
                            <div>
                                <FormButton type="button" buttonStyle="action" @click="navigateTo('/settings/ip-restrictions')">
                                    {{ $t('settings.company.form.manageIpWhitelist') }}
                                </FormButton>
                            </div>
                        </template>
                    </div>

                    <div class="mt-6 border-t border-gray-200 pt-6 space-y-4">
                        <h3 class="text-sm font-semibold text-gray-700">{{ $t('settings.company.form.deviceRestriction') }}</h3>
                        <div class="space-y-1 flex items-center gap-x-2">
                            <FormSwitch :value="state.formCompany.is_device_restriction_enabled"
                                @toggleSwitch="state.formCompany.is_device_restriction_enabled = !state.formCompany.is_device_restriction_enabled" />
                            <p>{{ $t('settings.company.form.enableDeviceRestriction') }}</p>
                        </div>
                        <template v-if="state.formCompany.is_device_restriction_enabled">
                            <div class="space-y-1 max-w-xs">
                                <FormLabel :label="$t('settings.company.form.deviceRestrictionAction')" />
                                <FormSelect
                                    :options="[{ value: 'block', label: $t('settings.company.form.actionBlock') }, { value: 'otp', label: $t('settings.company.form.actionOtp') }]"
                                    v-model="state.formCompany.device_restriction_action" />
                            </div>
                            <div>
                                <FormButton type="button" buttonStyle="action" @click="navigateTo('/settings/approved-devices')">
                                    {{ $t('settings.company.form.manageApprovedDevices') }}
                                </FormButton>
                            </div>
                        </template>
                    </div>

                    <div class="mt-6">
                        <FormButton type="submit" buttonStyle="primary" class="w-full">
                            {{ $t('save') }}
                        </FormButton>
                    </div>
                </form>

                <!-- Company modules — admin enables/disables whole modules for the company -->
                <div class="mt-8 card" v-if="isAtLeast('Admin') && moduleState.pages.length">
                    <div class="card-header">
                        <h3 class="text-sm font-semibold text-slate-900">Moduler</h3>
                    </div>
                    <p class="text-sm text-slate-500 mt-1 mb-4">Vælg hvilke moduler virksomheden bruger. Slået fra skjuler modulet for alle i virksomheden.</p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div v-for="page in moduleState.pages" :key="page.uuid"
                            class="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5">
                            <span class="text-sm text-slate-800">{{ $t(`companyModules.${page.name}`) }}</span>
                            <FormSwitch :value="moduleState.enabled.includes(page.uuid)" @toggleSwitch="toggleModule(page.uuid)" />
                        </div>
                    </div>
                    <div class="mt-5">
                        <FormButton type="button" buttonStyle="primary" @click="saveModules">
                            {{ $t('save') }}
                        </FormButton>
                    </div>
                </div>
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { userService } from "@/components/api/user/UserService";
import { regionService } from '@/components/api/user/RegionService'
import { municipalityService } from '@/components/api/user/MunicipalityService'
import { citizenDisplayService } from '@/components/api/user/CitizenDisplayService'
import { companyService } from '@/components/api/user/CompanyService'
import { usePermissions } from '@/composables/usePermissions'
import { useUserStore } from '@/store/user'
import { useCompanyStore } from '@/store/company'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore()
const companyStore = useCompanyStore()
const language = useI18n()
const { successAlert } = useAlert()
const { t } = useI18n()
const { isAtLeast } = usePermissions()

// --- Company modules (admin enable/disable whole modules) ---
const moduleState = reactive<{ pages: any[]; enabled: string[] }>({ pages: [], enabled: [] })

async function fetchCompanyModules() {
    try {
        const response = await companyService.getCompanyModules()
        moduleState.pages = response?.pages ?? []
        moduleState.enabled = response?.enabled_page_uuids ?? []
    } catch (e) { /* leave empty */ }
}

function toggleModule(uuid: string) {
    const i = moduleState.enabled.indexOf(uuid)
    if (i === -1) moduleState.enabled.push(uuid)
    else moduleState.enabled.splice(i, 1)
}

async function saveModules() {
    try {
        await companyService.updateCompanyModules({ page_uuids: moduleState.enabled })
        // Update the in-memory user so the sidebar regenerates live (no reload).
        const enabledNames = moduleState.pages.filter((p: any) => moduleState.enabled.includes(p.uuid)).map((p: any) => p.name)
        const u: any = userStore.getUser
        if (u?.company) userStore.setUser({ ...u, company: { ...u.company, module_pages: enabledNames } })
        successAlert(`${t('alert.success')}!`, 'Moduler opdateret.')
    } catch (e) { }
}

onMounted(fetchCompanyModules)

// Company logo for PDF branding
const logoInput = ref<HTMLInputElement | null>(null)
const logoPreviewUrl = ref('')
const breadcrumbLinks = [
    {
        name: 'settings.tabs.company',
        translate: true,
        href: '/settings/company',
    },
]

const state = reactive({
    error: {} as Error,
    formCompany: {
        name: '',
        cvr: '',
        website: '',
        accountant_email: '',
        phone: '',
        street: '',
        region: '',
        municipality: '',
        city: '',
        post_code: '',
        citizen_display_uuid: [] as any,
        intervention_notification_hours: '',
        is_2fa_enabled: false,
        group_chat_enabled: false,
        checkin_enabled: false,
        intervention_checkin_enabled: false,
        change_password_enabled: false,
        plans_enabled: false,
        goals_enabled: false,
        subgoals_enabled: false,
        is_lock_past_schedules: false,
        transfer_norm_hours_enabled: false,
        is_sort_by_status: false,
        social_og_boligstyrelsen: false,
        quick_risk_assessment_enabled: false,
        logo: null as File | null,
        should_delete_logo: false,
        register_transport_enabled: false,
        warning_13_hour_shift_enabled: true,
        warning_11_hour_rest_enabled: true,
        warning_48_hour_rule_enabled: true,
        is_ip_restriction_enabled: false,
        ip_restriction_action: 'block' as string,
        is_device_restriction_enabled: false,
        device_restriction_action: 'block' as string,
        holiday_non_sunday_hours_enabled: false,
    },
    isPageLoading: false,
    options: {
        cities: [],
        citizen_displays: [],
        municipalities: [],
        regions: [],
    }
})

// Unsaved-changes guard: warn before navigating away or reloading with edits.
const isDirty = ref(false)
const formReady = ref(false)

const rules = computed(() => {
    return {
        formCompany: {
            name: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

onMounted(() => {
    fetchAllCitizenDisplays()
    fetchRegions()
})

watch(() => language.locale.value, (newValue: any) => {
    if (newValue != null) {
        fetchAllCitizenDisplays()
    }
})

watch(() => userStore.getUser, (newValue: any) => {
    if (newValue != null) {
        const address = newValue?.company?.company_address ?? companyStore.getCompanyAddress
        state.formCompany = {
            name: newValue?.company?.name,
            cvr: newValue?.company?.cvr,
            website: newValue?.company?.website,
            accountant_email: newValue?.company?.accountant_email,
            phone: newValue?.company?.phone,
            street: address?.street ?? '',
            region: address?.region?.uuid ?? '',
            municipality: address?.municipality?.uuid ?? '',
            city: address?.city ?? '',
            post_code: address?.post_code ?? '',
            citizen_display_uuid: [],
            intervention_notification_hours: newValue?.company?.intervention_notification_hours?.toString(),
            is_2fa_enabled: newValue?.company?.is_2fa_enabled ? true : false,
            group_chat_enabled: newValue?.company?.group_chat_enabled ? true : false,
            checkin_enabled: newValue?.company?.checkin_enabled ? true : false,
            intervention_checkin_enabled: newValue?.company?.intervention_checkin_enabled ? true : false,
            change_password_enabled: newValue?.company?.change_password_enabled ? true : false,
            plans_enabled: newValue?.company?.employee_create_plans_enabled ? true : false,
            goals_enabled: newValue?.company?.employee_create_goals_enabled ? true : false,
            subgoals_enabled: newValue?.company?.employee_create_subgoals_enabled ? true : false,
            is_lock_past_schedules: newValue?.company?.is_lock_past_schedules ? true : false,
            transfer_norm_hours_enabled: newValue?.company?.transfer_norm_hours_enabled ? true : false,
            is_sort_by_status: newValue?.company?.is_sort_by_status ? true : false,
            social_og_boligstyrelsen: newValue?.company?.social_og_boligstyrelsen ? true : false,
            quick_risk_assessment_enabled: newValue?.company?.quick_risk_assessment_enabled ? true : false,
            register_transport_enabled: newValue?.company?.register_transport_enabled ? true : false,
            warning_13_hour_shift_enabled: newValue?.company?.warning_13_hour_shift_enabled !== false,
            warning_11_hour_rest_enabled: newValue?.company?.warning_11_hour_rest_enabled !== false,
            warning_48_hour_rule_enabled: newValue?.company?.warning_48_hour_rule_enabled !== false,
            is_ip_restriction_enabled: newValue?.company?.is_ip_restriction_enabled ? true : false,
            ip_restriction_action: newValue?.company?.ip_restriction_action ?? 'block',
            is_device_restriction_enabled: newValue?.company?.is_device_restriction_enabled ? true : false,
            device_restriction_action: newValue?.company?.device_restriction_action ?? 'block',
            holiday_non_sunday_hours_enabled: newValue?.company?.holiday_non_sunday_hours_enabled ? true : false,
            logo: null,
            should_delete_logo: false,
        }
        // Load existing company logo if available
        if (newValue?.company?.logo_url) {
            logoPreviewUrl.value = newValue.company.logo_url
        }
        fetchMunicipalitiesPerRegion(address?.region?.uuid)
        const displays = newValue?.company?.citizen_displays ?? companyStore.getCitizenDisplays
        displays?.forEach((item: any) => {
            state.formCompany.citizen_display_uuid.push(item.uuid)
        })
        // Treat the freshly-loaded values as the clean baseline.
        formReady.value = false
        nextTick(() => { formReady.value = true; isDirty.value = false })
    }
})

// Mark the form dirty once the user changes anything after it loaded.
watch(() => state.formCompany, () => {
    if (formReady.value) isDirty.value = true
}, { deep: true })

function beforeUnloadHandler(e: BeforeUnloadEvent) {
    if (isDirty.value) { e.preventDefault(); e.returnValue = '' }
}
onMounted(() => window.addEventListener('beforeunload', beforeUnloadHandler))
onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnloadHandler))

onBeforeRouteLeave(() => {
    if (isDirty.value) {
        return window.confirm('Du har ugemte ændringer. Vil du forlade siden uden at gemme?')
    }
    return true
})

async function fetchAllCitizenDisplays() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await citizenDisplayService.getAllCitizenDisplay()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: language.locale.value === 'en' ? item.en_name : item.dk_name,
                })
            )
            state.options.citizen_displays = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchRegions() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await regionService.getAllRegions()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.regions = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchMunicipalitiesPerRegion(regionUuid: string) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            region_uuid: regionUuid
        }
        const response = await municipalityService.getAllMunicipalitiesPerRegion(params)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.municipalities = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function changeSelectedRegion(regionUuid: string) {
    if (regionUuid) {
        fetchMunicipalitiesPerRegion(regionUuid)
    }
}

const v$ = useVuelidate(rules, state)

function validateCVR(event: Event) {
    const input = event.target as HTMLInputElement
    input.value = input.value.replace(/[^0-9]/g, '').slice(0, 8)
    state.formCompany.cvr = input.value
}

// Logo upload functions
function triggerLogoInput() {
    logoInput.value?.click()
}

async function onLogoChange(event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
        state.formCompany.logo = file
        // Show preview immediately
        const reader = new FileReader()
        reader.onload = (e) => {
            logoPreviewUrl.value = e.target?.result as string
        }
        reader.readAsDataURL(file)
    }
}

function removeLogo() {
    state.formCompany.logo = null
    logoPreviewUrl.value = ''
    state.formCompany.should_delete_logo = true
}

async function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        state.error = {}
        state.isPageLoading = true
        try {
            if (state.formCompany.should_delete_logo) {
                await userService.deleteCompanyLogo()
                state.formCompany.should_delete_logo = false
            } else if (state.formCompany.logo) {
                const formData = new FormData()
                formData.append('logo', state.formCompany.logo)
                const logoResponse = await userService.uploadCompanyLogo(formData)
                if (logoResponse.data?.logo_url) {
                    logoPreviewUrl.value = logoResponse.data.logo_url
                }
                state.formCompany.logo = null
            }
            const params = {
                name: state.formCompany.name,
                cvr: state.formCompany.cvr,
                website: state.formCompany.website,
                accountant_email: state.formCompany.accountant_email,
                phone: state.formCompany.phone,
                street: state.formCompany.street,
                region_uuid: state.formCompany.region,
                municipality_uuid: state.formCompany.municipality,
                city: state.formCompany.city,
                post_code: state.formCompany.post_code,
                citizen_display_uuid: state.formCompany.citizen_display_uuid,
                intervention_notification_hours: state.formCompany.intervention_notification_hours,
                is_2fa_enabled: state.formCompany.is_2fa_enabled,
                group_chat_enabled: state.formCompany.group_chat_enabled,
                checkin_enabled: state.formCompany.checkin_enabled,
                intervention_checkin_enabled: state.formCompany.intervention_checkin_enabled,
                change_password_enabled: state.formCompany.change_password_enabled,
                employee_create_plans_enabled: state.formCompany.plans_enabled,
                employee_create_goals_enabled: state.formCompany.goals_enabled,
                employee_create_subgoals_enabled: state.formCompany.subgoals_enabled,
                is_lock_past_schedules: state.formCompany.is_lock_past_schedules,
                transfer_norm_hours_enabled: state.formCompany.transfer_norm_hours_enabled,
                is_sort_by_status: state.formCompany.is_sort_by_status,
                social_og_boligstyrelsen: state.formCompany.social_og_boligstyrelsen,
                quick_risk_assessment_enabled: state.formCompany.quick_risk_assessment_enabled,
                register_transport_enabled: state.formCompany.register_transport_enabled,
                warning_13_hour_shift_enabled: state.formCompany.warning_13_hour_shift_enabled,
                warning_11_hour_rest_enabled: state.formCompany.warning_11_hour_rest_enabled,
                warning_48_hour_rule_enabled: state.formCompany.warning_48_hour_rule_enabled,
                is_ip_restriction_enabled: state.formCompany.is_ip_restriction_enabled,
                ip_restriction_action: state.formCompany.ip_restriction_action,
                is_device_restriction_enabled: state.formCompany.is_device_restriction_enabled,
                device_restriction_action: state.formCompany.device_restriction_action,
                holiday_non_sunday_hours_enabled: state.formCompany.holiday_non_sunday_hours_enabled,
            }

            const response = await userService.updateCompany(params)
            if (response.data) {
                userStore.setUserCheckinStatus(state.formCompany.checkin_enabled)
                if (response.data.company_address) {
                    companyStore.setCompanyAddress(response.data.company_address)
                }
                if (response.data.citizen_displays) {
                    companyStore.setCitizenDisplays(response.data.citizen_displays)
                }
                const currentUser: any = { ...userStore.getUser }
                if (currentUser?.company) {
                    currentUser.company = { ...currentUser.company, ...response.data }
                    userStore.setUser(currentUser)
                }
                successAlert(`${t('alert.success')}!`, `${t('settings.company.form.alert.successfullyUpdated')}.`)
                isDirty.value = false
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    }
}
</script>