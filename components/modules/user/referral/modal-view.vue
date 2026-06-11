<template>
    <div>
        <Modal size="md" :title="$t('referrals.referral')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <Alert type="danger" :text="state.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <div v-if="state.referral" class="space-y-5">

                        <!-- Citizen & status -->
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-xs text-gray-400">{{ $t('referrals.citizen') }}</p>
                                <p class="font-semibold text-gray-900">
                                    {{ state.referral.citizen?.firstname }} {{ state.referral.citizen?.lastname }}
                                </p>
                            </div>
                            <Badge
                                :type="state.referral.status === 'active' ? 'active' : state.referral.status === 'pending' ? 'pending' : 'inactive'">
                                <p class="text-xxs px-1">
                                    {{ state.referral.status === 'active' ? $t('referrals.statusActive') :
                                        state.referral.status === 'pending' ? $t('referrals.statusPending') :
                                        $t('referrals.statusClosed') }}
                                </p>
                            </Badge>
                        </div>

                        <!-- Period -->
                        <div class="grid grid-cols-3 gap-4 border-t border-gray-100 pt-4">
                            <div>
                                <p class="text-xs text-gray-400">{{ $t('referrals.startDate') }}</p>
                                <p class="text-sm font-medium text-gray-700">{{ formatDateToReadable(state.referral.start_date) }}</p>
                            </div>
                            <div>
                                <p class="text-xs text-gray-400">{{ $t('referrals.endDate') }}</p>
                                <p class="text-sm font-medium text-gray-700">{{ formatDateToReadable(state.referral.end_date) }}</p>
                            </div>
                            <div v-if="state.referral.weeks">
                                <p class="text-xs text-gray-400">{{ $t('referrals.weeks') }}</p>
                                <p class="text-sm font-medium text-gray-700">{{ state.referral.weeks }}</p>
                            </div>
                        </div>

                        <!-- Department & municipality -->
                        <div class="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                            <div v-if="state.referral.department">
                                <p class="text-xs text-gray-400">{{ $t('referrals.department') }}</p>
                                <p class="text-sm font-medium text-gray-700">{{ state.referral.department.name }}</p>
                            </div>
                            <div v-if="state.referral.municipality">
                                <p class="text-xs text-gray-400">{{ $t('referrals.municipality') }}</p>
                                <p class="text-sm font-medium text-gray-700">{{ state.referral.municipality }}</p>
                            </div>
                        </div>

                        <!-- Caseworker -->
                        <div v-if="state.referral.caseworker_name || state.referral.caseworker_email || state.referral.caseworker_phone"
                            class="border-t border-gray-100 pt-4 space-y-1">
                            <p class="text-xs text-gray-400 mb-2">{{ $t('referrals.caseworkerName') }}</p>
                            <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                                <div v-if="state.referral.caseworker_name" class="flex items-center gap-1.5">
                                    <Icon name="ph:user" class="h-4 w-4 text-gray-400" />
                                    <span class="text-gray-700">{{ state.referral.caseworker_name }}</span>
                                </div>
                                <div v-if="state.referral.caseworker_email" class="flex items-center gap-1.5">
                                    <Icon name="ph:envelope" class="h-4 w-4 text-gray-400" />
                                    <span class="text-gray-700">{{ state.referral.caseworker_email }}</span>
                                </div>
                                <div v-if="state.referral.caseworker_phone" class="flex items-center gap-1.5">
                                    <Icon name="ph:phone" class="h-4 w-4 text-gray-400" />
                                    <span class="text-gray-700">{{ state.referral.caseworker_phone }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Notes -->
                        <div v-if="state.referral.notes" class="border-t border-gray-100 pt-4">
                            <p class="text-xs text-gray-400 mb-1">{{ $t('referrals.notes') }}</p>
                            <p class="text-sm text-gray-700 whitespace-pre-line">{{ state.referral.notes }}</p>
                        </div>

                        <!-- Created by -->
                        <div v-if="state.referral.created_by" class="border-t border-gray-100 pt-4 flex items-center gap-2 text-sm text-gray-500">
                            <Icon name="ph:user" class="h-4 w-4 text-gray-400" />
                            <span>{{ $t('overview.createdBy') }}:</span>
                            <span class="font-medium text-gray-700">{{ state.referral.created_by.name }}</span>
                            <span v-if="state.referral.created_at" class="text-gray-400">·</span>
                            <span v-if="state.referral.created_at" class="text-gray-500">{{ formatDateToReadable(state.referral.created_at) }}</span>
                        </div>

                        <!-- Period logs -->
                        <div class="border-t border-gray-100 pt-4">
                            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                {{ $t('referrals.periodLogs') }}
                            </p>
                            <div v-if="state.referral.period_logs?.length > 0" class="table-responsive">
                                <table class="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead>
                                        <tr>
                                            <th class="text-left py-2 pr-4 text-gray-400 font-medium text-xs">{{ $t('referrals.periodLog.previousPeriod') }}</th>
                                            <th class="text-left py-2 pr-4 text-gray-400 font-medium text-xs">{{ $t('referrals.periodLog.newPeriod') }}</th>
                                            <th class="text-left py-2 pr-4 text-gray-400 font-medium text-xs">{{ $t('referrals.periodLog.reason') }}</th>
                                            <th class="text-left py-2 pr-4 text-gray-400 font-medium text-xs">{{ $t('referrals.periodLog.changedBy') }}</th>
                                            <th class="text-left py-2 text-gray-400 font-medium text-xs">{{ $t('referrals.periodLog.date') }}</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-100">
                                        <tr v-for="log in state.referral.period_logs" :key="log.uuid">
                                            <td class="py-2 pr-4 text-gray-600">
                                                {{ formatDateToReadable(log.previous_start_date) }} –
                                                {{ formatDateToReadable(log.previous_end_date) }}
                                            </td>
                                            <td class="py-2 pr-4 text-gray-600">
                                                {{ formatDateToReadable(log.new_start_date) }} –
                                                {{ formatDateToReadable(log.new_end_date) }}
                                            </td>
                                            <td class="py-2 pr-4 text-gray-600">{{ log.reason }}</td>
                                            <td class="py-2 pr-4 text-gray-600">{{ log.changed_by?.name }}</td>
                                            <td class="py-2 text-gray-600">{{ formatDateToReadable(log.created_at) }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p v-else class="text-sm text-gray-400">{{ $t('referrals.noPeriodLogs') }}</p>
                        </div>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { referralService } from '@/components/api/user/ReferralService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import type { Error } from '@/types'

const { formatDateToReadable } = useDatetimeFormatter()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedReferralUuid: {
        type: String,
        required: true,
    },
})

const emit = defineEmits(['close'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    referral: null as any,
})

function closeModal() {
    state.referral = null
    emit('close')
}

watch(() => props.isModalOpen, (newVal) => {
    if (newVal && props.selectedReferralUuid) {
        fetchReferral()
    }
})

watch(() => props.selectedReferralUuid, (newVal) => {
    if (newVal && props.isModalOpen) {
        fetchReferral()
    }
})

async function fetchReferral() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await referralService.getReferral(props.selectedReferralUuid)
        if (response?.data) {
            state.referral = response.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
