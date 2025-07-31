<template>
    <div>
        <Modal size="sm" :title="$t('dutySchedules.viewSchedule.viewSchedule')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div>
                    <div class="space-y-3">
                        <div class="flex items-center gap-x-1">
                            <p class="text-sm text-gray-600">
                                {{ $t('dutySchedules.viewSchedule.typeofShift') }}:
                            </p>
                            <p class="text-sm" v-if="language.locale.value === 'en'">
                                {{ props?.selectedEmployeeSchedule?.shift_type?.en_name }}
                            </p>
                            <p class="text-sm" v-if="language.locale.value === 'dk'">
                                {{ props?.selectedEmployeeSchedule?.shift_type?.dk_name }}
                            </p>
                        </div>
                        <div class="flex items-center gap-x-1">
                            <p class="text-sm text-gray-600">
                                {{ $t('dutySchedules.viewSchedule.datetimeStart') }}:
                            </p>
                            <p class="text-sm">
                                {{ formatDateTimeToReadable(props?.selectedEmployeeSchedule?.date_time_start) }}
                            </p>
                        </div>
                        <div class="flex items-center gap-x-1">
                            <p class="text-sm text-gray-600">
                                {{ $t('dutySchedules.viewSchedule.dateTimeEnd') }}:
                            </p>
                            <p class="text-sm">
                                {{ formatDateTimeToReadable(props?.selectedEmployeeSchedule?.date_time_start) }}
                            </p>
                        </div>
                        <div class="space-y-1">
                            <p class="text-sm text-gray-600">
                                {{ $t('dutySchedules.viewSchedule.citizens') }}:
                            </p>
                            <div class="text-sm">
                                <p v-for="(citizenSchedule, citizenScheduleIndex) in props?.selectedEmployeeSchedule?.citizen_schedules"
                                    :key="citizenScheduleIndex">
                                    {{ citizenSchedule?.citizen?.firstname }}
                                    {{ citizenSchedule?.citizen?.lastname }}
                                </p>
                            </div>
                        </div>
                        <div class="space-y-1">
                            <p class="text-sm text-gray-600">
                                {{ $t('dutySchedules.viewSchedule.departments') }}:
                            </p>
                            <p class="text-sm">
                                <span
                                    v-for="(department, departmentIndex) in props?.selectedEmployeeSchedule?.departments"
                                    :key="departmentIndex">
                                    {{ department?.name }}<span
                                        v-if="departmentIndex < props?.selectedEmployeeSchedule.departments.length - 1">,
                                    </span><span v-else>.</span>
                                </span>
                            </p>
                        </div>
                        <div class="space-y-1 text-sm">
                            <p class="text-gray-600">
                                {{ $t('dutySchedules.viewSchedule.note') }}:
                            </p>
                            <p v-html="props?.selectedEmployeeSchedule?.note?.replace(/\n/g, '<br>')" />
                        </div>
                        <div class="flex items-center flex-wrap gap-y-0.5 mt-1"
                            v-if="props?.selectedEmployeeSchedule?.tags?.length > 0">
                            <Tooltip :text="tag?.tag" v-for="(tag, tagIndex) in props?.selectedEmployeeSchedule?.tags"
                                :key="tagIndex">
                                <div class="text-white w-6 h-6 text-xxs rounded-full flex items-center justify-center"
                                    :style="{ backgroundColor: tag?.color }">
                                    <span v-if="tag?.tag">
                                        {{ tag?.tag?.charAt(0) }}
                                    </span>
                                </div>
                            </Tooltip>
                        </div>
                    </div>
                    <div class="mt-5 flex gap-x-3 justify-end">
                        <FormButton buttonStyle="cancel" @click="closeModal" class="rounded-md">
                            {{ $t('close') }}
                        </FormButton>
                    </div>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useI18n } from "vue-i18n"

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedEmployeeSchedule: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close'])
const language = useI18n()
const { formatDateTimeToReadable } = useDatetimeFormatter()

function closeModal() {
    emit('close')
}
</script>