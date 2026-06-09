<template>
    <form @submit.prevent="submit" class="space-y-4">

        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />

        <!-- Logo -->
        <div>
            <SuperadminFormLabel :label="$t('superadmin.apps.form.logo')" />
            <input type="file" ref="logoInputRef" @change="onLogoChange" class="hidden" accept="image/*" />
            <div class="w-20 h-20 rounded-xl border-2 border-dashed border-[#D5D9E2] overflow-hidden flex items-center justify-center bg-[#F9FAFB] hover:border-[#42AED9] transition-colors cursor-pointer"
                @click="logoInputRef?.click()">
                <img v-if="state.logoPreview" :src="state.logoPreview" class="w-full h-full object-cover" />
                <Icon v-else name="ph:image" class="w-6 h-6 text-[#B0B8C4]" />
            </div>
            <SuperadminFormError :error="props.error?.errors?.logo?.[0]" />
        </div>

        <!-- Image -->
        <div>
            <SuperadminFormLabel :label="$t('superadmin.apps.form.image')" />
            <input type="file" ref="imageInputRef" @change="onImageChange" class="hidden" accept="image/*" />
            <div class="w-32 h-32 rounded-xl border-2 border-dashed border-[#D5D9E2] overflow-hidden flex items-center justify-center bg-[#F9FAFB] hover:border-[#42AED9] transition-colors cursor-pointer"
                @click="imageInputRef?.click()">
                <img v-if="state.imagePreview" :src="state.imagePreview" class="w-full h-full object-cover" />
                <Icon v-else name="ph:image" class="w-6 h-6 text-[#B0B8C4]" />
            </div>
            <SuperadminFormError :error="props.error?.errors?.image?.[0]" />
        </div>

        <!-- Background image -->
        <div>
            <SuperadminFormLabel :label="$t('superadmin.apps.form.backgroundImage')" />
            <input type="file" ref="bgInputRef" @change="onBgChange" class="hidden" accept="image/*" />
            <div class="w-full h-28 rounded-xl border-2 border-dashed border-[#D5D9E2] overflow-hidden flex items-center justify-center bg-[#F9FAFB] hover:border-[#42AED9] transition-colors cursor-pointer"
                @click="bgInputRef?.click()">
                <img v-if="state.bgPreview" :src="state.bgPreview" class="w-full h-full object-cover" />
                <div v-else class="flex flex-col items-center gap-1 text-[#B0B8C4]">
                    <Icon name="ph:image" class="w-6 h-6" />
                    <span class="text-[11px]">{{ $t('superadmin.apps.form.backgroundImage') }}</span>
                </div>
            </div>
            <SuperadminFormError :error="props.error?.errors?.background_image?.[0]" />
        </div>

        <!-- Name -->
        <div>
            <SuperadminFormLabel :label="$t('superadmin.apps.form.name')" :required="true" />
            <SuperadminFormTextField v-model="state.form.name" :placeholder="$t('superadmin.apps.form.name')"
                :hasError="!!state.errors.name" />
            <SuperadminFormError :error="state.errors.name" />
            <SuperadminFormError :error="props.error?.errors?.name?.[0]" />
        </div>

        <!-- Description -->
        <div>
            <SuperadminFormLabel :label="$t('superadmin.apps.form.description')" />
            <textarea v-model="state.form.description" rows="3"
                :placeholder="$t('superadmin.apps.form.description')"
                class="co-input resize-none"></textarea>
            <SuperadminFormError :error="props.error?.errors?.description?.[0]" />
        </div>

        <!-- Is one time fee -->
        <div class="flex items-center gap-2 cursor-pointer select-none"
            @click="state.form.is_one_time_fee = !state.form.is_one_time_fee">
            <div class="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                :style="state.form.is_one_time_fee ? 'border-color:#42AED9;background:#42AED9' : 'border-color:#D5D9E2;background:white'">
                <Icon v-if="state.form.is_one_time_fee" name="ph:check" class="w-2.5 h-2.5 text-white" />
            </div>
            <span class="text-[13px] font-medium text-[#1F2533]">{{ $t('superadmin.apps.form.isOneTimeFee') }}</span>
        </div>

        <!-- Price (one-time) -->
        <div v-if="state.form.is_one_time_fee">
            <SuperadminFormLabel :label="$t('superadmin.apps.form.price')" />
            <div class="relative">
                <SuperadminFormTextField v-model.number="state.form.price" type="number" placeholder="0"
                    class="pr-8" />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[#8891A4] text-sm">kr</span>
            </div>
            <SuperadminFormError :error="props.error?.errors?.price?.[0]" />
        </div>

        <!-- Monthly + Yearly price -->
        <div v-if="!state.form.is_one_time_fee" class="space-y-3">
            <div>
                <SuperadminFormLabel :label="$t('superadmin.apps.form.monthlyPrice')" />
                <div class="relative">
                    <SuperadminFormTextField v-model.number="state.form.monthly_price" type="number" placeholder="0"
                        class="pr-8" />
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[#8891A4] text-sm">kr</span>
                </div>
                <SuperadminFormError :error="props.error?.errors?.monthly_price?.[0]" />
            </div>
            <div>
                <SuperadminFormLabel :label="$t('superadmin.apps.form.yearlyPrice')" />
                <div class="relative">
                    <SuperadminFormTextField v-model.number="state.form.yearly_price" type="number" placeholder="0"
                        class="pr-8" />
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[#8891A4] text-sm">kr</span>
                </div>
                <SuperadminFormError :error="props.error?.errors?.yearly_price?.[0]" />
            </div>
        </div>

        <!-- Type -->
        <div>
            <SuperadminFormLabel :label="$t('superadmin.apps.form.type')" />
            <SuperadminFormSelectField v-model="state.form.type">
                <option value="">— {{ $t('superadmin.apps.form.type') }} —</option>
                <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </SuperadminFormSelectField>
            <SuperadminFormError :error="props.error?.errors?.type?.[0]" />
        </div>

        <!-- Link -->
        <div>
            <SuperadminFormLabel :label="$t('superadmin.apps.form.link')" />
            <SuperadminFormTextField v-model="state.form.url_field" type="url" placeholder="https://..." />
            <SuperadminFormError :error="props.error?.errors?.url_field?.[0]" />
        </div>

        <!-- Checkboxes -->
        <div class="space-y-2">
            <div v-for="flag in boolFlags" :key="flag.key"
                class="flex items-center gap-2 cursor-pointer select-none"
                @click="(state.form as any)[flag.key] = !(state.form as any)[flag.key]">
                <div class="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                    :style="(state.form as any)[flag.key] ? 'border-color:#42AED9;background:#42AED9' : 'border-color:#D5D9E2;background:white'">
                    <Icon v-if="(state.form as any)[flag.key]" name="ph:check" class="w-2.5 h-2.5 text-white" />
                </div>
                <span class="text-[13px] font-medium text-[#1F2533]">{{ $t(flag.label) }}</span>
            </div>
        </div>

        <!-- Visible in App Store -->
        <div class="flex items-center justify-between py-3 px-4 border border-[#EAECF0] rounded-xl">
            <div>
                <p class="text-[13px] font-medium text-[#1F2533]">{{ $t('superadmin.apps.visibleInAppStore') }}</p>
                <p class="text-[11px] text-[#8891A4] mt-0.5">{{ $t('superadmin.apps.visibleInAppStoreHint') }}</p>
            </div>
            <button type="button" @click="state.form.is_active = !state.form.is_active"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
                :style="state.form.is_active ? 'background:#42AED9' : 'background:#D5D9E2'">
                <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                    :class="state.form.is_active ? 'translate-x-6' : 'translate-x-1'"></span>
            </button>
        </div>

        <!-- Attach to company (edit only) -->
        <div v-if="showCompanyAttach" class="border border-[#EAECF0] rounded-xl p-4">
            <p class="text-[13px] font-semibold text-[#1F2533] mb-1">{{ $t('superadmin.apps.attachToCompany') }}</p>
            <p class="text-[11px] text-[#8891A4] mb-3">{{ $t('superadmin.apps.attachToCompanyDesc') }}</p>
            <div class="relative">
                <Icon name="ph:magnifying-glass"
                    class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8891A4]" />
                <SuperadminFormTextField v-model="state.companySearch"
                    :placeholder="$t('superadmin.apps.searchCompany')" class="!pl-9"
                    @input="searchCompanies" />
            </div>
            <div v-if="state.companyResults.length"
                class="mt-1 border border-[#EAECF0] rounded-lg bg-white shadow max-h-36 overflow-y-auto">
                <button v-for="c in state.companyResults" :key="c.uuid" type="button"
                    class="w-full text-left px-3 py-2 hover:bg-[#F5F6F8] flex items-center gap-2 text-[13px] transition-colors"
                    @click="assignToCompany(c)">
                    <div class="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                        :style="`background:${avatarColor(c.name)}`">
                        {{ (c.name || '?').charAt(0).toUpperCase() }}
                    </div>
                    {{ c.name }}
                </button>
            </div>
            <div v-if="state.assignedCompanies.length" class="mt-2 space-y-1">
                <div v-for="c in state.assignedCompanies" :key="c.uuid"
                    class="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200 text-[12px]">
                    <Icon name="ph:check-circle" class="w-3.5 h-3.5 text-green-600" />
                    <span class="text-green-700 flex-1">{{ c.name }} — {{ $t('superadmin.apps.assigned') }}</span>
                </div>
            </div>
        </div>

        <!-- Action buttons (page context) -->
        <div v-if="showActions" class="flex items-center justify-end gap-3 pt-2">
            <button type="button" @click="navigateTo('/superadmin/apps')"
                class="px-5 py-2.5 rounded-lg text-sm font-medium text-[#5C6478] bg-white border border-[#EAECF0] hover:bg-[#F5F6F8] transition-colors">
                {{ $t('cancel') }}
            </button>
            <button type="submit"
                class="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors shadow-sm"
                style="background:#205E77">
                {{ props.formType === 'create' ? $t('save') : $t('update') }}
            </button>
        </div>

    </form>
</template>

<script setup lang="ts">
import { companyService } from '@/components/api/superadmin/CompanyService'
import { appService } from '@/components/api/superadmin/AppService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const props = defineProps({
    error: {
        type: Object as () => Error,
        required: false,
    },
    formType: {
        type: String as () => 'create' | 'update',
        required: true,
    },
    selectedApp: {
        type: Object,
        required: false,
    },
    showActions: {
        type: Boolean,
        default: true,
    },
    showCompanyAttach: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(['submitForm'])

const { successAlert } = useAlert()
const { t } = useI18n()

let companySearchTimeout: any = null

const APP_COLORS = ['#205E77', '#2E9E33', '#368F8B', '#1A4D99', '#D4900A', '#9B4D9B', '#CC3B2D']
const avatarColor = (name: string) => APP_COLORS[(name?.charCodeAt(0) ?? 0) % APP_COLORS.length]

const logoInputRef = ref<HTMLInputElement | null>(null)
const imageInputRef = ref<HTMLInputElement | null>(null)
const bgInputRef = ref<HTMLInputElement | null>(null)

const typeOptions = computed(() => [
    { value: 'citizenone', label: t('superadmin.apps.form.types.citizenone') },
    { value: 'fst', label: t('superadmin.apps.form.types.fst') },
    { value: 'marketing', label: t('superadmin.apps.form.types.marketing') },
    { value: 'visual', label: t('superadmin.apps.form.types.visual') },
    { value: 'other', label: t('superadmin.apps.form.types.other') },
])

const boolFlags = [
    { key: 'is_quantifiable', label: 'superadmin.apps.form.quantifiable' },
    { key: 'is_thirdparty', label: 'superadmin.apps.form.thirdPartyApp' },
    { key: 'is_popular', label: 'superadmin.apps.form.popular' },
    { key: 'is_recommended', label: 'superadmin.apps.form.recommended' },
    { key: 'is_news', label: 'superadmin.apps.form.news' },
]

const state = reactive({
    assignedCompanies: [] as any[],
    bgFile: null as File | null,
    bgPreview: '' as string,
    companyResults: [] as any[],
    companySearch: '',
    errors: { name: '' },
    form: {
        description: '',
        is_active: true,
        is_news: false,
        is_one_time_fee: false,
        is_popular: false,
        is_quantifiable: false,
        is_recommended: false,
        is_thirdparty: false,
        monthly_price: 0,
        name: '',
        price: 0,
        type: '',
        url_field: '',
        yearly_price: 0,
    },
    imageFile: null as File | null,
    imagePreview: '' as string,
    logoFile: null as File | null,
    logoPreview: '' as string,
})

watch(() => props.selectedApp, (app: any) => {
    if (app) {
        state.form = {
            description: app.description ?? '',
            is_active: app.is_active !== false,
            is_news: app.is_news ?? false,
            is_one_time_fee: app.is_one_time_fee ?? false,
            is_popular: app.is_popular ?? false,
            is_quantifiable: app.is_quantifiable ?? false,
            is_recommended: app.is_recommended ?? false,
            is_thirdparty: app.is_thirdparty ?? false,
            monthly_price: app.monthly_price ?? 0,
            name: app.name ?? '',
            price: app.price ?? 0,
            type: app.type ?? '',
            url_field: app.url_field ?? '',
            yearly_price: app.yearly_price ?? 0,
        }
        state.logoPreview = app.logo ?? ''
        state.imagePreview = app.image ?? ''
        state.bgPreview = app.background_image ?? ''
        state.logoFile = null
        state.imageFile = null
        state.bgFile = null
        state.assignedCompanies = []
        state.companySearch = ''
        state.companyResults = []
    }
})

function onLogoChange(event: any) {
    const file = event.target.files[0]
    if (!file) return
    state.logoFile = file
    const reader = new FileReader()
    reader.onload = (e: any) => { state.logoPreview = e.target.result }
    reader.readAsDataURL(file)
}

function onImageChange(event: any) {
    const file = event.target.files[0]
    if (!file) return
    state.imageFile = file
    const reader = new FileReader()
    reader.onload = (e: any) => { state.imagePreview = e.target.result }
    reader.readAsDataURL(file)
}

function onBgChange(event: any) {
    const file = event.target.files[0]
    if (!file) return
    state.bgFile = file
    const reader = new FileReader()
    reader.onload = (e: any) => { state.bgPreview = e.target.result }
    reader.readAsDataURL(file)
}

function reset() {
    state.form = {
        description: '',
        is_active: true,
        is_news: false,
        is_one_time_fee: false,
        is_popular: false,
        is_quantifiable: false,
        is_recommended: false,
        is_thirdparty: false,
        monthly_price: 0,
        name: '',
        price: 0,
        type: '',
        url_field: '',
        yearly_price: 0,
    }
    state.errors = { name: '' }
    state.logoFile = null
    state.logoPreview = ''
    state.imageFile = null
    state.imagePreview = ''
    state.bgFile = null
    state.bgPreview = ''
    state.assignedCompanies = []
    state.companySearch = ''
    state.companyResults = []
}

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

async function assignToCompany(company: any) {
    try {
        await appService.assignAppToCompany(props.selectedApp?.uuid ?? props.selectedApp?.id, company.uuid)
        state.assignedCompanies.push(company)
        state.companySearch = ''
        state.companyResults = []
        successAlert(
            t('superadmin.apps.successAssigned'),
            t('superadmin.apps.successAssignedBody', { appName: props.selectedApp?.name, companyName: company.name })
        )
    } catch (_) { }
}

async function submit() {
    state.errors.name = ''
    if (!state.form.name) {
        state.errors.name = t('superadmin.apps.errorNameRequired')
        return
    }
    emit('submitForm', {
        ...state.form,
        background_image: state.bgFile,
        image: state.imageFile,
        logo: state.logoFile,
    })
}

defineExpose({ submit, reset })
</script>

<style scoped>
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
</style>
