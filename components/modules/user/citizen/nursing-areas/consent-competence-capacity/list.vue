<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <div class="space-y-3">
            <Alert type="danger" :text="state?.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />
            <div class="flex justify-end items-center mb-5 gap-x-2">
                <FormButton buttonStyle="action" class="rounded-lg"
                    @click="state.modal.isAddConsentCompetenceCapacityOpen = true">
                    <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                    {{ $t('citizens.nursingAreas.consentCompetenceOrCapacity.newConsentCompetenceOrCapacity') }}
                </FormButton>
            </div>
            <div class="space-y-5">
                <div class="bg-white ring-1 ring-gray-200 rounded-md p-5 border-l-4 border-secondary"
                    v-for="(record, index) in state.records?.data" :key="index">
                    <div class="flex flex-col md:flex-row gap-3 md:gap-10">
                        <div class="grow">
                            <p class="text-sm">
                                <span>{{ formatDateToReadable(record?.date) }}</span>
                            </p>
                            <p class="text-sm">
                                {{ $t('citizens.nursingAreas.table.reportedBy') }}:
                                {{ record?.user?.firstname + ' ' + record?.user?.lastname }}
                            </p>
                        </div>
                        <div>
                            <div class="flex items-center gap-2 flex-wrap md:flex-nowrap">
                                <Tooltip :text="$t('citizens.nursingAreas.table.actions.edit')">
                                    <FormButton class="rounded-md" buttonSize="sm"
                                        @click="navigateTo(`/citizens/${citizenUuid}/nursing-areas/${record.uuid}/edit`)">
                                        <Icon name="ph:pencil-simple" class="size-4" />
                                    </FormButton>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                    <div class="mt-2 space-y-1">
                        <div :class="expandedRecords[index] ? '' : 'line-clamp-2'">
                            <div v-html="record?.consent_competence_capacity" class="content" />
                        </div>
                        <button @click="toggleExpanded(index)" class="mt-3 text-primary text-sm hover:text-primary-700">
                            {{ expandedRecords[index] ?
                                $t('showLess') :
                                $t('showMore') }}
                        </button>
                    </div>
                </div>
                <div v-if="state.records?.data?.length === 0">
                    <p class="text-center">
                        {{ $t('theresNoDataAvailableToDisplay') }}.
                    </p>
                </div>
                <Pagination :data="state.records" @previous="previous" @next="next" />
            </div>
        </div>
        <ModulesUserCitizenNursingAreasConsentCompetenceCapacityModalNew
            :isModalOpen="state.modal.isAddConsentCompetenceCapacityOpen"
            :selectedConsentCompetenceCapacity="state.selectedRecord"
            @close="state.modal.isAddConsentCompetenceCapacityOpen = false"
            @refreshConsentCompetenceCapacities="fetchConsentCompetenceOrCapacity" />
        <ModulesUserCitizenNursingAreasConsentCompetenceCapacityModalEdit
            :isModalOpen="state.modal.isEditConsentCompetenceCapacityOpen"
            :selectedConsentCompetenceCapacity="state.selectedRecord"
            @close="state.modal.isEditConsentCompetenceCapacityOpen = false"
            @refreshConsentCompetenceCapacities="fetchConsentCompetenceOrCapacity" />
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { consentCompetenceCapacityService } from '@/components/api/user/ConsentCompetenceCapacityService'
import type { Error } from '@/types'

const router = useRouter()
const { formatDateToReadable } = useDatetimeFormatter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as any
const expandedRecords = reactive([] as boolean[])
let currentTablePage = 1

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    records: [] as any,
    selectedRecord: {},
    modal: {
        isAddConsentCompetenceCapacityOpen: false,
        isEditConsentCompetenceCapacityOpen: false,
    },
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchConsentCompetenceOrCapacity()
})

async function fetchConsentCompetenceOrCapacity() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
        }
        const response = await consentCompetenceCapacityService.getConsentCompetenceCapacities(params)
        if (response) {
            state.records = response
            expandedRecords.splice(0, expandedRecords.length, ...response.data.map(() => false))
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function previous() {
    currentTablePage--
    fetchConsentCompetenceOrCapacity()
}

function next() {
    currentTablePage++
    fetchConsentCompetenceOrCapacity()
}

function toggleExpanded(index: number) {
    expandedRecords[index] = !expandedRecords[index]
}
</script>