<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <div class="space-y-3">
            <Alert type="danger" :text="state.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />

            <div class="flex justify-end items-center mb-5 gap-x-2"
                v-if="isAtLeast('Admin') || can('create_citizen_health')">
                <FormButton buttonStyle="action" @click="openAddModal">
                    <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                    {{ $t('citizens.nursingAreas.checklists.newChecklist') }}
                </FormButton>
            </div>

            <div v-if="state.checklists.length === 0" class="text-center py-4">
                <p class="text-sm text-gray-500">
                    {{ $t('citizens.nursingAreas.checklists.empty') }}
                </p>
            </div>

            <div class="space-y-3">
                <div class="bg-white ring-1 ring-gray-200 rounded-md p-4 border-l-4 border-secondary"
                    v-for="checklist in state.checklists" :key="checklist.uuid">
                    <div class="flex items-start justify-between gap-3">
                        <button type="button" class="flex-1 min-w-0 text-left flex items-center gap-2"
                            @click="toggleExpanded(checklist.uuid)">
                            <Icon :name="expanded[checklist.uuid] ? 'ic:round-keyboard-arrow-up' : 'ic:round-keyboard-arrow-down'"
                                class="w-5 h-5 shrink-0 text-gray-400" />
                            <span>
                                <p class="font-medium text-sm">{{ checklist.title }}</p>
                                <p v-if="checklist.description" class="text-xs text-gray-500 mt-0.5">
                                    {{ checklist.description }}
                                </p>
                                <p class="text-xs text-gray-500 mt-0.5">
                                    {{ $t('citizens.nursingAreas.checklists.progress', {
                                        completed: checklist.completed_count,
                                        total: checklist.total_count,
                                    }) }}
                                </p>
                            </span>
                        </button>
                        <div class="flex items-center gap-2 shrink-0"
                            v-if="isAtLeast('Admin') || can('update_citizen_health')">
                            <Tooltip :text="$t('citizens.nursingAreas.checklists.table.actions.edit')">
                                <FormButton :aria-label="$t('citizens.nursingAreas.checklists.table.actions.edit')"
                                    buttonSize="sm" @click="openEditModal(checklist)">
                                    <Icon name="ph:pencil-simple" class="size-4" />
                                </FormButton>
                            </Tooltip>
                            <Tooltip :text="$t('citizens.nursingAreas.checklists.table.actions.delete')">
                                <FormButton :aria-label="$t('citizens.nursingAreas.checklists.table.actions.delete')"
                                    buttonStyle="danger" buttonSize="sm" @click="openDeleteConfirmation(checklist)">
                                    <Icon name="ph:trash" class="size-4" />
                                </FormButton>
                            </Tooltip>
                        </div>
                    </div>

                    <div class="mt-3" v-if="expanded[checklist.uuid]">
                        <ModulesUserCitizenNursingAreasChecklistItemsList
                            :checklistUuid="checklist.uuid"
                            :items="checklist.items"
                            @refresh="fetchChecklists" />
                    </div>
                </div>
            </div>
        </div>

        <Modal :show="state.modal.isFormOpen" :title="state.selectedChecklist
            ? $t('citizens.nursingAreas.checklists.editChecklist')
            : $t('citizens.nursingAreas.checklists.newChecklist')" @close="closeFormModal">
            <template #modal-body>
                <Alert type="danger" :text="state.formError?.message"
                    v-if="state.formError?.message && state.formError.message.length > 0" />
                <div class="space-y-3 p-4">
                    <div class="space-y-1">
                        <FormLabel for="checklist_title" :label="$t('citizens.nursingAreas.checklists.form.title')" />
                        <FormTextField id="checklist_title" name="checklist_title"
                            :placeholder="$t('citizens.nursingAreas.checklists.form.title')"
                            v-model="state.form.title" />
                        <FormError :error="state.validationErrors.title" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="checklist_description" :label="$t('citizens.nursingAreas.checklists.form.description')" />
                        <FormTextArea id="checklist_description" name="checklist_description"
                            :placeholder="$t('citizens.nursingAreas.checklists.form.description')"
                            :rows="3"
                            v-model="state.form.description" />
                    </div>
                </div>
                <div class="flex gap-3 px-4 pb-4">
                    <FormButton buttonStyle="cancel" class="flex-1" @click="closeFormModal">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton buttonStyle="primary" class="flex-1" @click="submitForm">
                        {{ state.selectedChecklist ? $t('update') : $t('save') }}
                    </FormButton>
                </div>
            </template>
        </Modal>

        <DialogConfirmation :isModalOpen="state.modal.isDeleteOpen"
            :message="$t('citizens.nursingAreas.checklists.table.confirmation.deleteChecklistConfirmation') + '?'"
            @close="state.modal.isDeleteOpen = false"
            @confirm="deleteChecklist" />
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { checklistService } from '@/components/api/user/ChecklistService'
import { usePermissions } from '@/composables/usePermissions'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const router = useRouter()
const { t } = useI18n()
const { successAlert } = useAlert()
const { isAtLeast, can } = usePermissions()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as any

const expanded = reactive({} as Record<string, boolean>)

const state = reactive({
    error: {} as Error,
    formError: {} as Error,
    isPageLoading: false,
    checklists: [] as any[],
    selectedChecklist: null as any,
    validationErrors: {
        title: '',
    },
    form: {
        title: '',
        description: '',
    },
    modal: {
        isFormOpen: false,
        isDeleteOpen: false,
    },
})

onMounted(() => {
    fetchChecklists()
})

async function fetchChecklists() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await checklistService.getChecklistsByCitizen(citizenUuid, {})
        if (response?.data) {
            state.checklists = response.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function toggleExpanded(uuid: string) {
    expanded[uuid] = !expanded[uuid]
}

function openAddModal() {
    state.selectedChecklist = null
    state.form = { title: '', description: '' }
    state.validationErrors = { title: '' }
    state.formError = {}
    state.modal.isFormOpen = true
}

function openEditModal(checklist: any) {
    state.selectedChecklist = checklist
    state.form = { title: checklist.title, description: checklist.description ?? '' }
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
        if (state.selectedChecklist) {
            await checklistService.updateChecklist(state.selectedChecklist.uuid, {
                title: state.form.title,
                description: state.form.description,
            })
            successAlert(`${t('alert.success')}!`, `${t('citizens.nursingAreas.checklists.form.alert.checklistSuccessfullyUpdated')}.`)
        } else {
            await checklistService.saveChecklist({
                citizen_uuid: citizenUuid,
                title: state.form.title,
                description: state.form.description,
            })
            successAlert(`${t('alert.success')}!`, `${t('citizens.nursingAreas.checklists.form.alert.checklistSuccessfullyAdded')}.`)
        }
        state.modal.isFormOpen = false
        fetchChecklists()
    } catch (error: any) {
        state.formError = error
    }
}

function openDeleteConfirmation(checklist: any) {
    state.selectedChecklist = checklist
    state.modal.isDeleteOpen = true
}

async function deleteChecklist() {
    state.error = {}
    try {
        await checklistService.deleteChecklist(state.selectedChecklist.uuid)
        successAlert(`${t('alert.success')}!`, `${t('citizens.nursingAreas.checklists.table.alert.checklistSuccessfullyDeleted')}.`)
        state.modal.isDeleteOpen = false
        fetchChecklists()
    } catch (error: any) {
        state.error = error
    }
}
</script>
