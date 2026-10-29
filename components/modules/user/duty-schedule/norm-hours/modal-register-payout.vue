<template>
    <div>
        <Modal size="sm" :title="$t('dutySchedules.normHours.payout.title')"
            :show="props.isModalOpen && !state.modal.isConfirmationOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <Alert type="danger" :text="$t('dutySchedules.normHours.payout.noAccountAssigned')"
                        v-if="!state.isPageLoading && state.options.accounts.length === 0" />

                    <div class="space-y-3">
                        <div v-if="state.options.accounts.length > 1" class="space-y-1">
                            <FormLabel for="time_account_uuid" :label="$t('dutySchedules.normHours.payout.account')" />
                            <FormSelect id="time_account_uuid" name="time_account_uuid"
                                :options="state.options.accounts" v-model="state.formData.time_account_uuid" />
                        </div>

                        <div class="space-y-1">
                            <FormLabel for="payout_amount" :label="$t('dutySchedules.normHours.payout.amount')" />
                            <FormTextField id="payout_amount" name="payout_amount"
                                :placeholder="$t('dutySchedules.normHours.payout.amount')"
                                v-model="state.formData.amount" />
                            <FormError :error="state.amountError" />
                        </div>

                        <div class="space-y-1">
                            <FormLabel for="payout_date" :label="$t('dutySchedules.normHours.payout.date')" />
                            <FormDateField id="payout_date" name="payout_date"
                                :placeholder="$t('dutySchedules.normHours.payout.date')"
                                v-model="state.formData.date" />
                            <p class="text-xs text-gray-500">{{ $t('dutySchedules.normHours.payout.dateHint') }}</p>
                        </div>

                        <div class="mt-6">
                            <FormButton type="button" class="w-full" buttonStyle="primary"
                                :disabled="state.options.accounts.length === 0" @click="handleSubmit">
                                {{ $t('dutySchedules.normHours.payout.register') }}
                            </FormButton>
                        </div>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>

        <DialogConfirmation :isModalOpen="state.modal.isConfirmationOpen"
            :message="confirmationMessage"
            @close="state.modal.isConfirmationOpen = false"
            @confirm="submitPayout" />
    </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import moment from 'moment'
import { timeAccountService } from '@/components/api/user/TimeAccountService'
import { dutyScheduleService } from '@/components/api/user/DutyScheduleService'
import { useAlert } from '@/composables/alert'
import { useNumberFormatter } from '@/composables/numberFormatter'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const { successAlert } = useAlert()
const language = useI18n()
const { t } = language
const { formatNumber } = useNumberFormatter()
const userStore = useUserStore() as any

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedEmployee: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['close', 'success'])

const state = reactive({
    error: {} as Error,
    amountError: '',
    isPageLoading: false,
    formData: {
        time_account_uuid: '',
        amount: '',
        date: '',
    },
    options: {
        accounts: [] as any[],
    },
    // The employee's compensatory balance for the current norm period - the figure
    // the payout is checked against - so the confirmation can warn before it goes
    // below zero. Null when it could not be read; the warning is then left out.
    balance: null as number | null,
    modal: {
        isConfirmationOpen: false,
    },
})

const employeeName = computed(() => {
    return `${props.selectedEmployee?.firstname ?? ''} ${props.selectedEmployee?.lastname ?? ''}`.trim()
})

const payoutBeyondBalanceEnabled = computed(() => !!userStore.getUser?.company?.payout_beyond_balance_enabled)

const confirmationMessage = computed(() => {
    const message = t('dutySchedules.normHours.payout.confirmation', {
        amount: state.formData.amount,
        employee: employeeName.value,
    })

    const amount = Number(state.formData.amount)
    if (!payoutBeyondBalanceEnabled.value || state.balance === null || amount <= state.balance) {
        return message
    }

    const warning = t('dutySchedules.normHours.payout.negativeBalanceWarning', {
        employee: employeeName.value,
        balance: formatNumber(language.locale.value, state.balance),
        after: formatNumber(language.locale.value, state.balance - amount),
    })

    return `${warning} ${message}`
})

watch(() => props.isModalOpen, async (isModalOpen: boolean) => {
    if (isModalOpen) {
        state.error = {}
        state.amountError = ''
        state.formData.amount = ''
        state.formData.time_account_uuid = ''
        state.formData.date = moment().format('YYYY-MM-DD')
        state.balance = null
        await Promise.all([fetchAssignedAccounts(), fetchBalance()])
    }
})

async function fetchBalance() {
    const normPeriod = props.selectedEmployee?.norm_period
    if (!payoutBeyondBalanceEnabled.value || !normPeriod?.period_start || !normPeriod?.period_end) {
        return
    }

    try {
        const response = await dutyScheduleService.getCompensatoryVacationHours({
            user_uuid: props.selectedEmployee.uuid,
            start_date: moment(normPeriod.period_start).format('YYYY-MM-DD'),
            end_date: moment(normPeriod.period_end).format('YYYY-MM-DD'),
        })
        const total = response?.data?.total_compensatory_hours
        state.balance = total === undefined || total === null ? null : Number(total)
    } catch {
        // Without the balance the payout still works; only the warning is missing.
        state.balance = null
    }
}

async function fetchAssignedAccounts() {
    state.isPageLoading = true
    try {
        const response = await timeAccountService.getAssignedAccounts(props.selectedEmployee?.uuid)
        if (response?.data) {
            state.options.accounts = response.data.map((account: any) => ({
                value: account.uuid,
                label: account.name,
            }))
            if (state.options.accounts.length === 1) {
                state.formData.time_account_uuid = state.options.accounts[0].value
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function closeModal() {
    emit('close')
}

function handleSubmit() {
    state.amountError = ''
    const amount = Number(state.formData.amount)

    if (!amount || amount <= 0) {
        state.amountError = t('dutySchedules.normHours.payout.amountRequired')
        return
    }
    if (!state.formData.time_account_uuid) {
        state.error = { message: t('dutySchedules.normHours.payout.accountRequired') }
        return
    }

    state.modal.isConfirmationOpen = true
}

async function submitPayout() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            user_uuid: props.selectedEmployee?.uuid,
            amount: Number(state.formData.amount),
            date: state.formData.date || undefined,
        }
        const response = await timeAccountService.registerPayout(state.formData.time_account_uuid, params)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.normHours.payout.alert.registerSuccess')}.`)
            emit('success')
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
