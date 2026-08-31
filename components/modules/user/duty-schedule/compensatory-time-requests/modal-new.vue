<template>
    <div>
        <Modal size="sm" :title="$t('dutySchedules.compensatoryTimeRequests.newRequest')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="space-y-3">
                        <div class="flex items-center gap-x-1">
                            <p class="text-sm text-gray-600">
                                {{ $t('dutySchedules.compensatoryTimeRequests.shift') }}:
                            </p>
                            <p class="text-sm">
                                {{ formatDateTimeToReadable(props.schedule?.date_time_start) }} -
                                {{ formatDateTimeToReadable(props.schedule?.date_time_end) }}
                            </p>
                        </div>
                        <div class="flex items-center gap-x-1">
                            <p class="text-sm text-gray-600">
                                {{ $t('dutySchedules.compensatoryTimeRequests.hours') }}:
                            </p>
                            <p class="text-sm">
                                {{ formatNumber(language.locale.value, computedHours) }}
                            </p>
                        </div>
                        <div class="space-y-1" v-if="state.options.timeAccounts.length > 1">
                            <FormLabel for="time_account"
                                :label="$t('dutySchedules.compensatoryTimeRequests.timeAccount')" />
                            <FormSelect id="time_account" name="time_account" :options="state.options.timeAccounts"
                                v-model="state.formRequest.time_account_uuid" />
                        </div>
                        <Alert type="warning" :text="$t('dutySchedules.compensatoryTimeRequests.noAccount')"
                            v-if="!state.isPageLoading && state.options.timeAccounts.length === 0" />
                    </div>
                    <div class="mt-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" @click="closeModal"
                                :disabled="state.isPageLoading">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="primary"
                                :disabled="state.isPageLoading || state.options.timeAccounts.length === 0"
                                @click="submitRequest">
                                {{ $t('dutySchedules.compensatoryTimeRequests.sendRequest') }}
                            </FormButton>
                        </div>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { compensatoryTimeRequestService } from '@/components/api/user/CompensatoryTimeRequestService'
import { timeAccountService } from '@/components/api/user/TimeAccountService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useNumberFormatter } from '@/composables/numberFormatter'
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    schedule: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'success'])

const { formatDateTimeToReadable } = useDatetimeFormatter()
const { formatNumber } = useNumberFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const language = useI18n()
const userStore = useUserStore() as any

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formRequest: {
        time_account_uuid: '',
    },
    options: {
        timeAccounts: [] as any,
    },
})

const computedHours = computed(() => {
    const start = props.schedule?.date_time_start
    const end = props.schedule?.date_time_end
    if (!start || !end) return 0
    return Math.round((moment(end).diff(moment(start), 'minutes') / 60) * 100) / 100
})

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        state.error = {}
        state.formRequest.time_account_uuid = ''
        fetchTimeAccounts()
    }
})

function closeModal() {
    if (state.isPageLoading) return
    emit('close')
}

async function fetchTimeAccounts() {
    state.isPageLoading = true
    try {
        const response = await timeAccountService.getAssignedAccounts(userStore.getUser?.uuid)
        if (response) {
            state.options.timeAccounts = (response.data || []).map((account: any) => ({
                value: account.uuid,
                label: account.name,
            }))
            if (state.options.timeAccounts.length === 1) {
                state.formRequest.time_account_uuid = state.options.timeAccounts[0].value
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function submitRequest() {
    state.error = {}
    if (state.options.timeAccounts.length > 1 && !state.formRequest.time_account_uuid) {
        state.error = { message: t('dutySchedules.compensatoryTimeRequests.selectAccount') } as Error
        return
    }
    state.isPageLoading = true
    try {
        const params = {
            schedule_uuid: props.schedule?.scheduleUuid,
            time_account_uuid: state.formRequest.time_account_uuid || undefined,
        }
        const response = await compensatoryTimeRequestService.saveCompensatoryTimeRequest(params)
        if (response) {
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.compensatoryTimeRequests.alert.requestSuccessfullySent')}.`)
            state.isPageLoading = false
            emit('success')
            closeModal()
            return
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
