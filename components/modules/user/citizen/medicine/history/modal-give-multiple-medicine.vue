<template>
    <div>
        <Modal size="4xl" :title="$t('citizens.medicineJournals.history.giveAllMedicines')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="submitForm()" id="formGiveMedicine">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="space-y-3">
                            <div class="space-y-1">
                                <FormLabel for="date" :label="$t('citizens.medicineJournals.history.form.date')" />
                                <FormDateField id="date" name="date"
                                    :placeholder="$t('citizens.medicineJournals.history.form.date')"
                                    v-model="state.formGiveMedicine.date" />
                            </div>

                            <Alert type="danger" :text="$t('citizens.medicineJournals.history.form.noMedicineToday')"
                                v-if="state.formGiveMedicine.medicines?.length === 0" />

                            <div class="max-h-[55vh] overflow-y-auto overflow-x-auto border border-gray-100 rounded-md"
                                v-if="state.formGiveMedicine.medicines?.some((m: any) => !m.is_pn_medicine)">
                                <table class="w-full border-collapse">
                                    <thead>
                                        <tr>
                                            <th
                                                class="sticky top-0 left-0 z-20 bg-primary text-white font-normal
                                                        border-b border-white/20 px-4 py-3 text-left text-sm min-w-[200px]">
                                                {{ $t('citizens.medicineJournals.table.medicine') }}
                                            </th>
                                            <th v-for="time in state.timeColumns" :key="time"
                                                class="sticky top-0 z-10 bg-primary text-white font-normal
                                                       border-b border-white/20 px-4 py-3 text-center text-sm min-w-[220px]">
                                                {{ time }}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <template v-for="(medicine, medicineIndex) in state.formGiveMedicine.medicines"
                                            :key="medicineIndex">
                                            <tr v-if="!medicine.is_pn_medicine"
                                                class="border-b border-gray-100 align-top">
                                                <td class="sticky left-0 z-10 bg-white px-4 py-3 text-sm
                                                            min-w-[200px] border-r border-gray-100">
                                                    <div class="space-y-1">
                                                        <p class="font-medium text-gray-800 leading-tight">
                                                            <span v-if="language.locale.value === 'en'">{{
                                                                medicine.medicine?.en_name }}</span>
                                                            <span v-else>{{ medicine.medicine?.dk_name }}</span>
                                                        </p>
                                                        <p class="text-xs text-gray-500">{{
                                                            medicine.medicine?.ingredients }}</p>
                                                        <Badge type="primary" class="w-fit">
                                                            <p class="text-xxs">{{ medicine.dosage_unit }}</p>
                                                        </Badge>
                                                    </div>
                                                </td>

                                                <!-- Time slot cells -->
                                                <td v-for="time in state.timeColumns" :key="time"
                                                    class="px-3 py-3 align-top" :class="[
                                                        getDosageIndexByTime(Number(medicineIndex), time) === -1
                                                            ? '!bg-gray-50'
                                                            : ['', null].includes(
                                                                state.formGiveMedicine.medicines[medicineIndex]
                                                                    .dosages[getDosageIndexByTime(Number(medicineIndex), time)].type
                                                            )
                                                                ? '!bg-red-50'
                                                                : 'bg-white'
                                                    ]">
                                                    <div v-if="getDosageIndexByTime(Number(medicineIndex), time) !== -1"
                                                        class="space-y-2">
                                                        <div class="flex justify-center">
                                                            <Badge type="primary" class="w-fit">
                                                                <p class="text-xxs">
                                                                    {{
                                                                        state.formGiveMedicine.medicines[medicineIndex]
                                                                            .dosages[getDosageIndexByTime(Number(medicineIndex),
                                                                                time)].required_dosage
                                                                    }}
                                                                    {{
                                                                        medicine.dosage_unit
                                                                    }}
                                                                </p>
                                                            </Badge>
                                                        </div>

                                                        <div class="flex gap-1 justify-center flex-wrap">
                                                            <button v-for="typeOption in state.options.types"
                                                                :key="typeOption.value" type="button" @click="state.formGiveMedicine.medicines[medicineIndex]
                                                                    .dosages[getDosageIndexByTime(Number(medicineIndex), time)].type
                                                                    = typeOption.value" :class="[
                                                                        'px-2 py-1 rounded text-xxs font-semibold border transition-colors',
                                                                        state.formGiveMedicine.medicines[medicineIndex]
                                                                            .dosages[getDosageIndexByTime(Number(medicineIndex), time)].type
                                                                            === typeOption.value
                                                                            ? {
                                                                                'bg-primary border-primary text-white': typeOption.title === 'Delivered',
                                                                                'bg-red-600 border-red-600 text-white': typeOption.title === 'Deviated',
                                                                                'bg-green-700 border-green-700 text-white': typeOption.title === 'Given',
                                                                            }
                                                                            : {
                                                                                'bg-white border-primary text-primary hover:bg-blue-50': typeOption.title === 'Delivered',
                                                                                'bg-white border-red-600 text-red-600 hover:bg-red-50': typeOption.title === 'Deviated',
                                                                                'bg-white border-green-700 text-green-700 hover:bg-green-50': typeOption.title === 'Given',
                                                                            }
                                                                    ]">
                                                                <span v-if="typeOption.title === 'Delivered'">
                                                                    {{
                                                                        $t('citizens.medicineJournals.history.form.type.delivered')
                                                                    }}
                                                                </span>
                                                                <span v-if="typeOption.title === 'Deviated'">
                                                                    {{
                                                                        $t('citizens.medicineJournals.history.form.type.deviated')
                                                                    }}
                                                                </span>
                                                                <span v-if="typeOption.title === 'Given'">
                                                                    {{ customPagesStore.getCustomPagesName?.giveMedicine
                                                                    }}
                                                                </span>
                                                            </button>
                                                        </div>

                                                        <div class="text-left">
                                                            <button type="button"
                                                                class="text-xxs text-primary hover:underline flex items-center gap-0.5"
                                                                @click="toggleComment(`${medicineIndex}_${time}`)">
                                                                <Icon :name="state.expandedComments.has(`${medicineIndex}_${time}`)
                                                                    ? 'ic:round-keyboard-arrow-up'
                                                                    : 'ic:round-keyboard-arrow-down'"
                                                                    class="w-3 h-3" />
                                                                {{
                                                                    $t('citizens.medicineJournals.history.form.comment')
                                                                }}
                                                            </button>
                                                            <div v-if="state.expandedComments.has(`${medicineIndex}_${time}`)"
                                                                class="mt-1">
                                                                <FormTextArea :id="`comment_${medicineIndex}_${time}`"
                                                                    :name="`comment_${medicineIndex}`"
                                                                    :placeholder="$t('citizens.medicineJournals.history.form.comment')"
                                                                    :rows="2"
                                                                    v-model="state.formGiveMedicine.medicines[medicineIndex]
                                                                        .dosages[getDosageIndexByTime(Number(medicineIndex), time)].comment" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div v-else class="flex justify-center">
                                                        <span class="text-sm text-gray-300">—</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        </template>
                                    </tbody>
                                </table>
                            </div>

                            <!-- PN section divider -->
                            <div v-if="state.formGiveMedicine.medicines?.some((m: any) => m.is_pn_medicine)"
                                class="flex items-center gap-2">
                                <div class="h-px flex-1 bg-gray-200"></div>
                                <span class="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2">
                                    {{ $t('citizens.medicineJournals.table.pnMedicine') }}
                                </span>
                                <div class="h-px flex-1 bg-gray-200"></div>
                            </div>

                            <Disclosure v-slot="{ open }"
                                v-for="(selectedMedicine, selecedMedicineIndex) in state.formGiveMedicine.medicines"
                                :key="selecedMedicineIndex">
                                <div v-if="selectedMedicine?.is_pn_medicine">
                                    <DisclosureButton
                                        class="w-full bg-primary/10 border border-primary/20 hover:bg-primary/20 flex justify-between p-3.5 transition-colors"
                                        :class="!open ? 'rounded-md' : 'rounded-tl-md rounded-tr-md'">
                                        <div class="flex items-center gap-x-2 text-sm font-semibold text-gray-700">
                                            <div>
                                                <span v-if="language.locale.value === 'en'">
                                                    {{ selectedMedicine?.medicine?.en_name }},
                                                </span>
                                                <span v-if="language.locale.value === 'dk'">
                                                    {{ selectedMedicine?.medicine?.dk_name }},
                                                </span>
                                                <span>
                                                    {{ selectedMedicine?.medicine?.ingredients }}
                                                </span>
                                            </div>
                                            <Badge type="primary" class="w-fit">
                                                <p class="text-xxs">
                                                    {{
                                                        $t('citizens.medicineJournals.table.pnMedicine')
                                                    }}
                                                </p>
                                            </Badge>
                                        </div>
                                        <div class="flex items-center">
                                            <Icon name="ic:round-keyboard-arrow-down" class="w-4 h-4" v-if="!open" />
                                            <Icon name="ic:round-keyboard-arrow-up" class="w-4 h-4" v-else />
                                        </div>
                                    </DisclosureButton>
                                    <DisclosurePanel>
                                        <div
                                            class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-bl-lg rounded-br-lg px-4 py-6 sm:p-8">
                                            <div class="space-y-3" v-if="selectedMedicine.is_pn_medicine">
                                                <div class="space-y-1">
                                                    <FormLabel for="dosage"
                                                        :label="$t('citizens.medicineJournals.history.form.dose')" />
                                                    <FormTextField id="dosage" name="dosage"
                                                        :placeholder="$t('citizens.medicineJournals.history.form.dose')"
                                                        v-model="state.formGiveMedicine.medicines[selecedMedicineIndex].dosage" />
                                                </div>
                                                <div class="space-y-1">
                                                    <p class="text-sm text-gray-600">
                                                        {{ $t('citizens.medicineJournals.history.form.type.type') }}
                                                    </p>
                                                    <div>
                                                        <RadioGroup
                                                            v-model="state.formGiveMedicine.medicines[selecedMedicineIndex].type"
                                                            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                            <RadioGroupOption as="template"
                                                                v-for="(type, typeIndex) in state.options.types"
                                                                :key="typeIndex" :value="type.value"
                                                                v-slot="{ active, checked }">
                                                                <div
                                                                    :class="[
                                                                        active ? 'ring-1 ring-offset-2' : '',
                                                                        type.title === 'Delivered' && 'ring-primary',
                                                                        type.title === 'Deviated' && 'ring-red-600',
                                                                        type.title === 'Given' && 'ring-green-700',
                                                                        checked && type.title === 'Delivered' && 'bg-primary text-white ring-0 hover:bg-primary',
                                                                        checked && type.title === 'Deviated' && 'bg-red-600 text-white ring-0 hover:bg-red-600',
                                                                        checked && type.title === 'Given' && 'bg-green-700 text-white ring-0 hover:bg-green-700',
                                                                        !active && !checked && type.title === 'Delivered' && 'border border-primary ring-inset',
                                                                        !active && !checked && type.title === 'Deviated' && 'border border-red-600 ring-inset',
                                                                        !active && !checked && type.title === 'Given' && 'border border-green-700 ring-inset',
                                                                        active && checked ? 'text-white ring-1' : '',
                                                                        'cursor-pointer flex items-center justify-center rounded-md px-2 py-2 text-xs']">
                                                                    <span v-if="type.title === 'Delivered'">
                                                                        {{
                                                                            $t('citizens.medicineJournals.history.form.type.delivered')
                                                                        }}
                                                                    </span>
                                                                    <span v-if="type.title === 'Deviated'">
                                                                        {{
                                                                            $t('citizens.medicineJournals.history.form.type.deviated')
                                                                        }}
                                                                    </span>
                                                                    <span v-if="type.title === 'Given'">
                                                                        {{
                                                                            customPagesStore.getCustomPagesName?.giveMedicine
                                                                        }}
                                                                    </span>
                                                                </div>
                                                            </RadioGroupOption>
                                                        </RadioGroup>
                                                    </div>
                                                </div>
                                                <div class="space-y-1">
                                                    <FormLabel for="evaluator"
                                                        :label="$t('citizens.medicineJournals.history.form.evaluator')" />
                                                    <FormSelect id="evaluator" name="evaluator"
                                                        :options="state.options.evaluators"
                                                        v-model="state.formGiveMedicine.medicines[selecedMedicineIndex].evaluator_uuid" />
                                                </div>
                                                <div class="space-y-1">
                                                    <FormLabel for="evaluation_frequency"
                                                        :label="`${$t('citizens.medicineJournals.history.form.evaluationFrequency')}?`" />
                                                    <FormSelectMultiple id="evaluation_frequency"
                                                        name="evaluation_frequency"
                                                        :options="state.options.evaluation_frequencies"
                                                        v-model="state.formGiveMedicine.medicines[selecedMedicineIndex].evaluation_frequency" />
                                                </div>
                                                <div class="space-y-1">
                                                    <FormLabel :for="`comment_${selecedMedicineIndex}`"
                                                        :label="$t('citizens.medicineJournals.history.form.comment')" />
                                                    <FormTextArea :id="`comment_${selecedMedicineIndex}`"
                                                        :name="`comment_${selecedMedicineIndex}`"
                                                        :placeholder="$t('citizens.medicineJournals.history.form.comment')"
                                                        v-model="state.formGiveMedicine.medicines[selecedMedicineIndex].comment" />
                                                </div>
                                            </div>
                                            <div class="space-y-4" v-else>
                                                <Disclosure v-slot="{ open }"
                                                    v-for="(dosage, dosageIndex) in selectedMedicine.dosages"
                                                    :key="dosageIndex">
                                                    <div>
                                                        <DisclosureButton
                                                            class="w-full bg-gray-100 ring-1 ring-gray-100 flex justify-between p-3.5"
                                                            :class="!open ? 'rounded-md' : 'rounded-tl-md rounded-tr-md'">
                                                            <p class="text-sm font-semibold text-gray-700">
                                                                {{ t('citizens.medicineJournals.history.form.time') }}:
                                                                {{ dosage?.time }}
                                                            </p>
                                                            <div class="flex items-center">
                                                                <Icon name="ic:round-keyboard-arrow-down"
                                                                    class="w-4 h-4" v-if="!open" />
                                                                <Icon name="ic:round-keyboard-arrow-up" class="w-4 h-4"
                                                                    v-else />
                                                            </div>
                                                        </DisclosureButton>
                                                        <DisclosurePanel>
                                                            <div
                                                                class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-bl-lg rounded-br-lg px-4 py-6 sm:p-8">
                                                                <div class="space-y-3">
                                                                    <div class="space-y-1">
                                                                        <FormLabel
                                                                            :for="`quantity_${selecedMedicineIndex}_${dosageIndex}`"
                                                                            :label="$t('citizens.medicineJournals.history.form.dose')" />
                                                                        <FormTextField
                                                                            :id="`quantity_${selecedMedicineIndex}_${dosageIndex}`"
                                                                            :name="`quantity_${selecedMedicineIndex}_${dosageIndex}`"
                                                                            :placeholder="$t('citizens.medicineJournals.history.form.dose')"
                                                                            :value="dosage.dosage"
                                                                            @keyup="(event: any) => handleQuantityInput(event, Number(selecedMedicineIndex), Number(dosageIndex))" />
                                                                    </div>
                                                                    <div class="space-y-1">
                                                                        <p class="text-sm text-gray-600">
                                                                            {{
                                                                                $t('citizens.medicineJournals.history.form.type.type')
                                                                            }}
                                                                        </p>
                                                                        <div>
                                                                            <RadioGroup
                                                                                v-model="state.formGiveMedicine.medicines[selecedMedicineIndex].dosages[dosageIndex].type"
                                                                                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                                <RadioGroupOption as="template"
                                                                                    v-for="(type, index) in state.options.types"
                                                                                    :key="index" :value="type.value"
                                                                                    v-slot="{ active, checked }">
                                                                                    <div
                                                                                        :class="[
                                                                                            active ? 'ring-1 ring-offset-2' : '',
                                                                                            type.title === 'Delivered' && 'ring-primary',
                                                                                            type.title === 'Deviated' && 'ring-red-600',
                                                                                            type.title === 'Given' && 'ring-green-700',
                                                                                            checked && type.title === 'Delivered' && 'bg-primary text-white ring-0 hover:bg-primary',
                                                                                            checked && type.title === 'Deviated' && 'bg-red-600 text-white ring-0 hover:bg-red-600',
                                                                                            checked && type.title === 'Given' && 'bg-green-700 text-white ring-0 hover:bg-green-700',
                                                                                            !active && !checked && type.title === 'Delivered' && 'border border-primary ring-inset',
                                                                                            !active && !checked && type.title === 'Deviated' && 'border border-red-600 ring-inset',
                                                                                            !active && !checked && type.title === 'Given' && 'border border-green-700 ring-inset',
                                                                                            active && checked ? 'text-white ring-1' : '',
                                                                                            'cursor-pointer flex items-center justify-center rounded-md px-2 py-2 text-xs']">
                                                                                        <span
                                                                                            v-if="type.title === 'Delivered'">
                                                                                            {{
                                                                                                $t('citizens.medicineJournals.history.form.type.delivered')
                                                                                            }}
                                                                                        </span>
                                                                                        <span
                                                                                            v-if="type.title === 'Deviated'">
                                                                                            {{
                                                                                                $t('citizens.medicineJournals.history.form.type.deviated')
                                                                                            }}
                                                                                        </span>
                                                                                        <span
                                                                                            v-if="type.title === 'Given'">
                                                                                            {{
                                                                                                customPagesStore.getCustomPagesName?.giveMedicine
                                                                                            }}
                                                                                        </span>
                                                                                    </div>
                                                                                </RadioGroupOption>
                                                                            </RadioGroup>
                                                                        </div>
                                                                    </div>
                                                                    <div class="space-y-1 col-span-2">
                                                                        <FormLabel
                                                                            :for="`comment_${selecedMedicineIndex}_${dosageIndex}`"
                                                                            :label="$t('citizens.medicineJournals.history.form.comment')" />
                                                                        <FormTextArea
                                                                            :id="`comment_${selecedMedicineIndex}_${dosageIndex}`"
                                                                            :name="`comment_${selecedMedicineIndex}_${dosageIndex}`"
                                                                            :placeholder="$t('citizens.medicineJournals.history.form.comment')"
                                                                            v-model="state.formGiveMedicine.medicines[selecedMedicineIndex].dosages[dosageIndex].comment" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </DisclosurePanel>
                                                    </div>
                                                </Disclosure>
                                            </div>
                                        </div>
                                    </DisclosurePanel>
                                </div>
                            </Disclosure>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" @click="emit('close')">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="w-full"
                                    v-if="state.formGiveMedicine.medicines?.length > 0">
                                    {{ $t('save') }}
                                </FormButton>
                            </div>
                        </div>
                        <DialogConfirmation :isModalOpen="state.modal.isMoreThanMedicineDailyConfirmationOpen"
                            :message="$t('citizens.medicineJournals.history.confirmation.rightDailyDoseConfirmation') + '?'"
                            @close="state.modal.isMoreThanMedicineDailyConfirmationOpen = false"
                            @confirm="giveAllMedicines" />
                    </form>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'
import { medicineJournalService } from '@/components/api/user/MedicineJournalService'
import { medicineHistoryService } from '@/components/api/user/MedicineHistoryService'
import { userService } from '@/components/api/user/UserService'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import { useCitizenMedicineStore } from '@/store/citizen-medicines'
import { euDecimalValidation } from "@/composables/euDecimalValidation"
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()
const language = useI18n()
const citizenMedicineStore = useCitizenMedicineStore() as any
const { validateEuropeanDecimal } = euDecimalValidation()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshMedicines', 'refreshMedicineHistories'])
const customPagesStore = useCustomPagesStore() as any

const state = reactive({
    columnHeaders: [] as any,
    error: {} as Error,
    isPageLoading: false,
    formGiveMedicine: {
        date: moment().format('YYYY-MM-DD'),
        medicines: [],
    } as any,
    modal: {
        isMoreThanMedicineDailyConfirmationOpen: false,
    },
    options: {
        evaluation_frequencies: [] as any,
        evaluators: [],
        types: [
            { value: 'delivered', title: 'Delivered' },
            { value: 'deviated', title: 'Deviated' },
            { value: 'given', title: 'Given' },
        ] as any
    },
    sortData: {
        sortField: '',
        sortOrder: '',
    },
    timeColumns: [] as any,
    expandedComments: new Set() as Set<string>,
})

function toggleComment(key: string) {
    if (state.expandedComments.has(key)) {
        state.expandedComments.delete(key)
    } else {
        state.expandedComments.add(key)
    }
}

function closeModal() {
    emit('close')
}

function refreshMedicines() {
    emit('refreshMedicines')
}

function refreshMedicineHistories() {
    emit('refreshMedicineHistories')
}

function buildColumnHeaders(selectedMedicines: any[]) {
    const timeMap = new Map<string, true>()

    selectedMedicines?.forEach((m: any) => {
        m?.max_dosage_per_time?.forEach((d: any) => {
            if (d?.time) timeMap.set(d.time, true)
        })
    })

    const times = Array.from(timeMap.keys())

    // ✅ store times for table body rendering
    state.timeColumns.splice(0, state.timeColumns.length, ...times)

    // ✅ Table header format
    const newHeaders = [
        { name: 'citizens.medicineJournals.table.medicine', isTranslateName: true, },
        ...times.map((time) => ({ name: time, isTranslateName: false, })),
    ]

    // ✅ update in-place
    state.columnHeaders.splice(0, state.columnHeaders.length, ...newHeaders)
}

function getDosageIndexByTime(medicineIndex: number, time: string) {
    const dosages = state.formGiveMedicine.medicines?.[medicineIndex]?.dosages || []
    return dosages.findIndex((d: any) => d?.time === time)
}

function getTypeOptions() {
    return state.options.types.map((type: any) => ({
        value: type.value,
        label:
            type.title === 'Delivered'
                ? t('citizens.medicineJournals.history.form.type.delivered')
                : type.title === 'Deviated'
                    ? t('citizens.medicineJournals.history.form.type.deviated')
                    : customPagesStore.getCustomPagesName?.giveMedicine ?? t('citizens.medicineJournals.history.form.type.given'),
    }))
}

generateEvaluationFrequenciesTimeIntervals()

function generateEvaluationFrequenciesTimeIntervals() {
    const times = []
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 1) {
            const hourStr = String(hour).padStart(2, '0')
            const minuteStr = String(minute).padStart(2, '0')
            const time = `${hourStr}:${minuteStr}`
            times.push({ value: time, label: time })
        }
    }
    state.options.evaluation_frequencies = times
}

watch(() => props.isModalOpen, (newValue) => {
    if (newValue) {
        fetchAllUsers()
        state.formGiveMedicine.date = moment().format('YYYY-MM-DD')
        fetchAllSelectedMedicines(state.formGiveMedicine.date)
    }
})

watch(() => state.formGiveMedicine.date, (date: any) => {
    fetchAllSelectedMedicines(date)
})

async function fetchAllUsers() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await userService.getAllUsersWithoutAllUsersOption()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (user: any) => options.push({
                    value: user?.uuid,
                    label: user?.firstname + " " + (user?.lastname ?? ''),
                })
            )
            state.options.evaluators = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchAllSelectedMedicines(date: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            date: date,
            citizen_medicine_uuid: Array(citizenMedicineStore.getSelectedMedicines),
        }
        const response = await medicineJournalService.getAllSelectedMedicines(params)
        if (response.data) {
            let medicines = [] as any
            response.data?.forEach((selectedMedicine: any) => {
                const doseUnit =
                    language.locale.value === 'dk'
                        ? selectedMedicine?.dosage?.dk_name
                        : selectedMedicine?.dosage?.en_name
                if (selectedMedicine?.is_pn_medicine) {
                    medicines.push({
                        medicine: selectedMedicine?.medicine,
                        dosage_unit: doseUnit,
                        is_pn_medicine: selectedMedicine?.is_pn_medicine,
                        citizen_medicine_uuid: selectedMedicine?.uuid,
                        dosage: '',
                        type: '',
                        evaluator_uuid: '',
                        evaluation_frequency: [],
                        comment: '',
                    })
                } else {
                    medicines.push({
                        medicine: selectedMedicine?.medicine,
                        dosage_unit: doseUnit,
                        is_pn_medicine: selectedMedicine?.is_pn_medicine,
                        citizen_medicine_uuid: selectedMedicine?.uuid,
                        dosages: generateDosage(selectedMedicine),
                    })
                }
            })
            state.formGiveMedicine.medicines = medicines

            state.expandedComments.clear()
            medicines.forEach((medicine: any, medicineIndex: number) => {
                if (!medicine.is_pn_medicine) {
                    medicine.dosages?.forEach((dosage: any) => {
                        if (dosage.comment?.trim()) {
                            state.expandedComments.add(`${medicineIndex}_${dosage.time}`)
                        }
                    })
                }
            })
            buildColumnHeaders(response.data)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function generateDosage(selectedMedicine: any) {
    let dosages = [] as any
    const doseUnit =
        language.locale.value === 'dk'
            ? selectedMedicine?.dosage?.dk_name
            : selectedMedicine?.dosage?.en_name
    selectedMedicine?.max_dosage_per_time.forEach((dosage: any) => {
        dosages.push({
            medicine_uuid: selectedMedicine?.uuid,
            time: dosage?.time,
            required_dosage: dosage?.dosage ?? '',
            // planned_status: dosage?.status ?? null,
            dosage_unit: doseUnit,
            dosage: dosage?.dosage ?? '',
            type: dosage?.status ?? '',
            comment: dosage?.comment ?? '',
        })
    })
    return dosages
}

function submitForm() {
    state.modal.isMoreThanMedicineDailyConfirmationOpen = true
}

async function giveAllMedicines() {
    state.error = {}
    state.isPageLoading = true
    try {
        let params = {
            date: state.formGiveMedicine.date,
            medicines: state.formGiveMedicine.medicines,
        }
        const response = await medicineHistoryService.saveAllMedicineHistory(params)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('citizens.medicineJournals.history.form.alert.successfullyAdded')}.`)
            closeModal()
            citizenMedicineStore.resetSelectedMedicine()
            refreshMedicines()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function handleQuantityInput(event: Event, selectedMedicineIndex: number, dosageIndex: number) {
    const target = event.target as HTMLInputElement
    if (language.locale.value === 'dk') {
        target.value = validateEuropeanDecimal(target.value)
    }
    state.formGiveMedicine.medicines[selectedMedicineIndex].dosages[dosageIndex].dosage = target.value
}
</script>