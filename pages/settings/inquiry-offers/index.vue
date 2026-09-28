<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('inquiryOfferSettings.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('inquiryOfferSettings.title') }}</template>

            <div class="mt-8 space-y-5">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <p class="max-w-2xl text-sm text-gray-500">{{ $t('inquiryOfferSettings.description') }}</p>

                <!-- Rates per indsatstype, one row per revision -->
                <section class="rounded-lg border border-gray-200 bg-white">
                    <div class="border-b border-gray-100 px-4 py-3">
                        <p class="text-sm font-semibold text-gray-900">{{ $t('inquiryOfferSettings.rates.title') }}</p>
                        <p class="text-xs text-gray-400">{{ $t('inquiryOfferSettings.rates.hint') }}</p>
                    </div>
                    <div class="flex flex-wrap items-end gap-3 border-b border-gray-100 px-4 py-3">
                        <div class="w-64">
                            <FormLabel for="rate-type" :label="$t('inquiryOfferSettings.rates.serviceType')" />
                            <FormSelect :modelValue="state.rateDraft.inquiry_service_type_uuid" :options="serviceTypeOptions"
                                @update:modelValue="(value: any) => state.rateDraft.inquiry_service_type_uuid = value" />
                        </div>
                        <div class="w-40">
                            <FormLabel for="rate-from" :label="$t('inquiryOfferSettings.validFrom')" />
                            <FormDateField id="rate-from" name="rate-from" :placeholder="$t('inquiryOfferSettings.validFrom')"
                                v-model="state.rateDraft.valid_from" />
                        </div>
                        <div v-for="key in ['hourly_rate', 'admin_hourly_rate', 'transport_hourly_rate']" :key="key" class="w-36">
                            <FormLabel :for="`rate-${key}`" :label="$t('inquiryOfferSettings.rates.' + key)" />
                            <FormNumberField :id="`rate-${key}`" :name="`rate-${key}`" :min="0"
                                :placeholder="$t('inquiryOfferSettings.rates.' + key)" v-model="state.rateDraft[key]" />
                        </div>
                        <div class="w-56">
                            <FormLabel for="rate-note" :label="$t('inquiryOfferSettings.note')" />
                            <FormTextField id="rate-note" name="rate-note" :placeholder="$t('inquiryOfferSettings.note')"
                                v-model="state.rateDraft.note" :maxLength="255" />
                        </div>
                        <FormButton v-if="state.rateEditing" type="button" buttonStyle="cancel" @click="resetRateDraft">
                            {{ $t('cancel') }}
                        </FormButton>
                        <FormButton type="button" buttonStyle="action"
                            :disabled="!state.rateDraft.inquiry_service_type_uuid || !state.rateDraft.valid_from || state.rateDraft.hourly_rate === ''"
                            @click="saveRate">
                            <Icon :name="state.rateEditing ? 'ph:floppy-disk' : 'ph:plus'" class="size-4" />
                            {{ state.rateEditing ? $t('save') : $t('inquiryOfferSettings.add') }}
                        </FormButton>
                    </div>
                    <p v-if="!state.rates.length" class="px-4 py-5 text-sm text-gray-400">{{ $t('inquiryOfferSettings.rates.empty') }}</p>
                    <div v-for="rate in state.rates" :key="rate.uuid"
                        class="flex flex-wrap items-center gap-3 border-b border-gray-50 px-4 py-2.5 last:border-b-0">
                        <div class="min-w-0 flex-1">
                            <p class="text-sm font-medium text-gray-900">{{ rate.service_type?.label }}</p>
                            <p class="text-xs text-gray-500">
                                {{ $t('inquiryOfferSettings.fromDate', { date: formatDateToReadable(rate.valid_from) }) }}
                                · {{ money(rate.hourly_rate) }}
                                <template v-if="rate.admin_hourly_rate"> · {{ $t('inquiryOfferSettings.rates.admin_hourly_rate') }} {{ money(rate.admin_hourly_rate) }}</template>
                                <template v-if="rate.transport_hourly_rate"> · {{ $t('inquiryOfferSettings.rates.transport_hourly_rate') }} {{ money(rate.transport_hourly_rate) }}</template>
                                <template v-if="rate.note"> · {{ rate.note }}</template>
                            </p>
                        </div>
                        <FormButton type="button" buttonStyle="action" @click="editRate(rate)">
                            <Icon name="ph:pencil-simple" class="size-4" />
                        </FormButton>
                        <FormButton type="button" buttonStyle="danger" @click="deleteRate(rate)">
                            <Icon name="ph:trash" class="size-4" />
                        </FormButton>
                    </div>
                </section>

                <!-- Company-wide prices, revised yearly -->
                <section class="rounded-lg border border-gray-200 bg-white">
                    <div class="border-b border-gray-100 px-4 py-3">
                        <p class="text-sm font-semibold text-gray-900">{{ $t('inquiryOfferSettings.prices.title') }}</p>
                        <p class="text-xs text-gray-400">{{ $t('inquiryOfferSettings.prices.hint') }}</p>
                    </div>
                    <div class="grid grid-cols-1 gap-3 border-b border-gray-100 px-4 py-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <FormLabel for="price-from" :label="$t('inquiryOfferSettings.validFrom')" />
                            <FormDateField id="price-from" name="price-from" :placeholder="$t('inquiryOfferSettings.validFrom')"
                                v-model="state.priceDraft.valid_from" />
                        </div>
                        <div v-for="key in PRICE_FIELDS" :key="key">
                            <FormLabel :for="`price-${key}`" :label="$t('inquiryOfferSettings.prices.' + key)" />
                            <FormNumberField :id="`price-${key}`" :name="`price-${key}`" :min="0"
                                :placeholder="$t('inquiryOfferSettings.prices.' + key)" v-model="state.priceDraft[key]" />
                        </div>
                        <div>
                            <FormLabel for="price-applies" :label="$t('inquiryOfferSettings.prices.special_language_applies_to')" />
                            <select id="price-applies" v-model="state.priceDraft.special_language_applies_to"
                                class="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-primary focus:ring-primary">
                                <option value="contact">{{ $t('inquiryOfferSettings.prices.appliesContact') }}</option>
                                <option value="all">{{ $t('inquiryOfferSettings.prices.appliesAll') }}</option>
                            </select>
                        </div>
                        <div class="flex items-end gap-2">
                            <FormButton v-if="state.priceEditing" type="button" buttonStyle="cancel" @click="resetPriceDraft">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="action" :disabled="!state.priceDraft.valid_from" @click="savePrice">
                                <Icon :name="state.priceEditing ? 'ph:floppy-disk' : 'ph:plus'" class="size-4" />
                                {{ state.priceEditing ? $t('save') : $t('inquiryOfferSettings.prices.addRevision') }}
                            </FormButton>
                        </div>
                    </div>
                    <p v-if="!state.prices.length" class="px-4 py-5 text-sm text-gray-400">{{ $t('inquiryOfferSettings.prices.empty') }}</p>
                    <div v-for="price in state.prices" :key="price.uuid"
                        class="flex flex-wrap items-center gap-3 border-b border-gray-50 px-4 py-2.5 last:border-b-0">
                        <div class="min-w-0 flex-1">
                            <p class="text-sm font-medium text-gray-900">
                                {{ $t('inquiryOfferSettings.fromDate', { date: formatDateToReadable(price.valid_from) }) }}
                            </p>
                            <p class="text-xs text-gray-500">
                                {{ $t('inquiryOfferSettings.prices.special_language_surcharge') }} {{ money(price.special_language_surcharge) }}
                                · {{ $t('inquiryOfferSettings.prices.supervision_price_per_week') }} {{ money(price.supervision_price_per_week) }}
                                · {{ $t('inquiryOfferSettings.prices.room_price_per_session') }} {{ money(price.room_price_per_session) }}
                                · {{ $t('inquiryOfferSettings.prices.reporting_price_per_report') }} {{ money(price.reporting_price_per_report) }}
                            </p>
                        </div>
                        <FormButton type="button" buttonStyle="action" @click="editPrice(price)">
                            <Icon name="ph:pencil-simple" class="size-4" />
                        </FormButton>
                        <FormButton type="button" buttonStyle="danger" @click="deletePrice(price)">
                            <Icon name="ph:trash" class="size-4" />
                        </FormButton>
                    </div>
                </section>

                <!-- Special languages: anything not marked is a common language -->
                <section class="rounded-lg border border-gray-200 bg-white">
                    <div class="flex flex-wrap items-end justify-between gap-3 border-b border-gray-100 px-4 py-3">
                        <div>
                            <p class="text-sm font-semibold text-gray-900">{{ $t('inquiryOfferSettings.languages.title') }}</p>
                            <p class="text-xs text-gray-400">{{ $t('inquiryOfferSettings.languages.hint') }}</p>
                        </div>
                        <div class="flex items-end gap-2">
                            <div class="w-56">
                                <FormTextField id="language-search" name="language-search"
                                    :placeholder="$t('inquiryOfferSettings.languages.search')" v-model="state.languageSearch" />
                            </div>
                            <FormButton type="button" buttonStyle="primary" @click="saveLanguages">{{ $t('save') }}</FormButton>
                        </div>
                    </div>
                    <p class="px-4 pt-3 text-xs text-gray-500">
                        {{ $t('inquiryOfferSettings.languages.count', { count: state.specialUuids.length }) }}
                    </p>
                    <div class="grid max-h-80 grid-cols-1 gap-x-6 gap-y-1.5 overflow-y-auto px-4 py-3 sm:grid-cols-2 lg:grid-cols-3">
                        <label v-for="language in filteredLanguages" :key="language.uuid"
                            class="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                            <input type="checkbox" class="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                                :value="language.uuid" v-model="state.specialUuids" />
                            {{ language.name_dk || language.name }}
                        </label>
                    </div>
                </section>

                <!-- The offer template -->
                <section class="rounded-lg border border-gray-200 bg-white">
                    <div class="border-b border-gray-100 px-4 py-3">
                        <p class="text-sm font-semibold text-gray-900">{{ $t('inquiryOfferSettings.template.title') }}</p>
                        <p class="text-xs text-gray-400">
                            {{ $t('inquiryOfferSettings.template.hint', { placeholders: state.placeholders.join(' ') }) }}
                        </p>
                    </div>
                    <div class="grid grid-cols-1 gap-3 px-4 py-3 sm:grid-cols-3">
                        <div class="sm:col-span-3">
                            <FormLabel for="template-title" :label="$t('inquiryOfferSettings.template.documentTitle')" />
                            <FormTextField id="template-title" name="template-title" :maxLength="255"
                                :placeholder="$t('inquiryOfferSettings.template.documentTitlePlaceholder')" v-model="state.template.title" />
                        </div>
                        <div class="sm:col-span-3">
                            <FormLabel for="template-intro" :label="$t('inquiryOfferSettings.template.intro')" />
                            <FormTextArea id="template-intro" name="template-intro" :rows="4"
                                :placeholder="$t('inquiryOfferSettings.template.introPlaceholder')" v-model="state.template.intro_text" />
                        </div>
                        <div class="sm:col-span-3">
                            <FormLabel for="template-terms" :label="$t('inquiryOfferSettings.template.terms')" />
                            <FormTextArea id="template-terms" name="template-terms" :rows="4"
                                :placeholder="$t('inquiryOfferSettings.template.termsPlaceholder')" v-model="state.template.terms_text" />
                        </div>
                        <div>
                            <FormLabel for="template-deadline" :label="$t('inquiryOfferSettings.template.deadlineDays')" />
                            <FormNumberField id="template-deadline" name="template-deadline" :min="0"
                                :placeholder="$t('inquiryOfferSettings.template.deadlineDays')" v-model="state.template.deadline_days" />
                        </div>
                        <div>
                            <FormLabel for="template-reminder" :label="$t('inquiryOfferSettings.template.reminderDaysBefore')" />
                            <FormNumberField id="template-reminder" name="template-reminder" :min="0"
                                :placeholder="$t('inquiryOfferSettings.template.reminderDaysBefore')" v-model="state.template.reminder_days_before" />
                        </div>
                        <div class="flex items-end justify-end">
                            <FormButton type="button" buttonStyle="primary" @click="saveTemplate">{{ $t('save') }}</FormButton>
                        </div>
                    </div>
                </section>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'require-page', requiredPage: 'Inquiries', requiredCompanyFlag: 'inquiry_pipeline_enabled' })

import { inquiryOfferService } from '@/components/api/user/InquiryOfferService'
import { inquiryServiceTypeService } from '@/components/api/user/InquiryServiceTypeService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert, errorAlert } = useAlert()
const { t } = useI18n()
const { formatDateToReadable } = useDatetimeFormatter()

const breadcrumbLinks = [
    {
        name: 'inquiryOfferSettings.title',
        translate: true,
        href: '/settings/inquiry-offers',
    },
]

const PRICE_FIELDS = [
    'special_language_surcharge',
    'supervision_price_per_week',
    'room_price_per_session',
    'reporting_price_per_report',
    'weeks_per_month',
]

function emptyRate(): any {
    return { inquiry_service_type_uuid: null, valid_from: '', hourly_rate: '', admin_hourly_rate: '', transport_hourly_rate: '', note: '' }
}

function emptyPrice(): any {
    return {
        valid_from: '',
        special_language_surcharge: '',
        special_language_applies_to: 'contact',
        supervision_price_per_week: '',
        room_price_per_session: '',
        reporting_price_per_report: '',
        weeks_per_month: '4.33',
    }
}

const state = reactive({
    error: {} as Error,
    serviceTypes: [] as any[],
    rates: [] as any[],
    rateDraft: emptyRate(),
    rateEditing: '',
    prices: [] as any[],
    priceDraft: emptyPrice(),
    priceEditing: '',
    languages: [] as any[],
    specialUuids: [] as string[],
    languageSearch: '',
    template: { title: '', intro_text: '', terms_text: '', deadline_days: '10', reminder_days_before: '2' } as any,
    placeholders: [] as string[],
})

const serviceTypeOptions = computed(() => state.serviceTypes.map((type: any) => ({ value: type.uuid, label: type.label })))

const filteredLanguages = computed(() => {
    const search = state.languageSearch.trim().toLowerCase()
    if (!search) return state.languages

    return state.languages.filter((language: any) =>
        `${language.name} ${language.name_dk ?? ''}`.toLowerCase().includes(search))
})

onMounted(() => {
    fetchAll()
})

async function fetchAll() {
    state.error = {}
    try {
        const [types, rates, prices, languages, template] = await Promise.all([
            inquiryServiceTypeService.getServiceTypes(),
            inquiryOfferService.getRates(),
            inquiryOfferService.getPriceSettings(),
            inquiryOfferService.getSpecialLanguages(),
            inquiryOfferService.getTemplate(),
        ])
        state.serviceTypes = types?.data ?? []
        state.rates = rates?.data ?? []
        state.prices = prices?.data ?? []
        state.languages = languages?.data ?? []
        state.specialUuids = state.languages.filter((language: any) => language.is_special).map((language: any) => language.uuid)
        state.placeholders = template?.placeholders ?? []
        const data = template?.data ?? {}
        state.template = {
            title: data.title ?? '',
            intro_text: data.intro_text ?? '',
            terms_text: data.terms_text ?? '',
            deadline_days: String(data.deadline_days ?? 10),
            reminder_days_before: String(data.reminder_days_before ?? 2),
        }
        if (!state.priceEditing) prefillPriceFromLatest()
    } catch (error: any) {
        state.error = error
    }
}

function money(value: any) {
    if (value === null || value === undefined || value === '') return '-'

    return Number(value).toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' kr.'
}

function numeric(value: any) {
    return value === '' || value === null || value === undefined ? null : Number(value)
}

function failed(error: any) {
    const first = error?.errors ? Object.values(error.errors)[0] as any : null

    errorAlert(t('alert.warning'), first?.[0] ?? error?.message ?? t('inquiryOfferSettings.saveFailed'))
}

// Rates

function resetRateDraft() {
    state.rateDraft = emptyRate()
    state.rateEditing = ''
}

function editRate(rate: any) {
    state.rateEditing = rate.uuid
    state.rateDraft = {
        inquiry_service_type_uuid: rate.service_type?.uuid ?? null,
        valid_from: rate.valid_from,
        hourly_rate: String(rate.hourly_rate ?? ''),
        admin_hourly_rate: rate.admin_hourly_rate === null ? '' : String(rate.admin_hourly_rate),
        transport_hourly_rate: rate.transport_hourly_rate === null ? '' : String(rate.transport_hourly_rate),
        note: rate.note ?? '',
    }
}

async function saveRate() {
    const body = {
        inquiry_service_type_uuid: state.rateDraft.inquiry_service_type_uuid,
        valid_from: state.rateDraft.valid_from,
        hourly_rate: numeric(state.rateDraft.hourly_rate),
        admin_hourly_rate: numeric(state.rateDraft.admin_hourly_rate),
        transport_hourly_rate: numeric(state.rateDraft.transport_hourly_rate),
        note: state.rateDraft.note || null,
    }
    try {
        if (state.rateEditing) {
            await inquiryOfferService.updateRate(state.rateEditing, body)
        } else {
            await inquiryOfferService.saveRate(body)
        }
        resetRateDraft()
        await fetchAll()
        successAlert(`${t('alert.success')}!`, `${t('inquiryOfferSettings.saved')}.`)
    } catch (error: any) {
        failed(error)
    }
}

async function deleteRate(rate: any) {
    try {
        await inquiryOfferService.deleteRate(rate.uuid)
        await fetchAll()
    } catch (error: any) {
        failed(error)
    }
}

// Price revisions

function prefillPriceFromLatest() {
    // A yearly revision usually changes a few numbers, so it starts from the
    // one in force rather than from empty fields.
    const latest = state.prices[0]
    state.priceDraft = emptyPrice()
    if (!latest) return

    for (const key of PRICE_FIELDS) {
        state.priceDraft[key] = latest[key] === null ? '' : String(latest[key])
    }
    state.priceDraft.special_language_applies_to = latest.special_language_applies_to ?? 'contact'
}

function resetPriceDraft() {
    state.priceEditing = ''
    prefillPriceFromLatest()
}

function editPrice(price: any) {
    state.priceEditing = price.uuid
    state.priceDraft = { valid_from: price.valid_from, special_language_applies_to: price.special_language_applies_to ?? 'contact' }
    for (const key of PRICE_FIELDS) {
        state.priceDraft[key] = price[key] === null ? '' : String(price[key])
    }
}

async function savePrice() {
    const body: any = {
        valid_from: state.priceDraft.valid_from,
        special_language_applies_to: state.priceDraft.special_language_applies_to,
    }
    for (const key of PRICE_FIELDS) {
        body[key] = numeric(state.priceDraft[key])
    }
    if (body.weeks_per_month === null) delete body.weeks_per_month

    try {
        if (state.priceEditing) {
            await inquiryOfferService.updatePriceSetting(state.priceEditing, body)
        } else {
            await inquiryOfferService.savePriceSetting(body)
        }
        state.priceEditing = ''
        await fetchAll()
        successAlert(`${t('alert.success')}!`, `${t('inquiryOfferSettings.saved')}.`)
    } catch (error: any) {
        failed(error)
    }
}

async function deletePrice(price: any) {
    try {
        await inquiryOfferService.deletePriceSetting(price.uuid)
        await fetchAll()
    } catch (error: any) {
        failed(error)
    }
}

// Special languages

async function saveLanguages() {
    try {
        await inquiryOfferService.saveSpecialLanguages([...state.specialUuids])
        await fetchAll()
        successAlert(`${t('alert.success')}!`, `${t('inquiryOfferSettings.saved')}.`)
    } catch (error: any) {
        failed(error)
    }
}

// Template

async function saveTemplate() {
    try {
        await inquiryOfferService.saveTemplate({
            title: state.template.title || null,
            intro_text: state.template.intro_text || null,
            terms_text: state.template.terms_text || null,
            deadline_days: Number(state.template.deadline_days || 0),
            reminder_days_before: Number(state.template.reminder_days_before || 0),
        })
        await fetchAll()
        successAlert(`${t('alert.success')}!`, `${t('inquiryOfferSettings.saved')}.`)
    } catch (error: any) {
        failed(error)
    }
}
</script>
