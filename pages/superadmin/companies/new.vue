<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.companies.newCompany') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('superadmin.companies.newCompany') }}</template>

            <div class="p-1 max-w-2xl">

                <!-- Back -->
                <NuxtLink to="/superadmin/companies"
                    class="inline-flex items-center gap-1.5 text-sm text-[#5C6478] hover:text-[#1F2533] mb-6 transition-colors">
                    <Icon name="ph:arrow-left" class="w-4 h-4" />
                    {{ $t('superadmin.companies.companies') }}
                </NuxtLink>

                <LoadingSpinner :isActive="state.isPageLoading">
                    <Alert type="danger" :text="state?.error?.message" v-if="state.error?.message?.length > 0" />

                    <form @submit.prevent="saveCompany" class="space-y-5">

                        <!-- Section 1: Company details -->
                        <div class="bg-white border border-[#EAECF0] rounded-xl p-6 shadow-sm">
                            <h2 class="text-[15px] font-semibold text-[#1F2533] mb-5">{{
                                $t('superadmin.companies.form.companyInformation') }}</h2>

                            <!-- Company name -->
                            <div class="mb-4">
                                <label class="co-label">{{ $t('superadmin.companies.form.companyName') }} <span
                                        class="text-red-500">*</span></label>
                                <input v-model="state.form.name" type="text"
                                    :placeholder="$t('superadmin.companies.form.companyNamePlaceholder')"
                                    class="co-input"
                                    :class="v$?.form?.name?.$error ? 'border-red-300 focus:border-red-400' : ''" />
                                <FormError :error="v$?.form?.name?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.name?.[0]" />
                            </div>

                            <!-- CVR + Phone -->
                            <div class="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                    <label class="co-label">{{ $t('superadmin.companies.form.cvr') }}</label>
                                    <input v-model="state.form.cvr" type="text" placeholder="12345678"
                                        class="co-input" />
                                </div>
                                <div>
                                    <label class="co-label">{{ $t('superadmin.companies.form.phone') }}</label>
                                    <input v-model="state.form.phone" type="text" placeholder="+45 12 34 56 78"
                                        class="co-input" />
                                    <FormError :error="state?.error?.errors?.phone?.[0]" />
                                </div>
                            </div>

                            <!-- Address -->
                            <div class="mb-4">
                                <label class="co-label">{{ $t('superadmin.companies.form.address') }}</label>
                                <input v-model="state.form.address" type="text"
                                    :placeholder="$t('superadmin.companies.form.addressPlaceholder')"
                                    class="co-input" />
                            </div>

                            <!-- Website -->
                            <div class="mb-4">
                                <label class="co-label">{{ $t('superadmin.companies.form.website') }}</label>
                                <input v-model="state.form.website" type="url" placeholder="https://virksomhed.dk"
                                    class="co-input" />
                            </div>

                            <!-- Industry -->
                            <div class="mb-4">
                                <label class="co-label">{{ $t('superadmin.companies.form.industry') }} <span
                                        class="text-red-500">*</span></label>
                                <select v-model="state.form.industry_uuid" class="co-input"
                                    :class="v$?.form?.industry_uuid?.$error ? 'border-red-300' : ''">
                                    <option value="" disabled>{{ $t('superadmin.companies.form.selectIndustry') }}
                                    </option>
                                    <option v-for="opt in state.options.industries" :key="opt.value" :value="opt.value">
                                        {{ opt.label }}
                                    </option>
                                </select>
                                <FormError :error="v$?.form?.industry_uuid?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.industry_uuid?.[0]" />
                            </div>

                            <!-- Facility type (only if social welfare) -->
                            <div v-if="showFacilityType" class="mb-4">
                                <label class="co-label">{{ $t('superadmin.companies.form.typeOfFacility') }} <span
                                        class="text-red-500">*</span></label>
                                <select v-model="state.form.facility_type_uuid" class="co-input">
                                    <option value="" disabled>{{ $t('superadmin.companies.form.selectType') }}</option>
                                    <option v-for="opt in state.options.typeOfFacilities" :key="opt.value"
                                        :value="opt.value">
                                        {{ opt.label }}
                                    </option>
                                </select>
                            </div>
                        </div>

                        <!-- Section 2: Admin user -->
                        <div class="bg-white border border-[#EAECF0] rounded-xl p-6 shadow-sm">
                            <h2 class="text-[15px] font-semibold text-[#1F2533] mb-1">{{
                                $t('superadmin.companies.form.adminUser')
                            }}</h2>
                            <p class="text-[12px] text-[#8891A4] mb-5">{{ $t('superadmin.companies.form.adminUserDesc')
                            }}</p>

                            <!-- First name + Last name -->
                            <div class="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                    <label class="co-label">{{ $t('superadmin.companies.form.firstname') }} <span
                                            class="text-red-500">*</span></label>
                                    <input v-model="state.form.firstname" type="text"
                                        :placeholder="$t('superadmin.companies.form.firstname')" class="co-input"
                                        :class="v$?.form?.firstname?.$error ? 'border-red-300' : ''" />
                                    <FormError :error="v$?.form?.firstname?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.firstname?.[0]" />
                                </div>
                                <div>
                                    <label class="co-label">{{ $t('superadmin.companies.form.lastname') }} <span
                                            class="text-red-500">*</span></label>
                                    <input v-model="state.form.lastname" type="text"
                                        :placeholder="$t('superadmin.companies.form.lastname')" class="co-input"
                                        :class="v$?.form?.lastname?.$error ? 'border-red-300' : ''" />
                                    <FormError :error="v$?.form?.lastname?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.lastname?.[0]" />
                                </div>
                            </div>

                            <!-- Email -->
                            <div class="mb-4">
                                <label class="co-label">{{ $t('superadmin.companies.form.emailAddress') }} <span
                                        class="text-red-500">*</span></label>
                                <input v-model="state.form.email" type="email" placeholder="admin@virksomhed.dk"
                                    class="co-input" :class="v$?.form?.email?.$error ? 'border-red-300' : ''" />
                                <FormError :error="v$?.form?.email?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.email?.[0]" />
                            </div>

                            <!-- Password + Confirm -->
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="co-label">{{ $t('superadmin.companies.form.password') }} <span
                                            class="text-red-500">*</span></label>
                                    <div class="relative">
                                        <input v-model="state.form.password" :type="showPassword ? 'text' : 'password'"
                                            :placeholder="$t('superadmin.companies.form.passwordPlaceholder')"
                                            class="co-input pr-10"
                                            :class="v$?.form?.password?.$error ? 'border-red-300' : ''" />
                                        <button type="button"
                                            class="absolute right-3 top-1/2 -translate-y-1/2 text-[#8891A4] hover:text-[#5C6478]"
                                            @click="showPassword = !showPassword">
                                            <Icon :name="showPassword ? 'ph:eye-slash' : 'ph:eye'" class="w-4 h-4" />
                                        </button>
                                    </div>
                                    <FormError :error="v$?.form?.password?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.password?.[0]" />
                                </div>
                                <div>
                                    <label class="co-label">{{ $t('superadmin.companies.form.confirmPassword')
                                    }}</label>
                                    <input v-model="state.form.password_confirmation"
                                        :type="showPassword ? 'text' : 'password'"
                                        :placeholder="$t('superadmin.companies.form.repeatPassword')" class="co-input"
                                        :class="v$?.form?.password_confirmation?.$error ? 'border-red-300' : ''" />
                                    <FormError
                                        :error="v$?.form?.password_confirmation?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.password_confirmation?.[0]" />
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
                                    <p class="text-[13px] font-medium text-[#1F2533]">{{
                                        $t('superadmin.companies.form.sendWelcomeEmail') }}</p>
                                    <p class="text-[11px] text-[#8891A4] mt-0.5">{{
                                        $t('superadmin.companies.form.sendWelcomeEmailDesc') }}</p>
                                </div>
                                <button type="button"
                                    @click="state.form.send_welcome_email = !state.form.send_welcome_email"
                                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
                                    :style="state.form.send_welcome_email ? 'background:#42AED9' : 'background:#D5D9E2'">
                                    <span
                                        class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                                        :class="state.form.send_welcome_email ? 'translate-x-6' : 'translate-x-1'"></span>
                                </button>
                            </div>

                            <!-- Active immediately -->
                            <div class="flex items-center justify-between py-3">
                                <div>
                                    <p class="text-[13px] font-medium text-[#1F2533]">{{
                                        $t('superadmin.companies.form.activeImmediately') }}</p>
                                    <p class="text-[11px] text-[#8891A4] mt-0.5">{{
                                        $t('superadmin.companies.form.activeImmediatelyDesc') }}</p>
                                </div>
                                <button type="button" @click="state.form.is_active = !state.form.is_active"
                                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
                                    :style="state.form.is_active ? 'background:#42AED9' : 'background:#D5D9E2'">
                                    <span
                                        class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                                        :class="state.form.is_active ? 'translate-x-6' : 'translate-x-1'"></span>
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
                                style="background:#205E77" :disabled="state.isPageLoading">
                                <span v-if="state.isPageLoading" class="flex items-center gap-2">
                                    <Icon name="ph:spinner" class="w-4 h-4 animate-spin" />
                                    {{ $t('superadmin.companies.form.creating') }}
                                </span>
                                <span v-else>{{ $t('superadmin.companies.newCompany') }}</span>
                            </button>
                        </div>

                    </form>
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
import { useI18n } from 'vue-i18n'
import { useVuelidate } from '@vuelidate/core'
import { required, minLength, helpers, sameAs } from '@vuelidate/validators'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t, locale } = useI18n()

const showPassword = ref(false)

const state = reactive({
    form: {
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
    options: {
        industries: [] as any[],
        typeOfFacilities: [] as any[],
    },
    error: {} as Error,
    isPageLoading: false,
})

const rules = computed(() => ({
    form: {
        name: {
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
            sameAs: helpers.withMessage(() => `${t('superadmin.companies.form.passwordMismatch')}.`, sameAs(computed(() => state.form.password))),
        },
    },
}))

const v$ = useVuelidate(rules, state)

const showFacilityType = computed(() =>
    state.options.industries.find((i: any) => i.value === state.form.industry_uuid)?.system_name === 'social_welfare'
)

onMounted(() => {
    fetchIndustries()
    fetchFacilityTypes()
})

watch(() => locale.value, () => {
    fetchIndustries()
    fetchFacilityTypes()
})

async function fetchIndustries() {
    try {
        const response = await industryService.getAllIndustries()
        if (response?.data) {
            state.options.industries = response.data.map((i: any) => ({
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
            state.options.typeOfFacilities = response.data.map((i: any) => ({
                value: i.uuid,
                label: locale.value === 'en' ? i.en_name : i.dk_name,
            }))
        }
    } catch (_) { }
}

async function saveCompany() {
    const valid = await v$.value.$validate()
    if (!valid) return

    state.error = {}
    state.isPageLoading = true
    try {
        const response = await companyService.saveCompany({
            name: state.form.name,
            industry_uuid: state.form.industry_uuid,
            facility_type_uuid: state.form.facility_type_uuid || undefined,
            firstname: state.form.firstname,
            lastname: state.form.lastname,
            email: state.form.email,
            phone: state.form.phone,
            website: state.form.website,
            cvr: state.form.cvr,
            address: state.form.address,
            password: state.form.password,
            password_confirmation: state.form.password_confirmation,
            send_welcome_email: state.form.send_welcome_email,
            is_active: state.form.is_active,
        })
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('superadmin.companies.form.alert.newCompanySuccessfullySaved')}.`)
            navigateTo('/superadmin/companies')
        }
    } catch (error: any) {
        state.error = error
        // Map backend validation errors to fields
        const errs = error?.errors ?? {}
        Object.keys(errs).forEach(k => {
            if (k in errors) (errors as any)[k] = errs[k][0]
        })
    }
    state.isPageLoading = false
}
</script>

<style scoped>
.co-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #1F2533;
    margin-bottom: 6px;
}

.co-input {
    width: 100%;
    padding: 9px 13px;
    font-size: 14px;
    color: #1F2533;
    background: white;
    border: 1px solid #D5D9E2;
    border-radius: 10px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
}

.co-input:focus {
    border-color: #42AED9;
    box-shadow: 0 0 0 3px rgba(66, 174, 217, 0.12);
}

.co-input::placeholder {
    color: #B0B8C4
}

.co-error {
    font-size: 11px;
    color: #CC3B2D;
    margin-top: 4px;
}
</style>
