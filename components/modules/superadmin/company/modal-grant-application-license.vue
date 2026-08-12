<template>
    <Teleport to="body">
        <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="props.open" class="fixed inset-0 bg-black/30 z-40" @click="close" />
        </Transition>
        <Transition enter-active-class="transition-transform duration-300 ease-out"
            enter-from-class="translate-x-full" enter-to-class="translate-x-0"
            leave-active-class="transition-transform duration-200 ease-in" leave-from-class="translate-x-0"
            leave-to-class="translate-x-full">
            <div v-if="props.open"
                class="fixed inset-y-0 right-0 z-50 w-full max-w-[440px] bg-white shadow-2xl flex flex-col">

                <!-- Header -->
                <div class="flex items-start justify-between px-6 py-5 border-b border-[#EAECF0]">
                    <div>
                        <h2 class="text-[16px] font-semibold text-[#1F2533]">
                            {{ $t('superadmin.grantLicense.title') }}
                        </h2>
                        <p v-if="props.companyUuid && props.companyName" class="text-[12px] text-[#8891A4] mt-0.5">
                            {{ props.companyName }}
                        </p>
                        <p v-if="props.preselectedApplicationUuid && preselectedAppName"
                            class="text-[12px] text-[#8891A4] mt-0.5">
                            {{ preselectedAppName }}
                        </p>
                    </div>
                    <button @click="close"
                        class="w-8 h-8 rounded-lg flex items-center justify-center text-[#8891A4] hover:bg-[#F5F6F8] transition-colors">
                        <Icon name="ph:x" class="w-4 h-4" />
                    </button>
                </div>

                <!-- Body -->
                <div class="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    <Alert type="danger" :text="state.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <!-- Company picker (only when not pre-scoped to a company) -->
                    <div v-if="!props.companyUuid">
                        <label class="co-label">
                            {{ $t('superadmin.grantLicense.companyLabel') }} <span class="text-red-500">*</span>
                        </label>
                        <div class="relative">
                            <Icon name="ph:magnifying-glass"
                                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8891A4]" />
                            <input v-model="state.companySearch" type="text"
                                :placeholder="$t('superadmin.grantLicense.searchCompanyPlaceholder')"
                                class="co-input !pl-8" @input="searchCompanies" />
                        </div>
                        <div v-if="state.companyResults.length"
                            class="mt-1 border border-[#EAECF0] rounded-lg bg-white shadow max-h-36 overflow-y-auto">
                            <button v-for="c in state.companyResults" :key="c.uuid" type="button"
                                class="w-full text-left px-3 py-2 hover:bg-[#F5F6F8] flex items-center gap-2 transition-colors text-[13px]"
                                @click="selectCompany(c)">
                                {{ c.name }}
                            </button>
                        </div>
                        <div v-if="state.selectedCompany"
                            class="mt-2 flex items-center gap-2 px-3 py-2 bg-[#E4F1F6] rounded-lg">
                            <span class="text-[12px] font-medium text-[#205E77] flex-1">
                                {{ state.selectedCompany.name }}
                            </span>
                            <button type="button" @click="state.selectedCompany = null; state.companySearch = ''"
                                class="text-[#205E77]/50 hover:text-[#205E77]">
                                <Icon name="ph:x" class="w-3 h-3" />
                            </button>
                        </div>
                    </div>

                    <!-- Application picker (hidden when pre-selected from an app row) -->
                    <div v-if="!props.preselectedApplicationUuid">
                        <label class="co-label">
                            {{ $t('superadmin.grantLicense.appLabel') }} <span class="text-red-500">*</span>
                        </label>
                        <div class="relative mb-2">
                            <Icon name="ph:magnifying-glass"
                                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8891A4]" />
                            <input v-model="state.appSearch" type="text"
                                :placeholder="$t('superadmin.grantLicense.searchAppPlaceholder')"
                                class="co-input !pl-8" />
                        </div>
                        <div class="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-0.5">
                            <button v-for="a in filteredApps" :key="a.uuid ?? a.id" type="button"
                                @click="selectApp(a)" :disabled="!isAppPickable(a)"
                                class="text-left border rounded-xl p-3 transition-colors relative"
                                :class="[
                                    state.form.application_uuid === (a.uuid ?? a.id) ? 'border-[#42AED9] bg-[#F0FAFD]' : 'border-[#EAECF0] hover:bg-[#F9FAFB]',
                                    !isAppPickable(a) && 'opacity-50 cursor-not-allowed hover:bg-transparent'
                                ]">
                                <Icon v-if="state.form.application_uuid === (a.uuid ?? a.id)" name="ph:check-circle"
                                    class="w-4 h-4 text-[#205E77] absolute top-2 right-2" />
                                <span v-else-if="isAlreadyActivated(a)"
                                    class="absolute top-2 right-2 co-badge co-badge-green text-[9px] !px-1.5 !py-0">
                                    {{ $t('superadmin.grantLicense.alreadyActivated') }}
                                </span>
                                <div class="w-8 h-8 rounded-lg flex items-center justify-center mb-2 overflow-hidden"
                                    :style="`background:${appColor(a.name)}20`">
                                    <img v-if="a.image || a.logo" :src="a.image || a.logo"
                                        class="w-6 h-6 object-contain rounded" />
                                    <span v-else class="text-[11px] font-bold" :style="`color:${appColor(a.name)}`">
                                        {{ (a.name || '?').charAt(0).toUpperCase() }}
                                    </span>
                                </div>
                                <p class="text-[12px] font-semibold text-[#1F2533] truncate pr-4">{{ a.name }}</p>
                                <p class="text-[11px] text-[#8891A4] mt-0.5">{{ appPriceLabel(a) }}</p>
                            </button>
                            <p v-if="!filteredApps.length" class="col-span-2 text-[12px] text-[#8891A4] py-4 text-center">
                                {{ $t('superadmin.grantLicense.noAppsFound') }}
                            </p>
                        </div>
                        <p v-if="state.errors.application" class="co-error">
                            {{ state.errors.application }}
                        </p>
                    </div>

                    <!-- Seat summary (only for apps sold as multiple seats - a single-toggle
                         app like Mail/OneDrive has no "seats used" concept) -->
                    <div v-if="effectiveCompanyUuid && state.form.application_uuid && state.seatCounts && selectedApp?.is_quantifiable"
                        class="text-[12px] text-[#5C6478] bg-[#F9FAFB] border border-[#EAECF0] rounded-lg px-3 py-2">
                        {{ $t('superadmin.grantLicense.seatSummary', {
                            used: state.seatCounts.used, total: state.seatCounts.total
                        }) }}
                    </div>

                    <!-- Quantity (only for apps sold as multiple seats - a single-toggle
                         app like Mail/OneDrive has nothing to count, so it's implicitly 1) -->
                    <div v-if="!selectedApp || selectedApp.is_quantifiable">
                        <label class="co-label">
                            {{ $t('superadmin.grantLicense.quantityLabel') }}
                        </label>
                        <input v-model.number="state.form.quantity" type="number" min="0" placeholder="0"
                            class="co-input" />
                        <p class="text-[11px] text-[#8891A4] mt-1">
                            {{ $t('superadmin.grantLicense.quantityHint') }}
                        </p>
                        <p v-if="state.errors.quantity" class="co-error">
                            {{ state.errors.quantity }}
                        </p>
                    </div>

                    <!-- Billing frequency (only for paid, recurring apps) -->
                    <div v-if="needsFrequencyPicker">
                        <label class="co-label">
                            {{ $t('superadmin.grantLicense.billingFrequency') }}
                        </label>
                        <fieldset :aria-label="$t('superadmin.grantLicense.billingFrequency')">
                            <RadioGroup v-model="state.form.frequency"
                                class="grid grid-cols-2 gap-x-1 rounded-full p-2 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-gray-200">
                                <RadioGroupOption as="template" v-for="option in ['monthly', 'yearly']" :key="option"
                                    :value="option" v-slot="{ checked }">
                                    <div
                                        :class="[checked ? 'bg-tertiary text-white' : 'text-gray-500', 'cursor-pointer rounded-full px-2.5 py-1']">
                                        {{ option === 'monthly'
                                            ? $t('superadmin.grantLicense.monthly')
                                            : $t('superadmin.grantLicense.yearly') }}
                                    </div>
                                </RadioGroupOption>
                            </RadioGroup>
                        </fieldset>
                        <p v-if="state.errors.frequency" class="co-error">
                            {{ state.errors.frequency }}
                        </p>
                    </div>
                    <p v-else-if="fixedFrequencyLabel" class="text-[12px] text-[#5C6478]">
                        {{ $t('superadmin.grantLicense.billingFixed', { frequency: fixedFrequencyLabel }) }}
                    </p>

                    <div>
                        <div class="w-fit flex items-center cursor-pointer"
                            @click="state.form.paysViaLeverandorservice = !state.form.paysViaLeverandorservice">
                            <FormCheckbox :value="state.form.paysViaLeverandorservice" />
                            {{ $t('superadmin.companies.licenseOverview.addSubscription.paysViaLeverandorservice') }}
                        </div>
                    </div>

                    <!-- Assign directly to a user (only for apps sold as multiple seats -
                         a single-toggle app like Mail/OneDrive is a company-wide grant,
                         not a per-user seat, so there's nothing to assign) -->
                    <div v-if="!selectedApp || selectedApp.is_quantifiable" class="border border-[#EAECF0] rounded-xl p-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-[13px] font-medium text-[#1F2533]">
                                    {{ $t('superadmin.grantLicense.assignToggle') }}
                                </p>
                                <p class="text-[11px] text-[#8891A4] mt-0.5">
                                    {{ $t('superadmin.grantLicense.assignToggleHint') }}
                                </p>
                            </div>
                            <button type="button" @click="toggleAssign"
                                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ml-4"
                                :style="state.assignEnabled ? 'background:#42AED9' : 'background:#D5D9E2'">
                                <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                                    :class="state.assignEnabled ? 'translate-x-6' : 'translate-x-1'"></span>
                            </button>
                        </div>

                        <div v-if="state.assignEnabled" class="mt-3">
                            <div class="relative">
                                <Icon name="ph:magnifying-glass"
                                    class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8891A4]" />
                                <input v-model="state.userSearch" type="text"
                                    :disabled="!effectiveCompanyUuid"
                                    :placeholder="$t('superadmin.grantLicense.searchUserPlaceholder')"
                                    class="co-input !pl-8" @input="searchUsers" />
                            </div>
                            <p v-if="!effectiveCompanyUuid" class="text-[11px] text-[#8891A4] mt-1">
                                {{ $t('superadmin.grantLicense.selectCompanyFirst') }}
                            </p>
                            <div v-if="state.userResults.length"
                                class="mt-1 border border-[#EAECF0] rounded-lg bg-white shadow max-h-36 overflow-y-auto">
                                <button v-for="u in state.userResults" :key="u.uuid" type="button"
                                    class="w-full text-left px-3 py-2 hover:bg-[#F5F6F8] flex items-center gap-2 transition-colors text-[13px]"
                                    @click="selectUser(u)">
                                    {{ u.firstname }} {{ u.lastname }} <span class="text-[#8891A4]">— {{ u.email
                                    }}</span>
                                </button>
                            </div>
                            <div v-if="state.selectedUser"
                                class="mt-2 flex items-center gap-2 px-3 py-2 bg-[#E4F1F6] rounded-lg">
                                <span class="text-[12px] font-medium text-[#205E77] flex-1">
                                    {{ state.selectedUser.firstname }} {{ state.selectedUser.lastname }}
                                </span>
                                <button type="button" @click="state.selectedUser = null; state.userSearch = ''"
                                    class="text-[#205E77]/50 hover:text-[#205E77]">
                                    <Icon name="ph:x" class="w-3 h-3" />
                                </button>
                            </div>
                            <p v-if="state.errors.user" class="co-error">
                                {{ state.errors.user }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="flex items-center gap-3 px-6 py-4 border-t border-[#EAECF0]">
                    <button @click="close"
                        class="flex-1 py-2.5 rounded-lg text-sm font-medium text-[#5C6478] bg-white border border-[#EAECF0] hover:bg-[#F5F6F8] transition-colors">
                        {{ $t('cancel') }}
                    </button>
                    <button @click="submit"
                        class="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm"
                        style="background:#205E77" :disabled="state.isSaving">
                        <span v-if="state.isSaving" class="flex items-center justify-center gap-2">
                            <Icon name="ph:spinner" class="w-4 h-4 animate-spin" />
                            {{ $t('superadmin.grantLicense.saving') }}
                        </span>
                        <span v-else>
                            {{ $t('superadmin.grantLicense.submit') }}
                        </span>
                    </button>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { appService } from '@/components/api/superadmin/AppService'
import { licenseService } from '@/components/api/superadmin/LicenseService'
import { companyService } from '@/components/api/superadmin/CompanyService'
import { accountService } from '@/components/api/superadmin/AccountService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'
import type { Error } from '@/types'

const props = defineProps({
    open: {
        type: Boolean,
        default: false,
    },
    companyUuid: {
        type: String,
        required: false,
    },
    companyName: {
        type: String,
        required: false,
    },
    preselectedApplicationUuid: {
        type: String,
        required: false,
    },
})

const emit = defineEmits(['close', 'granted'])

const { successAlert, errorAlert } = useAlert()
const { t } = useI18n()

let companySearchTimeout: any = null
let userSearchTimeout: any = null

const APP_COLORS = ['#205E77', '#2E9E33', '#368F8B', '#1A4D99', '#D4900A', '#9B4D9B', '#CC3B2D']
const appColor = (name: string) => APP_COLORS[(name?.charCodeAt(0) ?? 0) % APP_COLORS.length]

function appPriceLabel(app: any) {
    if (app.is_one_time_fee) {
        return app.price > 0 ? `kr. ${app.price}` : t('superadmin.grantLicense.free')
    }
    if (app.monthly_price > 0) return `kr. ${app.monthly_price}/mo`
    if (app.yearly_price > 0) return `kr. ${app.yearly_price}/yr`
    return t('superadmin.grantLicense.free')
}

const state = reactive({
    appSearch: '',
    apps: [] as any[],
    assignEnabled: false,
    companyResults: [] as any[],
    companySearch: '',
    error: {} as Error,
    errors: { application: '', quantity: '', user: '', frequency: '' },
    form: {
        application_uuid: '',
        quantity: 1 as number,
        frequency: 'monthly' as 'monthly' | 'yearly',
        paysViaLeverandorservice: false,
    },
    isSaving: false,
    seatCounts: null as null | { total: number; used: number; available: number },
    companyApps: [] as any[],
    selectedCompany: null as any,
    selectedUser: null as any,
    subscription: null as any,
    userResults: [] as any[],
    userSearch: '',
})

const effectiveCompanyUuid = computed(() => props.companyUuid ?? state.selectedCompany?.uuid ?? null)
const preselectedAppName = computed(() =>
    state.apps.find((a) => (a.uuid ?? a.id) === props.preselectedApplicationUuid)?.name ?? null
)
const filteredApps = computed(() => {
    const term = state.appSearch.trim().toLowerCase()
    if (!term) return state.apps
    return state.apps.filter((a) => (a.name ?? '').toLowerCase().includes(term))
})

const selectedApp = computed(() =>
    state.apps.find((a) => (a.uuid ?? a.id) === state.form.application_uuid) ?? null
)

// Apps already granted to this company - shown as a badge in the picker so the
// superadmin doesn't accidentally re-grant a single-toggle (non-quantifiable)
// app that's already active; quantifiable apps (AI/Secure Mail/Booking/...)
// stay selectable since buying more seats is a normal, expected action.
function activeQuantityFor(app: any) {
    const uuid = app.uuid ?? app.id
    return state.companyApps.find((c) => c.application_uuid === uuid)?.active_quantity ?? 0
}
function isAlreadyActivated(app: any) {
    return activeQuantityFor(app) > 0
}
function isAppPickable(app: any) {
    return app.is_quantifiable || !isAlreadyActivated(app)
}

// Billing only matters when new seats are actually being purchased - quantity=0
// means "assign an existing already-paid seat to this user", not a new
// purchase, so there's no billing decision to make at all. Free apps and
// one-time-fee apps have no monthly/yearly billing concept either way; paid
// recurring apps auto-derive the frequency from the company's active Deal
// subscription when one exists, same as the Extra User/Department license grant.
const needsFrequencyPicker = computed(() => {
    if (!selectedApp.value || !state.form.quantity || selectedApp.value.is_free || selectedApp.value.is_one_time_fee) return false
    const dealType = state.subscription?.data?.type
    return !['monthly', 'yearly', 'custom_monthly', 'custom_yearly'].includes(dealType)
})

const fixedFrequencyLabel = computed(() => {
    if (!selectedApp.value || !state.form.quantity || selectedApp.value.is_free || selectedApp.value.is_one_time_fee) return null
    const dealType = state.subscription?.data?.type
    return dealType?.includes('yearly')
        ? t('superadmin.grantLicense.yearly')
        : t('superadmin.grantLicense.monthly')
})

function selectApp(app: any) {
    if (!isAppPickable(app)) return
    state.form.application_uuid = app.uuid ?? app.id
    state.form.quantity = app.is_quantifiable ? state.form.quantity : 1
    if (!app.is_quantifiable) {
        state.assignEnabled = false
        state.selectedUser = null
        state.userSearch = ''
    }
    fetchSeatCounts()
}

watch(() => props.open, (open: boolean) => {
    if (open) {
        state.form = { application_uuid: props.preselectedApplicationUuid ?? '', quantity: 1, frequency: 'monthly', paysViaLeverandorservice: false }
        state.appSearch = ''
        state.assignEnabled = false
        state.errors = { application: '', quantity: '', user: '', frequency: '' }
        state.error = {}
        state.selectedUser = null
        state.userSearch = ''
        state.userResults = []
        state.selectedCompany = null
        state.companySearch = ''
        state.companyResults = []
        state.seatCounts = null
        state.subscription = null
        state.companyApps = []
        fetchApps().then(fetchSeatCounts)
        fetchSubscription()
        fetchCompanyApps()
    }
})

async function fetchApps() {
    try {
        // This picker needs every app (including free/one-time-fee ones), not a
        // paginated page - the default page size (10) would silently hide apps.
        const response = await appService.getApplications({ per_page: 1000 })
        state.apps = Array.isArray(response) ? response : (response?.data ?? [])
    } catch (_) {
        state.apps = []
    }
}

async function fetchSeatCounts() {
    state.seatCounts = null
    if (!effectiveCompanyUuid.value || !state.form.application_uuid) return
    try {
        const response = await licenseService.getAppSeatCounts(effectiveCompanyUuid.value, state.form.application_uuid)
        state.seatCounts = response?.data ?? null
    } catch (_) {
        state.seatCounts = null
    }
}

async function fetchSubscription() {
    state.subscription = null
    if (!effectiveCompanyUuid.value) return
    try {
        state.subscription = await licenseService.getSubscription(effectiveCompanyUuid.value)
    } catch (_) {
        state.subscription = null
    }
}

async function fetchCompanyApps() {
    state.companyApps = []
    if (!effectiveCompanyUuid.value) return
    try {
        const response = await companyService.getCompanyApps(effectiveCompanyUuid.value, { per_page: 1000 })
        state.companyApps = response?.data ?? []
    } catch (_) {
        state.companyApps = []
    }
}

watch(effectiveCompanyUuid, () => {
    fetchSeatCounts()
    fetchSubscription()
    fetchCompanyApps()
    state.selectedUser = null
    state.userSearch = ''
    state.userResults = []
})

function searchCompanies() {
    clearTimeout(companySearchTimeout)
    if (!state.companySearch.trim()) { state.companyResults = []; return }
    companySearchTimeout = setTimeout(async () => {
        try {
            const response = await companyService.getCompanies({ search: state.companySearch, page: 1 })
            state.companyResults = response?.data?.slice(0, 8) ?? []
        } catch (_) { }
    }, 300)
}

function selectCompany(company: any) {
    state.selectedCompany = company
    state.companySearch = company.name
    state.companyResults = []
}

function searchUsers() {
    clearTimeout(userSearchTimeout)
    if (!state.userSearch.trim() || !effectiveCompanyUuid.value) { state.userResults = []; return }
    userSearchTimeout = setTimeout(async () => {
        try {
            const trimmed = state.userSearch.trim()
            const response = await accountService.getAccounts({
                company_uuid: effectiveCompanyUuid.value,
                search: [trimmed],
                page: 1,
            })
            state.userResults = response?.data?.slice(0, 8) ?? []
        } catch (_) { }
    }, 300)
}

function selectUser(user: any) {
    state.selectedUser = user
    state.userSearch = `${user.firstname} ${user.lastname}`
    state.userResults = []
}

function toggleAssign() {
    state.assignEnabled = !state.assignEnabled
    if (!state.assignEnabled) {
        state.selectedUser = null
        state.userSearch = ''
        state.userResults = []
    }
}

function close() {
    emit('close')
}

function validate() {
    state.errors = { application: '', quantity: '', user: '', frequency: '' }
    let valid = true
    if (!effectiveCompanyUuid.value) valid = false
    if (!state.form.application_uuid) {
        state.errors.application = t('superadmin.grantLicense.errorSelectApp')
        valid = false
    }
    if (state.form.quantity < 0) {
        state.errors.quantity = t('superadmin.grantLicense.errorQuantity')
        valid = false
    }
    if (state.form.quantity === 0 && !state.selectedUser) {
        state.errors.quantity = t('superadmin.grantLicense.errorQuantityOrAssign')
        valid = false
    }
    if (state.assignEnabled && !state.selectedUser) {
        state.errors.user = t('superadmin.grantLicense.errorSelectUser')
        valid = false
    }
    if (needsFrequencyPicker.value && !state.form.frequency) {
        state.errors.frequency = t('superadmin.grantLicense.errorSelectFrequency')
        valid = false
    }
    return valid
}

async function submit() {
    if (!validate()) return
    state.isSaving = true
    state.error = {}
    try {
        await licenseService.grantApplicationLicense(effectiveCompanyUuid.value as string, {
            application_uuid: state.form.application_uuid,
            quantity: state.form.quantity,
            assign_to_user_uuid: state.selectedUser?.uuid ?? null,
            pays_via_leverandorservice: state.form.paysViaLeverandorservice,
            ...(needsFrequencyPicker.value ? { frequency: state.form.frequency } : {}),
        })
        successAlert(t('superadmin.grantLicense.successTitle'), t('superadmin.grantLicense.successBody'))
        emit('granted')
        close()
    } catch (error: any) {
        state.error = error
        errorAlert(t('alert.warning'), error?.message ?? t('superadmin.grantLicense.errorGeneric'))
    }
    state.isSaving = false
}

onMounted(() => {
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && props.open) close() })
})
</script>

<style scoped>
.co-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #1F2533;
    margin-bottom: 5px
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
    transition: border-color 0.15s, box-shadow 0.15s
}

.co-input:focus {
    border-color: #42AED9;
    box-shadow: 0 0 0 3px rgba(66, 174, 217, 0.12)
}

.co-input::placeholder {
    color: #B0B8C4
}

.co-error {
    font-size: 11px;
    color: #CC3B2D;
    margin-top: 4px
}
</style>
