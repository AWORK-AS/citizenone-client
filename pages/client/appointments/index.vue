<template>
    <div>
        <NuxtLayout name="client">

            <Head>
                <Title>{{ $t('client.appointments') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('client.appointments') }}</template>

            <div class="mt-2">
                <div class="space-y-10">
                    
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.appointments"
                            :isLoading="state.isTableLoading">
                            <template #body v-if="!(state.isTableLoading || (state.appointments?.data?.length === 0))">
                                <tr v-for="(appointment, index) in state.appointments" :key="index">
                                    <td width="30%">
                                        <div class="flex items-center gap-x-2">
                                            <div>
                                                <span>{{ appointment?.appointment?.booking_setting?.appointment?.name }}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td width="30%">
                                        <span class="truncate-ellipsis">{{ appointment?.appointment?.booking_setting?.appointment?.address }}</span>
                                    </td>
                                    <td width="15%">
                                        <span>{{ formatDateToReadable(appointment?.appointment?.date) }}</span>
                                    </td>
                                    <td width="15%">
                                        <span>{{ appointment?.appointment?.start_time }} - {{ appointment?.appointment?.end_time }}</span>
                                    </td>
                                    <td width="10%">
                                        <div class="flex items-end justify-end gap-2">
                                            <Tooltip :text="$t('citizens.table.actions.view')">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="viewAppointment(appointment)">
                                                    <Icon name="ph:eye" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.appointments" @previous="previous" @next="next" />
                   
                </div>
            </div>

            <ModulesClientAppointmentModalView :is-modal-open="state.modal.isAppointmentView" :appointment="state.selectedAppointment" @close="state.modal.isAppointmentView = false"  />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'
import { bookingClientService } from '~/components/api/client/BookingClientService'
import { useAppointmentStore } from '@/store/appointment'

const runtimeConfig = useRuntimeConfig()
const appointmentStore = useAppointmentStore() as any
const { formatDateToReadable } = useDatetimeFormatter()

const state = reactive({
    columnHeaders: [
        { name: 'client.appointmentsTable.eventName', sorter: true, key: 'name' },
        { name: 'client.appointmentsTable.address', sorter: false, key: 'address' },
        { name: 'client.appointmentsTable.date', sorter: false, key: 'date' },
        { name: 'client.appointmentsTable.time', sorter: false, key: 'time' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    appointments: [] as any,
    modal: {
        isAppointmentView: false,
    },
    selectedAppointment: {},
    bookingSettings: {},
})

onMounted(async() => {
    fetchAppointments()
})

async function fetchAppointments() {
    state.error = {}

    try {
        state.isTableLoading = true

        const params = {
            page: appointmentStore.getCurrentPageNumber,
            page_length: appointmentStore.getCurrentPageLength,
            sortField: appointmentStore.getSortData.sortField,
            sortOrder: appointmentStore.getSortData.sortOrder,
            ...state.dataFilter
        }
        const response = await bookingClientService.appointments(params)
        if (response?.data) {
            state.appointments = response.data
        }
    } catch(error: any) {
        state.error =error
    }
    state.isTableLoading = false
}

function previous() {
    const currentTablePage = appointmentStore.getCurrentPageNumber - 1
    appointmentStore.setCurrentPageNumber(currentTablePage)
    fetchAppointments()
}

function next() {
    const currentTablePage = appointmentStore.getCurrentPageNumber + 1
    appointmentStore.setCurrentPageNumber(currentTablePage)
    fetchAppointments()
}

function viewAppointment(appointment: any) {
    console.log('appointment', appointment)
    state.selectedAppointment = appointment
    state.bookingSettings = appointment?.appointment?.booking_setting
    state.modal.isAppointmentView = true
}

</script>