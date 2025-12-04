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
                    </div>
                    <div class="mt-6">
                        <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full">
                            {{ $t('save') }}
                        </FormButton>
                    </div>
                </form>
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
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore()
const language = useI18n()
const { successAlert } = useAlert()
const { t } = useI18n()
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
        is_2fa_enabled: false,
        group_chat_enabled: false,
        checkin_enabled: false,
        change_password_enabled: false,
        plans_enabled: false,
        goals_enabled: false,
        subgoals_enabled: false,
        is_lock_past_schedules: false,
        transfer_norm_hours_enabled: false,
        is_sort_by_status: false,
        social_og_boligstyrelsen: false,
        quick_risk_assessment_enabled: false,
    },
    isPageLoading: false,
    options: {
        cities: [],
        citizen_displays: [],
        municipalities: [],
        regions: [],
    }
})

const rules = computed(() => {
    return {
        formCompany: {
            name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
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
        state.formCompany = {
            name: newValue?.company?.name,
            cvr: newValue?.company?.cvr,
            website: newValue?.company?.website,
            accountant_email: newValue?.company?.accountant_email,
            phone: newValue?.company?.phone,
            street: newValue?.company?.company_address?.street,
            region: newValue?.company?.company_address?.region?.uuid,
            municipality: newValue?.company?.company_address?.municipality?.uuid,
            city: newValue?.company?.company_address?.city,
            post_code: newValue?.company?.company_address?.post_code,
            citizen_display_uuid: [],
            is_2fa_enabled: newValue?.company?.is_2fa_enabled ? true : false,
            group_chat_enabled: newValue?.company?.group_chat_enabled ? true : false,
            checkin_enabled: newValue?.company?.checkin_enabled ? true : false,
            change_password_enabled: newValue?.company?.change_password_enabled ? true : false,
            plans_enabled: newValue?.company?.employee_create_plans_enabled ? true : false,
            goals_enabled: newValue?.company?.employee_create_goals_enabled ? true : false,
            subgoals_enabled: newValue?.company?.employee_create_subgoals_enabled ? true : false,
            is_lock_past_schedules: newValue?.company?.is_lock_past_schedules ? true : false,
            transfer_norm_hours_enabled: newValue?.company?.transfer_norm_hours_enabled ? true : false,
            is_sort_by_status: newValue?.company?.is_sort_by_status ? true : false,
            social_og_boligstyrelsen: newValue?.company?.social_og_boligstyrelsen ? true : false,
            quick_risk_assessment_enabled: newValue?.company?.quick_risk_assessment_enabled ? true : false,
        }
        fetchMunicipalitiesPerRegion(newValue?.company?.company_address?.region?.uuid)
        newValue?.company?.citizen_displays?.forEach((item: any) => {
            state.formCompany.citizen_display_uuid.push(item.uuid)
        })
    }
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

async function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        state.error = {}
        state.isPageLoading = true
        try {
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
                is_2fa_enabled: state.formCompany.is_2fa_enabled,
                group_chat_enabled: state.formCompany.group_chat_enabled,
                checkin_enabled: state.formCompany.checkin_enabled,
                change_password_enabled: state.formCompany.change_password_enabled,
                employee_create_plans_enabled: state.formCompany.plans_enabled,
                employee_create_goals_enabled: state.formCompany.goals_enabled,
                employee_create_subgoals_enabled: state.formCompany.subgoals_enabled,
                is_lock_past_schedules: state.formCompany.is_lock_past_schedules,
                transfer_norm_hours_enabled: state.formCompany.transfer_norm_hours_enabled,
                is_sort_by_status: state.formCompany.is_sort_by_status,
                social_og_boligstyrelsen: state.formCompany.social_og_boligstyrelsen,
                quick_risk_assessment_enabled: state.formCompany.quick_risk_assessment_enabled,
            }
            const response = await userService.updateCompany(params)
            if (response.data) {
                userStore.setUserCheckinStatus(state.formCompany.checkin_enabled)
                successAlert(`${t('alert.success')}!`, `${t('settings.company.form.alert.successfullyUpdated')}.`)
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    }
}
</script>