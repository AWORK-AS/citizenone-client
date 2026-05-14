<template>
    <div>
        <Modal size="xs" :title="$t('dutySchedules.timeRange')" :show="props.isModalOpen" @close="emit('close')">
            <template #modal-body>
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <FormLabel :label="$t('dutySchedules.timeRange')" />
                        <button type="button"
                            v-if="localFrom || localTo"
                            @click="localFrom = ''; localTo = ''"
                            class="flex items-center gap-1 text-xs text-red-500 hover:text-red-700">
                            <Icon name="ph:x-circle" class="h-3.5 w-3.5" />
                            {{ $t('clear') }}
                        </button>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <FormLabel for="tr_time_from" :label="$t('dutySchedules.filter.timeFrom')" />
                            <FormTimeField id="tr_time_from" name="tr_time_from"
                                :placeholder="$t('dutySchedules.filter.timeFrom')"
                                v-model:value="localFrom" />
                        </div>
                        <div>
                            <FormLabel for="tr_time_to" :label="$t('dutySchedules.filter.timeTo')" />
                            <FormTimeField id="tr_time_to" name="tr_time_to"
                                :placeholder="$t('dutySchedules.filter.timeTo')"
                                v-model:value="localTo" />
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3 mt-4">
                        <FormButton type="button" buttonStyle="cancel" @click="emit('close')">
                            {{ $t('cancel') }}
                        </FormButton>
                        <FormButton type="button" buttonStyle="primary" @click="apply()">
                            {{ $t('filter') }}
                        </FormButton>
                    </div>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    timeFrom: {
        type: String,
        default: '',
    },
    timeTo: {
        type: String,
        default: '',
    },
})

const emit = defineEmits(['close', 'setTimeRange'])

const localFrom = ref(props.timeFrom)
const localTo = ref(props.timeTo)

watch(() => props.isModalOpen, (isOpen: boolean) => {
    if (isOpen) {
        localFrom.value = props.timeFrom
        localTo.value = props.timeTo
    }
})

function apply() {
    emit('setTimeRange', { time_from: localFrom.value, time_to: localTo.value })
    emit('close')
}
</script>
