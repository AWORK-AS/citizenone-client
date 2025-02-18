<template>
    <TransitionRoot as="template" :show="props.isOpen">
        <Dialog class="relative z-50" @close="closeSlide">
            <div class="fixed inset-0" />

            <div class="fixed inset-0 overflow-hidden">
                <div class="absolute inset-0 overflow-hidden">
                    <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                        <TransitionChild as="template"
                            enter="transform transition ease-in-out duration-500 sm:duration-600"
                            enter-from="translate-x-full" enter-to="translate-x-0"
                            leave="transform transition ease-in-out duration-500 sm:duration-700"
                            leave-from="translate-x-0" leave-to="translate-x-full">
                            <DialogPanel class="pointer-events-auto w-screen max-w-4xl">
                                <div class="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                                    <LoadingSpinner :isActive="state.isPageLoading">
                                        <div class="px-4 sm:px-6">
                                            <div class="flex items-start justify-between">
                                                <DialogTitle class="text-base font-semibold leading-6 text-gray-900">
                                                    {{ $t('citizens.incidents.incidents') }}
                                                </DialogTitle>
                                                <div class="ml-3 flex h-7 items-center">
                                                    <button type="button"
                                                        class="relative rounded-md bg-white text-tertiary-800 hover:text-tertiary focus:outline-none"
                                                        @click="closeSlide">
                                                        <span class="absolute -inset-2.5" />
                                                        <span class="sr-only">Close panel</span>
                                                        <Icon name="ph:x" class="h-6 w-6" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="relative mt-10 flex-1 px-4 sm:px-6">
                                            <Alert type="danger" :text="state?.error?.message"
                                                v-if="state.error?.message && state.error.message.length > 0" />
                                            <div>
                                                <div class="space-y-5">
                                                    <div class="bg-white ring-1 ring-gray-200 rounded-md p-5 border-l-4 border-secondary"
                                                        v-for="(incident, index) in state.incidents?.data" :key="index">
                                                        <div class="flex gap-x-3">
                                                            <div class="grow space-y-1.5">
                                                                <div>
                                                                    <Badge type="harmless"
                                                                        class="text-xxs truncate w-fit"
                                                                        v-if="incident?.risk_level === 'harmless'">
                                                                        {{
                                                                            $t('citizens.incidents.table.riskLevels.harmless')
                                                                        }}
                                                                    </Badge>
                                                                    <Badge type="low-risk"
                                                                        class="text-xxs truncate w-fit"
                                                                        v-if="incident?.risk_level === 'low-risk'">
                                                                        {{
                                                                            $t('citizens.incidents.table.riskLevels.lowRisk')
                                                                        }}
                                                                    </Badge>
                                                                    <Badge type="moderate-risk"
                                                                        class="text-xxs truncate w-fit"
                                                                        v-if="incident?.risk_level === 'moderate-risk'">
                                                                        {{
                                                                            $t('citizens.incidents.table.riskLevels.moderateRisk')
                                                                        }}
                                                                    </Badge>
                                                                    <Badge type="high-risk"
                                                                        class="text-xxs truncate w-fit"
                                                                        v-if="incident?.risk_level === 'high-risk'">
                                                                        {{
                                                                            $t('citizens.incidents.table.riskLevels.highRisk')
                                                                        }}
                                                                    </Badge>
                                                                    <div
                                                                        class="flex items-center gap-x-3 justify-between">
                                                                        <div class="flex items-center gap-x-3">
                                                                            <h3 class="text-md font-semibold">
                                                                                {{ incident.title }}
                                                                            </h3>
                                                                            <div v-if="incident.is_draft">
                                                                                <Badge type="primary">
                                                                                    <p class="text-xs">
                                                                                        {{
                                                                                            $t('citizens.incidents.form.draft')
                                                                                        }}
                                                                                    </p>
                                                                                </Badge>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <p class="mt-1 text-xs text-muted-400">
                                                                        <span>
                                                                            {{ formatDateToReadable(incident.date) }}
                                                                        </span>
                                                                    </p>
                                                                </div>
                                                                <p class="text-sm text-muted-400">
                                                                    <div v-html="incident.description"
                                                                        class="content" />
                                                                </p>
                                                                <p class="text-sm">
                                                                    {{
                                                                        $t('citizens.incidents.table.reportedBy')
                                                                    }}:
                                                                    {{ incident?.reported_by?.firstname }}
                                                                    {{ incident?.reported_by?.lastname }}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <FormButton class="rounded-md h-fit" buttonSize="xs"
                                                                    @click="editIncident(incident)"
                                                                    v-if="incident?.is_editable">
                                                                    <Icon name="ph:pencil-duotone" class="w-4 h-4" />
                                                                </FormButton>
                                                            </div>
                                                            <div>
                                                                <FormButton class="rounded-md h-fit" buttonSize="xs"
                                                                    @click="viewStatuses(incident)">
                                                                    {{ $t('citizens.useOfForce.table.statuses') }}
                                                                </FormButton>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div v-if="state.incidents?.data?.length === 0">
                                                        <p class="text-center py-10">
                                                            {{ $t('theresNoDataAvailableToDisplay') }}.
                                                        </p>
                                                    </div>
                                                    <Pagination :data="state.incidents" @previous="previous"
                                                        @next="next" />
                                                </div>
                                            </div>
                                        </div>
                                        <ModulesCitizenIncidentsModalEdit :selectedIncident="state.formIncident"
                                            :isModalOpen="state.modal.isEditIncidentOpen"
                                            @close="state.modal.isEditIncidentOpen = false"
                                            @refreshIncidents="fetchIncidents" />
                                        <ModulesCitizenIncidentsStatusModalStatuses
                                            :isModalOpen="state.modal.isStatusesOpen"
                                            :selectedData="state.selectedIncident" @close="closeStatusesModal"
                                            @refreshData="fetchIncidents" />
                                    </LoadingSpinner>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { incidentService } from '@/components/api/IncidentService'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import type { Error } from '@/types'

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close'])
const { formatDateToReadable } = useDatetimeFormatter()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
let currentTablePage = 1

function closeSlide() {
    emit('close')
}

const state = reactive({
    error: {} as Error,
    formIncident: {
        uuid: '',
        title: '',
        date: '',
        description: '',
        is_draft: false,
    },
    incidents: [] as any,
    isPageLoading: false,
    modal: {
        isEditIncidentOpen: false,
        isStatusesOpen: false
    },
    selectedIncident: {} as any,
    sortData: {
        sortField: 'date',
        sortOrder: 'descend',
    },
})

watch(() => props.isOpen, (isOpen: any) => {
    if (isOpen) {
        fetchIncidents()
    }
})

async function fetchIncidents() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
        }
        const response = await incidentService.getIncidents(params)
        if (response) {
            state.incidents = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function previous() {
    currentTablePage--
    fetchIncidents()
}

function next() {
    currentTablePage++
    fetchIncidents()
}

function viewStatuses(incidents: any) {
    state.selectedIncident = incidents
    state.modal.isStatusesOpen = true
}

function closeStatusesModal() {
    state.modal.isStatusesOpen = false
}

function editIncident(incident: any) {
    state.formIncident = {
        uuid: incident.uuid,
        title: incident.title,
        date: incident.date,
        description: incident.description,
        is_draft: incident.is_draft,
    }
    state.modal.isEditIncidentOpen = true
}
</script>