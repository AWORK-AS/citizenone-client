<template>
    <div>
        <Modal size="md" :title="props?.selectedProcedureTask?.title" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="space-y-3">
                        <div v-for="(employee, index) in state.progress?.data" :key="index">
                            <div class="bg-white rounded-md p-5 ring-1 ring-inset ring-gray-100">
                                <div class="grid grid-cols-2 gap-x-2">
                                    <div class="flex items-center gap-x-2">
                                        <img :src="`https://ui-avatars.com/api/?background=42AED9&color=fff&name=${employee?.firstname + ' ' + employee?.lastname}`"
                                            class="rounded-full w-11" />
                                        <span>{{ employee?.firstname + ' ' + employee?.lastname }}</span>
                                    </div>
                                    <div>
                                        <p class="text-sm">{{ employee?.employee_detail?.job?.title }}</p>
                                        <div class="flex gap-x-3 whitespace-nowrap">
                                            <div class="mt-2 flex w-full h-2.5 bg-gray-200 rounded-full overflow-hidden"
                                                role="progressbar" aria-valuenow="25" aria-valuemin="0"
                                                aria-valuemax="100">
                                                <div class="flex flex-col justify-center rounded-full overflow-hidden bg-primary text-xs text-white text-center whitespace-nowrap transition duration-500"
                                                    :style="`width: ${employee?.task_average ?? 0}%`"></div>
                                            </div>
                                            <div class="w-10 text-end">
                                                <span class="text-sm text-gray-800">
                                                    {{ employee?.task_average ?? 0 }}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { procedureTaskService } from '@/components/api/ProcedureTaskService'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedProcedureTask: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    progress: [] as any,
})

function closeModal() {
    emit('close')
}

watch(() => props.isModalOpen, (newValue: any) => {
    if (newValue) {
        fetchEmployeeProgress()
    }
})

async function fetchEmployeeProgress() {
    state.error = {}
    state.isPageLoading = true
    try {
        const procedureUuid = props.selectedProcedureTask?.uuid
        const response = await procedureTaskService.getProcedureTaskProgress(procedureUuid)
        if (response) {
            state.progress = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>