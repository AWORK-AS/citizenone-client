<template>
    <div>
        <Modal size="lg" :title="$t('timeLogs.payrollMonths.title')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="mt-4 space-y-4">
                    <p class="text-sm text-gray-500">{{ $t('timeLogs.payrollMonths.hint') }}</p>
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <LoadingSpinner :isActive="state.isLoading">
                        <div class="table-responsive">
                            <table class="min-w-full divide-y divide-gray-200 text-sm">
                                <thead>
                                    <tr class="text-left text-xs font-medium text-gray-500">
                                        <th class="py-2 pr-3">{{ $t('timeLogs.payrollMonths.month') }}</th>
                                        <th class="py-2 pr-3">{{ $t('timeLogs.payrollMonths.registrations') }}</th>
                                        <th class="py-2 pr-3">{{ $t('timeLogs.payrollMonths.status') }}</th>
                                        <th class="py-2"></th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100">
                                    <tr v-for="month in state.months" :key="month.month" :data-month="month.month">
                                        <td class="py-2 pr-3 font-medium text-gray-800">{{ month.label }}</td>
                                        <td class="py-2 pr-3 tabular-nums">{{ month.registrations }}</td>
                                        <td class="py-2 pr-3">
                                            <div class="space-y-0.5">
                                                <Badge type="primary" class="w-fit" v-if="month.is_locked">
                                                    <p class="text-xxs">{{ $t('timeLogs.payrollMonths.closed') }}</p>
                                                </Badge>
                                                <span class="text-xs text-gray-500" v-else>
                                                    {{ $t('timeLogs.payrollMonths.open') }}
                                                </span>
                                                <p class="text-xxs text-gray-500" v-if="month.is_locked && month.locked_at">
                                                    {{ $t('timeLogs.payrollMonths.closedBy', {
                                                        date: formatDateTimeToReadable(month.locked_at),
                                                        name: month.locked_by?.name ?? '',
                                                    }) }}
                                                </p>
                                                <p class="text-xxs text-gray-500" v-else-if="month.reopened_at">
                                                    {{ $t('timeLogs.payrollMonths.reopenedBy', {
                                                        date: formatDateTimeToReadable(month.reopened_at),
                                                        name: month.reopened_by?.name ?? '',
                                                    }) }}
                                                </p>
                                            </div>
                                        </td>
                                        <td class="py-2 text-right">
                                            <FormButton type="button" buttonStyle="action" buttonSize="xs"
                                                v-if="month.is_locked" @click="confirm(month, 'reopen')">
                                                <Icon name="ph:lock-open" class="size-4" />
                                                {{ $t('timeLogs.payrollMonths.reopen') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="primary" buttonSize="xs" v-else
                                                @click="confirm(month, 'close')">
                                                <Icon name="ph:lock" class="size-4" />
                                                {{ $t('timeLogs.payrollMonths.close') }}
                                            </FormButton>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </LoadingSpinner>
                </div>
                <DialogConfirmation :isModalOpen="state.confirm.isOpen" :message="confirmMessage"
                    @close="state.confirm.isOpen = false" @confirm="apply" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { careHourPayrollService } from '@/components/api/user/CareHourPayrollService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['close', 'changed'])
const { t } = useI18n()
const { successAlert } = useAlert()
const { formatDateTimeToReadable } = useDatetimeFormatter()

const state = reactive({
    error: {} as Error,
    isLoading: false,
    months: [] as any[],
    confirm: {
        isOpen: false,
        action: 'close' as 'close' | 'reopen',
        month: null as any,
    },
})

// Closing says how many registrations in the month are still running: they
// can still be finished, and are locked once they are.
const confirmMessage = computed(() => {
    const month = state.confirm.month

    if (!month) return ''

    if (state.confirm.action === 'reopen') {
        return t('timeLogs.payrollMonths.confirmReopen', { month: month.label })
    }

    const message = t('timeLogs.payrollMonths.confirmClose', { month: month.label })

    return month.open_registrations > 0
        ? `${message} ${t('timeLogs.payrollMonths.confirmCloseOpenRows', { count: month.open_registrations, month: month.label })}`
        : message
})

watch(() => props.isModalOpen, (isOpen: boolean) => {
    if (isOpen) {
        fetchMonths()
    }
})

function closeModal() {
    emit('close')
}

async function fetchMonths() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await careHourPayrollService.getPayrollMonths()
        state.months = Array.isArray(response?.data) ? response.data : []
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function confirm(month: any, action: 'close' | 'reopen') {
    state.confirm = { isOpen: true, action, month }
}

async function apply() {
    const { action, month } = state.confirm
    state.confirm.isOpen = false
    state.error = {}
    state.isLoading = true
    try {
        const response = action === 'close'
            ? await careHourPayrollService.closePayrollMonth(month.month)
            : await careHourPayrollService.reopenPayrollMonth(month.month)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, t(
                action === 'close' ? 'timeLogs.payrollMonths.closedAlert' : 'timeLogs.payrollMonths.reopenedAlert',
                { month: month.label },
            ))
            emit('changed')
            await fetchMonths()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}
</script>
