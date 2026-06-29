<template>
    <div>
        <Modal size="3xl" :title="$t('citizens.medicineJournals.synchronizeWithFMK')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isLoading">
                    <div class="space-y-4">
                        <!-- Fault / error. A 4202 fault is expected until the
                             MitID Erhverv login is live, so explain it kindly. -->
                        <Alert v-if="state.error?.message" :type="state.isExpectedBlock ? 'info' : 'danger'"
                            :text="state.error.message" />

                        <!-- Medicine list from FMK -->
                        <div v-if="state.medications.length" class="overflow-x-auto">
                            <table class="min-w-full text-sm">
                                <thead>
                                    <tr class="text-left text-gray-500 border-b">
                                        <th class="py-2 pr-4">{{ $t('citizens.medicineJournals.fmk.drug') }}</th>
                                        <th class="py-2 pr-4">{{ $t('citizens.medicineJournals.fmk.dosage') }}</th>
                                        <th class="py-2 pr-4">{{ $t('citizens.medicineJournals.fmk.period') }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(m, i) in state.medications" :key="i" class="border-b last:border-0">
                                        <td class="py-2 pr-4 font-medium">{{ m.drugName || '—' }}</td>
                                        <td class="py-2 pr-4">{{ m.dosage?.text || '—' }}</td>
                                        <td class="py-2 pr-4 text-gray-600">
                                            {{ m.treatmentStartDate || '—' }}<span v-if="m.treatmentEndDate"> – {{ m.treatmentEndDate }}</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <!-- Empty (successful call, no medications) -->
                        <p v-else-if="state.hasFetched && !state.error?.message" class="text-sm text-gray-500">
                            {{ $t('citizens.medicineJournals.fmk.empty') }}
                        </p>

                        <!-- Fallback: the national FMK web client always works. -->
                        <div class="pt-2 border-t flex items-center justify-between gap-3 flex-wrap">
                            <a href="https://fmk-online.dk/fmk" target="_blank" rel="noopener"
                                class="text-sm text-primary inline-flex items-center gap-1">
                                <Icon name="mdi:open-in-new" class="h-4 w-4" />
                                {{ $t('citizens.medicineJournals.fmk.openOnline') }}
                            </a>
                            <div class="flex items-center gap-2">
                                <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                                    {{ $t('close') }}
                                </FormButton>
                                <FormButton type="button" buttonStyle="primary" @click="fetchCard"
                                    :disabled="state.isLoading">
                                    <Icon name="mdi:cloud-refresh-outline" class="h-4 w-4" />
                                    {{ $t('citizens.medicineJournals.fmk.refresh') }}
                                </FormButton>
                            </div>
                        </div>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { citizenService } from '@/components/api/user/CitizenService'
import { fMKService } from '@/components/api/user/FMKService'
import { useCompanyStore } from '@/store/company'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: { type: Boolean, required: true },
    citizenUuid: { type: String, required: true },
})
const emit = defineEmits(['close', 'refreshMedicines'])

const { t } = useI18n()
const companyStore = useCompanyStore() as any

const state = reactive({
    isLoading: false,
    hasFetched: false,
    isExpectedBlock: false,
    error: {} as Error,
    medications: [] as any[],
})

// Fetch when the modal opens.
watch(
    () => props.isModalOpen,
    (open) => {
        if (open) fetchCard()
    },
)

async function fetchCard() {
    state.error = {} as Error
    state.medications = []
    state.isExpectedBlock = false
    state.isLoading = true
    try {
        const orgCvr = String(companyStore.getSelectedCompany?.cvr ?? '')
        if (!orgCvr) {
            state.error = { message: t('citizens.medicineJournals.fmk.missingCvr') } as Error
            return
        }

        const citizenRes = await citizenService.getCitizen(props.citizenUuid)
        const citizen = citizenRes?.data ?? citizenRes
        const cpr = citizen?.social_security_number
        if (!cpr) {
            state.error = { message: t('citizens.medicineJournals.fmk.missingCpr') } as Error
            return
        }

        const result = await fMKService.getMedicineCard({
            orgCvr,
            cpr,
            citizenId: citizen?.id,
        })
        state.medications = result?.data?.medicineCard?.medications ?? []
        // The backend imported these into the citizen's medicine list as drafts;
        // tell the parent page to refresh so they appear without a manual reload.
        if ((result?.import?.imported ?? 0) > 0 || (result?.import?.updated ?? 0) > 0) {
            emit('refreshMedicines')
        }
    } catch (error: any) {
        const faultCode = error?.data?.faultCode
        const message = error?.data?.message || error?.message || t('citizens.medicineJournals.fmk.error')
        // 4202 = system ID-card (no employee login yet) — expected, explain softly.
        if (String(faultCode) === '4202') {
            state.isExpectedBlock = true
            state.error = { message: t('citizens.medicineJournals.fmk.loginPending') } as Error
        } else {
            state.error = { message: faultCode ? `${message} (${faultCode})` : message } as Error
        }
    } finally {
        state.isLoading = false
        state.hasFetched = true
    }
}

function closeModal() {
    emit('close')
}
</script>
