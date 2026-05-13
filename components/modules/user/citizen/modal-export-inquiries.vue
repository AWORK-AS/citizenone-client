<template>
    <div>
        <Modal size="xs" :title="props.title" :show="props.isModalOpen" @close="emit('close')">
            <template #modal-body>
                <div class="space-y-4">
                    <div class="space-y-1">
                        <FormLabel :label="customPagesStore.getCustomPagesName?.department || $t('department.department')" />
                        <FormSelect :options="props.departmentOptions" v-model="selectedDepartmentUuid" />
                    </div>
                    <div class="grid grid-cols-2 gap-3 pb-6">
                        <FormButton buttonStyle="cancel" @click="emit('close')">
                            {{ $t('cancel') }}
                        </FormButton>
                        <FormButton buttonStyle="primary" @click="confirm">
                            {{ $t('inquiries.exportInquiries') }}
                        </FormButton>
                    </div>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { useCustomPagesStore } from '@/store/custom-pages'

const customPagesStore = useCustomPagesStore() as any

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    departmentOptions: {
        type: Array as () => { value: string; label: string }[],
        required: true,
    },
})

const emit = defineEmits<{
    close: []
    confirm: [departmentUuid: string]
}>()

const selectedDepartmentUuid = ref('')

watch(() => props.isModalOpen, (isOpen) => {
    if (isOpen) selectedDepartmentUuid.value = ''
})

function confirm() {
    emit('confirm', selectedDepartmentUuid.value)
}
</script>

<style>
.multiselect-dropdown {
    max-height: 5rem !important;
}
</style>
