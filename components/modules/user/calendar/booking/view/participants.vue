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
                            <td width="50%">
                                <span>{{ participant?.firstname }}</span>
                                <span>{{ participant?.lastname }}</span>
                            </td>
                            <td width="50%">
                                <p>{{ participant?.email }}</p>
                            </td>
                        </tr>
                    </template>
                </Table>
            </div>
            <Pagination :data="state.participants" @previous="previous" @next="next" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { coursesEventsService } from '@/components/api/user/CoursesEventsService'

const props = defineProps({
    selectedCourseEvent: {
        type: Object,
        required: true,
    },
})
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'bookings.view.participants.table.name', sorter: true, key: 'firstname' },
        { name: 'bookings.view.participants.table.emailAddress', sorter: true, key: 'email' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    participants: [] as any,
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
</script>