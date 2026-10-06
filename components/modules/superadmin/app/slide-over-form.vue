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
            <textarea v-model="state.form.description" rows="3" :placeholder="$t('superadmin.apps.form.description')"
                class="co-input resize-none"></textarea>
            <SuperadminFormError :error="props.error?.errors?.description?.[0]" />
        </div>

        <!-- Subtitle: the one line a card and a shelf can show. -->
        <div>
            <SuperadminFormLabel :label="$t('superadmin.apps.form.tagline')" />
            <SuperadminFormTextField v-model="state.form.tagline"
                :placeholder="$t('superadmin.apps.form.tagline')" />
            <SuperadminFormError :error="props.error?.errors?.tagline?.[0]" />
        </div>

        <!-- Long description: the app page -->
        <div>
            <SuperadminFormLabel :label="$t('superadmin.apps.form.longDescription')" />
            <textarea v-model="state.form.long_description" rows="5"
                :placeholder="$t('superadmin.apps.form.longDescription')" class="co-input resize-none"></textarea>
            <SuperadminFormError :error="props.error?.errors?.long_description?.[0]" />
        </div>

        <!-- Release: what the customer sees under "Version" -->
        <div class="grid grid-cols-2 gap-3">
            <div>
                <SuperadminFormLabel :label="$t('superadmin.apps.form.version')" />
                <SuperadminFormTextField v-model="state.form.version" placeholder="1.0.0" />
            </div>
            <div>
                <SuperadminFormLabel :label="$t('superadmin.apps.form.releasedAt')" />
                <SuperadminFormTextField v-model="state.form.released_at" type="date" />
            </div>
        </div>

        <div>
            <SuperadminFormLabel :label="$t('superadmin.apps.form.whatsNew')" />
            <textarea v-model="state.form.whats_new" rows="3" :placeholder="$t('superadmin.apps.form.whatsNew')"
                class="co-input resize-none"></textarea>
        </div>

        <div class="grid grid-cols-2 gap-3">
            <div>
                <SuperadminFormLabel :label="$t('superadmin.apps.form.publisher')" />
                <SuperadminFormTextField v-model="state.form.publisher" placeholder="CitizenONE" />
            </div>
            <div>
                <SuperadminFormLabel :label="$t('superadmin.apps.form.dataLocation')" />
                <SuperadminFormTextField v-model="state.form.data_location" placeholder="EU/DK" />
            </div>
        </div>

        <!-- Publishing to the marketing site is a deliberate act, not a default. -->
        <div>
            <div class="flex items-center gap-2 cursor-pointer select-none"
                @click="state.form.is_public = !state.form.is_public">
                <div class="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                    :style="state.form.is_public ? 'border-color:#42AED9;background:#42AED9' : 'border-color:#D5D9E2;background:white'">
                    <Icon v-if="state.form.is_public" name="ph:check" class="w-2.5 h-2.5 text-white" />
                </div>
                <span class="text-[13px] font-medium text-[#1F2533]">{{ $t('superadmin.apps.form.isPublic') }}</span>
            </div>
            <p class="mt-1 text-[11px] text-[#8891A4]">{{ $t('superadmin.apps.form.isPublicHint') }}</p>
        </div>

        <!-- Screenshots: only once the app exists, since they hang off its uuid. -->
        <div v-if="props.selectedApp?.uuid">
            <SuperadminFormLabel :label="$t('superadmin.apps.form.screenshots')" />
            <div class="space-y-2">
                <div v-for="shot in state.screenshots" :key="shot.uuid"
                    class="flex items-center gap-3 rounded-lg border border-[#EAECF0] p-2">
                    <img :src="shot.url" alt="" class="h-10 w-16 flex-none rounded object-cover" />
                    <span class="flex-1 truncate text-[12px] text-[#5C6478]">{{ shot.caption || shot.url }}</span>
                    <button type="button" class="text-[#CC3B2D]" @click="removeScreenshot(shot)"
                        :aria-label="$t('delete')">
                        <Icon name="ph:trash" class="h-4 w-4" />
                    </button>
                </div>
                <SuperadminFormTextField v-model="state.newScreenshot.caption"
                    :placeholder="$t('superadmin.apps.form.screenshotCaption')" />

                <div class="grid grid-cols-[1fr_auto] gap-2">
                    <SuperadminFormTextField v-model="state.newScreenshot.url" type="url" placeholder="https://..." />
                    <button type="button"
                        class="rounded-lg border border-[#D5D9E2] px-3 text-[12px] font-medium text-[#205E77] disabled:opacity-50"
                        :disabled="!state.newScreenshot.url || state.isUploadingScreenshot" @click="addScreenshot">
                        {{ $t('superadmin.apps.form.addScreenshot') }}
                    </button>
                </div>

                <!-- Or a file off the editor's own machine. Same endpoint, same row. -->
                <div>
                    <input ref="screenshotFile" type="file" accept="image/png,image/jpeg,image/webp,image/gif"
                        class="hidden" @change="uploadScreenshot" />
                    <button type="button"
                        class="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#D5D9E2] px-3 py-2 text-[12px] font-medium text-[#5C6478] hover:border-[#42AED9] hover:text-[#205E77] disabled:opacity-50"
                        :disabled="state.isUploadingScreenshot" @click="screenshotFile?.click()">
                        <Icon :name="state.isUploadingScreenshot ? 'ph:spinner' : 'ph:upload-simple'"
                            :class="['w-4 h-4', state.isUploadingScreenshot && 'animate-spin']" />
                        {{ $t('superadmin.apps.form.uploadScreenshot') }}
                    </button>
                    <SuperadminFormError :error="state.errors.screenshot" />
                </div>
            </div>
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
                <SuperadminFormTextField v-model.number="state.form.price" type="number" placeholder="0" class="pr-8" />
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

        <!-- Setup fee -->
        <div>
            <SuperadminFormLabel :label="$t('superadmin.apps.form.setupFee')" />
            <div class="relative">
                <SuperadminFormTextField v-model.number="state.form.setup_fee" type="number" placeholder="0"
                    class="pr-8" />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[#8891A4] text-sm">kr</span>
            </div>
            <SuperadminFormError :error="props.error?.errors?.setup_fee?.[0]" />
        </div>

        <!-- Payment fee (%) -->
        <div>
            <SuperadminFormLabel :label="$t('superadmin.apps.form.paymentFeePercent')" />
            <div class="relative">
                <SuperadminFormTextField v-model="state.form.payment_fee_percent" type="number" placeholder="0"
                    class="pr-8" />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[#8891A4] text-sm">%</span>
            </div>
            <p class="mt-1 text-xs text-[#8891A4]">{{ $t('superadmin.apps.form.paymentFeeHelp') }}</p>
            <SuperadminFormError :error="props.error?.errors?.payment_fee_percent?.[0]" />
        </div>

        <!-- Discount (%) -->
        <div>
            <SuperadminFormLabel :label="$t('superadmin.apps.form.discountPercent')" />
            <div class="relative">
                <SuperadminFormTextField v-model.number="state.form.discount_percent" type="number" placeholder="0"
                    class="pr-8" />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[#8891A4] text-sm">%</span>
            </div>
            <SuperadminFormError :error="props.error?.errors?.discount_percent?.[0]" />
        </div>

        <!-- Discount ends at -->
        <div>
            <SuperadminFormLabel :label="$t('superadmin.apps.form.discountEndsAt')" />
            <SuperadminFormTextField v-model="state.form.discount_ends_at" type="date" />
            <SuperadminFormError :error="props.error?.errors?.discount_ends_at?.[0]" />
        </div>

        <!-- Sort order -->
        <div>
            <SuperadminFormLabel :label="$t('superadmin.apps.form.sortOrder')" />
            <SuperadminFormTextField v-model.number="state.form.sort_order" type="number" placeholder="0" />
            <SuperadminFormError :error="props.error?.errors?.sort_order?.[0]" />
        </div>

        <!-- Category -->
        <div>
            <SuperadminFormLabel :label="$t('superadmin.apps.form.category')" :required="true" />
            <SuperadminFormSelectField v-model="state.form.category_id">
                <option value="">— {{ $t('superadmin.apps.form.category') }} —</option>
                <option v-for="category in state.categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                </option>
            </SuperadminFormSelectField>
            <SuperadminFormError :error="props.error?.errors?.category_id?.[0]" />
        </div>

        <!-- Required plan -->
        <div>
            <SuperadminFormLabel :label="$t('superadmin.apps.form.requiredPlan')" />
            <SuperadminFormSelectField v-model="state.form.required_plan">
                <option value="">{{ $t('superadmin.apps.form.requiredPlanNone') }}</option>
                <option value="Basis">Basis</option>
                <option value="Pro">Pro</option>
            </SuperadminFormSelectField>
            <p class="mt-1 text-xs text-gray-500">{{ $t('superadmin.apps.form.requiredPlanHint') }}</p>
            <SuperadminFormError :error="props.error?.errors?.required_plan?.[0]" />
        </div>

        <!-- Link -->
        <div>
            <SuperadminFormLabel :label="$t('superadmin.apps.form.link')" />
            <SuperadminFormTextField v-model="state.form.url_field" type="url" placeholder="https://..." />
            <SuperadminFormError :error="props.error?.errors?.url_field?.[0]" />
        </div>

        <!-- Checkboxes -->
        <div class="space-y-2">
            <div v-for="flag in boolFlags" :key="flag.key" class="flex items-center gap-2 cursor-pointer select-none"
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
import { appService } from '@/components/api/superadmin/AppService'
import { appCategoryService } from '@/components/api/superadmin/AppCategoryService'
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
})

const emit = defineEmits(['submitForm'])

const { t } = useI18n()

const screenshotFile = ref<HTMLInputElement | null>(null)

const logoInputRef = ref<HTMLInputElement | null>(null)
const imageInputRef = ref<HTMLInputElement | null>(null)
const bgInputRef = ref<HTMLInputElement | null>(null)

const boolFlags = [
    { key: 'is_free', label: 'superadmin.apps.form.isFree' },
    { key: 'is_quantifiable', label: 'superadmin.apps.form.quantifiable' },
    { key: 'is_thirdparty', label: 'superadmin.apps.form.thirdPartyApp' },
    { key: 'is_popular', label: 'superadmin.apps.form.popular' },
    { key: 'is_recommended', label: 'superadmin.apps.form.recommended' },
    { key: 'is_news', label: 'superadmin.apps.form.news' },
]

const state = reactive({
    bgFile: null as File | null,
    bgPreview: '' as string,
    categories: [] as any[],
    errors: { name: '', screenshot: '' },
    form: {
        category_id: '' as any,
        data_location: '',
        description: '',
        discount_ends_at: '' as any,
        discount_percent: 0,
        is_active: true,
        is_free: false,
        is_news: false,
        is_one_time_fee: false,
        is_popular: false,
        is_public: false,
        is_quantifiable: false,
        is_recommended: false,
        is_thirdparty: false,
        long_description: '',
        monthly_price: 0,
        name: '',
        payment_fee_percent: '' as string | number,
        price: 0,
        publisher: '',
        released_at: '' as any,
        required_plan: '',
        setup_fee: 0,
        sort_order: 0,
        tagline: '',
        type: '',
        url_field: '',
        version: '',
        whats_new: '',
        yearly_price: 0,
    },
    isUploadingScreenshot: false,
    newScreenshot: { url: '', caption: '' },
    screenshots: [] as any[],
    imageFile: null as File | null,
    imagePreview: '' as string,
    logoFile: null as File | null,
    logoPreview: '' as string,
})

watch(() => props.selectedApp, (app: any) => {
    if (app) {
        state.screenshots = app.screenshots ?? []
        state.form = {
            category_id: app.category_id ?? '',
            data_location: app.data_location ?? '',
            description: app.description ?? '',
            discount_ends_at: app.discount_ends_at ? String(app.discount_ends_at).slice(0, 10) : '',
            discount_percent: app.discount_percent ?? 0,
            is_active: app.is_active !== false,
            is_free: app.is_free ?? false,
            is_news: app.is_news ?? false,
            is_one_time_fee: app.is_one_time_fee ?? false,
            is_popular: app.is_popular ?? false,
            is_public: app.is_public ?? false,
            is_quantifiable: app.is_quantifiable ?? false,
            is_recommended: app.is_recommended ?? false,
            long_description: app.long_description ?? '',
            publisher: app.publisher ?? '',
            required_plan: app.required_plan ?? '',
            released_at: app.released_at ? String(app.released_at).slice(0, 10) : '',
            tagline: app.tagline ?? '',
            version: app.version ?? '',
            whats_new: app.whats_new ?? '',
            is_thirdparty: app.is_thirdparty ?? false,
            monthly_price: app.monthly_price ?? 0,
            name: app.name ?? '',
            payment_fee_percent: app.payment_fee_percent ?? '',
            price: app.price ?? 0,
            setup_fee: app.setup_fee ?? 0,
            sort_order: app.sort_order ?? 0,
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
    }
})

onMounted(() => {
    fetchCategories()
})

async function fetchCategories() {
    try {
        const response = await appCategoryService.getCategories({ page: 1 })
        state.categories = response?.data ?? []
    } catch (_) {
        state.categories = []
    }
}

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
        category_id: '',
        data_location: '',
        description: '',
        discount_ends_at: '',
        discount_percent: 0,
        is_active: true,
        is_free: false,
        is_news: false,
        is_one_time_fee: false,
        is_popular: false,
        is_public: false,
        is_quantifiable: false,
        is_recommended: false,
        is_thirdparty: false,
        long_description: '',
        monthly_price: 0,
        name: '',
        payment_fee_percent: '',
        price: 0,
        publisher: '',
        released_at: '',
        required_plan: '',
        setup_fee: 0,
        sort_order: 0,
        tagline: '',
        type: '',
        url_field: '',
        version: '',
        whats_new: '',
        yearly_price: 0,
    }
    state.errors = { name: '', screenshot: '' }
    state.screenshots = []
    state.newScreenshot = { url: '', caption: '' }
    state.logoFile = null
    state.logoPreview = ''
    state.imageFile = null
    state.imagePreview = ''
    state.bgFile = null
    state.bgPreview = ''
}

/**
 * Screenshots belong to a saved app, so they are added straight away rather than
 * being held until the form is submitted. That also means the list on screen is
 * what the store will show.
 */
async function addScreenshot() {
    if (!state.newScreenshot.url || !props.selectedApp?.uuid) {
        return
    }

    const response = await appService.addScreenshot(props.selectedApp.uuid, {
        url: state.newScreenshot.url,
        caption: state.newScreenshot.caption,
        sort_order: state.screenshots.length + 1,
    })

    if (response?.data) {
        state.screenshots = [...state.screenshots, response.data]
        state.newScreenshot = { url: '', caption: '' }
    }
}

/**
 * A file picked off the editor's machine. The caption field above is reused, so
 * the two ways of adding a shot do not need two captions.
 */
async function uploadScreenshot(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]

    if (!file || !props.selectedApp?.uuid) {
        return
    }

    state.errors.screenshot = ''
    state.isUploadingScreenshot = true

    try {
        const formData = new FormData()
        formData.append('screenshot', file)
        formData.append('sort_order', String(state.screenshots.length + 1))

        if (state.newScreenshot.caption) {
            formData.append('caption', state.newScreenshot.caption)
        }

        const response = await appService.uploadScreenshot(props.selectedApp.uuid, formData)

        if (response?.data) {
            state.screenshots = [...state.screenshots, response.data]
            state.newScreenshot = { url: '', caption: '' }
        }
    } catch (error: any) {
        state.errors.screenshot = error?.message ?? t('superadmin.apps.form.uploadFailed')
    }

    state.isUploadingScreenshot = false
    input.value = ''
}

async function removeScreenshot(shot: any) {
    await appService.deleteScreenshot(shot.uuid)
    state.screenshots = state.screenshots.filter((item: any) => item.uuid !== shot.uuid)
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
