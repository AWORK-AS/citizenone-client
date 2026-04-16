<template>
    <div>
        <div class="space-y-5">
            <Alert type="danger" :text="state?.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />
            <TableSearch @search="handleSearch" />
            <div class="table-responsive">
                <Table :columnHeaders="state.columnHeaders" :data="state.participants" :isLoading="state.isTableLoading"
                    :sortData="state.sortData" @sort="sort">
                    <template #body v-if="!(state.isTableLoading || (state.participants?.data?.length === 0))">
                        <tr v-for="(participant, index) in state.participants?.data" :key="index">
                            <td width="40%">
                                <p>
                                    {{ participant?.firstname + ' ' + participant?.lastname }}
                                </p>
                            </td>
                            <td width="40%">
                                <p>{{ participant?.email }}</p>
                            </td>
                            <td width="20%">
                                <div class="flex items-end justify-end gap-2">
                                    <FormButton type="button" buttonStyle="action"
                                        @click="convertAsCitizenConfirmation(participant)">
                                        <Icon name="ph:user-plus" class="size-4" />
                                        {{ $t('bookings.view.participants.actions.convertAsCitizen') }}
                                    </FormButton>
                                </div>
                            </td>
                        </tr>
                    </template>
                </Table>
            </div>
            <Pagination :data="state.participants" @previous="previous" @next="next" />
        </div>

        <DialogConfirmation :isModalOpen="state.modal.isConvertAsCitizen"
            :message="$t('bookings.view.participants.confirmation.convertAsCitizenConfirmation') + '?'"
            @close="state.modal.isConvertAsCitizen = false" @confirm="convertAsCitizen" />
    </div>
</template>

<script setup lang="ts">
import { coursesEventsService } from '@/components/api/user/CoursesEventsService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const props = defineProps({
    selectedCourseEvent: {
        type: Object,
        required: true,
    },
})

const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'bookings.view.participants.table.name', isTranslateName: true, sorter: true, key: 'firstname' },
        { name: 'bookings.view.participants.table.emailAddress', isTranslateName: true, sorter: true, key: 'email' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isConvertAsCitizen: false,
    },
    participants: [] as any,
    selectedParticipant: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchParticipants()
})

async function fetchParticipants() {
    state.error = {}
    state.isTableLoading = true
    try {
        const courseEventUuid = props.selectedCourseEvent?.uuid
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter,
        }
        const response = await coursesEventsService.getEventCourseParticipants(courseEventUuid, params)
        if (response) {
            state.participants = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchParticipants()
}

function next() {
    currentTablePage++
    fetchParticipants()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchParticipants()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchParticipants()
}

function convertAsCitizenConfirmation(participant: any) {
    state.selectedParticipant = participant
    state.modal.isConvertAsCitizen = true
}

async function convertAsCitizen() {
    state.error = {}
    state.isTableLoading = true
    try {
        const participantUuid = state.selectedParticipant?.uuid
        const response = await coursesEventsService.convertParticipantAsCitizen(participantUuid)
        if (response) {
            fetchParticipants()
            successAlert(`${t('alert.success')}!`, `${t('bookings.view.participants.alert.participantToCitizenConvertedSuccessfully')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>