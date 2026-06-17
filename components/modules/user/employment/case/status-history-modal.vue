<template>
    <Modal :title="$t('employment.cases.statusHistory.title')" :show="props.isModalOpen" @close="emit('close')">
        <template #modal-body>
            <LoadingSpinner :isActive="state.isLoading">
                <div class="space-y-4">
                    <Alert type="danger" :text="state.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <!-- Add new status entry -->
                    <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <h4 class="text-sm font-semibold text-gray-700 mb-3">
                            {{ $t('employment.cases.statusHistory.addEntry') }}
                        </h4>
                        <div class="space-y-3">
                            <div class="space-y-1">
                                <FormLabel for="new_status_type_uuid"
                                    :label="$t('employment.cases.statusHistory.form.statusType')" />
                                <div class="flex items-center gap-2">
                                    <FormSelect id="new_status_type_uuid" :options="state.options.statusTypes"
                                        v-model="state.newEntry.status_type_uuid" class="flex-1" />
                                    <span v-if="newEntryStatusTypeColor"
                                        :style="{ backgroundColor: newEntryStatusTypeColor }"
                                        class="inline-block w-6 h-6 rounded shrink-0" />
                                </div>
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="new_notes"
                                    :label="$t('employment.cases.statusHistory.form.notes')" />
                                <FormTextArea id="new_notes" name="new_notes"
                                    :placeholder="$t('employment.cases.statusHistory.form.notesPlaceholder')"
                                    v-model="state.newEntry.notes" />
                            </div>
                            <FormButton type="button" buttonStyle="primary" @click="saveStatusEntry"
                                :disabled="state.isSaving">
                                {{ $t('employment.cases.statusHistory.form.save') }}
                            </FormButton>
                        </div>
                    </div>

                    <!-- History list -->
                    <div>
                        <h4 class="text-sm font-semibold text-gray-700 mb-3">
                            {{ $t('employment.cases.statusHistory.history') }}
                        </h4>
                        <div v-if="state.history.length === 0" class="text-sm text-gray-400">
                            {{ $t('employment.cases.statusHistory.noHistory') }}
                        </div>
                        <div v-else class="space-y-2">
                            <div v-for="entry in state.history" :key="entry.uuid"
                                class="flex items-start gap-3 p-3 border border-gray-200 rounded-lg bg-white">
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-2 flex-wrap">
                                        <span v-if="entry.status_type"
                                            class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                                            :style="{ backgroundColor: entry.status_type.color || '#6b7280' }">
                                            {{ entry.status_type.name }}
                                        </span>
                                        <span v-else class="text-xs text-gray-400 italic">
                                            {{ $t('employment.cases.statusHistory.statusCleared') }}
                                        </span>
                                        <span class="text-xs text-gray-400">
                                            {{ formatDate(entry.created_at) }}
                                        </span>
                                        <span v-if="entry.changed_by" class="text-xs text-gray-500">
                                            {{ entry.changed_by.name }}
                                        </span>
                                    </div>
                                    <p v-if="entry.notes" class="mt-1 text-sm text-gray-600">
                                        {{ entry.notes }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </LoadingSpinner>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { employmentService } from '@/components/api/user/EmploymentService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: { type: Boolean, required: true },
    selectedCase: { type: Object, required: false, default: () => ({}) },
})
const emit = defineEmits(['close', 'statusUpdated'])

const { t } = useI18n()
const { successAlert } = useAlert()

const state = reactive({
    history: [] as any[],
    options: {
        statusTypes: [] as any[],
    },
    statusTypesRaw: [] as any[],
    newEntry: {
        status_type_uuid: null as string | null,
        notes: '',
    },
    isLoading: false,
    isSaving: false,
    error: {} as Error,
})

const newEntryStatusTypeColor = computed(() => {
    if (!state.newEntry.status_type_uuid) return null
    const st = state.statusTypesRaw.find((s: any) => s.uuid === state.newEntry.status_type_uuid)
    return st?.color ?? null
})

watch(() => props.isModalOpen, (open) => {
    if (open && props.selectedCase?.uuid) {
        fetchHistory()
        fetchAgreementStatusTypes()
    }
})

watch(() => props.selectedCase, (newCase) => {
    if (props.isModalOpen && newCase?.uuid) {
        fetchHistory()
        fetchAgreementStatusTypes()
    }
})

async function fetchHistory() {
    state.isLoading = true
    state.error = {}
    try {
        const response = await employmentService.getCaseStatusHistory(props.selectedCase.uuid)
        if (response?.data) state.history = response.data
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function fetchAgreementStatusTypes() {
    const agreementUuid = props.selectedCase?.agreement?.uuid
    if (!agreementUuid) return
    try {
        const response = await employmentService.getAgreementStatusTypes(agreementUuid)
        if (response?.data) {
            state.statusTypesRaw = response.data
            state.options.statusTypes = [
                { value: null, label: '—' },
                ...response.data.map((st: any) => ({
                    value: st.uuid,
                    label: st.name,
                })),
            ]
        }
    } catch { /* ignore */ }
}

async function saveStatusEntry() {
    state.isSaving = true
    state.error = {}
    try {
        await employmentService.saveCaseStatusHistory(props.selectedCase.uuid, {
            status_type_uuid: state.newEntry.status_type_uuid,
            notes: state.newEntry.notes || undefined,
        })
        state.newEntry = { status_type_uuid: null, notes: '' }
        successAlert(`${t('alert.success')}!`, `${t('employment.cases.statusHistory.alert.statusUpdated')}.`)
        await fetchHistory()
        emit('statusUpdated')
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}

function formatDate(dateString: string) {
    if (!dateString) return ''
    return new Date(dateString).toLocaleString()
}
</script>
