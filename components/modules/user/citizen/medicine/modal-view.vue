<template>
    <div>
        <Modal size="lg" :title="$t('citizens.medicineJournals.viewMedicine.viewMedicine')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="space-y-3" v-if="state.selectedMedicine">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="flex justify-end">
                            <FormButton buttonStyle="action" @click="downloadAndPrintMedicine">
                                <Icon name="ph:download" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('citizens.medicineJournals.viewMedicine.downloadAndPrintMedicine') }}
                            </FormButton>
                        </div>
                        <div class="flex items-center gap-x-2">
                            <div v-if="state.selectedMedicine.is_pn_medicine">
                                <Badge type="primary" class="w-fit">
                                    <p class="text-xxs">
                                        {{
                                            $t('citizens.medicineJournals.table.pnMedicine')
                                        }}
                                    </p>
                                </Badge>
                            </div>
                            <div v-if="state.selectedMedicine.is_self_administered">
                                <Badge type="primary" class="w-fit">
                                    <p class="text-xxs">
                                        {{
                                            $t('citizens.medicineJournals.form.selfAdminister')
                                        }}
                                    </p>
                                </Badge>
                            </div>
                            <div v-if="state.selectedMedicine.is_expired"
                                :title="$t('citizens.medicineJournals.viewModal.expiredTooltip')">
                                <span
                                    class="inline-flex items-center gap-x-1 rounded-full bg-red-100 px-2 py-0.5 text-xxs font-semibold text-red-700">
                                    <Icon name="ph:warning-circle" class="size-3" />
                                    {{ $t('citizens.medicineJournals.viewModal.expired') }}
                                </span>
                            </div>
                        </div>
                        <div class="flex items-center gap-x-2">
                            <p v-if="language.locale.value === 'en'">
                                {{ state.selectedMedicine?.medicine?.en_name }},
                                {{ state.selectedMedicine?.medicine?.ingredients }}
                            </p>
                            <p v-if="language.locale.value === 'dk'">
                                {{ state.selectedMedicine?.medicine?.dk_name }},
                                {{ state.selectedMedicine?.medicine?.ingredients }}
                            </p>
                            <p v-if="language.locale.value === 'no'">
                                {{ state.selectedMedicine?.medicine?.no_name }},
                                {{ state.selectedMedicine?.medicine?.ingredients }}
                            </p>
                            <p v-if="language.locale.value === 'sv'">
                                {{ state.selectedMedicine?.medicine?.sv_name }},
                                {{ state.selectedMedicine?.medicine?.ingredients }}
                            </p>
                            <Badge :type="state.selectedMedicine?.is_active ? 'active' : 'inactive'"
                                class="text-xxs truncate w-fit">
                                {{
                                    $t('citizens.medicineJournals.form.active')
                                }}
                            </Badge>
                        </div>
                        <p>
                            <span class="font-semibold">
                                {{ $t('citizens.medicineJournals.form.medicine') }}:
                                {{ $t('citizens.medicineJournals.form.dosageForm') }}:
                            </span>
                            {{ state.selectedMedicine?.dosage?.name }}
                        </p>
                        <p>
                            <span class="font-semibold">
                                {{ $t('citizens.medicineJournals.form.currentStocks') }}:
                            </span>
                            {{ state.selectedMedicine?.current_stocks }}
                        </p>
                        <p>
                            <span class="font-semibold">
                                {{ $t('citizens.medicineJournals.form.strength') }}:
                            </span>
                            {{ state.selectedMedicine?.strength }}
                            {{ state.selectedMedicine?.mass_unit?.name }}
                        </p>
                        <p>
                            <span class="font-semibold">
                                {{ $t('citizens.medicineJournals.form.maxDailyDose') }}:
                            </span>
                            {{ state.selectedMedicine?.max_daily_dose }}
                        </p>
                        <p>
                            <span class="font-semibold">
                                {{ $t('citizens.medicineJournals.form.packageLeafletLink') }}:
                            </span>
                            {{ state.selectedMedicine?.package_leaflet_link }}
                        </p>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-1">
                            <p>
                                <span class="font-semibold">
                                    {{ $t('citizens.medicineJournals.form.startDate') }}:
                                </span>
                                <span v-if="state.selectedMedicine?.start_date">
                                    {{ formatDateToReadable(state.selectedMedicine?.start_date) }}
                                </span>
                            </p>
                            <p>
                                <span class="font-semibold">
                                    {{ $t('citizens.medicineJournals.form.endDate') }}:
                                </span>
                                <span v-if="state.selectedMedicine?.end_date">
                                    {{ formatDateToReadable(state.selectedMedicine?.end_date) }}
                                </span>
                            </p>
                            <p v-if="state.selectedMedicine?.recurring_until">
                                <span class="font-semibold">
                                    {{ $t('citizens.medicineJournals.viewModal.until') }}:
                                </span>
                                {{ formatDateToReadable(state.selectedMedicine?.recurring_until) }}
                            </p>
                        </div>

                        <!-- Treatment periods #545 -->
                        <div v-if="state.selectedMedicine?.treatment_periods?.length > 0"
                            class="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-2">
                            <p class="text-xs font-semibold text-primary flex items-center gap-1.5">
                                <Icon name="ph:calendar-dots" class="size-4" />
                                {{ $t('citizens.medicineJournals.viewModal.treatmentPeriods') }}
                            </p>
                            <div class="space-y-1.5">
                                <div v-for="(period, idx) in state.selectedMedicine.treatment_periods" :key="idx"
                                    class="flex items-center gap-2 text-xs text-gray-700 bg-white rounded-lg px-3 py-2 border border-gray-200">
                                    <span class="text-gray-400">
                                        {{ $t('citizens.medicineJournals.viewModal.from') }}
                                    </span>
                                    <span class="font-medium">
                                        {{ formatDateToReadable(period.start) }}
                                    </span>
                                    <span class="text-gray-400">
                                        {{ $t('citizens.medicineJournals.viewModal.to') }}
                                    </span>
                                    <span class="font-medium">
                                        {{ formatDateToReadable(period.end) }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Extra individual dates #549 -->
                        <div v-if="state.selectedMedicine?.extra_dates?.length > 0"
                            class="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-2">
                            <p class="text-xs font-semibold text-primary flex items-center gap-1.5">
                                <Icon name="ph:calendar-plus" class="size-4" />
                                {{ $t('citizens.medicineJournals.viewModal.extraIndividualDates') }}
                            </p>
                            <div class="flex flex-wrap gap-1.5">
                                <span v-for="d in state.selectedMedicine.recurring_dates.slice().sort()" :key="d"
                                    class="text-xs bg-white border border-primary/20 text-primary px-2 py-0.5 rounded-full">
                                    {{ formatDateToReadable(d) }}
                                </span>
                            </div>
                        </div>

                        <p>
                            <span class="font-semibold">
                                {{ $t('citizens.medicineJournals.form.doctor') }}:
                            </span>
                            {{ state.selectedMedicine?.doctor?.firstname }}
                            {{ state.selectedMedicine?.doctor?.lastname }}
                        </p>
                        <p class="break-words">
                            <span class="font-semibold">
                                {{ $t('citizens.medicineJournals.form.treatmentReason') }}:
                            </span>
                            {{ state.selectedMedicine?.treatment_reason }}
                        </p>
                        <p class="break-words">
                            <span class="font-semibold">
                                {{ $t('citizens.medicineJournals.form.medicineStorage') }}:
                            </span>
                            {{ state.selectedMedicine?.medication_storage }}
                        </p>
                        <p class="break-words">
                            <span class="font-semibold">
                                {{ $t('citizens.medicineJournals.form.consentToPrescribe') }}:
                            </span>
                            {{ state.selectedMedicine?.has_consent ? $t('yes') : $t('no') }}
                        </p>
                        <p class="break-words" v-if="state.selectedMedicine?.has_consent && state.selectedMedicine?.prescribed_by">
                            <span class="font-semibold">
                                {{ $t('citizens.medicineJournals.form.whoPrescribed') }}:
                            </span>
                            {{ state.selectedMedicine?.prescribed_by }}
                        </p>
                        <p v-if="state.selectedMedicine?.date_opened">
                            <span class="font-semibold">
                                {{ $t('citizens.medicineJournals.form.dateOpened') }}:
                            </span>
                            {{ formatDateToReadable(state.selectedMedicine?.date_opened) }}
                        </p>
                        <p v-if="state.selectedMedicine?.shelf_life_days">
                            <span class="font-semibold">
                                {{ $t('citizens.medicineJournals.form.shelfLifeDays') }}:
                            </span>
                            {{ state.selectedMedicine?.shelf_life_days }}
                        </p>
                        <p v-if="state.selectedMedicine?.expiration_date"
                            :class="state.selectedMedicine?.is_expired ? 'text-red-700 font-semibold' : ''">
                            <span class="font-semibold">
                                {{ $t('citizens.medicineJournals.form.expirationDate') }}:
                            </span>
                            {{ formatDateToReadable(state.selectedMedicine?.expiration_date) }}
                        </p>
                        <p class="break-words">
                            <span class="font-semibold">
                                {{ $t('citizens.medicineJournals.form.ingredients') }}:
                            </span>
                            {{ state.selectedMedicine?.ingredients }}
                        </p>
                        <p class="break-words">
                            <span class="font-semibold">
                                {{ $t('citizens.medicineJournals.form.description') }}:
                            </span>
                            {{ state.selectedMedicine?.description }}
                        </p>
                    </div>
                    <div class="mt-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="primary" class="w-full"
                                @click="state.modal.isEditMedicineOpen = true">
                                {{ $t('citizens.medicineJournals.editMedicine') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="cancel" class="col-start-2" @click="closeModal()">
                                {{ $t('close') }}
                            </FormButton>
                        </div>
                    </div>
                </LoadingSpinner>
                <ModulesUserCitizenMedicineModalEdit :isModalOpen="state.modal.isEditMedicineOpen"
                    :selectedMedicine="state.selectedMedicine" @close="state.modal.isEditMedicineOpen = false"
                    @refreshMedicines="fetchCitizenMedicines" />
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { medicineJournalService } from '@/components/api/user/MedicineJournalService'
import { useI18n } from "vue-i18n"
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { saveAs } from 'file-saver'
import type { Error } from '@/types'

const language = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedMedicine: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshMedicines'])
const { formatDateToReadable } = useDatetimeFormatter()

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    modal: {
        isEditMedicineOpen: false
    },
    selectedMedicine: {} as any,
})

function closeModal() {
    emit('close')
}

watch(() => props.isModalOpen, (isModalOpen) => {
    if (isModalOpen) {
        fetchSelectedMedicine()
    }
})

function refreshMedicines() {
    emit('refreshMedicines')
}

function fetchCitizenMedicines() {
    fetchSelectedMedicine()
    refreshMedicines()
}

async function fetchSelectedMedicine() {
    state.error = {}
    state.isPageLoading = true
    try {
        const medicineUuid = props.selectedMedicine?.uuid
        const response = await medicineJournalService.getMedicine(medicineUuid)
        if (response?.data) {
            state.selectedMedicine = response.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function downloadAndPrintMedicine() {
    state.error = {}
    state.isPageLoading = true

    try {
        const medicineUuid = props.selectedMedicine?.uuid
        const resp = await medicineJournalService.downloadMedicine(medicineUuid)

        // Ensure we have a Blob (PDF)
        const blob =
            resp instanceof Blob
                ? resp
                : new Blob([resp], { type: 'application/pdf' })

        // Localized filename with .pdf extension
        const baseName =
            language.locale.value === 'en'
                ? state.selectedMedicine?.medicine?.en_name
                : state.selectedMedicine?.medicine?.dk_name
        const safeName = (baseName || 'medicine').replace(/[\\/:*?"<>|]+/g, '_')
        const filename = safeName.endsWith('.pdf') ? safeName : `${safeName}.pdf`

        // 1) Save to disk
        saveAs(blob, filename)

        // 2) Open and print (best effort)
        const url = URL.createObjectURL(blob)

        // Try popup window first (works well on desktop)
        let win: Window | null = window.open(url)
        if (win) {
            const onWinLoad = () => {
                try {
                    win!.focus()
                    win!.print()
                } catch (e) {
                    // ignore printing errors
                } finally {
                    // give the browser a moment before revoking
                    setTimeout(() => URL.revokeObjectURL(url), 10_000)
                    win!.removeEventListener('load', onWinLoad as any)
                }
            }
            // Some browsers fire 'load' on the opened window; others need a short delay
            win.addEventListener?.('load', onWinLoad)
            // Fallback: if no load event, attempt print after a small delay
            setTimeout(onWinLoad, 800)
        } else {
            // Popup blocked — use a hidden iframe as a fallback
            const iframe = document.createElement('iframe')
            iframe.style.position = 'fixed'
            iframe.style.right = '0'
            iframe.style.bottom = '0'
            iframe.style.width = '0'
            iframe.style.height = '0'
            iframe.style.border = '0'
            iframe.src = url
            iframe.onload = () => {
                try {
                    iframe.contentWindow?.focus()
                    iframe.contentWindow?.print()
                } finally {
                    setTimeout(() => {
                        URL.revokeObjectURL(url)
                        iframe.remove()
                    }, 10_000)
                }
            }
            document.body.appendChild(iframe)
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.isPageLoading = false
    }
}
</script>