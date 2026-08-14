<template>
    <Modal size="2xl"
        :title="props.estimate ? $t('citizens.priceEstimates.editTitle') : $t('citizens.priceEstimates.newTitle')"
        :show="props.isModalOpen" @close="emit('close')">
        <template #modal-body>
            <div class="space-y-5">
                <Alert type="danger" :text="state.error" v-if="state.error" />

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="title" :label="$t('citizens.priceEstimates.form.title')" />
                        <FormTextField id="title" name="title" v-model="state.form.title"
                            :placeholder="$t('citizens.priceEstimates.form.titlePlaceholder')" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="valid_until" :label="$t('citizens.priceEstimates.form.validUntil')" />
                        <FormDateField id="valid_until" name="valid_until" v-model="state.form.valid_until"
                            :placeholder="$t('citizens.priceEstimates.form.validUntil')" />
                    </div>
                </div>

                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <FormLabel for="lines" :label="$t('citizens.priceEstimates.form.lines')" />
                        <FormButton buttonStyle="action" buttonSize="xs" @click="addLine">
                            <Icon name="ph:plus" class="size-4" />
                            {{ $t('citizens.priceEstimates.form.addLine') }}
                        </FormButton>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="min-w-full text-sm">
                            <thead>
                                <tr class="text-left text-xs uppercase tracking-wide text-gray-500">
                                    <th class="py-1 pr-2 w-28">{{ $t('citizens.toothChart.tooth') }}</th>
                                    <th class="py-1 pr-2 w-24">{{ $t('citizens.priceEstimates.form.code') }}</th>
                                    <th class="py-1 pr-2">{{ $t('citizens.priceEstimates.form.description') }}</th>
                                    <th class="py-1 pr-2 w-20">{{ $t('citizens.priceEstimates.form.quantity') }}</th>
                                    <th class="py-1 pr-2 w-28">{{ $t('citizens.priceEstimates.form.unitPrice') }}</th>
                                    <th class="py-1 pr-2 w-28">{{ $t('citizens.priceEstimates.form.subsidy') }}</th>
                                    <th class="py-1 pr-2 w-28 text-right">{{ $t('citizens.priceEstimates.form.lineTotal') }}</th>
                                    <th class="py-1 w-8"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(line, index) in state.form.lines" :key="index" class="align-top">
                                    <td class="py-1 pr-2">
                                        <FormSelect :id="`tooth-${index}`" :options="toothOptions"
                                            v-model="line.tooth_uuid"
                                            :placeholder="$t('citizens.priceEstimates.form.noTooth')" />
                                    </td>
                                    <td class="py-1 pr-2">
                                        <FormTextField :id="`code-${index}`" :name="`code-${index}`"
                                            v-model="line.treatment_code"
                                            :placeholder="$t('citizens.priceEstimates.form.code')" />
                                    </td>
                                    <td class="py-1 pr-2">
                                        <FormTextField :id="`description-${index}`" :name="`description-${index}`"
                                            v-model="line.description"
                                            :placeholder="$t('citizens.priceEstimates.form.description')" />
                                    </td>
                                    <td class="py-1 pr-2">
                                        <FormNumberField :name="`quantity-${index}`" :min="0" v-model="line.quantity"
                                            :placeholder="$t('citizens.priceEstimates.form.quantity')" />
                                    </td>
                                    <td class="py-1 pr-2">
                                        <FormNumberField :name="`unit-price-${index}`" :min="0"
                                            v-model="line.unit_price"
                                            :placeholder="$t('citizens.priceEstimates.form.unitPrice')" />
                                    </td>
                                    <td class="py-1 pr-2">
                                        <FormNumberField :name="`subsidy-${index}`" :min="0"
                                            v-model="line.subsidy_amount"
                                            :placeholder="$t('citizens.priceEstimates.form.subsidy')" />
                                    </td>
                                    <td class="py-1 pr-2 text-right tabular-nums pt-3">
                                        {{ formatAmount(lineTotal(line)) }}
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
                </div>

                <div class="flex justify-end">
                    <dl class="w-full sm:w-72 text-sm space-y-1">
                        <div class="flex justify-between">
                            <dt class="text-gray-500">{{ $t('citizens.priceEstimates.total') }}</dt>
                            <dd class="tabular-nums">{{ formatAmount(totals.total) }}</dd>
                        </div>
                        <div class="flex justify-between">
                            <dt class="text-gray-500">{{ $t('citizens.priceEstimates.subsidy') }}</dt>
                            <dd class="tabular-nums">- {{ formatAmount(totals.subsidy) }}</dd>
                        </div>
                        <div class="flex justify-between border-t border-gray-300 pt-1 font-semibold">
                            <dt>{{ $t('citizens.priceEstimates.patientPays') }}</dt>
                            <dd class="tabular-nums">{{ formatAmount(totals.patient) }}</dd>
                        </div>
                    </dl>
                </div>

                <div class="space-y-1">
                    <FormLabel for="note" :label="$t('citizens.priceEstimates.form.note')" />
                    <FormTextArea id="note" name="note" :rows="3" v-model="state.form.note"
                        :placeholder="$t('citizens.priceEstimates.form.notePlaceholder')" />
                </div>

                <div class="flex items-center justify-end gap-2 pt-2">
                    <FormButton buttonStyle="action" @click="emit('close')" :disabled="state.isSaving">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton buttonStyle="primary" @click="save" :disabled="state.isSaving">
                        {{ $t('save') }}
                    </FormButton>
                </div>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { priceEstimateService } from '@/components/api/user/PriceEstimateService'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
    isModalOpen: boolean
    citizenUuid: string
    estimate: any | null
    teeth: any[]
}>()

const emit = defineEmits<{ (event: 'saved'): void; (event: 'close'): void }>()

const { t, locale } = useI18n()

const state = reactive({
    form: emptyForm(),
    isSaving: false,
    error: '',
})

function emptyForm() {
    return {
        title: '',
        valid_until: '',
        note: '',
        lines: [newLine()],
    }
}

function newLine() {
    return { tooth_uuid: null, treatment_code: '', description: '', quantity: '1', unit_price: '', subsidy_amount: '' }
}

const toothOptions = computed(() => (props.teeth || []).map((tooth: any) => ({
    value: tooth.uuid,
    label: `${tooth.fdi_number} (${locale.value === 'en' ? tooth.en_name : tooth.dk_name})`,
})))

function lineTotal(line: any): number {
    return (Number(line.quantity) || 0) * (Number(line.unit_price) || 0)
}

const totals = computed(() => {
    const total = state.form.lines.reduce((sum: number, line: any) => sum + lineTotal(line), 0)
    const subsidy = state.form.lines.reduce((sum: number, line: any) => sum + (Number(line.subsidy_amount) || 0), 0)

    return { total, subsidy, patient: Math.max(total - subsidy, 0) }
})

function formatAmount(amount: number): string {
    return new Intl.NumberFormat(locale.value === 'en' ? 'en-GB' : 'da-DK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount || 0)
}

function addLine() {
    state.form.lines.push(newLine())
}

function removeLine(index: number) {
    state.form.lines.splice(index, 1)

    if (state.form.lines.length === 0) addLine()
}

async function save() {
    state.error = ''

    const lines = state.form.lines
        .filter((line: any) => (line.description || '').trim() !== '')
        .map((line: any) => ({
            tooth_uuid: line.tooth_uuid || null,
            treatment_code: line.treatment_code || null,
            description: line.description,
            quantity: Number(line.quantity) || 0,
            unit_price: Number(line.unit_price) || 0,
            subsidy_amount: Number(line.subsidy_amount) || 0,
        }))

    if (lines.length === 0) {
        state.error = t('citizens.priceEstimates.form.needsALine')

        return
    }

    state.isSaving = true

    try {
        const payload = {
            title: state.form.title || null,
            valid_until: state.form.valid_until || null,
            note: state.form.note || null,
            lines,
        }

        if (props.estimate) {
            await priceEstimateService.updateEstimate(props.estimate.uuid, payload)
        } else {
            await priceEstimateService.createEstimate(props.citizenUuid, payload)
        }

        emit('saved')
    } catch (error: any) {
        state.error = error?.message || ''
    } finally {
        state.isSaving = false
    }
}

watch(() => [props.isModalOpen, props.estimate], () => {
    if (!props.isModalOpen) return

    state.error = ''

    if (!props.estimate) {
        state.form = emptyForm()

        return
    }

    state.form = {
        title: props.estimate.title || '',
        valid_until: props.estimate.valid_until || '',
        note: props.estimate.note || '',
        lines: (props.estimate.lines || []).map((line: any) => ({
            tooth_uuid: line.tooth_uuid || null,
            treatment_code: line.treatment_code || '',
            description: line.description || '',
            quantity: String(line.quantity ?? 1),
            unit_price: String(line.unit_price ?? ''),
            subsidy_amount: String(line.subsidy_amount ?? ''),
        })),
    }

    if (state.form.lines.length === 0) addLine()
}, { immediate: true })
</script>
