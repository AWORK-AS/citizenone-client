<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.companies.newCompany') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.companies.newCompany') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/superadmin/companies">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="max-w-2xl">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <form class="mt-5" method="POST" @submit.prevent="saveCompany">
                            <div class="grid grid-cols-1 gap-y-3">
                                <div class="space-y-1">
                                    <FormLabel for="name" :label="$t('superadmin.companies.form.companyName')" />
                                    <FormTextField id="name" name="name"
                                        :placeholder="$t('superadmin.companies.form.companyName')"
                                        v-model="state.formCompany.name" />
                                    <FormError :error="v$?.formCompany?.name?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.name?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="industry" :label="$t('superadmin.companies.form.industry')" />
                                    <FormSelect id="industry" :options="state.options.industries"
                                        v-model="state.formCompany.industry_uuid" />
                                    <FormError
                                        :error="v$?.formCompany?.industry_uuid?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.industry_uuid?.[0]" />
                                </div>
                                <div class="space-y-1"
                                    v-if="state.options.industries.find((industry: any) => industry.value === state.formCompany.industry_uuid)?.system_name === 'social_welfare'">
                                    <FormLabel for="facility_type_uuid"
                                        :label="$t('superadmin.companies.form.typeOfFacility')" />
                                    <FormSelect id="facility_type_uuid" :options="state.options.typeOfFacilities"
                                        v-model="state.formCompany.facility_type_uuid" />
                                    <FormError
                                        :error="v$?.formCompany?.facility_type_uuid?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.facility_type_uuid?.[0]" />
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div class="space-y-1">
                                        <FormLabel for="firstname" :label="$t('superadmin.companies.form.firstname')" />
                                        <FormTextField id="firstname" name="firstname"
                                            :placeholder="$t('superadmin.companies.form.firstname')"
                                            v-model="state.formCompany.firstname" />
                                        <FormError
                                            :error="v$?.formCompany?.firstname?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.firstname?.[0]" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel for="lastname" :label="$t('superadmin.companies.form.lastname')" />
                                        <FormTextField id="lastname" name="lastname"
                                            :placeholder="$t('superadmin.companies.form.lastname')"
                                            v-model="state.formCompany.lastname" />
                                        <FormError
                                            :error="v$?.formCompany?.lastname?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.lastname?.[0]" />
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div class="space-y-1">
                                        <FormLabel for="email" :label="$t('superadmin.companies.form.emailAddress')" />
                                        <FormTextField id="email" name="email"
                                            :placeholder="$t('superadmin.companies.form.emailAddress')"
                                            v-model="state.formCompany.email" />
                                        <FormError :error="v$?.formCompany?.email?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.email?.[0]" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel for="phone" :label="$t('superadmin.companies.form.phone')" />
                                        <FormTextField id="phone" name="phone"
                                            :placeholder="$t('superadmin.companies.form.phone')"
                                            v-model="state.formCompany.phone" />
                                        <FormError :error="v$?.formCompany?.phone?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.phone?.[0]" />
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div class="space-y-1">
                                        <FormLabel for="website" :label="$t('superadmin.companies.form.website')" />
                                        <FormTextField id="website" name="website"
                                            :placeholder="$t('superadmin.companies.form.website')"
                                            v-model="state.formCompany.website" />
                                        <FormError :error="v$?.formCompany?.website?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.website?.[0]" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel for="cvr" :label="$t('superadmin.companies.form.cvr')" />
                                        <FormTextField id="cvr" name="cvr"
                                            :placeholder="$t('superadmin.companies.form.cvr')"
                                            v-model="state.formCompany.cvr" />
                                        <FormError :error="v$?.formCompany?.cvr?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.cvr?.[0]" />
                                    </div>
                                </div>
                            </div>
                            <div class="mt-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                                        @click="navigateTo(`/superadmin/companies`)">
                                        {{ $t('cancel') }}
                                    </FormButton>
                                    <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                                        {{ $t('save') }}
                                    </FormButton>
                                </div>
                            </div>
                        </form>
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { companyService } from '@/components/api/superadmin/CompanyService'
import { industryService } from '@/components/api/superadmin/IndustryService'
import { facilityTypeService } from '@/components/api/user/FacilityTypeService'
import { useAlert } from '@/composables/alert'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const language = useI18n()
const { successAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formCompany: {
        name: '',
        industry_uuid: '',
        facility_type_uuid: '',
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        website: '',
        cvr: '',
    },
    isPageLoading: false,
    options: {
        industries: [] as any,
        typeOfFacilities: [] as any,
    },
})

const rules = computed(() => {
    return {
        formCompany: {
            name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            industry_uuid: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            firstname: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            lastname: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            email: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            phone: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        }
    }
})
const v$ = useVuelidate(rules, state)

onMounted(() => {
    fetchAllIndustries()
    fetchAllFacilityTypes()
})

watch(() => language.locale.value, (newValue: any) => {
    if (newValue != null) {
        fetchAllIndustries()
        fetchAllFacilityTypes()
    }
})

async function fetchAllIndustries() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await industryService.getAllIndustries()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (industry: any) => options.push({
                    value: industry?.uuid,
                    label: language.locale.value === 'en' ? industry.en_name : industry.dk_name,
                    system_name: industry.system_name,
                })
            )
            state.options.industries = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchAllFacilityTypes() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await facilityTypeService.getAllFacilityTypes()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item?.uuid,
                    label: language.locale.value === 'en' ? item.en_name : item.dk_name,
                })
            )
            state.options.typeOfFacilities = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function saveCompany() {
    state.error = {}
    state.isPageLoading = true
    v$.value.$validate()
    if (!v$.value.$error) {
        try {
            const params = {
                name: state.formCompany.name,
                industry_uuid: state.formCompany.industry_uuid,
                facility_type_uuid: state.formCompany.facility_type_uuid,
                firstname: state.formCompany.firstname,
                lastname: state.formCompany.lastname,
                email: state.formCompany.email,
                phone: state.formCompany.phone,
                website: state.formCompany.website,
                cvr: state.formCompany.cvr,
            }
            const response = await companyService.saveCompany(params)
            if (response.data) {
                successAlert(`${t('alert.success')}!`, `${t('superadmin.companies.form.alert.newCompanySuccessfullySaved')}.`)
                navigateTo('/superadmin/companies')
            }
        } catch (error: any) {
            state.error = error
        }
    }
    state.isPageLoading = false
}
</script>