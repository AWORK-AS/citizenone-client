<template>
    <div>
        <Modal size="sm" :title="`${customPagesStore.getCustomPagesName?.dutySchedules} ${$t('dutySchedules.draft.draft')?.toLowerCase()}`" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="space-y-2 mb-4">
                        <p>{{ $t('dutySchedules.draft.selectDepartment.message') }}</p>
                    </div>

                    <ModulesUserDutyScheduleDraftSelectDepartmentForm @select-department="selectDepartment" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { useCustomPagesStore } from '@/store/custom-pages'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const customPagesStore = useCustomPagesStore() as any
const emit = defineEmits(['close', 'selectDepartment'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    selectedDepartmentUuid: '' as string | null,
})

function closeModal() {
    emit('close')
}

function selectDepartment() {
    emit('selectDepartment', state.selectedDepartmentUuid)
}
</script>