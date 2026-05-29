<template>
    <div>
        <Modal size="xl" :title="$t('citizens.sections.employmentProgram')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div class="rounded-lg border border-gray-200 overflow-hidden">
                    <dl class="divide-y divide-gray-100">
                        <!-- Case Type -->
                        <div v-if="props?.selectedCitizen?.data?.employment_profile?.case_type?.name"
                            class="grid grid-cols-5 px-4 py-2.5">
                            <dt class="col-span-2 text-xs text-gray-500 self-center">
                                {{ $t('citizens.form.employmentProgram.caseType') }}
                            </dt>
                            <dd class="col-span-3 text-sm text-gray-800 font-medium">
                                {{ props?.selectedCitizen?.data?.employment_profile?.case_type?.name }}
                            </dd>
                        </div>
                        <!-- Status -->
                        <div v-if="props?.selectedCitizen?.data?.employment_profile?.status_type?.name"
                            class="grid grid-cols-5 px-4 py-2.5">
                            <dt class="col-span-2 text-xs text-gray-500 self-center">
                                {{ $t('citizens.form.employmentProgram.status') }}
                            </dt>
                            <dd class="col-span-3 text-sm text-gray-800 font-medium">
                                {{ props?.selectedCitizen?.data?.employment_profile?.status_type?.name }}
                            </dd>
                        </div>
                        <!-- Financial Support Basis -->
                        <div v-if="props?.selectedCitizen?.data?.employment_profile?.financial_support_basis"
                            class="grid grid-cols-5 px-4 py-2.5">
                            <dt class="col-span-2 text-xs text-gray-500 self-center">
                                {{ $t('citizens.form.employmentProgram.financialSupportBasis') }}
                            </dt>
                            <dd class="col-span-3 text-sm text-gray-800 font-medium">
                                {{ props?.selectedCitizen?.data?.employment_profile?.financial_support_basis }}
                            </dd>
                        </div>
                        <!-- Language -->
                        <div v-if="props?.selectedCitizen?.data?.employment_profile?.language"
                            class="grid grid-cols-5 px-4 py-2.5">
                            <dt class="col-span-2 text-xs text-gray-500 self-center">
                                {{ $t('citizens.form.employmentProgram.language') }}
                            </dt>
                            <dd class="col-span-3 text-sm text-gray-800 font-medium">
                                {{ props?.selectedCitizen?.data?.employment_profile?.language }}
                            </dd>
                        </div>
                        <!-- Primary Consultant -->
                        <div v-if="props?.selectedCitizen?.data?.employment_profile?.primary_consultant"
                            class="grid grid-cols-5 px-4 py-2.5">
                            <dt class="col-span-2 text-xs text-gray-500 self-center">
                                {{ $t('citizens.form.employmentProgram.primaryConsultant') }}
                            </dt>
                            <dd class="col-span-3 text-sm text-gray-800 font-medium">
                                {{ props?.selectedCitizen?.data?.employment_profile?.primary_consultant?.firstname }}
                                {{ props?.selectedCitizen?.data?.employment_profile?.primary_consultant?.lastname }}
                            </dd>
                        </div>
                        <!-- Secondary Consultant -->
                        <div v-if="props?.selectedCitizen?.data?.employment_profile?.secondary_consultant"
                            class="grid grid-cols-5 px-4 py-2.5">
                            <dt class="col-span-2 text-xs text-gray-500 self-center">
                                {{ $t('citizens.form.employmentProgram.secondaryConsultant') }}
                            </dt>
                            <dd class="col-span-3 text-sm text-gray-800 font-medium">
                                {{ props?.selectedCitizen?.data?.employment_profile?.secondary_consultant?.firstname }}
                                {{ props?.selectedCitizen?.data?.employment_profile?.secondary_consultant?.lastname }}
                            </dd>
                        </div>

                        <!-- Referrer sub-section header -->
                        <div v-if="props?.selectedCitizen?.data?.employment_profile?.referrer_name ||
                                   props?.selectedCitizen?.data?.employment_profile?.referrer_organization ||
                                   props?.selectedCitizen?.data?.employment_profile?.referrer_phone ||
                                   props?.selectedCitizen?.data?.employment_profile?.referrer_email"
                            class="px-4 py-2.5 bg-gray-50/60">
                            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {{ $t('citizens.form.employmentProgram.referrerInfo') }}
                            </p>
                        </div>
                        <!-- Referrer Name -->
                        <div v-if="props?.selectedCitizen?.data?.employment_profile?.referrer_name"
                            class="grid grid-cols-5 px-4 py-2.5">
                            <dt class="col-span-2 text-xs text-gray-500 self-center">
                                {{ $t('citizens.form.employmentProgram.referrerName') }}
                            </dt>
                            <dd class="col-span-3 text-sm text-gray-800 font-medium">
                                {{ props?.selectedCitizen?.data?.employment_profile?.referrer_name }}
                            </dd>
                        </div>
                        <!-- Referrer Organization -->
                        <div v-if="props?.selectedCitizen?.data?.employment_profile?.referrer_organization"
                            class="grid grid-cols-5 px-4 py-2.5">
                            <dt class="col-span-2 text-xs text-gray-500 self-center">
                                {{ $t('citizens.form.employmentProgram.referrerOrganization') }}
                            </dt>
                            <dd class="col-span-3 text-sm text-gray-800 font-medium">
                                {{ props?.selectedCitizen?.data?.employment_profile?.referrer_organization }}
                            </dd>
                        </div>
                        <!-- Referrer Phone -->
                        <div v-if="props?.selectedCitizen?.data?.employment_profile?.referrer_phone"
                            class="grid grid-cols-5 px-4 py-2.5">
                            <dt class="col-span-2 text-xs text-gray-500 self-center">
                                {{ $t('citizens.form.employmentProgram.referrerPhone') }}
                            </dt>
                            <dd class="col-span-3 text-sm text-gray-800 font-medium">
                                {{ props?.selectedCitizen?.data?.employment_profile?.referrer_phone }}
                            </dd>
                        </div>
                        <!-- Referrer Email -->
                        <div v-if="props?.selectedCitizen?.data?.employment_profile?.referrer_email"
                            class="grid grid-cols-5 px-4 py-2.5">
                            <dt class="col-span-2 text-xs text-gray-500 self-center">
                                {{ $t('citizens.form.employmentProgram.referrerEmail') }}
                            </dt>
                            <dd class="col-span-3 text-sm text-gray-800 font-medium">
                                {{ props?.selectedCitizen?.data?.employment_profile?.referrer_email }}
                            </dd>
                        </div>
                        <!-- Referral Date -->
                        <div v-if="props?.selectedCitizen?.data?.employment_profile?.referral_date"
                            class="grid grid-cols-5 px-4 py-2.5">
                            <dt class="col-span-2 text-xs text-gray-500 self-center">
                                {{ $t('citizens.form.employmentProgram.referralDate') }}
                            </dt>
                            <dd class="col-span-3 text-sm text-gray-800 font-medium">
                                {{ formatDateToReadable(props?.selectedCitizen?.data?.employment_profile?.referral_date) }}
                            </dd>
                        </div>
                        <!-- Case Start Date -->
                        <div v-if="props?.selectedCitizen?.data?.employment_profile?.case_start_date"
                            class="grid grid-cols-5 px-4 py-2.5">
                            <dt class="col-span-2 text-xs text-gray-500 self-center">
                                {{ $t('citizens.form.employmentProgram.caseStartDate') }}
                            </dt>
                            <dd class="col-span-3 text-sm text-gray-800 font-medium">
                                {{ formatDateToReadable(props?.selectedCitizen?.data?.employment_profile?.case_start_date) }}
                            </dd>
                        </div>
                        <!-- Case End Date -->
                        <div v-if="props?.selectedCitizen?.data?.employment_profile?.case_end_date"
                            class="grid grid-cols-5 px-4 py-2.5">
                            <dt class="col-span-2 text-xs text-gray-500 self-center">
                                {{ $t('citizens.form.employmentProgram.caseEndDate') }}
                            </dt>
                            <dd class="col-span-3 text-sm text-gray-800 font-medium">
                                {{ formatDateToReadable(props?.selectedCitizen?.data?.employment_profile?.case_end_date) }}
                            </dd>
                        </div>
                        <!-- Total Weeks -->
                        <div v-if="props?.selectedCitizen?.data?.employment_profile?.total_weeks"
                            class="grid grid-cols-5 px-4 py-2.5">
                            <dt class="col-span-2 text-xs text-gray-500 self-center">
                                {{ $t('citizens.form.employmentProgram.totalWeeks') }}
                            </dt>
                            <dd class="col-span-3 text-sm text-gray-800 font-medium">
                                {{ props?.selectedCitizen?.data?.employment_profile?.total_weeks }}
                            </dd>
                        </div>
                        <!-- Weeks Used -->
                        <div v-if="props?.selectedCitizen?.data?.employment_profile?.weeks_used"
                            class="grid grid-cols-5 px-4 py-2.5">
                            <dt class="col-span-2 text-xs text-gray-500 self-center">
                                {{ $t('citizens.form.employmentProgram.weeksUsed') }}
                            </dt>
                            <dd class="col-span-3 text-sm text-gray-800 font-medium">
                                {{ props?.selectedCitizen?.data?.employment_profile?.weeks_used }}
                            </dd>
                        </div>
                        <!-- Activation Deadline -->
                        <div v-if="props?.selectedCitizen?.data?.employment_profile?.activation_deadline"
                            class="grid grid-cols-5 px-4 py-2.5">
                            <dt class="col-span-2 text-xs text-gray-500 self-center">
                                {{ $t('citizens.form.employmentProgram.activationDeadline') }}
                            </dt>
                            <dd class="col-span-3 text-sm text-gray-800 font-medium">
                                {{ formatDateToReadable(props?.selectedCitizen?.data?.employment_profile?.activation_deadline) }}
                            </dd>
                        </div>
                        <!-- Reporting Requirements -->
                        <div v-if="props?.selectedCitizen?.data?.employment_profile?.reporting_requirements"
                            class="px-4 py-2.5 space-y-1">
                            <dt class="text-xs text-gray-500">
                                {{ $t('citizens.form.employmentProgram.reportingRequirements') }}
                            </dt>
                            <dd class="text-sm text-gray-800 bg-gray-50 rounded-md px-3 py-2">
                                {{ props?.selectedCitizen?.data?.employment_profile?.reporting_requirements }}
                            </dd>
                        </div>
                        <!-- Referral Reason -->
                        <div v-if="props?.selectedCitizen?.data?.employment_profile?.referral_reason"
                            class="px-4 py-2.5 space-y-1">
                            <dt class="text-xs text-gray-500">
                                {{ $t('citizens.form.employmentProgram.referralReason') }}
                            </dt>
                            <dd class="text-sm text-gray-800 bg-gray-50 rounded-md px-3 py-2">
                                {{ props?.selectedCitizen?.data?.employment_profile?.referral_reason }}
                            </dd>
                        </div>
                    </dl>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'

const { formatDateToReadable } = useDatetimeFormatter()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedCitizen: {
        type: Object,
        required: true,
    }
})

const emit = defineEmits(['close'])

function closeModal() {
    emit('close')
}
</script>
