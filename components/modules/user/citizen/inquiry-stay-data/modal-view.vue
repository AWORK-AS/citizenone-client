<template>
    <div>
        <Modal size="md" :title="$t('citizens.inquiryStayData.inquiryAndStayData')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div class="space-y-1">
                    <h3 class="text-sm font-semibold">
                        {{ $t('citizens.inquiryStayData.inquiryData.inquiryData') }}
                    </h3>
                    <div class="flex items-center gap-x-1 text-sm">
                        <p>
                            {{ $t('citizens.inquiryStayData.inquiryData.dateOfInquiry') }}:
                        </p>
                        <p>
                            {{ formatDateToReadable(props?.selectedCitizen?.data?.inquiry_data?.inquiry_date) }}
                        </p>
                    </div>
                    <div class="flex items-center gap-x-1 text-sm">
                        <p>
                            {{ $t('citizens.inquiryStayData.inquiryData.inquirerName') }}:
                        </p>
                        <p>
                            {{ props?.selectedCitizen?.data?.inquiry_data?.inquirer_name }}
                        </p>
                    </div>
                    <div class="flex items-center gap-x-1 text-sm">
                        <p>
                            {{ $t('citizens.inquiryStayData.inquiryData.purpose') }}:
                        </p>
                        <p>
                            {{ props?.selectedCitizen?.data?.inquiry_data?.purpose }}
                        </p>
                    </div>
                    <div class="flex items-center gap-x-1 text-sm">
                        <p>
                            {{ $t('citizens.inquiryStayData.inquiryData.outcome') }}:
                        </p>
                        <p>
                            {{ props?.selectedCitizen?.data?.inquiry_data?.outcome }}
                        </p>
                    </div>
                </div>
                <div class="mt-5 space-y-1">
                    <h3 class="text-sm font-semibold">
                        {{ $t('citizens.inquiryStayData.stayData.stayData') }}
                    </h3>
                    <div class="flex items-center gap-x-1 text-sm">
                        <p>
                            {{ $t('citizens.inquiryStayData.stayData.journalNumber') }}:
                        </p>
                        <p>
                            {{ props?.selectedCitizen?.data?.stay_data?.journal_number }}
                        </p>
                    </div>
                    <div class="flex items-center gap-x-1 text-sm">
                        <p>
                            {{ $t('citizens.inquiryStayData.stayData.accommodationStartDate') }}:
                        </p>
                        <p>
                            {{ formatDateToReadable(props?.selectedCitizen?.data?.stay_data?.start_date) }}
                        </p>
                    </div>
                    <div class="flex items-center gap-x-1 text-sm">
                        <p>
                            {{ $t('citizens.inquiryStayData.stayData.accommodationEndDate') }}:
                        </p>
                        <p>
                            {{ formatDateToReadable(props?.selectedCitizen?.data?.stay_data?.end_date) }}
                        </p>
                    </div>
                    <div class="flex items-center gap-x-1 text-sm">
                        <p>
                            {{ $t('citizens.inquiryStayData.stayData.municipalityOfResidenceBefore') }}:
                        </p>
                        <p>
                            {{ props?.selectedCitizen?.data?.stay_data?.residence_before_municipality?.name }}
                        </p>
                    </div>
                    <div class="flex items-center gap-x-1 text-sm">
                        <p>
                            {{ $t('citizens.inquiryStayData.stayData.municipalityOfResidenceAfter') }}:
                        </p>
                        <p>
                            {{ props?.selectedCitizen?.data?.stay_data?.residence_after_municipality?.name }}
                        </p>
                    </div>
                    <div class="flex items-center gap-x-1 text-sm">
                        <p>
                            {{ $t('citizens.inquiryStayData.stayData.dischargeReason') }}:
                        </p>
                        <p>
                            {{ props?.selectedCitizen?.data?.stay_data?.discharge_reason }}
                        </p>
                    </div>
                    <div class="text-sm">
                        <p>
                            {{ $t('citizens.inquiryStayData.stayData.accompanyingChildren.accompanyingChildren') }}:
                        </p>
                        <div class="divide-y divide-gray-300 divide-dashed">
                            <div v-for="(child, index) in props?.selectedCitizen?.data?.stay_data?.accompanying_children"
                                :key="index" class="ml-3">
                                <div class="space-y-1 py-2">
                                    <div class="flex items-center gap-x-1 text-sm">
                                        <p>
                                            {{ $t('citizens.inquiryStayData.stayData.accompanyingChildren.name') }}:
                                        </p>
                                        <p>
                                            {{ child?.name }}
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-x-1 text-sm">
                                        <p>
                                            {{ $t('citizens.inquiryStayData.stayData.accompanyingChildren.gender') }}:
                                        </p>
                                        <p>
                                            <span v-if="child?.gender === 'male'">
                                                {{ $t('gender.male') }}
                                            </span>
                                            <span v-if="child?.gender === 'female'">
                                                {{ $t('gender.female') }}
                                            </span>
                                            <span v-if="child?.gender === 'non_binary'">
                                                {{ $t('gender.nonbinary') }}
                                            </span>
                                            <span v-if="child?.gender === 'will_not_disclose'">
                                                {{ $t('gender.willNotDisclose') }}
                                            </span>
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-x-1 text-sm">
                                        <p>
                                            {{ $t('citizens.inquiryStayData.stayData.accompanyingChildren.age') }}:
                                        </p>
                                        <p>
                                            {{ child?.age }}
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-x-1 text-sm">
                                        <p>
                                            {{ $t('citizens.inquiryStayData.stayData.accompanyingChildren.origin') }}:
                                        </p>
                                        <p>
                                            {{ child?.origin }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </Modal>
    </div>

</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import type { Error } from '@/types'

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