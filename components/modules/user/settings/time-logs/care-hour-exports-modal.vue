<template>
    <div>
        <Modal size="3xl" :title="title" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="mt-4 space-y-4">
                    <p class="text-sm text-gray-500">{{ $t('timeLogs.exportHistory.hint') }}</p>
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <LoadingSpinner :isActive="state.isLoading">
                        <div class="table-responsive">
                            <table class="min-w-full divide-y divide-gray-200 text-sm">
                                <thead>
                                    <tr class="text-left text-xs font-medium text-gray-500">
                                        <th class="py-2 pr-3">{{ $t('timeLogs.exportHistory.period') }}</th>
                                        <th class="py-2 pr-3">{{ $t('timeLogs.exportHistory.downloaded') }}</th>
                                        <th class="py-2 pr-3">{{ $t('timeLogs.exportHistory.rows') }}</th>
                                        <th class="py-2 pr-3">{{ $t('timeLogs.exportHistory.processed') }}</th>
                                        <th class="py-2"></th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100">
                                    <tr v-if="!state.isLoading && state.exports?.data?.length === 0">
                                        <td colspan="5" class="py-4 text-center text-gray-500">
                                            {{ $t('timeLogs.exportHistory.empty') }}
                                        </td>
                                    </tr>
                                    <tr v-for="item in state.exports?.data" :key="item.uuid" :data-export="item.uuid">
                                        <td class="py-2 pr-3 align-top">
                                            <p class="font-medium text-gray-800 whitespace-nowrap">
                                                {{ formatDate(item.start_date) }} - {{ formatDate(item.end_date) }}
                                            </p>
                                            <p class="text-xxs text-gray-500" v-if="item.employee">
                                                {{ $t('timeLogs.exportHistory.employee', { name: item.employee.name }) }}
                                            </p>
                                            <p class="text-xxs text-gray-500" v-if="item.has_filters">
                                                {{ $t('timeLogs.exportHistory.filtered') }}
                                            </p>
                                            <p class="text-xxs text-gray-500" v-if="item.only_unprocessed">
                                                {{ $t('timeLogs.exportHistory.onlyUnprocessed') }}
                                            </p>
                                        </td>
                                        <td class="py-2 pr-3 align-top">
                                            <p class="text-gray-800">{{ item.downloaded_by?.name ?? '' }}</p>
                                            <p class="text-xxs text-gray-500">{{ formatDateTime(item.downloaded_at) }}</p>
                                        </td>
                                        <td class="py-2 pr-3 align-top tabular-nums">
                                            {{ item.row_count }}
                                            <span class="text-xxs text-gray-500 uppercase">{{ item.format }}</span>
                                        </td>
                                        <td class="py-2 pr-3 align-top">
                                            <label class="inline-flex items-start gap-x-2 cursor-pointer">
                                                <input type="checkbox" :checked="item.is_processed"
                                                    :disabled="state.savingUuid === item.uuid"
                                                    class="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                    @change="toggleProcessed(item, $event.target as HTMLInputElement)" />
                                                <span>
                                                    <span class="block text-gray-800">{{ $t('timeLogs.exportHistory.processed') }}</span>
                                                    <span class="block text-xxs text-gray-500" v-if="item.is_processed">
                                                        {{ item.processed_by?.name ?? '' }}, {{ formatDateTime(item.processed_at) }}
                                                    </span>
                                                </span>
                                            </label>
                                        </td>
                                        <td class="py-2 text-right align-top">
                                            <FormButton type="button" buttonStyle="action" buttonSize="xs"
                                                :disabled="state.downloadingUuid === item.uuid" @click="downloadAgain(item)">
                                                <Icon name="ph:download" class="size-4" />
                                                {{ $t('timeLogs.exportHistory.downloadAgain') }}
                                            </FormButton>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <Pagination :data="state.exports" @previous="previous" @next="next" />
                    </LoadingSpinner>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { saveAs } from 'file-saver'
import { careHourExportService } from '@/components/api/user/CareHourExportService'
import { useI18n } from 'vue-i18n'
import type { PropType } from 'vue'
import type { Error } from '@/types'

// "Tidligere behandlede indsatstimer / kørsler": every report downloaded from
// Settings, with a "Behandlet" tick for when the salary or mileage is paid.
const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    kind: {
        type: String as PropType<'hours' | 'mileage'>,
        required: true,
    },
})

const emit = defineEmits(['close'])
const { t } = useI18n()
let currentPage = 1

const state = reactive({
    error: {} as Error,
    isLoading: false,
    exports: {} as any,
    savingUuid: '' as string,
    downloadingUuid: '' as string,
})

const title = computed(() => props.kind === 'mileage'
    ? t('timeLogs.exportHistory.titleMileage')
    : t('timeLogs.exportHistory.titleHours'))

watch(() => props.isModalOpen, (isOpen: boolean) => {
    if (isOpen) {
        currentPage = 1
        fetchExports()
    }
})

function closeModal() {
    emit('close')
}

function formatDate(date: string): string {
    return date ? moment(date).format('DD-MM-YYYY') : ''
}

function formatDateTime(datetime: string): string {
    return datetime ? moment(datetime).format('DD-MM-YYYY HH:mm') : ''
}

async function fetchExports() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await careHourExportService.getExports({ kind: props.kind, page: currentPage })
        state.exports = response ?? {}
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function previous() {
    currentPage--
    fetchExports()
}

function next() {
    currentPage++
    fetchExports()
}

async function toggleProcessed(item: any, checkbox: HTMLInputElement) {
    const processed = checkbox.checked
    state.error = {}
    state.savingUuid = item.uuid
    try {
        const response = await careHourExportService.setProcessed(item.uuid, processed)
        if (response?.data) {
            Object.assign(item, response.data)
        }
    } catch (error: any) {
        state.error = error
        // Put the tick back as the server still has it.
        checkbox.checked = !!item.is_processed
    }
    state.savingUuid = ''
}

async function downloadAgain(item: any) {
    state.error = {}
    state.downloadingUuid = item.uuid
    try {
        const response = await careHourExportService.downloadExport(item.uuid)
        if (response) {
            const name = props.kind === 'mileage' ? t('mileageLog.mileageLog') : t('citizens.interventionHours.interventionHours')
            const filename = `${name.replace(/ /g, '-')}-${formatDate(item.start_date)}-${formatDate(item.end_date)}`
            if (item.format === 'csv') {
                saveAs(new Blob([response], { type: 'text/csv;charset=utf-8;' }), `${filename}.csv`)
            } else {
                saveAs(response, `${filename}.pdf`)
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.downloadingUuid = ''
}
</script>
