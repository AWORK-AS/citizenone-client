<template>
    <form @submit.prevent="submitForm" class="space-y-5">

        <Alert type="danger" :text="error?.message" v-if="error?.message && error.message.length > 0" />

        <!-- Section 1: Company details -->
        <div class="bg-white border border-[#EAECF0] rounded-xl p-6 shadow-sm">
            <h2 class="text-[15px] font-semibold text-[#1F2533] mb-5">{{
                $t('superadmin.companies.form.companyInformation') }}</h2>

            <!-- Company name -->
            <div class="mb-4">
                <SuperadminFormLabel :label="$t('superadmin.companies.form.companyName')" :required="true" />
                <SuperadminFormTextField v-model="state.formCompany.name"
                    :placeholder="$t('superadmin.companies.form.companyNamePlaceholder')"
                    :hasError="v$?.formCompany?.name?.$error" />
                <SuperadminFormError :error="v$?.formCompany?.name?.$errors[0]?.$message.toString()" />
                <SuperadminFormError :error="error?.errors?.name?.[0]" />
            </div>

            <!-- CVR + Phone -->
            <div class="grid grid-cols-2 gap-3 mb-4">
                <div>
                    <SuperadminFormLabel :label="$t('superadmin.companies.form.cvr')" />
                    <SuperadminFormTextField v-model="state.formCompany.cvr" placeholder="12345678" />
                    <SuperadminFormError :error="v$?.formCompany?.cvr?.$errors[0]?.$message.toString()" />
                    <SuperadminFormError :error="error?.errors?.cvr?.[0]" />
                </div>
                <div>
                    <SuperadminFormLabel :label="$t('superadmin.companies.form.phone')"
                        :required="formType === 'create'" />
                    <SuperadminFormTextField v-model="state.formCompany.phone" placeholder="+45 12 34 56 78"
                        :hasError="v$?.formCompany?.phone?.$error" />
                    <SuperadminFormError :error="v$?.formCompany?.phone?.$errors[0]?.$message.toString()" />
                    <SuperadminFormError :error="error?.errors?.phone?.[0]" />
                </div>
            </div>

            <!-- Address (create only) -->
            <div v-if="formType === 'create'" class="mb-4">
                <SuperadminFormLabel :label="$t('superadmin.companies.form.address')" />
                <SuperadminFormTextField v-model="state.formCompany.address"
                    :placeholder="$t('superadmin.companies.form.addressPlaceholder')" />
                <SuperadminFormError :error="v$?.formCompany?.address?.$errors[0]?.$message.toString()" />
                <SuperadminFormError :error="error?.errors?.address?.[0]" />
            </div>

            <!-- Website -->
            <div class="mb-4">
                <SuperadminFormLabel :label="$t('superadmin.companies.form.website')" />
                <SuperadminFormTextField v-model="state.formCompany.website" type="text"
                    placeholder="https://virksomhed.dk" @blur="ensureWebsiteScheme" />
                <SuperadminFormError :error="v$?.formCompany?.website?.$errors[0]?.$message.toString()" />
                <SuperadminFormError :error="error?.errors?.website?.[0]" />
            </div>

            <!-- Industry -->
            <div class="mb-4">
                <SuperadminFormLabel :label="$t('superadmin.companies.form.industry')" :required="true" />
                <SuperadminFormSelectField v-model="state.formCompany.industry_uuid"
                    :hasError="v$?.formCompany?.industry_uuid?.$error">
                    <option value="" disabled>{{ $t('superadmin.companies.form.selectIndustry') }}</option>
                    <option v-for="opt in options.industries" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                    </option>
                </SuperadminFormSelectField>
                <SuperadminFormError :error="v$?.formCompany?.industry_uuid?.$errors[0]?.$message.toString()" />
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
                <SuperadminFormError :error="error?.errors?.facility_type_uuid?.[0]" />
            </div>
        </div>

        <!-- Section 2: Admin user (create only) -->
        <div v-if="formType === 'create'" class="bg-white border border-[#EAECF0] rounded-xl p-6 shadow-sm">
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
                        :hasError="v$?.formCompany?.firstname?.$error" />
                    <SuperadminFormError :error="v$?.formCompany?.firstname?.$errors[0]?.$message.toString()" />
                    <SuperadminFormError :error="error?.errors?.firstname?.[0]" />
                </div>
                <div>
                    <SuperadminFormLabel :label="$t('superadmin.companies.form.lastname')" :required="true" />
                    <SuperadminFormTextField v-model="state.formCompany.lastname"
                        :placeholder="$t('superadmin.companies.form.lastname')"
                        :hasError="v$?.formCompany?.lastname?.$error" />
                    <SuperadminFormError :error="v$?.formCompany?.lastname?.$errors[0]?.$message.toString()" />
                    <SuperadminFormError :error="error?.errors?.lastname?.[0]" />
                </div>
            </div>

            <!-- Email -->
            <div class="mb-4">
                <SuperadminFormLabel :label="$t('superadmin.companies.form.emailAddress')" :required="true" />
                <SuperadminFormTextField v-model="state.formCompany.email" type="email"
                    placeholder="admin@virksomhed.dk" :hasError="v$?.formCompany?.email?.$error" />
                <SuperadminFormError :error="v$?.formCompany?.email?.$errors[0]?.$message.toString()" />
                <SuperadminFormError :error="error?.errors?.email?.[0]" />
            </div>

            <!-- Password + Confirm -->
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <SuperadminFormLabel :label="$t('superadmin.companies.form.password')" :required="true" />
                    <SuperadminFormPasswordField v-model="state.formCompany.password"
                        :placeholder="$t('superadmin.companies.form.passwordPlaceholder')"
                        :hasError="v$?.formCompany?.password?.$error" />
                    <SuperadminFormError :error="v$?.formCompany?.password?.$errors[0]?.$message.toString()" />
                    <SuperadminFormError :error="error?.errors?.password?.[0]" />
                </div>
                <div>
                    <SuperadminFormLabel :label="$t('superadmin.companies.form.confirmPassword')" />
                    <SuperadminFormTextField v-model="state.formCompany.password_confirmation" type="password"
                        :placeholder="$t('superadmin.companies.form.repeatPassword')"
                        :hasError="v$?.formCompany?.password_confirmation?.$error" />
                    <SuperadminFormError
                        :error="v$?.formCompany?.password_confirmation?.$errors[0]?.$message.toString()" />
                    <SuperadminFormError :error="error?.errors?.password_confirmation?.[0]" />
                </div>
            </div>
        </div>

        <!-- Section 3: Settings -->
        <div class="bg-white border border-[#EAECF0] rounded-xl p-6 shadow-sm">
            <h2 class="text-[15px] font-semibold text-[#1F2533] mb-4">{{
                $t('superadmin.companies.form.settings') }}</h2>

            <!-- Send welcome email (create only) -->
            <div v-if="formType === 'create'" class="flex items-center justify-between py-3 border-b border-[#F5F6F8]">
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

            <!-- Active -->
            <div class="flex items-center justify-between py-3">
                <div>
                    <p class="text-[13px] font-medium text-[#1F2533]">
                        {{ formType === 'create' ? $t('superadmin.companies.form.activeImmediately') :
                            $t('superadmin.companies.form.active') }}
                    </p>
                    <p v-if="formType === 'create'" class="text-[11px] text-[#8891A4] mt-0.5">
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
            <button type="button" @click="router.back()"
                class="px-5 py-2.5 rounded-lg text-sm font-medium text-[#5C6478] bg-white border border-[#EAECF0] hover:bg-[#F5F6F8] transition-colors">
                {{ $t('cancel') }}
            </button>
            <button type="submit"
                class="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors shadow-sm"
                style="background:#205E77">
                {{ formType === 'create' ? $t('superadmin.companies.saveCompany') : $t('update') }}
            </button>
        </div>

    </form>
</template>

<script setup lang="ts">
import { industryService } from '@/components/api/superadmin/IndustryService'
import { facilityTypeService } from '@/components/api/user/FacilityTypeService'
import { useI18n } from 'vue-i18n'
import { useVuelidate } from '@vuelidate/core'
import { required, minLength, helpers, sameAs } from '@vuelidate/validators'
import type { Error } from '@/types'

const props = defineProps({
    formType: {
        type: String as () => 'create' | 'update',
        required: true,
    },
    error: {
        type: Object as () => Error,
        required: false,
    },
    selectedCompany: {
        type: Object,
        required: false,
    },
})

const emit = defineEmits(['isPageLoading', 'submitForm'])
const router = useRouter()
const { t, locale } = useI18n()

const state = reactive({
    formCompany: {
        name: '',
        industry_uuid: '',
        facility_type_uuid: '',
        cvr: '',
        phone: '',
        address: '',
        website: '',
        is_active: true,
        // create only
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        password_confirmation: '',
        send_welcome_email: true,
    },
})

const rules = computed(() => ({
    formCompany: {
        name: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
        industry_uuid: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
        ...(props.formType === 'create' ? {
            phone: {
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
        } : {}),
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

watch(() => props.selectedCompany, (company: any) => {
    if (company) {
        state.formCompany = {
            ...state.formCompany,
            name: company.name ?? '',
            industry_uuid: company.industry?.uuid ?? '',
            facility_type_uuid: company.facility_type?.uuid ?? '',
            cvr: company.cvr ?? '',
            phone: company.phone ?? '',
            website: company.website ?? '',
            is_active: company.is_active ?? true,
        }
    }
})

onMounted(async () => {
    emit('isPageLoading', true)
    await Promise.all([fetchIndustries(), fetchFacilityTypes()])
    emit('isPageLoading', false)
})

watch(() => locale.value, () => {
    fetchIndustries()
    fetchFacilityTypes()
})

async function fetchIndustries() {
    try {
        const response = await industryService.getAllIndustries()
        if (response?.data) {
            options.industries = response.data.map((i: any) => ({
                value: i.uuid,
                label: locale.value === 'en' ? i.en_name : i.dk_name,
                system_name: i.system_name,
            }))
        }
    } catch (_) { }
}

async function fetchFacilityTypes() {
    try {
        const response = await facilityTypeService.getAllFacilityTypes()
        if (response?.data) {
            options.typeOfFacilities = response.data.map((i: any) => ({
                value: i.uuid,
                label: locale.value === 'en' ? i.en_name : i.dk_name,
            }))
        }
    } catch (_) { }
}

function ensureWebsiteScheme() {
    const val = state.formCompany.website.trim()
    if (val && !val.startsWith('http://') && !val.startsWith('https://')) {
        state.formCompany.website = `https://${val}`
    }
}

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        const payload: Record<string, any> = {
            name: state.formCompany.name,
            industry_uuid: state.formCompany.industry_uuid,
            facility_type_uuid: state.formCompany.facility_type_uuid || undefined,
            cvr: state.formCompany.cvr,
            phone: state.formCompany.phone,
            website: state.formCompany.website,
            is_active: state.formCompany.is_active,
        }
        if (props.formType === 'create') {
            payload.address = state.formCompany.address
            payload.firstname = state.formCompany.firstname
            payload.lastname = state.formCompany.lastname
            payload.email = state.formCompany.email
            payload.password = state.formCompany.password
            payload.password_confirmation = state.formCompany.password_confirmation
            payload.send_welcome_email = state.formCompany.send_welcome_email
        }
        emit('submitForm', payload)
    }
}
</script>
