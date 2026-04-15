<template>
    <div>
        <Modal size="4xl" :title="$t('dutySchedules.draft.preset.draftSchedulesPresets')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="space-y-5">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <!-- Forklaring -->
                        <div class="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-3">
                            <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p class="text-xs font-semibold text-blue-800 mb-0.5">{{ $t('dutySchedules.draft.preset.infoBox.title') }}</p>
                                <p class="text-xs text-blue-700">{{ $t('dutySchedules.draft.preset.infoBox.description') }}</p>
                            </div>
                        </div>
                        <TableSearch @search="handleSearch" />
                        <div class="table-responsive">
                            <Table :columnHeaders="state.columnHeaders" :data="state.presets"
                                :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                                <template #body v-if="!(state.isTableLoading || (state.presets?.data?.length === 0))">
                                    <tr v-for="(preset, index) in state.presets?.data" :key="index">
                                        <td width="30%">
                                            <span>{{ preset?.name }}</span>
                                        </td>
                                        <td width="20%">
                                            <span>{{ formatDateToReadable(preset?.original_date_start) }} - {{
                                                formatDateToReadable(preset?.original_date_end) }}</span>
                                        </td>
                                        <td width="30%">
                                            <div class="flex items-center gap-x-2">
                                                <img :src="preset.creator?.profile_image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${preset.creator?.firstname + ' ' + preset.creator?.lastname}`"
                                                    class="h-11 w-11 rounded-full bg-gray-50 object-cover" />
                                                <span>
                                                    {{ preset.creator?.firstname }} {{ preset.creator?.lastname }}
                                                </span>
                                            </div>
                                        </td>
                                        <td width="20%">
                                            <div class="flex items-end justify-end gap-2">
                                                <Tooltip :text="$t('dutySchedules.draft.preset.table.actions.apply')">
                                                    <FormButton type="button" buttonStyle="action"
                                                        @click="applyPreset(preset)">
                                                        <Icon name="ph:check" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                                <Tooltip :text="$t('dutySchedules.draft.preset.table.actions.edit')">
                                                    <FormButton type="button" buttonStyle="action"
                                                        @click="editPreset(preset)">
                                                        <Icon name="ph:pencil-simple" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                                <Tooltip :text="$t('dutySchedules.draft.preset.table.actions.delete')">
                                                    <FormButton type="button" buttonStyle="danger"
                                                        @click="deletePresetConfirmation(preset)">
                                                        <Icon name="ph:trash" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </Table>
                        </div>
                        <Pagination :data="state.presets" @previous="previous" @next="next" />
                    </div>

                    <ModulesUserDutySchedulePresetsModalEdit :selectedPreset="state.selectedPreset"
                        :isModalOpen="state.modal.isEditPresetOpen" @close="state.modal.isEditPresetOpen = false"
                        @refreshPresets="fetchPresets" />
                    <ModulesUserDutySchedulePresetsModalApply :selectedPreset="state.selectedPreset"
                        :isModalOpen="state.modal.isApplyPresetOpen" @close="state.modal.isApplyPresetOpen = false"
                        @refreshPresets="fetchPresets" />

                    <DialogConfirmation :isModalOpen="state.modal.isDeletePresetOpen"
                        :message="`${$t('dutySchedules.draft.preset.confirmation.deletePresetConfirmation')} ${state.selectedPreset.name}?`"
                        @close="state.modal.isDeletePresetOpen = false" @confirm="deletePreset" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'
import { draftSchedulePresetService } from '@/components/api/user/DraftSchedulePresetService'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const { t } = useI18n()
const { successAlert } = useAlert()
const { formatDateToReadable } = useDatetimeFormatter()
const emit = defineEmits(['close'])

let currentTablePage = 1

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    isTableLoading: false,
    presets: [] as any,
    columnHeaders: [
        { name: 'dutySchedules.draft.preset.table.name', isTranslateName: true, sorter: true },
        { name: 'dutySchedules.draft.preset.table.date', isTranslateName: true },
        { name: 'dutySchedules.draft.preset.table.createdBy', isTranslateName: true },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    selectedPreset: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
    modal: {
        isEditPresetOpen: false,
        isDeletePresetOpen: false,
        isApplyPresetOpen: false,
    }

})

function closeModal() {
    emit('close')
}

onMounted(() => {
    fetchPresets()
})

watch(() => props.isModalOpen, (newValue) => {
    if (newValue) {
        fetchPresets()
    }
})

async function fetchPresets() {
    try {
        state.error = {}
        state.isTableLoading = true
        const response = await draftSchedulePresetService.getPresets({
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter,
        })
        state.presets = response
    } catch (error: any) {
        state.error = error
    } finally {
        state.isTableLoading = false
    }
}

function previous() {
    currentTablePage--
    fetchPresets()
}

function next() {
    currentTablePage++
    fetchPresets()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchPresets()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchPresets()
}

function editPreset(preset: any) {
    state.selectedPreset = preset
    state.modal.isEditPresetOpen = true
}

function deletePresetConfirmation(preset: any) {
    state.selectedPreset = preset
    state.modal.isDeletePresetOpen = true
}

async function deletePreset() {
    try {
        state.error = {}
        state.isPageLoading = true
        await draftSchedulePresetService.deletePreset(state.selectedPreset.uuid)
        successAlert(`${t('alert.success')}!`, `${t('dutySchedules.draft.preset.deleteSuccess')}`)
        fetchPresets()
    } catch (error: any) {
        state.error = error
    } finally {
        state.isPageLoading = false
        state.modal.isDeletePresetOpen = false
    }
}

function applyPreset(preset: any) {
    state.selectedPreset = preset
    state.modal.isApplyPresetOpen = true
}
</script>