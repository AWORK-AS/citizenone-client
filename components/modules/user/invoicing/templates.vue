<template>
    <div class="space-y-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm text-gray-500 max-w-2xl">{{ $t('invoiceTemplates.help') }}</p>
            <FormButton buttonStyle="action" @click="startNew">
                <Icon name="ph:plus" class="size-4" />
                {{ $t('invoiceTemplates.new') }}
            </FormButton>
        </div>

        <Alert type="danger" :text="state.error" v-if="state.error" />

        <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-4 space-y-4" v-if="state.isEditing">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="space-y-1">
                    <FormLabel for="name" :label="$t('invoiceTemplates.form.name')" />
                    <FormTextField id="name" name="name" v-model="state.form.name"
                        :placeholder="$t('invoiceTemplates.form.namePlaceholder')" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="description" :label="$t('invoiceTemplates.form.description')" />
                    <FormTextField id="description" name="description" v-model="state.form.description"
                        :placeholder="$t('invoiceTemplates.form.descriptionPlaceholder')" />
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="min-w-full text-sm">
                    <thead>
                        <tr class="text-left text-xs uppercase tracking-wide text-gray-500">
                            <th class="py-1 pr-2 w-48">{{ $t('citizens.invoices.form.service') }}</th>
                            <th class="py-1 pr-2">{{ $t('citizens.invoices.form.description') }}</th>
                            <th class="py-1 pr-2 w-20">{{ $t('citizens.invoices.form.quantity') }}</th>
                            <th class="py-1 pr-2 w-28">{{ $t('citizens.invoices.form.unitPrice') }}</th>
                            <th class="py-1 pr-2 w-20">{{ $t('citizens.invoices.form.vat') }}</th>
                            <th class="py-1 w-8"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(line, index) in state.form.lines" :key="index" class="align-top">
                            <td class="py-1 pr-2">
                                <FormSelect :id="`template-service-${index}`" :options="serviceOptions"
                                    v-model="line.service_uuid"
                                    :placeholder="$t('citizens.invoices.form.freeLine')" />
                            </td>
                            <td class="py-1 pr-2">
                                <FormTextField :id="`template-description-${index}`" :name="`template-description-${index}`"
                                    v-model="line.description" :placeholder="descriptionPlaceholder(line)" />
                            </td>
                            <td class="py-1 pr-2">
                                <FormNumberField :name="`template-quantity-${index}`" :min="0" v-model="line.quantity"
                                    :placeholder="$t('citizens.invoices.form.quantity')" />
                            </td>
                            <td class="py-1 pr-2">
                                <FormNumberField :name="`template-price-${index}`" :min="0" v-model="line.unit_price"
                                    :placeholder="line.service_uuid ? $t('invoiceTemplates.fromCatalogue') : ''" />
                            </td>
                            <td class="py-1 pr-2">
                                <FormNumberField :name="`template-vat-${index}`" :min="0" v-model="line.vat_rate"
                                    :placeholder="line.service_uuid ? $t('invoiceTemplates.fromCatalogue') : ''" />
                            </td>
                            <td class="py-1 pt-3">
                                <button type="button" class="text-gray-400 hover:text-red-600"
                                    :aria-label="$t('delete')" @click="removeLine(index)">
                                    <Icon name="ph:trash" class="size-4" />
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <p class="text-xs text-gray-500">{{ $t('invoiceTemplates.form.priceHelp') }}</p>

            <div class="flex items-center justify-between gap-2">
                <FormButton buttonStyle="action" buttonSize="xs" @click="addLine">
                    <Icon name="ph:plus" class="size-4" />
                    {{ $t('citizens.invoices.form.addLine') }}
                </FormButton>
                <div class="flex items-center gap-2">
                    <FormButton buttonStyle="action" buttonSize="xs" @click="state.isEditing = false">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton buttonStyle="primary" buttonSize="xs" @click="save" :disabled="state.isSaving">
                        {{ $t('save') }}
                    </FormButton>
                </div>
            </div>
        </div>

        <LoadingSpinner :isActive="state.isPageLoading">
            <div v-if="state.templates.length === 0"
                class="px-6 py-14 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg text-center">
                <div class="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon name="ph:cards" class="h-7 w-7 text-primary" />
                </div>
                <h3 class="mt-4 text-lg font-semibold text-gray-900">{{ $t('invoiceTemplates.empty.title') }}</h3>
                <p class="mt-1 text-sm text-gray-500 max-w-md mx-auto">{{ $t('invoiceTemplates.empty.text') }}</p>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <div v-for="template in state.templates" :key="template.uuid"
                    class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-4 flex flex-col">
                    <div class="flex items-start justify-between gap-2">
                        <div>
                            <h3 class="text-sm font-semibold text-gray-900">{{ template.name }}</h3>
                            <p class="text-xs text-gray-500" v-if="template.description">{{ template.description }}</p>
                        </div>
                        <div class="whitespace-nowrap">
                            <button type="button" class="text-gray-400 hover:text-primary mr-2"
                                :aria-label="$t('invoiceTemplates.preview')" @click="preview(template)">
                                <Icon name="ph:eye" class="size-4" />
                            </button>
                            <button type="button" class="text-gray-400 hover:text-primary mr-2"
                                :aria-label="$t('edit')" @click="startEdit(template)">
                                <Icon name="ph:pencil-simple" class="size-4" />
                            </button>
                            <button type="button" class="text-gray-400 hover:text-red-600" :aria-label="$t('delete')"
                                @click="remove(template)">
                                <Icon name="ph:trash" class="size-4" />
                            </button>
                        </div>
                    </div>

                    <ul class="mt-3 space-y-1 text-sm text-gray-600">
                        <li v-for="line in template.lines" :key="line.uuid" class="flex justify-between gap-3">
                            <span class="truncate">
                                <span class="text-gray-400 tabular-nums mr-1" v-if="line.code">{{ line.code }}</span>
                                {{ line.description }}
                            </span>
                            <span class="tabular-nums whitespace-nowrap text-gray-500">
                                {{ formatQuantity(line.quantity) }} &times;
                                {{ line.unit_price === null ? $t('invoiceTemplates.catalogue') : formatAmount(line.unit_price) }}
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </LoadingSpinner>
    </div>
</template>

<script setup lang="ts">
import { citizenInvoiceService } from '@/components/api/user/CitizenInvoiceService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

const props = defineProps<{ services: any[] }>()

const { successAlert } = useAlert()
const { t, locale } = useI18n()

const state = reactive({
    templates: [] as any[],
    form: emptyForm(),
    editingUuid: null as string | null,
    isEditing: false,
    isPageLoading: true,
    isSaving: false,
    error: '',
})

const serviceOptions = computed(() => (props.services || []).map((service: any) => ({
    value: service.uuid,
    label: service.code ? `${service.code} · ${service.name}` : service.name,
})))

function emptyForm() {
    return { name: '', description: '', lines: [newLine()] }
}

function newLine() {
    return { service_uuid: null, description: '', quantity: '1', unit_price: '', vat_rate: '' }
}

// A line on a service borrows its name, so the field can stay empty.
function descriptionPlaceholder(line: any): string {
    const service = (props.services || []).find((item: any) => item.uuid === line.service_uuid)

    return service?.name || t('citizens.invoices.form.description')
}

function formatAmount(amount: number): string {
    return new Intl.NumberFormat(locale.value === 'en' ? 'en-GB' : 'da-DK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(amount) || 0)
}

function formatQuantity(quantity: number): string {
    return String(Number(quantity) || 0).replace('.', ',')
}

function startNew() {
    state.form = emptyForm()
    state.editingUuid = null
    state.isEditing = true
}

function startEdit(template: any) {
    state.form = {
        name: template.name,
        description: template.description || '',
        lines: (template.lines || []).map((line: any) => ({
            service_uuid: line.service_uuid || null,
            description: line.service_uuid ? '' : (line.description || ''),
            quantity: String(line.quantity ?? 1),
            unit_price: line.unit_price === null ? '' : String(line.unit_price),
            vat_rate: line.vat_rate === null ? '' : String(line.vat_rate),
        })),
    }

    if (state.form.lines.length === 0) state.form.lines = [newLine()]

    state.editingUuid = template.uuid
    state.isEditing = true
}

function addLine() {
    state.form.lines.push(newLine())
}

function removeLine(index: number) {
    state.form.lines.splice(index, 1)

    if (state.form.lines.length === 0) addLine()
}

async function load() {
    state.error = ''

    try {
        const response = await citizenInvoiceService.getTemplates()
        state.templates = response?.data || []
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
        name: state.form.name,
        description: state.form.description || null,
        lines: state.form.lines.map((line: any) => ({
            service_uuid: line.service_uuid || null,
            description: line.description || null,
            quantity: Number(line.quantity) || 1,
            // Empty means the catalogue decides on the day it is billed.
            unit_price: line.unit_price === '' ? null : Number(line.unit_price),
            vat_rate: line.vat_rate === '' ? null : Number(line.vat_rate),
        })),
    }

    try {
        if (state.editingUuid) {
            await citizenInvoiceService.updateTemplate(state.editingUuid, payload)
        } else {
            await citizenInvoiceService.createTemplate(payload)
        }

        successAlert(`${t('alert.success')}!`, `${t('invoiceTemplates.saved')}.`)
        state.isEditing = false
        await load()
    } catch (error: any) {
        state.error = error?.message || ''
    } finally {
        state.isSaving = false
    }
}

// Opens the invoice exactly as the citizen receives it, so the wording,
// prices and layout can be checked before anything is sent.
async function preview(template: any) {
    state.error = ''

    try {
        const blob = await citizenInvoiceService.previewPdf(template.uuid)

        if (!blob) return

        const url = URL.createObjectURL(blob)
        window.open(url, '_blank')
        setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch (error: any) {
        state.error = error?.message || ''
    }
}

async function remove(template: any) {
    state.error = ''

    try {
        await citizenInvoiceService.deleteTemplate(template.uuid)
        await load()
    } catch (error: any) {
        state.error = error?.message || ''
    }
}

onMounted(() => load())
</script>
