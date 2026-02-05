<template>
    <div>
        <Modal size="sm" :title="$t('dutySchedules.normHours.compensatoryHours')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div class="space-y-1">
                    <div class="flex items-center gap-x-1">
                        <p class="text-sm">
                            {{ $t('dutySchedules.normHours.compensatoryHoursThisYear') }}
                            ({{ props.selectedEmployee?.norm_period?.period ?? '' }}):
                        </p>
                        <p :class="[
                            props.selectedEmployee?.current_norm_hours?.compensatory_hours > 0 ? 'text-green-700' : 'text-red-700',
                            'text-sm'
                        ]">
                            {{
                                formatNumber(language.locale.value,
                                    props.selectedEmployee?.current_norm_hours?.compensatory_hours || 0)
                            }}
                        </p>
                    </div>
                    <div class="flex items-center gap-x-1">
                        <p class="text-sm">
                            {{ $t('dutySchedules.normHours.compensatoryHourFromPreviousYear') }}
                            ({{ props.selectedEmployee?.norm_period?.previous_period ?? '' }}):
                        </p>
                        <p :class="[
                            props.selectedEmployee?.previous_year_norm_hours?.compensatory_hours > 0 ? 'text-green-700' : 'text-red-700',
                            'text-sm'
                        ]">
                            {{
                                formatNumber(language.locale.value,
                                    props.selectedEmployee?.previous_year_norm_hours?.compensatory_hours || 0)
                            }}
                        </p>
                    </div>
                    <div class="flex items-center gap-x-1">
                        <p class="text-sm">
                            {{ $t('dutySchedules.normHours.totalCompensatoryHours') }}:
                        </p>
                        <p :class="[
                            props.selectedEmployee?.total_norm_hours?.compensatory_hours > 0 ? 'text-green-700' : 'text-red-700',
                            'text-sm'
                        ]">
                            {{
                                formatNumber(language.locale.value,
                                    props.selectedEmployee?.total_norm_hours?.compensatory_hours || 0)
                            }}
                        </p>
                    </div>
                </div>
                <div class="mt-5 flex justify-end">
                    <FormButton buttonStyle="cancel" @click="closeModal" class="rounded-md">
                        {{ $t('close') }}
                    </FormButton>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { useNumberFormatter } from '@/composables/numberFormatter'
import { useI18n } from "vue-i18n"

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
const emit = defineEmits(['close'])
const language = useI18n()
const { formatNumber } = useNumberFormatter()

function closeModal() {
    emit('close')
}
</script>