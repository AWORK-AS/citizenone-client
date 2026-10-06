<template>
    <div class="space-y-3">
        <Alert type="danger" :text="state.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />

        <LoadingSpinner :isActive="state.isLoading">
            <div v-if="state.items.length === 0" class="text-sm text-gray-500 py-2">
                {{ $t('citizens.nursingAreas.checklists.noItems') }}
            </div>
            <ul v-else class="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
                <li v-for="item in state.items" :key="item.uuid"
                    class="flex items-start gap-3 px-3 py-2.5">
                    <button type="button" class="mt-0.5 shrink-0" @click="toggleComplete(item)">
                        <Icon v-if="item.is_completed" name="ph:check-circle-fill"
                            class="h-5 w-5 text-green-600" />
                        <Icon v-else name="ph:circle" class="h-5 w-5 text-gray-400" />
                    </button>
                    <div class="flex-1 min-w-0">
                        <p :class="['text-sm', item.is_completed ? 'line-through text-gray-400' : 'text-gray-900']">
                            {{ item.title }}
                        </p>
                        <p v-if="item.is_completed && item.completed_at" class="text-xs text-green-600 mt-0.5">
                            {{ formatDateToReadable(item.completed_at) }}
                        </p>
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                        <FormButton type="button" buttonStyle="action" buttonSize="sm" @click="openEditModal(item)">
                            <Icon name="ph:pencil-simple" class="size-4" />
                        </FormButton>
                        <FormButton type="button" buttonStyle="danger" buttonSize="sm" @click="openDeleteConfirmation(item)">
                            <Icon name="ph:trash" class="size-4" />
                        </FormButton>
                    </div>
                </li>
            </ul>
        </LoadingSpinner>

        <FormButton type="button" buttonStyle="action" buttonSize="sm" @click="openAddModal">
            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
            {{ $t('citizens.nursingAreas.checklists.addItem') }}
        </FormButton>

        <Modal :show="state.modal.isFormOpen" :title="state.selectedItem
            ? $t('citizens.nursingAreas.checklists.editItem')
            : $t('citizens.nursingAreas.checklists.newItem')" @close="closeFormModal">
            <template #modal-body>
                <Alert type="danger" :text="state.formError?.message"
                    v-if="state.formError?.message && state.formError.message.length > 0" />
                <div class="space-y-3 p-4">
                    <div class="space-y-1">
                        <FormLabel for="checklist_item_title" :label="$t('citizens.nursingAreas.checklists.form.title')" />
                        <FormTextField id="checklist_item_title" name="checklist_item_title"
                            :placeholder="$t('citizens.nursingAreas.checklists.form.title')"
                            v-model="state.form.title" />
                        <FormError :error="state.validationErrors.title" />
                    </div>
                </div>
                <div class="flex gap-3 px-4 pb-4">
                    <FormButton buttonStyle="cancel" class="flex-1" @click="closeFormModal">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton buttonStyle="primary" class="flex-1" @click="submitForm">
                        {{ state.selectedItem ? $t('update') : $t('save') }}
                    </FormButton>
                </div>
            </template>
        </Modal>

        <DialogConfirmation :isModalOpen="state.modal.isDeleteOpen"
            :message="$t('citizens.nursingAreas.checklists.table.confirmation.deleteItemConfirmation') + '?'"
            @close="state.modal.isDeleteOpen = false"
            @confirm="deleteItem" />
    </div>
</template>

<script setup lang="ts">
import { checklistService } from '@/components/api/user/ChecklistService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const props = defineProps({
    checklistUuid: {
        type: String,
        required: true,
    },
    items: {
        type: Array,
        required: true,
    },
})

const emit = defineEmits(['refresh'])

const { t } = useI18n()
const { successAlert } = useAlert()
const { formatDateToReadable } = useDatetimeFormatter()

const state = reactive({
    error: {} as Error,
    formError: {} as Error,
    isLoading: false,
    items: props.items as any[],
    selectedItem: null as any,
    validationErrors: {
        title: '',
    },
    form: {
        title: '',
    },
    modal: {
        isFormOpen: false,
        isDeleteOpen: false,
    },
})

watch(() => props.items, (items) => {
    state.items = items as any[]
})

function openAddModal() {
    state.selectedItem = null
    state.form = { title: '' }
    state.validationErrors = { title: '' }
    state.formError = {}
    state.modal.isFormOpen = true
}

function openEditModal(item: any) {
    state.selectedItem = item
    state.form = { title: item.title }
    state.validationErrors = { title: '' }
    state.formError = {}
    state.modal.isFormOpen = true
}

function closeFormModal() {
    state.modal.isFormOpen = false
}

async function submitForm() {
    if (!state.form.title.trim()) {
        state.validationErrors.title = `${t('validation.thisFieldIsRequired')}.`
        return
    }
    state.formError = {}
    try {
        if (state.selectedItem) {
            await checklistService.updateChecklistItem(state.selectedItem.uuid, {
                title: state.form.title,
            })
        } else {
            await checklistService.saveChecklistItem(props.checklistUuid, {
                title: state.form.title,
            })
        }
        state.modal.isFormOpen = false
        emit('refresh')
    } catch (error: any) {
        state.formError = error
    }
}

async function toggleComplete(item: any) {
    try {
        await checklistService.toggleChecklistItemComplete(item.uuid)
        emit('refresh')
    } catch (error: any) {
        state.error = error
    }
}

function openDeleteConfirmation(item: any) {
    state.selectedItem = item
    state.modal.isDeleteOpen = true
}

async function deleteItem() {
    state.error = {}
    try {
        await checklistService.deleteChecklistItem(state.selectedItem.uuid)
        successAlert(`${t('alert.success')}!`, `${t('citizens.nursingAreas.checklists.table.alert.itemSuccessfullyDeleted')}.`)
        state.modal.isDeleteOpen = false
        emit('refresh')
    } catch (error: any) {
        state.error = error
    }
}
</script>
