<template>
    <div class="space-y-5">
        <div class="flex justify-end items-center">
            <FormButton buttonStyle="action" @click="openCreateModal">
                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                {{ $t('forms.predefinedEvents.newPredefinedEvent') }}
            </FormButton>
        </div>

        <Alert
            type="danger"
            :text="state.error?.message"
            v-if="state.error?.message && state.error.message.length > 0"
        />

        <div class="table-responsive">
            <Table
                :columnHeaders="state.columnHeaders"
                :data="state.events"
                :isLoading="state.isTableLoading"
                :sortData="state.sortData"
            >
                <template #body v-if="!(state.isTableLoading || state.events?.length === 0)">
                    <tr v-for="(event, index) in state.events" :key="index">
                        <td>
                            <p>{{ event.title }}</p>
                        </td>
                        <td>
                            <p>{{ calendarTypeLabel(event.calendar_type) }}</p>
                        </td>
                        <td>
                            <p>{{ event.duration_minutes }}</p>
                        </td>
                        <td>
                            <Icon
                                :name="event.is_recurring ? 'ph:check-circle' : 'ph:x-circle'"
                                :class="event.is_recurring ? 'text-green-500' : 'text-gray-400'"
                                class="h-5 w-5"
                            />
                        </td>
                        <td>
                            <Icon
                                :name="event.is_active ? 'ph:check-circle' : 'ph:x-circle'"
                                :class="event.is_active ? 'text-green-500' : 'text-gray-400'"
                                class="h-5 w-5"
                            />
                        </td>
                        <td>
                            <div class="flex items-end justify-end gap-2">
                                <FormButton type="button" buttonStyle="action" @click="openEditModal(event)">
                                    <Icon name="ph:pencil-simple" class="size-4" />
                                    {{ $t('forms.predefinedEvents.table.actions.edit') }}
                                </FormButton>
                                <FormButton type="button" buttonStyle="action" @click="deleteConfirmation(event)">
                                    <Icon name="ph:trash" class="size-4" />
                                    {{ $t('forms.predefinedEvents.table.actions.delete') }}
                                </FormButton>
                            </div>
                        </td>
                    </tr>
                </template>
            </Table>
        </div>

        <ModulesUserFormPredefinedEventsModalForm
            :isOpen="state.modal.isFormOpen"
            :formType="state.modal.formType"
            :formUuid="props.formUuid"
            :selectedEvent="state.selectedEvent"
            @close="state.modal.isFormOpen = false"
            @saved="fetchEvents"
        />

        <DialogConfirmation
            :isModalOpen="state.modal.isDeleteOpen"
            :message="$t('forms.predefinedEvents.confirmation.deletePredefinedEventConfirmation') + '?'"
            @close="state.modal.isDeleteOpen = false"
            @confirm="deleteEvent"
        />
    </div>
</template>

<script setup lang="ts">
import { formPredefinedEventService } from '@/components/api/user/FormPredefinedEventService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const props = defineProps({
    formUuid: {
        type: String,
        required: true,
    },
})

const { successAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    columnHeaders: [
        { name: 'forms.predefinedEvents.table.title', isTranslateName: true },
        { name: 'forms.predefinedEvents.table.calendarType', isTranslateName: true },
        { name: 'forms.predefinedEvents.table.durationMinutes', isTranslateName: true },
        { name: 'forms.predefinedEvents.table.isRecurring', isTranslateName: true },
        { name: 'forms.predefinedEvents.table.isActive', isTranslateName: true },
        { name: '' },
    ],
    error: {} as Error,
    events: [] as any[],
    isTableLoading: false,
    modal: {
        isFormOpen: false,
        isDeleteOpen: false,
        formType: 'create',
    },
    selectedEvent: null as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchEvents()
})

async function fetchEvents() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await formPredefinedEventService.getPredefinedEvents(props.formUuid)
        if (response) {
            state.events = response.data ?? []
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function openCreateModal() {
    state.selectedEvent = null
    state.modal.formType = 'create'
    state.modal.isFormOpen = true
}

function openEditModal(event: any) {
    state.selectedEvent = event
    state.modal.formType = 'update'
    state.modal.isFormOpen = true
}

function deleteConfirmation(event: any) {
    state.selectedEvent = event
    state.modal.isDeleteOpen = true
}

async function deleteEvent() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await formPredefinedEventService.deletePredefinedEvent(
            props.formUuid,
            state.selectedEvent?.uuid,
        )
        if (response) {
            successAlert(`${t('alert.success')}!`, `${t('forms.predefinedEvents.alert.predefinedEventSuccessfullyDeleted')}.`)
            state.modal.isDeleteOpen = false
            fetchEvents()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function calendarTypeLabel(type: string) {
    if (type === 'citizens') return t('forms.predefinedEvents.calendarTypes.citizens')
    if (type === 'employees') return t('forms.predefinedEvents.calendarTypes.employees')
    return type
}
</script>
