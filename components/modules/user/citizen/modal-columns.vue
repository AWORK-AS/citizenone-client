<template>
    <Modal size="sm" :title="$t('citizens.table.columns.columns')" :show="props.isModalOpen" @close="closeModal">
        <template #modal-body>
            <div class="space-y-4">
                <p class="text-sm text-gray-500">{{ $t('citizens.table.columns.hint') }}</p>
                <TableColumnPicker :columns="OPTIONAL_COLUMNS" v-model="state.selected" />

                <div class="flex items-center justify-end gap-2 pt-2">
                    <button type="button" class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                        @click="closeModal">
                        {{ $t('cancel') }}
                    </button>
                    <button type="button"
                        class="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-600 rounded-lg"
                        @click="save">
                        {{ $t('save') }}
                    </button>
                </div>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
// The optional citizen-list columns a user can show/hide. Name stays fixed
// (it's the row's primary link), so it isn't offered here.
const OPTIONAL_COLUMNS = [
    { key: 'email', label: 'citizens.table.email' },
    { key: 'ssn', label: 'citizens.table.ssn' },
    { key: 'phone', label: 'citizens.table.phone' },
    { key: 'section', label: 'citizens.table.section' },
    { key: 'municipality', label: 'citizens.table.municipality' },
    { key: 'coordinator', label: 'citizens.table.coordinator' },
    { key: 'consultant', label: 'citizens.table.consultant' },
    { key: 'startup_status', label: 'citizens.table.startupStatus' },
    { key: 'phase', label: 'citizens.table.phase' },
    { key: 'scope', label: 'citizens.table.scope' },
    { key: 'geography', label: 'citizens.table.geography' },
    { key: 'department', label: 'citizens.table.department' },
    { key: 'admitted', label: 'citizens.table.admitted' },
]

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    modelValue: {
        type: Array as () => string[],
        required: true,
    },
})

const emit = defineEmits(['close', 'save'])

const state = reactive({
    selected: [...props.modelValue] as string[],
})

watch(() => props.modelValue, (value) => {
    state.selected = [...value]
})

function closeModal() {
    state.selected = [...props.modelValue]
    emit('close')
}

function save() {
    emit('save', [...state.selected])
}
</script>
