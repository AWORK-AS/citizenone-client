<template>
    <div class="space-y-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm text-gray-500 max-w-2xl">{{ $t('services.help') }}</p>
            <FormButton buttonStyle="action" @click="startNew">
                <Icon name="ph:plus" class="size-4" />
                {{ $t('services.new') }}
            </FormButton>
        </div>

        <Alert type="danger" :text="state.error" v-if="state.error" />

        <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-4 space-y-3" v-if="state.isEditing">
            <div class="grid grid-cols-1 sm:grid-cols-6 gap-3">
                <div class="space-y-1">
                    <FormLabel for="code" :label="$t('services.form.code')" />
                    <FormTextField id="code" name="code" v-model="state.form.code"
                        :placeholder="$t('services.form.codePlaceholder')" />
                </div>
                <div class="space-y-1 sm:col-span-2">
                    <FormLabel for="name" :label="$t('services.form.name')" />
                    <FormTextField id="name" name="name" v-model="state.form.name"
                        :placeholder="$t('services.form.name')" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="unit_price" :label="priceLabel" />
                    <FormNumberField name="unit_price" :min="0" v-model="state.form.unit_price"
                        :placeholder="priceLabel" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="vat_rate" :label="$t('services.form.vatRate')" />
                    <FormNumberField name="vat_rate" :min="0" v-model="state.form.vat_rate"
                        :placeholder="$t('services.form.vatRate')" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="default_subsidy" :label="$t('services.form.subsidy')" />
                    <FormNumberField name="default_subsidy" :min="0" v-model="state.form.default_subsidy"
                        :placeholder="$t('services.form.subsidy')" />
                </div>
            </div>

            <p class="text-xs text-gray-500">{{ $t('services.form.vatHelp') }}</p>

            <div class="flex items-center justify-end gap-2">
                <FormButton buttonStyle="action" buttonSize="xs" @click="state.isEditing = false">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton buttonStyle="primary" buttonSize="xs" @click="save" :disabled="state.isSaving">
                    {{ $t('save') }}
                </FormButton>
            </div>
        </div>

        <LoadingSpinner :isActive="state.isPageLoading">
            <div v-if="state.services.length === 0"
                class="px-6 py-14 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg text-center">
                <div class="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon name="ph:tag" class="h-7 w-7 text-primary" />
                </div>
                <h3 class="mt-4 text-lg font-semibold text-gray-900">{{ $t('services.empty.title') }}</h3>
                <p class="mt-1 text-sm text-gray-500 max-w-md mx-auto">{{ $t('services.empty.text') }}</p>
            </div>

            <div v-else class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-x-auto">
                <table class="min-w-full text-sm">
                    <thead>
                        <tr class="text-left text-xs uppercase tracking-wide text-gray-500">
                            <th class="px-4 py-3">{{ $t('services.form.code') }}</th>
                            <th class="px-4 py-3">{{ $t('services.form.name') }}</th>
                            <th class="px-4 py-3 text-right">{{ priceLabel }}</th>
                            <th class="px-4 py-3 text-right">{{ $t('services.form.vatRate') }}</th>
                            <th class="px-4 py-3 text-right">{{ $t('services.form.subsidy') }}</th>
                            <th class="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="service in state.services" :key="service.uuid" class="border-t border-gray-100">
                            <td class="px-4 py-3 tabular-nums">{{ service.code }}</td>
                            <td class="px-4 py-3">
                                {{ service.name }}
                                <span class="text-xs text-gray-400" v-if="!service.is_active">
                                    &middot; {{ $t('services.inactive') }}
                                </span>
                            </td>
                            <td class="px-4 py-3 text-right tabular-nums">{{ formatAmount(service.unit_price) }}</td>
                            <td class="px-4 py-3 text-right tabular-nums">{{ service.vat_rate }} %</td>
                            <td class="px-4 py-3 text-right tabular-nums">{{ formatAmount(service.default_subsidy) }}</td>
                            <td class="px-4 py-3 text-right whitespace-nowrap">
                                <button type="button" class="text-gray-400 hover:text-primary mr-2"
                                    :aria-label="$t('edit')" @click="startEdit(service)">
                                    <Icon name="ph:pencil-simple" class="size-4" />
                                </button>
                                <button type="button" class="text-gray-400 hover:text-red-600"
                                    :aria-label="$t('delete')" @click="remove(service)">
                                    <Icon name="ph:trash" class="size-4" />
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </LoadingSpinner>
    </div>
</template>

<script setup lang="ts">
import { citizenInvoiceService } from '@/components/api/user/CitizenInvoiceService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
    defaultVatRate?: number
    pricesIncludeVat?: boolean
}>()

const { successAlert } = useAlert()
const { t, locale } = useI18n()

const state = reactive({
    services: [] as any[],
    form: emptyForm(),
    editingUuid: null as string | null,
    isEditing: false,
    isPageLoading: true,
    isSaving: false,
    error: '',
})

// The heading tells you which price you are typing, so nobody has to guess
// whether VAT is already in the number.
const priceLabel = computed(() => props.pricesIncludeVat
    ? t('services.form.unitPriceIncl')
    : t('services.form.unitPrice'))

function emptyForm() {
    return { code: '', name: '', unit_price: '', vat_rate: String(props.defaultVatRate ?? 0), default_subsidy: '' }
}

function formatAmount(amount: number): string {
    return new Intl.NumberFormat(locale.value === 'en' ? 'en-GB' : 'da-DK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(amount) || 0)
}

function startNew() {
    state.form = emptyForm()
    state.editingUuid = null
    state.isEditing = true
}

function startEdit(service: any) {
    state.form = {
        code: service.code || '',
        name: service.name,
        unit_price: String(service.unit_price ?? ''),
        vat_rate: String(service.vat_rate ?? 0),
        default_subsidy: service.default_subsidy ? String(service.default_subsidy) : '',
    }
    state.editingUuid = service.uuid
    state.isEditing = true
}

async function load() {
    state.error = ''

    try {
        const response = await citizenInvoiceService.getServices()
        state.services = response?.data || []
    } catch (error: any) {
        state.error = error?.message || ''
    } finally {
        state.isPageLoading = false
    }
}

async function save() {
    state.isSaving = true
    state.error = ''

    const payload = {
        code: state.form.code || null,
        name: state.form.name,
        unit_price: Number(state.form.unit_price) || 0,
        vat_rate: Number(state.form.vat_rate) || 0,
        default_subsidy: Number(state.form.default_subsidy) || 0,
    }

    try {
        if (state.editingUuid) {
            await citizenInvoiceService.updateService(state.editingUuid, payload)
        } else {
            await citizenInvoiceService.createService(payload)
        }

        successAlert(`${t('alert.success')}!`, `${t('services.saved')}.`)
        state.isEditing = false
        await load()
    } catch (error: any) {
        state.error = error?.message || ''
    } finally {
        state.isSaving = false
    }
}

async function remove(service: any) {
    state.error = ''

    try {
        await citizenInvoiceService.deleteService(service.uuid)
        await load()
    } catch (error: any) {
        state.error = error?.message || ''
    }
}

onMounted(() => load())
</script>
