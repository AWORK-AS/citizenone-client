<template>
    <div>
        <Modal size="sm" :title="$t('dutySchedules.draft.selectDepartment.title')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="space-y-2 mb-4 text-sm">
                        <p>{{ $t('dutySchedules.draft.selectDepartment.message.message1') }} <b class="text-gray-900 font-semibold">{{ state.selectedDepartmentName }}</b></p>
                        <p>{{ $t('dutySchedules.draft.selectDepartment.message.message2') }}</p>
                        <p>{{ $t('dutySchedules.draft.selectDepartment.message.message3') }}</p>
                    </div>

                    <ModulesUserDutyScheduleDraftSelectDepartmentForm @select-department="selectDepartment" @is-page-loading="setPageLoading" @close="closeModal" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { useCustomPagesStore } from '@/store/custom-pages'
import { useDepartmentStore } from '@/store/department'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const customPagesStore = useCustomPagesStore() as any
const departmentStore = useDepartmentStore() as any
const emit = defineEmits(['close', 'selectDepartment'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    selectedDepartmentUuid: '' as string | null,
    selectedDepartmentName: '' as string,
})

onMounted(() => {
    state.selectedDepartmentName = departmentStore.getSelectedDepartmentName || ''
})

function setPageLoading(value: boolean) {
    state.isPageLoading = value
}

function closeModal() {
    emit('selectDepartment')
    emit('close')
}

function selectDepartment() {
    emit('selectDepartment')
}
</script>