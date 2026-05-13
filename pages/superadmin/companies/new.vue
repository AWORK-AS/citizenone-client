<template>
    <div>
        <NuxtLayout name="superadmin">
            <Head>
                <Title>Ny virksomhed - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>Ny virksomhed</template>

            <div class="p-1 max-w-2xl">

                <!-- Back -->
                <NuxtLink to="/superadmin/companies"
                    class="inline-flex items-center gap-1.5 text-sm text-[#5C6478] hover:text-[#1F2533] mb-6 transition-colors">
                    <Icon name="ph:arrow-left" class="w-4 h-4" />
                    Virksomheder
                </NuxtLink>

                <LoadingSpinner :isActive="state.isPageLoading">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message?.length > 0" />

                    <form @submit.prevent="saveCompany" class="space-y-5">

                        <!-- Section 1: Virksomhedsoplysninger -->
                        <div class="bg-white border border-[#EAECF0] rounded-xl p-6 shadow-sm">
                            <h2 class="text-[15px] font-semibold text-[#1F2533] mb-5">Virksomhedsoplysninger</h2>

                            <!-- Virksomhedsnavn -->
                            <div class="mb-4">
                                <label class="co-label">Virksomhedsnavn <span class="text-red-500">*</span></label>
                                <input v-model="state.form.name" type="text"
                                    placeholder="fx Danmarks Fængsler"
                                    class="co-input" :class="errors.name ? 'border-red-300 focus:border-red-400' : ''" />
                                <p v-if="errors.name" class="co-error">{{ errors.name }}</p>
                            </div>

                            <!-- CVR + Telefon -->
                            <div class="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                    <label class="co-label">CVR-nummer</label>
                                    <input v-model="state.form.cvr" type="text"
                                        placeholder="12345678" class="co-input" />
                                </div>
                                <div>
                                    <label class="co-label">Telefon</label>
                                    <input v-model="state.form.phone" type="text"
                                        placeholder="+45 12 34 56 78" class="co-input" />
                                    <p v-if="errors.phone" class="co-error">{{ errors.phone }}</p>
                                </div>
                            </div>

                            <!-- Adresse -->
                            <div class="mb-4">
                                <label class="co-label">Adresse</label>
                                <input v-model="state.form.address" type="text"
                                    placeholder="Vejnavn 1, 1234 By" class="co-input" />
                            </div>

                            <!-- Website -->
                            <div class="mb-4">
                                <label class="co-label">Website</label>
                                <input v-model="state.form.website" type="url"
                                    placeholder="https://virksomhed.dk" class="co-input" />
                            </div>

                            <!-- Branche -->
                            <div class="mb-4">
                                <label class="co-label">Branche <span class="text-red-500">*</span></label>
                                <select v-model="state.form.industry_uuid" class="co-input"
                                    :class="errors.industry_uuid ? 'border-red-300' : ''">
                                    <option value="" disabled>Vælg branche...</option>
                                    <option v-for="opt in state.options.industries" :key="opt.value" :value="opt.value">
                                        {{ opt.label }}
                                    </option>
                                </select>
                                <p v-if="errors.industry_uuid" class="co-error">{{ errors.industry_uuid }}</p>
                            </div>

                            <!-- Facilitettype (only if social welfare) -->
                            <div v-if="showFacilityType" class="mb-4">
                                <label class="co-label">Type af tilbud <span class="text-red-500">*</span></label>
                                <select v-model="state.form.facility_type_uuid" class="co-input">
                                    <option value="" disabled>Vælg type...</option>
                                    <option v-for="opt in state.options.typeOfFacilities" :key="opt.value" :value="opt.value">
                                        {{ opt.label }}
                                    </option>
                                </select>
                            </div>
                        </div>

                        <!-- Section 2: Administrator-bruger -->
                        <div class="bg-white border border-[#EAECF0] rounded-xl p-6 shadow-sm">
                            <h2 class="text-[15px] font-semibold text-[#1F2533] mb-1">Administrator-bruger</h2>
                            <p class="text-[12px] text-[#8891A4] mb-5">Denne bruger får admin-adgang til virksomheden</p>

                            <!-- Fornavn + Efternavn -->
                            <div class="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                    <label class="co-label">Fornavn <span class="text-red-500">*</span></label>
                                    <input v-model="state.form.firstname" type="text"
                                        placeholder="Fornavn" class="co-input"
                                        :class="errors.firstname ? 'border-red-300' : ''" />
                                    <p v-if="errors.firstname" class="co-error">{{ errors.firstname }}</p>
                                </div>
                                <div>
                                    <label class="co-label">Efternavn <span class="text-red-500">*</span></label>
                                    <input v-model="state.form.lastname" type="text"
                                        placeholder="Efternavn" class="co-input"
                                        :class="errors.lastname ? 'border-red-300' : ''" />
                                    <p v-if="errors.lastname" class="co-error">{{ errors.lastname }}</p>
                                </div>
                            </div>

                            <!-- Email -->
                            <div class="mb-4">
                                <label class="co-label">Email <span class="text-red-500">*</span></label>
                                <input v-model="state.form.email" type="email"
                                    placeholder="admin@virksomhed.dk" class="co-input"
                                    :class="errors.email ? 'border-red-300' : ''" />
                                <p v-if="errors.email" class="co-error">{{ errors.email }}</p>
                            </div>

                            <!-- Adgangskode + Bekræft -->
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="co-label">Adgangskode <span class="text-red-500">*</span></label>
                                    <div class="relative">
                                        <input v-model="state.form.password"
                                            :type="showPassword ? 'text' : 'password'"
                                            placeholder="Min. 8 tegn" class="co-input pr-10"
                                            :class="errors.password ? 'border-red-300' : ''" />
                                        <button type="button"
                                            class="absolute right-3 top-1/2 -translate-y-1/2 text-[#8891A4] hover:text-[#5C6478]"
                                            @click="showPassword = !showPassword">
                                            <Icon :name="showPassword ? 'ph:eye-slash' : 'ph:eye'" class="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p v-if="errors.password" class="co-error">{{ errors.password }}</p>
                                </div>
                                <div>
                                    <label class="co-label">Bekræft adgangskode</label>
                                    <input v-model="state.form.password_confirmation"
                                        :type="showPassword ? 'text' : 'password'"
                                        placeholder="Gentag adgangskode" class="co-input"
                                        :class="errors.password_confirmation ? 'border-red-300' : ''" />
                                    <p v-if="errors.password_confirmation" class="co-error">{{ errors.password_confirmation }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Section 3: Indstillinger -->
                        <div class="bg-white border border-[#EAECF0] rounded-xl p-6 shadow-sm">
                            <h2 class="text-[15px] font-semibold text-[#1F2533] mb-4">Indstillinger</h2>

                            <!-- Send velkomst-email -->
                            <div class="flex items-center justify-between py-3 border-b border-[#F5F6F8]">
                                <div>
                                    <p class="text-[13px] font-medium text-[#1F2533]">Send velkomst-email</p>
                                    <p class="text-[11px] text-[#8891A4] mt-0.5">Administratoren modtager login-instruktioner på email</p>
                                </div>
                                <button type="button" @click="state.form.send_welcome_email = !state.form.send_welcome_email"
                                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
                                    :style="state.form.send_welcome_email ? 'background:#42AED9' : 'background:#D5D9E2'">
                                    <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                                        :class="state.form.send_welcome_email ? 'translate-x-6' : 'translate-x-1'"></span>
                                </button>
                            </div>

                            <!-- Aktiv med det samme -->
                            <div class="flex items-center justify-between py-3">
                                <div>
                                    <p class="text-[13px] font-medium text-[#1F2533]">Aktiv med det samme</p>
                                    <p class="text-[11px] text-[#8891A4] mt-0.5">Virksomheden aktiveres øjeblikkeligt</p>
                                </div>
                                <button type="button" @click="state.form.is_active = !state.form.is_active"
                                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
                                    :style="state.form.is_active ? 'background:#42AED9' : 'background:#D5D9E2'">
                                    <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                                        :class="state.form.is_active ? 'translate-x-6' : 'translate-x-1'"></span>
                                </button>
                            </div>
                        </div>

                        <!-- Action buttons -->
                        <div class="flex items-center justify-end gap-3 pb-6">
                            <button type="button" @click="navigateTo('/superadmin/companies')"
                                class="px-5 py-2.5 rounded-lg text-sm font-medium text-[#5C6478] bg-white border border-[#EAECF0] hover:bg-[#F5F6F8] transition-colors">
                                Annuller
                            </button>
                            <button type="submit"
                                class="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors shadow-sm"
                                style="background:#205E77"
                                :disabled="state.isPageLoading">
                                <span v-if="state.isPageLoading" class="flex items-center gap-2">
                                    <Icon name="ph:spinner" class="w-4 h-4 animate-spin" />
                                    Opretter...
                                </span>
                                <span v-else>Opret virksomhed</span>
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

// Validation errors
const errors = reactive({
    name: '',
    industry_uuid: '',
    facility_type_uuid: '',
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
})

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
    } catch (_) {}
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
    } catch (_) {}
}

function validate() {
    let valid = true
    Object.keys(errors).forEach(k => (errors as any)[k] = '')

    if (!state.form.name)           { errors.name = 'Påkrævet'; valid = false }
    if (!state.form.industry_uuid)  { errors.industry_uuid = 'Vælg en branche'; valid = false }
    if (!state.form.firstname)      { errors.firstname = 'Påkrævet'; valid = false }
    if (!state.form.lastname)       { errors.lastname = 'Påkrævet'; valid = false }
    if (!state.form.email)          { errors.email = 'Påkrævet'; valid = false }
    if (!state.form.password)       { errors.password = 'Påkrævet'; valid = false }
    else if (state.form.password.length < 8) { errors.password = 'Min. 8 tegn'; valid = false }
    if (state.form.password && state.form.password !== state.form.password_confirmation) {
        errors.password_confirmation = 'Adgangskoderne matcher ikke'
        valid = false
    }
    return valid
}

async function saveCompany() {
    if (!validate()) return

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
.co-input::placeholder { color: #B0B8C4 }
.co-error {
    font-size: 11px;
    color: #CC3B2D;
    margin-top: 4px;
}
</style>
