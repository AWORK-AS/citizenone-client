<template>
    <Modal size="sm" :title="$t('citizens.table.columns.columns')" :show="props.isModalOpen" @close="closeModal">
        <template #modal-body>
            <div class="space-y-4">
                <p class="text-sm text-gray-500">{{ $t('citizens.table.columns.hint') }}</p>
                <div class="space-y-1.5">
                    <label v-for="column in OPTIONAL_COLUMNS" :key="column.key"
                        class="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer rounded-md px-1.5 py-1 hover:bg-slate-50">
                        <input type="checkbox" class="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                            :value="column.key" v-model="state.selected" />
                        {{ $t(column.label) }}
                    </label>
                </div>

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
