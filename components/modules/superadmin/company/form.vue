<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <form @submit.prevent="submitForm" class="space-y-5">

            <Alert type="danger" :text="state?.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />
            <Alert type="danger" :text="props?.error?.message"
                v-if="props.error?.message && props.error.message.length > 0" />

            <!-- Section 1: Company details -->
            <div class="bg-white border border-[#EAECF0] rounded-xl p-6 shadow-sm">
                <h2 class="text-[15px] font-semibold text-[#1F2533] mb-5">{{
                    $t('superadmin.companies.form.companyInformation') }}</h2>

                <!-- Company name -->
                <div class="mb-4">
                    <SuperadminFormLabel :label="$t('superadmin.companies.form.companyName')" :required="true" />
                    <SuperadminFormTextField v-model="state.formCompany.name"
                        :placeholder="$t('superadmin.companies.form.companyNamePlaceholder')"
                        :hasError="v$?.form?.name?.$error" />
                    <SuperadminFormError :error="v$?.form?.name?.$errors[0]?.$message.toString()" />
                    <SuperadminFormError :error="error?.errors?.name?.[0]" />
                </div>

                <!-- CVR + Phone -->
                <div class="grid grid-cols-2 gap-3 mb-4">
                    <div>
                        <SuperadminFormLabel :label="$t('superadmin.companies.form.cvr')" />
                        <SuperadminFormTextField v-model="state.formCompany.cvr" placeholder="12345678" />
                        <SuperadminFormError :error="v$?.form?.cvr?.$errors[0]?.$message.toString()" />
                        <SuperadminFormError :error="error?.errors?.cvr?.[0]" />
                    </div>
                    <div>
                        <SuperadminFormLabel :label="$t('superadmin.companies.form.phone')" :required="true" />
                        <SuperadminFormTextField v-model="state.formCompany.phone" placeholder="+45 12 34 56 78"
                            :hasError="v$?.form?.phone?.$error" />
                        <SuperadminFormError :error="v$?.form?.phone?.$errors[0]?.$message.toString()" />
                        <SuperadminFormError :error="error?.errors?.phone?.[0]" />
                    </div>
                </div>

                <!-- Address -->
                <div class="mb-4">
                    <SuperadminFormLabel :label="$t('superadmin.companies.form.address')" />
                    <SuperadminFormTextField v-model="state.formCompany.address"
                        :placeholder="$t('superadmin.companies.form.addressPlaceholder')" />
                    <SuperadminFormError :error="v$?.form?.address?.$errors[0]?.$message.toString()" />
                    <SuperadminFormError :error="error?.errors?.address?.[0]" />
                </div>

                <!-- Website -->
                <div class="mb-4">
                    <SuperadminFormLabel :label="$t('superadmin.companies.form.website')" />
                    <SuperadminFormTextField v-model="state.formCompany.website" type="url"
                        placeholder="https://virksomhed.dk" />
                    <SuperadminFormError :error="v$?.form?.website?.$errors[0]?.$message.toString()" />
                    <SuperadminFormError :error="error?.errors?.website?.[0]" />
                </div>

                <!-- Industry -->
                <div class="mb-4">
                    <SuperadminFormLabel :label="$t('superadmin.companies.form.industry')" :required="true" />
                    <SuperadminFormSelectField v-model="state.formCompany.industry_uuid"
                        :hasError="v$?.form?.industry_uuid?.$error">
                        <option value="" disabled>{{ $t('superadmin.companies.form.selectIndustry') }}</option>
                        <option v-for="opt in options.industries" :key="opt.value" :value="opt.value">
                            {{ opt.label }}
                        </option>
                    </SuperadminFormSelectField>
                    <SuperadminFormError :error="v$?.form?.industry_uuid?.$errors[0]?.$message.toString()" />
                    <SuperadminFormError :error="error?.errors?.industry_uuid?.[0]" />
                </div>

                <!-- Facility type (only if social welfare) -->
                <div v-if="showFacilityType" class="mb-4">
                    <SuperadminFormLabel :label="$t('superadmin.companies.form.typeOfFacility')" :required="true" />
                    <SuperadminFormSelectField v-model="state.formCompany.facility_type_uuid">
                        <option value="" disabled>{{ $t('superadmin.companies.form.selectType') }}</option>
                        <option v-for="opt in options.typeOfFacilities" :key="opt.value" :value="opt.value">
                            {{ opt.label }}
                        </option>
                    </SuperadminFormSelectField>
                </div>
            </div>

            <!-- Section 2: Admin user -->
            <div class="bg-white border border-[#EAECF0] rounded-xl p-6 shadow-sm">
                <h2 class="text-[15px] font-semibold text-[#1F2533] mb-1">
                    {{ $t('superadmin.companies.form.adminUser') }}
                </h2>
                <p class="text-[12px] text-[#8891A4] mb-5">
                    {{ $t('superadmin.companies.form.adminUserDesc') }}
                </p>

                <!-- First name + Last name -->
                <div class="grid grid-cols-2 gap-3 mb-4">
                    <div>
                        <SuperadminFormLabel :label="$t('superadmin.companies.form.firstname')" :required="true" />
                        <SuperadminFormTextField v-model="state.formCompany.firstname"
                            :placeholder="$t('superadmin.companies.form.firstname')"
                            :hasError="v$?.form?.firstname?.$error" />
                        <SuperadminFormError :error="v$?.form?.firstname?.$errors[0]?.$message.toString()" />
                        <SuperadminFormError :error="error?.errors?.firstname?.[0]" />
                    </div>
                    <div>
                        <SuperadminFormLabel :label="$t('superadmin.companies.form.lastname')" :required="true" />
                        <SuperadminFormTextField v-model="state.formCompany.lastname"
                            :placeholder="$t('superadmin.companies.form.lastname')"
                            :hasError="v$?.form?.lastname?.$error" />
                        <SuperadminFormError :error="v$?.form?.lastname?.$errors[0]?.$message.toString()" />
                        <SuperadminFormError :error="error?.errors?.lastname?.[0]" />
                    </div>
                </div>

                <!-- Email -->
                <div class="mb-4">
                    <SuperadminFormLabel :label="$t('superadmin.companies.form.emailAddress')" :required="true" />
                    <SuperadminFormTextField v-model="state.formCompany.email" type="email"
                        placeholder="admin@virksomhed.dk" :hasError="v$?.form?.email?.$error" />
                    <SuperadminFormError :error="v$?.form?.email?.$errors[0]?.$message.toString()" />
                    <SuperadminFormError :error="error?.errors?.email?.[0]" />
                </div>

                <!-- Password + Confirm -->
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <SuperadminFormLabel :label="$t('superadmin.companies.form.password')" :required="true" />
                        <SuperadminFormPasswordField v-model="state.formCompany.password"
                            :placeholder="$t('superadmin.companies.form.passwordPlaceholder')"
                            :hasError="v$?.form?.password?.$error" />
                        <SuperadminFormError :error="v$?.form?.password?.$errors[0]?.$message.toString()" />
                        <SuperadminFormError :error="error?.errors?.password?.[0]" />
                    </div>
                    <div>
                        <SuperadminFormLabel :label="$t('superadmin.companies.form.confirmPassword')" />
                        <SuperadminFormTextField v-model="state.formCompany.password_confirmation" type="password"
                            :placeholder="$t('superadmin.companies.form.repeatPassword')"
                            :hasError="v$?.form?.password_confirmation?.$error" />
                        <SuperadminFormError
                            :error="v$?.form?.password_confirmation?.$errors[0]?.$message.toString()" />
                        <SuperadminFormError :error="error?.errors?.password_confirmation?.[0]" />
                    </div>
                </div>
            </div>

            <!-- Section 3: Settings -->
            <div class="bg-white border border-[#EAECF0] rounded-xl p-6 shadow-sm">
                <h2 class="text-[15px] font-semibold text-[#1F2533] mb-4">{{
                    $t('superadmin.companies.form.settings') }}
                </h2>

                <!-- Send welcome email -->
                <div class="flex items-center justify-between py-3 border-b border-[#F5F6F8]">
                    <div>
                        <p class="text-[13px] font-medium text-[#1F2533]">
                            {{ $t('superadmin.companies.form.sendWelcomeEmail') }}
                        </p>
                        <p class="text-[11px] text-[#8891A4] mt-0.5">
                            {{ $t('superadmin.companies.form.sendWelcomeEmailDesc') }}
                        </p>
                    </div>
                    <button type="button"
                        @click="state.formCompany.send_welcome_email = !state.formCompany.send_welcome_email"
                        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
                        :style="state.formCompany.send_welcome_email ? 'background:#42AED9' : 'background:#D5D9E2'">
                        <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                            :class="state.formCompany.send_welcome_email ? 'translate-x-6' : 'translate-x-1'"></span>
                    </button>
                </div>

                <!-- Active immediately -->
                <div class="flex items-center justify-between py-3">
                    <div>
                        <p class="text-[13px] font-medium text-[#1F2533]">
                            {{ $t('superadmin.companies.form.activeImmediately') }}
                        </p>
                        <p class="text-[11px] text-[#8891A4] mt-0.5">
                            {{ $t('superadmin.companies.form.activeImmediatelyDesc') }}
                        </p>
                    </div>
                    <button type="button" @click="state.formCompany.is_active = !state.formCompany.is_active"
                        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
                        :style="state.formCompany.is_active ? 'background:#42AED9' : 'background:#D5D9E2'">
                        <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                            :class="state.formCompany.is_active ? 'translate-x-6' : 'translate-x-1'"></span>
                    </button>
                </div>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center justify-end gap-3 pb-6">
                <button type="button" @click="navigateTo('/superadmin/companies')"
                    class="px-5 py-2.5 rounded-lg text-sm font-medium text-[#5C6478] bg-white border border-[#EAECF0] hover:bg-[#F5F6F8] transition-colors">
                    {{ $t('cancel') }}
                </button>
                <button type="submit"
                    class="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors shadow-sm"
                    style="background:#205E77">
                    {{ $t('superadmin.companies.saveCompany') }}
                </button>
            </div>

        </form>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { industryService } from '@/components/api/superadmin/IndustryService'
import { facilityTypeService } from '@/components/api/user/FacilityTypeService'
import { useI18n } from 'vue-i18n'
import { useVuelidate } from '@vuelidate/core'
import { required, minLength, helpers, sameAs } from '@vuelidate/validators'
import type { Error } from '@/types'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
})

const emit = defineEmits(['isPageLoading', 'submitForm'])

const { t, locale } = useI18n()

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
        address: '',
        password: '',
        password_confirmation: '',
        send_welcome_email: true,
        is_active: true,
    },
    isPageLoading: false,
})

const rules = computed(() => ({
    formCompany: {
        name: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
        phone: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
        industry_uuid: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
        firstname: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
        lastname: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
        email: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
        password: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            minLength: helpers.withMessage(() => `${t('superadmin.companies.form.passwordPlaceholder')}.`, minLength(8)),
        },
        password_confirmation: {
            sameAs: helpers.withMessage(() => `${t('superadmin.companies.form.passwordMismatch')}.`, sameAs(computed(() => state.formCompany.password))),
        },
    },
}))

const v$ = useVuelidate(rules, state)

const options = reactive({
    industries: [] as any[],
    typeOfFacilities: [] as any[],
})

const showFacilityType = computed(() =>
    options.industries.find((i: any) => i.value === state.formCompany.industry_uuid)?.system_name === 'social_welfare'
)

onMounted(async () => {
    fetchIndustries()
    fetchFacilityTypes()
})

watch(() => locale.value, () => {
    fetchIndustries()
    fetchFacilityTypes()
})

async function fetchIndustries() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await industryService.getAllIndustries()
        if (response?.data) {
            options.industries = response.data.map((i: any) => ({
                value: i.uuid,
                label: locale.value === 'en' ? i.en_name : i.dk_name,
                system_name: i.system_name,
            }))
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchFacilityTypes() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await facilityTypeService.getAllFacilityTypes()
        if (response?.data) {
            options.typeOfFacilities = response.data.map((i: any) => ({
                value: i.uuid,
                label: locale.value === 'en' ? i.en_name : i.dk_name,
            }))
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', {
            name: state.formCompany.name,
            industry_uuid: state.formCompany.industry_uuid,
            facility_type_uuid: state.formCompany.facility_type_uuid || undefined,
            firstname: state.formCompany.firstname,
            lastname: state.formCompany.lastname,
            email: state.formCompany.email,
            phone: state.formCompany.phone,
            website: state.formCompany.website,
            cvr: state.formCompany.cvr,
            address: state.formCompany.address,
            password: state.formCompany.password,
            password_confirmation: state.formCompany.password_confirmation,
            send_welcome_email: state.formCompany.send_welcome_email,
            is_active: state.formCompany.is_active,
        })
    }
}
</script>
