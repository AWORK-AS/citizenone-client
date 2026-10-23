<template>
    <!-- Lives inside the customer form: Enter here must never submit that
         form, so it saves the row being edited instead. -->
    <div class="space-y-3" @keydown.enter.prevent="onEnter">
        <p class="text-[12px] text-slate-500">{{ $t('socialWelfare.customerDepartments.specialPrices.hint') }}</p>
        <Alert type="danger" :text="state.loadError" v-if="state.loadError" />

        <div v-if="state.prices.length" class="overflow-x-auto rounded-lg border border-surface-200">
            <table class="w-full text-sm">
                <thead class="border-b border-surface-200 bg-surface-50">
                    <tr>
                        <th class="co-th min-w-[200px]">{{ $t('socialWelfare.customerDepartments.specialPrices.serviceType') }}</th>
                        <th class="co-th">{{ $t('socialWelfare.customerDepartments.specialPrices.validFrom') }}</th>
                        <th class="co-th">{{ $t('socialWelfare.customerDepartments.specialPrices.hourlyRate') }}</th>
                        <!-- Short headers and the note under the type, so a row fits the
                             form; the buttons stay in view when it doesn't. -->
                        <th class="co-th">{{ $t('socialWelfare.customerDepartments.specialPrices.adminShort') }}</th>
                        <th class="co-th">{{ $t('socialWelfare.customerDepartments.specialPrices.transportShort') }}</th>
                        <th v-if="props.canEdit" class="co-th sticky right-0 bg-surface-50"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="price in state.prices" :key="price.uuid" class="border-t border-surface-100 first:border-t-0"
                        :class="rowBackground(price)">
                        <td class="co-td min-w-[200px]">
                            <p class="text-slate-800">{{ price.service_type?.label }}</p>
                            <p class="whitespace-nowrap text-[11px] text-slate-400">{{ standardText(price.service_type?.uuid) }}</p>
                            <p v-if="price.note" class="mt-0.5 max-w-[280px] break-words text-[12px] italic text-slate-500">{{ price.note }}</p>
                        </td>
                        <td class="co-td whitespace-nowrap text-slate-600">{{ formatDateToReadable(price.valid_from) }}</td>
                        <td class="co-td whitespace-nowrap tabular-nums font-semibold text-slate-800">{{ formatPrice(price.hourly_rate) }}</td>
                        <td class="co-td whitespace-nowrap tabular-nums text-slate-600">
                            {{ formatPrice(price.admin_hourly_rate) || $t('socialWelfare.customerDepartments.specialPrices.followsStandard') }}
                        </td>
                        <td class="co-td whitespace-nowrap tabular-nums text-slate-600">
                            {{ formatPrice(price.transport_hourly_rate) || $t('socialWelfare.customerDepartments.specialPrices.followsStandard') }}
                        </td>
                        <td v-if="props.canEdit" class="co-td sticky right-0" :class="rowBackground(price)">
                            <div class="flex items-center justify-end gap-2">
                                <FormButton type="button" buttonStyle="action" :aria-label="$t('edit')" @click="startEdit(price)">
                                    <Icon name="ph:pencil-simple" class="size-4" />
                                </FormButton>
                                <FormButton type="button" buttonStyle="danger" :aria-label="$t('delete')" @click="state.deleteFor = price">
                                    <Icon name="ph:trash" class="size-4" />
                                </FormButton>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <p v-else-if="!state.isLoading && !state.editing" class="text-[13px] text-slate-400">
            {{ $t('socialWelfare.customerDepartments.specialPrices.empty') }}
        </p>

        <!-- One row is edited at a time, below the list, so the type picker
             is not clipped by the scrolling table. -->
        <div v-if="state.editing" class="space-y-3 rounded-lg border border-surface-200 bg-surface-50 p-3">
            <!-- Field errors show under their field; the box is for the rest
                 (no permission, no pipeline, not found). -->
            <Alert type="danger" :text="state.error?.message"
                v-if="state.error?.message && !state.error?.errors" />
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div class="space-y-1 md:col-span-2">
                    <FormLabel :label="$t('socialWelfare.customerDepartments.specialPrices.serviceType')" />
                    <FormSelect :options="typeOptions" v-model="state.editing.inquiry_service_type_uuid"
                        :canClear="false" :canDeselect="false"
                        :placeholder="$t('socialWelfare.customerDepartments.specialPrices.serviceType')" />
                    <p v-if="state.editing.inquiry_service_type_uuid" class="text-[11px] text-slate-400">
                        {{ standardText(state.editing.inquiry_service_type_uuid) }}
                    </p>
                    <FormError :error="state.error?.errors?.inquiry_service_type_uuid?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel :label="$t('socialWelfare.customerDepartments.specialPrices.validFrom')" />
                    <input type="date" class="co-cell-input w-full" v-model="state.editing.valid_from"
                        :aria-label="$t('socialWelfare.customerDepartments.specialPrices.validFrom')" />
                    <FormError :error="state.error?.errors?.valid_from?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel :label="$t('socialWelfare.customerDepartments.specialPrices.hourlyRate')" />
                    <input type="text" inputmode="decimal" class="co-cell-input w-full" v-model="state.editing.hourly_rate"
                        :aria-label="$t('socialWelfare.customerDepartments.specialPrices.hourlyRate')" />
                    <FormError :error="state.error?.errors?.hourly_rate?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel :label="$t('socialWelfare.customerDepartments.specialPrices.adminRate')" />
                    <input type="text" inputmode="decimal" class="co-cell-input w-full" v-model="state.editing.admin_hourly_rate"
                        :placeholder="$t('socialWelfare.customerDepartments.specialPrices.optional')"
                        :aria-label="$t('socialWelfare.customerDepartments.specialPrices.adminRate')" />
                    <FormError :error="state.error?.errors?.admin_hourly_rate?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel :label="$t('socialWelfare.customerDepartments.specialPrices.transportRate')" />
                    <input type="text" inputmode="decimal" class="co-cell-input w-full" v-model="state.editing.transport_hourly_rate"
                        :placeholder="$t('socialWelfare.customerDepartments.specialPrices.optional')"
                        :aria-label="$t('socialWelfare.customerDepartments.specialPrices.transportRate')" />
                    <FormError :error="state.error?.errors?.transport_hourly_rate?.[0]" />
                </div>
                <div class="space-y-1 md:col-span-3">
                    <FormLabel :label="$t('socialWelfare.customerDepartments.specialPrices.note')" />
                    <input type="text" maxlength="255" class="co-cell-input w-full" v-model="state.editing.note"
                        :placeholder="$t('socialWelfare.customerDepartments.specialPrices.optional')"
                        :aria-label="$t('socialWelfare.customerDepartments.specialPrices.note')" />
                    <FormError :error="state.error?.errors?.note?.[0]" />
                </div>
            </div>
            <div class="flex justify-end gap-2">
                <FormButton type="button" buttonStyle="cancel" @click="cancelEdit">{{ $t('cancel') }}</FormButton>
                <FormButton type="button" buttonStyle="primary" :disabled="state.isSaving" @click="saveRow">{{ $t('save') }}</FormButton>
            </div>
        </div>

        <button v-if="props.canEdit && !state.editing" type="button"
            class="inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline" @click="startAdd">
            <Icon name="ph:plus" class="w-3 h-3" aria-hidden="true" />
            {{ $t('socialWelfare.customerDepartments.specialPrices.add') }}
        </button>

        <DialogConfirmation :isModalOpen="state.deleteFor !== null"
            :message="$t('socialWelfare.customerDepartments.specialPrices.confirmDelete')"
            @close="state.deleteFor = null" @confirm="confirmDelete" />
    </div>
</template>

<script setup lang="ts">
import { socialWelfareService } from '@/components/api/user/SocialWelfareService'
import { emptySpecialPriceRow, formatPrice, specialPricePayload, specialPriceRow } from '@/composables/customerSpecialPrice'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

/**
 * A customer department's special prices (særpriser) per indsatstype. An
 * offer for this customer uses them before the standard price; see
 * OfferCalculator in the backend.
 */
const props = defineProps({
    departmentUuid: { type: String, required: true },
    canEdit: { type: Boolean, default: false },
})

const { t } = useI18n()
const { successAlert, errorAlert } = useAlert()
const { formatDateToReadable } = useDatetimeFormatter()

const state = reactive({
    prices: [] as any[],
    serviceTypes: [] as any[],
    isLoading: false,
    loadError: '',
    editing: null as any,
    isSaving: false,
    error: {} as Error,
    deleteFor: null as any,
})

// The company's active types, plus a type a saved price still names after it
// was switched off, so that price can still be edited.
const typeOptions = computed(() => {
    const options = state.serviceTypes.map((type: any) => ({ value: type.uuid, label: type.label }))

    for (const price of state.prices) {
        const type = price.service_type
        if (type?.uuid && !options.some(option => option.value === type.uuid)) {
            options.push({ value: type.uuid, label: type.label })
        }
    }

    return options
})

watch(() => props.departmentUuid, () => {
    state.editing = null
    fetchPrices()
}, { immediate: true })

async function fetchPrices() {
    if (!props.departmentUuid) return

    state.isLoading = true
    state.loadError = ''
    try {
        const response = await socialWelfareService.getCustomerDepartmentSpecialPrices(props.departmentUuid)
        state.prices = response?.data ?? []
        state.serviceTypes = response?.service_types ?? []
    } catch (error: any) {
        state.prices = []
        state.loadError = error?.message ?? t('socialWelfare.customerDepartments.specialPrices.loadFailed')
    }
    state.isLoading = false
}

// The row being edited is tinted; the pinned buttons cell needs its own
// background, or the scrolled cells show through it.
function rowBackground(price: any) {
    return state.editing?.uuid === price.uuid ? 'bg-[#f0fafd]' : 'bg-white'
}

function standardText(typeUuid: string | null | undefined) {
    const type = state.serviceTypes.find((item: any) => item.uuid === typeUuid)

    if (!type) return ''

    return type.standard_hourly_rate === null || type.standard_hourly_rate === undefined
        ? t('socialWelfare.customerDepartments.specialPrices.noStandard')
        : t('socialWelfare.customerDepartments.specialPrices.standard', { amount: formatPrice(type.standard_hourly_rate) })
}

function today() {
    const now = new Date()

    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function startAdd() {
    state.error = {} as Error
    state.editing = emptySpecialPriceRow(today())
}

function startEdit(price: any) {
    state.error = {} as Error
    state.editing = specialPriceRow(price)
}

function cancelEdit() {
    state.error = {} as Error
    state.editing = null
}

function onEnter() {
    if (state.editing && !state.isSaving) saveRow()
}

async function saveRow() {
    const row = state.editing
    if (!row) return

    state.error = {} as Error
    state.isSaving = true
    try {
        if (row.uuid) {
            await socialWelfareService.updateCustomerDepartmentSpecialPrice(props.departmentUuid, row.uuid, specialPricePayload(row))
        } else {
            await socialWelfareService.saveCustomerDepartmentSpecialPrice(props.departmentUuid, specialPricePayload(row))
        }
        state.editing = null
        successAlert(`${t('alert.success')}!`, t('socialWelfare.customerDepartments.specialPrices.saved'))
        await fetchPrices()
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}

async function confirmDelete() {
    const price = state.deleteFor
    state.deleteFor = null
    if (!price) return

    try {
        await socialWelfareService.deleteCustomerDepartmentSpecialPrice(props.departmentUuid, price.uuid)
        if (state.editing?.uuid === price.uuid) state.editing = null
        successAlert(`${t('alert.success')}!`, t('socialWelfare.customerDepartments.specialPrices.deleted'))
        await fetchPrices()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? '')
    }
}
</script>
