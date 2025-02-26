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

            <ModulesSettingsTab />

            <LoadingSpinner :isActive="state.isPageLoading">
                <form @submit.prevent="submitForm()" class="mt-8 max-w-3xl">
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
                                    v-model="state.formCompany.municipality" @change="changeSelectedMunicipality" />
                                <FormError :error="v$?.formCompany?.municipality?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.municipality_uuid?.[0]" />
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div class="space-y-1">
                                <FormLabel for="city" :label="$t('settings.company.form.city')" />
                                <FormSelect id="city" :options="state.options.cities"
                                    v-model="state.formCompany.city" />
                                <FormError :error="v$?.formCompany?.city?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.city_uuid?.[0]" />
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
                                {{ $t('settings.company.form.checkinReminder') }}
                            </p>
                        </div>
                        <div class="space-y-1 flex items-center gap-x-2">
                            <FormSwitch :value="state.formCompany.plans_enabled"
                                @toggleSwitch="state.formCompany.plans_enabled = !state.formCompany.plans_enabled" />
                            <p>
                                {{ $t('settings.company.form.AllowPlans') }}
                            </p>
                        </div>
                        <div class="space-y-1 flex items-center gap-x-2">
                            <FormSwitch :value="state.formCompany.goals_enabled"
                                @toggleSwitch="state.formCompany.goals_enabled = !state.formCompany.goals_enabled" />
                            <p>
                                {{ $t('settings.company.form.AllowGoals') }}
                            </p>
                        </div>
                        <div class="space-y-1 flex items-center gap-x-2">
                            <FormSwitch :value="state.formCompany.subgoals_enabled"
                                @toggleSwitch="state.formCompany.subgoals_enabled = !state.formCompany.subgoals_enabled" />
                            <p>
                                {{ $t('settings.company.form.AllowSubGoals') }}
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
import { userService } from "@/components/api/UserService";
import { regionService } from '@/components/api/RegionService'
import { municipalityService } from '@/components/api/MunicipalityService'
import { cityService } from '@/components/api/CityService'
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore()
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
        street: '',
        region: '',
        municipality: '',
        city: '',
        post_code: '',
        group_chat_enabled: false,
        checkin_enabled: false,
        plans_enabled: false,
        goals_enabled: false,
        subgoals_enabled: false,
    },
    isPageLoading: false,
    options: {
        cities: [],
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
            cvr: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            street: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            region: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            municipality: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            city: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            post_code: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

onMounted(() => {
    fetchRegions()
})

watch(() => userStore.getUser, (newValue: any) => {
    if (newValue != null) {
        state.formCompany = {
            name: newValue?.company?.name,
            cvr: newValue?.company?.cvr,
            website: newValue?.company?.website,
            accountant_email: newValue?.company?.accountant_email,
            street: newValue?.company?.company_address?.street,
            region: newValue?.company?.company_address?.region?.uuid,
            municipality: newValue?.company?.company_address?.municipality?.uuid,
            city: newValue?.company?.company_address?.city?.uuid,
            post_code: newValue?.company?.company_address?.post_code,
            group_chat_enabled: newValue?.company?.group_chat_enabled ?? false,
            checkin_enabled: newValue?.company?.checkin_enabled ?? false,
            plans_enabled: newValue?.company?.employee_create_plans_enabled ?? false,
            goals_enabled: newValue?.company?.employee_create_goals_enabled ?? false,
            subgoals_enabled: newValue?.company?.employee_create_subgoals_enabled ?? false,
        }
        fetchMunicipalitiesPerRegion(newValue?.company?.company_address?.region?.uuid)
        fetchCities(newValue?.company?.company_address?.municipality?.uuid)
    }
})

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

async function fetchCities(municipalityUuid: string) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            municipality_uuid: municipalityUuid
        }
        const response = await cityService.getAllCities(params)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.cities = options
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

function changeSelectedMunicipality(municipalityUuid: string) {
    if (municipalityUuid) {
        fetchCities(municipalityUuid)
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
                street: state.formCompany.street,
                region_uuid: state.formCompany.region,
                municipality_uuid: state.formCompany.municipality,
                city_uuid: state.formCompany.city,
                post_code: state.formCompany.post_code,
                group_chat_enabled: state.formCompany.group_chat_enabled,
                checkin_enabled: state.formCompany.checkin_enabled,
                employee_create_plans_enabled: state.formCompany.plans_enabled,
                employee_create_goals_enabled: state.formCompany.goals_enabled,
                employee_create_subgoals_enabled: state.formCompany.subgoals_enabled,
            }
            const response = await userService.updateCompany(params)
            if (response.data) {
                successAlert(`${t('alert.success')}!`, `${t('settings.company.form.alert.successfullyUpdated')}.`)
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    }
}
</script>