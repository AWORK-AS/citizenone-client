<template>
    <div>
        <Modal size="md" :title="$t('referrals.referral')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="submitForm()">
                        <Alert type="danger" :text="state.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="space-y-3">
                            <!-- Citizen read-only -->
                            <div class="space-y-1" v-if="state.referral?.citizen">
                                <FormLabel :label="$t('referrals.citizen')" />
                                <p class="text-sm font-medium text-gray-700">
                                    {{ state.referral.citizen.firstname }} {{ state.referral.citizen.lastname }}
                                </p>
                            </div>

                            <div class="space-y-1">
                                <FormLabel for="department_uuid" :label="$t('referrals.department')" />
                                <FormSelect id="department_uuid" :options="state.options.departments"
                                    :placeholder="$t('referrals.department')"
                                    v-model="state.formReferral.department_uuid" />
                                <FormError :error="state.error?.errors?.department_uuid?.[0]" />
                            </div>

                            <div class="grid grid-cols-2 gap-3">
                                <div class="space-y-1">
                                    <FormLabel for="start_date" :label="$t('referrals.startDate')" />
                                    <FormDateField id="start_date" name="start_date"
                                        :placeholder="$t('referrals.startDate')"
                                        v-model="state.formReferral.start_date" />
                                    <FormError :error="v$?.formReferral?.start_date?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state.error?.errors?.start_date?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="weeks" :label="$t('referrals.weeks')" />
                                    <FormTextField id="weeks" name="weeks" type="number" min="1" max="520"
                                        :placeholder="$t('referrals.weeks')"
                                        v-model="state.formReferral.weeks"
                                        @input="onWeeksInput" />
                                    <FormError :error="state.error?.errors?.weeks?.[0]" />
                                </div>
                            </div>

                            <div class="space-y-1" v-if="calculatedEndDate && !state.formReferral.end_date">
                                <p class="text-xs text-gray-500">
                                    {{ $t('referrals.weeksCalculated') }}: <span class="font-medium">{{ calculatedEndDate }}</span>
                                </p>
                            </div>

                            <div class="space-y-1">
                                <FormLabel for="end_date" :label="$t('referrals.endDate')" />
                                <FormDateField id="end_date" name="end_date"
                                    :placeholder="$t('referrals.endDate')"
                                    v-model="state.formReferral.end_date" />
                                <FormError :error="state.error?.errors?.end_date?.[0]" />
                            </div>

                            <!-- Period change reason - shown when dates differ from original -->
                            <div class="space-y-1" v-if="periodChanged">
                                <FormLabel for="period_change_reason" :label="$t('referrals.periodChangeReason')" />
                                <FormTextArea id="period_change_reason" name="period_change_reason"
                                    :placeholder="$t('referrals.periodChangeReason')"
                                    v-model="state.formReferral.period_change_reason" />
                                <FormError :error="state.error?.errors?.period_change_reason?.[0]" />
                            </div>

                            <div class="space-y-1">
                                <FormLabel for="status" :label="$t('referrals.status')" />
                                <FormSelect id="status" :options="state.options.statuses"
                                    v-model="state.formReferral.status" />
                                <FormError :error="state.error?.errors?.status?.[0]" />
                            </div>

                            <div class="space-y-1">
                                <FormLabel for="municipality" :label="$t('referrals.municipality')" />
                                <FormTextField id="municipality" name="municipality"
                                    :placeholder="$t('referrals.municipality')"
                                    v-model="state.formReferral.municipality" />
                                <FormError :error="state.error?.errors?.municipality?.[0]" />
                            </div>

                            <div class="space-y-1">
                                <FormLabel for="caseworker_name" :label="$t('referrals.caseworkerName')" />
                                <FormTextField id="caseworker_name" name="caseworker_name"
                                    :placeholder="$t('referrals.caseworkerName')"
                                    v-model="state.formReferral.caseworker_name" />
                                <FormError :error="state.error?.errors?.caseworker_name?.[0]" />
                            </div>

                            <div class="space-y-1">
                                <FormLabel for="caseworker_email" :label="$t('referrals.caseworkerEmail')" />
                                <FormTextField id="caseworker_email" name="caseworker_email" type="email"
                                    :placeholder="$t('referrals.caseworkerEmail')"
                                    v-model="state.formReferral.caseworker_email" />
                                <FormError :error="state.error?.errors?.caseworker_email?.[0]" />
                            </div>

                            <div class="space-y-1">
                                <FormLabel for="caseworker_phone" :label="$t('referrals.caseworkerPhone')" />
                                <FormTextField id="caseworker_phone" name="caseworker_phone"
                                    :placeholder="$t('referrals.caseworkerPhone')"
                                    v-model="state.formReferral.caseworker_phone" />
                                <FormError :error="state.error?.errors?.caseworker_phone?.[0]" />
                            </div>

                            <div class="space-y-1">
                                <FormLabel for="notes" :label="$t('referrals.notes')" />
                                <FormTextArea id="notes" name="notes" :placeholder="$t('referrals.notes')"
                                    v-model="state.formReferral.notes" />
                                <FormError :error="state.error?.errors?.notes?.[0]" />
                            </div>
                        </div>

                        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="submit" buttonStyle="primary">
                                {{ $t('update') }}
                            </FormButton>
                        </div>
                    </form>

                    <!-- Period logs section -->
                    <div class="mt-8" v-if="state.referral">
                        <h3 class="text-sm font-semibold text-gray-700 mb-3">{{ $t('referrals.periodLogs') }}</h3>
                        <div v-if="state.referral?.period_logs?.length > 0" class="table-responsive">
                            <table class="min-w-full divide-y divide-gray-200 text-sm">
                                <thead>
                                    <tr>
                                        <th class="text-left py-2 pr-4 text-gray-500 font-medium text-xs">{{ $t('referrals.periodLog.previousPeriod') }}</th>
                                        <th class="text-left py-2 pr-4 text-gray-500 font-medium text-xs">{{ $t('referrals.periodLog.newPeriod') }}</th>
                                        <th class="text-left py-2 pr-4 text-gray-500 font-medium text-xs">{{ $t('referrals.periodLog.reason') }}</th>
                                        <th class="text-left py-2 pr-4 text-gray-500 font-medium text-xs">{{ $t('referrals.periodLog.changedBy') }}</th>
                                        <th class="text-left py-2 text-gray-500 font-medium text-xs">{{ $t('referrals.periodLog.date') }}</th>
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
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { referralService } from '@/components/api/user/ReferralService'
import { departmentService } from '@/components/api/user/DepartmentService'
import { useVuelidate } from '@vuelidate/core'
import { required, helpers } from '@vuelidate/validators'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import moment from 'moment'
import type { Error } from '@/types'

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

const emit = defineEmits(['close', 'refreshReferrals'])
const { successAlert } = useAlert()
const { t } = useI18n()
const { formatDateToReadable } = useDatetimeFormatter()

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    referral: null as any,
    originalStartDate: '',
    originalEndDate: '',
    formReferral: {
        department_uuid: '',
        start_date: '',
        end_date: '',
        weeks: null as number | null,
        period_change_reason: '',
        status: 'active',
        municipality: '',
        caseworker_name: '',
        caseworker_email: '',
        caseworker_phone: '',
        notes: '',
    },
    options: {
        departments: [] as any[],
        statuses: [] as any[],
    },
})

const calculatedEndDate = computed(() => {
    if (state.formReferral.start_date && state.formReferral.weeks) {
        return moment(state.formReferral.start_date).add(state.formReferral.weeks, 'weeks').format('DD. MMMM YYYY')
    }
    return null
})

const periodChanged = computed(() => {
    return (
        (state.formReferral.start_date && state.formReferral.start_date !== state.originalStartDate) ||
        (state.formReferral.end_date && state.formReferral.end_date !== state.originalEndDate)
    )
})

const rules = computed(() => ({
    formReferral: {
        start_date: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
    },
}))

const v$ = useVuelidate(rules, state)

watch(() => props.isModalOpen, (newVal) => {
    if (newVal && props.selectedReferralUuid) {
        loadData()
    }
})

watch(() => props.selectedReferralUuid, (newVal) => {
    if (newVal && props.isModalOpen) {
        loadData()
    }
})

function onWeeksInput() {
    if (state.formReferral.weeks) {
        state.formReferral.end_date = ''
    }
}

function closeModal() {
    state.error = {}
    state.referral = null
    emit('close')
}

async function loadData() {
    state.error = {}
    state.isPageLoading = true
    try {
        state.options.statuses = [
            { value: 'active', label: t('referrals.statusActive') },
            { value: 'pending', label: t('referrals.statusPending') },
            { value: 'closed', label: t('referrals.statusClosed') },
        ]
        await Promise.all([fetchReferral(), fetchDepartments()])
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchReferral() {
    const response = await referralService.getReferral(props.selectedReferralUuid)
    if (response?.data) {
        const r = response.data
        state.referral = r
        state.originalStartDate = r.start_date ?? ''
        state.originalEndDate = r.end_date ?? ''
        state.formReferral = {
            department_uuid: r.department?.uuid ?? '',
            start_date: r.start_date ?? '',
            end_date: r.end_date ?? '',
            weeks: r.weeks ?? null,
            period_change_reason: '',
            status: r.status ?? 'active',
            municipality: r.municipality ?? '',
            caseworker_name: r.caseworker_name ?? '',
            caseworker_email: r.caseworker_email ?? '',
            caseworker_phone: r.caseworker_phone ?? '',
            notes: r.notes ?? '',
        }
    }
}

async function fetchDepartments() {
    const response = await departmentService.getAllDepartments({})
    if (response?.data) {
        state.options.departments = response.data.map((d: any) => ({
                value: d.uuid,
                label: d.name,
            }))
    }
}

async function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (v$.value.$error) return

    state.isPageLoading = true
    try {
        const params: any = {
            start_date: state.formReferral.start_date,
            status: state.formReferral.status,
        }
        if (state.formReferral.department_uuid && state.formReferral.department_uuid !== 'all-departments') params.department_uuid = state.formReferral.department_uuid
        if (state.formReferral.end_date) params.end_date = state.formReferral.end_date
        if (state.formReferral.weeks) params.weeks = parseInt(state.formReferral.weeks as any)
        if (periodChanged.value && state.formReferral.period_change_reason) {
            params.period_change_reason = state.formReferral.period_change_reason
        }
        if (state.formReferral.municipality) params.municipality = state.formReferral.municipality
        if (state.formReferral.caseworker_name) params.caseworker_name = state.formReferral.caseworker_name
        if (state.formReferral.caseworker_email) params.caseworker_email = state.formReferral.caseworker_email
        if (state.formReferral.caseworker_phone) params.caseworker_phone = state.formReferral.caseworker_phone
        params.notes = state.formReferral.notes ?? ''

        const response = await referralService.updateReferral(props.selectedReferralUuid, params)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('referrals.alert.referralSuccessfullyUpdated')}.`)
            emit('refreshReferrals')
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
