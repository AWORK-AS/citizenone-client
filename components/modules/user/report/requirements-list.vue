<template>
    <div class="space-y-4">
        <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900">{{ $t('reportRequirements.requirements') }}</h3>
            <FormButton buttonStyle="action" @click="openAddModal">
                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                {{ $t('reportRequirements.addRequirement') }}
            </FormButton>
        </div>

        <Alert type="danger" :text="state.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />

        <LoadingSpinner :isActive="state.isLoading">
            <div v-if="state.requirements.length === 0" class="text-sm text-gray-500 py-4">
                {{ $t('reportRequirements.noRequirements') }}
            </div>
            <ul v-else class="divide-y divide-gray-100 rounded-lg border border-gray-200">
                <li v-for="req in state.requirements" :key="req.uuid"
                    class="flex items-start gap-3 px-4 py-3">
                    <button type="button" class="mt-0.5 shrink-0" @click="toggleComplete(req)">
                        <Icon v-if="req.is_completed" name="ph:check-circle-fill"
                            class="h-5 w-5 text-green-600" />
                        <Icon v-else name="ph:circle" class="h-5 w-5 text-gray-400" />
                    </button>
                    <div class="flex-1 min-w-0">
                        <p :class="['text-sm font-medium', req.is_completed ? 'line-through text-gray-400' : 'text-gray-900']">
                            {{ req.title }}
                        </p>
                        <p v-if="req.description" class="text-xs text-gray-500 mt-0.5">
                            {{ req.description }}
                        </p>
                        <p v-if="req.is_completed && req.completed_at" class="text-xs text-green-600 mt-0.5">
                            {{ formatDateToReadable(req.completed_at) }}
                        </p>
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                        <FormButton type="button" buttonStyle="action" @click="openEditModal(req)">
                            <Icon name="ph:pencil-simple" class="size-4" />
                        </FormButton>
                        <FormButton type="button" buttonStyle="danger" @click="openDeleteConfirmation(req)">
                            <Icon name="ph:trash" class="size-4" />
                        </FormButton>
                    </div>
                </li>
            </ul>
        </LoadingSpinner>

        <!-- Add / Edit Modal -->
        <Modal :show="state.modal.isFormOpen" :title="state.selectedRequirement
            ? $t('reportRequirements.editRequirement')
            : $t('reportRequirements.addRequirement')" @close="closeFormModal">
            <template #modal-body>
                <Alert type="danger" :text="state.formError?.message"
                    v-if="state.formError?.message && state.formError.message.length > 0" />
                <div class="space-y-3 p-4">
                    <div class="space-y-1">
                        <FormLabel for="req_title" :label="$t('reportRequirements.form.title')" />
                        <FormTextField id="req_title" name="req_title"
                            :placeholder="$t('reportRequirements.form.title')"
                            v-model="state.form.title" />
                        <FormError :error="state.validationErrors.title" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="req_description" :label="$t('reportRequirements.form.description')" />
                        <FormTextArea id="req_description" name="req_description"
                            :placeholder="$t('reportRequirements.form.description')"
                            :rows="3"
                            v-model="state.form.description" />
                    </div>
                </div>
                <div class="flex gap-3 px-4 pb-4">
                    <FormButton buttonStyle="cancel" class="flex-1" @click="closeFormModal">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton buttonStyle="primary" class="flex-1" @click="submitForm">
                        {{ state.selectedRequirement ? $t('update') : $t('save') }}
                    </FormButton>
                </div>
            </template>
        </Modal>

        <DialogConfirmation :isModalOpen="state.modal.isDeleteOpen"
            :message="$t('reportRequirements.confirmation.deleteConfirmation') + '?'"
            @close="state.modal.isDeleteOpen = false"
            @confirm="deleteRequirement" />
    </div>
</template>

<script setup lang="ts">
import { reportRequirementService } from '@/components/api/user/ReportRequirementService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const props = defineProps({
    citizenUuid: {
        type: String,
        required: true,
    },
})

const { t } = useI18n()
const { successAlert } = useAlert()
const { formatDateToReadable } = useDatetimeFormatter()

const state = reactive({
    error: {} as Error,
    formError: {} as Error,
    isLoading: false,
    requirements: [] as any[],
    selectedRequirement: null as any,
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
    fetchRequirements()
})

async function fetchRequirements() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await reportRequirementService.getRequirementsByCitizen(props.citizenUuid, {})
        if (response?.data) {
            state.requirements = response.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function openAddModal() {
    state.selectedRequirement = null
    state.form = { title: '', description: '' }
    state.validationErrors = { title: '' }
    state.formError = {}
    state.modal.isFormOpen = true
}

function openEditModal(req: any) {
    state.selectedRequirement = req
    state.form = { title: req.title, description: req.description ?? '' }
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
        if (state.selectedRequirement) {
            await reportRequirementService.updateRequirement(state.selectedRequirement.uuid, {
                title: state.form.title,
                description: state.form.description,
            })
            successAlert(`${t('alert.success')}!`, `${t('reportRequirements.alert.requirementSuccessfullyUpdated')}.`)
        } else {
            await reportRequirementService.saveRequirement({
                citizen_uuid: props.citizenUuid,
                title: state.form.title,
                description: state.form.description,
            })
            successAlert(`${t('alert.success')}!`, `${t('reportRequirements.alert.requirementSuccessfullySaved')}.`)
        }
        state.modal.isFormOpen = false
        fetchRequirements()
    } catch (error: any) {
        state.formError = error
    }
}

async function toggleComplete(req: any) {
    try {
        await reportRequirementService.toggleRequirementComplete(req.uuid)
        fetchRequirements()
    } catch (error: any) {
        state.error = error
    }
}

function openDeleteConfirmation(req: any) {
    state.selectedRequirement = req
    state.modal.isDeleteOpen = true
}

async function deleteRequirement() {
    state.error = {}
    try {
        await reportRequirementService.deleteRequirement(state.selectedRequirement.uuid)
        successAlert(`${t('alert.success')}!`, `${t('reportRequirements.alert.requirementSuccessfullyDeleted')}.`)
        state.modal.isDeleteOpen = false
        fetchRequirements()
    } catch (error: any) {
        state.error = error
    }
}
</script>
