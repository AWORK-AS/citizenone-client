<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.nursingAreas.nursingProfessionalRecords') }} - {{
                    runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('citizens.nursingAreas.nursingProfessionalRecords') }}</template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesCitizenDetailsHeader />
                <ModulesCitizenJournalTabs />

                <div>
                    <div class="mt-8 flex justify-end items-center mb-5 gap-x-2">
                        <FormButton buttonStyle="action" class="rounded-lg"
                            @click="navigateTo(`/citizens/${citizenUuid}/nursing-areas/new`)">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('citizens.nursingAreas.newNursingProfessionalRecords') }}
                        </FormButton>
                    </div>
                </div>

                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.records"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.records?.data?.length === 0))">
                                <tr v-for="(record, index) in state.records?.data" :key="index">
                                    <td width="15%">
                                        <span>{{ formatDateToReadable(record?.date) }}</span>
                                    </td>
                                    <td width="55%">
                                        <div class="space-y-3" :class="expandedRecords[index] ? '' : 'line-clamp-2'">
                                            <div>
                                                <p class="font-bold">
                                                    {{ $t('citizens.nursingAreas.form.functionalLevel') }}
                                                </p>
                                                <p class="text-sm">
                                                    {{ record?.functional_level }}
                                                </p>
                                            </div>
                                            <div>
                                                <p class="font-bold">
                                                    {{ $t('citizens.nursingAreas.form.musculoskeletalSystem') }}
                                                </p>
                                                <p class="text-sm">
                                                    {{ record?.musculoskeletal_system }}
                                                </p>
                                            </div>
                                            <div>
                                                <p class="font-bold">
                                                    {{ $t('citizens.nursingAreas.form.nutrition') }}
                                                </p>
                                                <p class="text-sm">
                                                    {{ record?.nutrition }}
                                                </p>
                                            </div>
                                            <div>
                                                <p class="font-bold">
                                                    {{ $t('citizens.nursingAreas.form.skinAndMucousMembranes') }}
                                                </p>
                                                <p class="text-sm">
                                                    {{ record?.skin_and_mucous_membranes }}
                                                </p>
                                            </div>
                                            <div>
                                                <p class="font-bold">
                                                    {{ $t('citizens.nursingAreas.form.communication') }}
                                                </p>
                                                <p class="text-sm">
                                                    {{ record?.communication }}
                                                </p>
                                            </div>
                                            <div>
                                                <p class="font-bold">
                                                    {{ $t('citizens.nursingAreas.form.psychosocialConditions') }}
                                                </p>
                                                <p class="text-sm">
                                                    {{ record?.psychosocial_conditions }}
                                                </p>
                                            </div>
                                            <div>
                                                <p class="font-bold">
                                                    {{ $t('citizens.nursingAreas.form.respirationAndCirculation') }}
                                                </p>
                                                <p class="text-sm">
                                                    {{ record?.respiration_and_circulation }}
                                                </p>
                                            </div>
                                            <div>
                                                <p class="font-bold">
                                                    {{ $t('citizens.nursingAreas.form.sexuality') }}
                                                </p>
                                                <p class="text-sm">
                                                    {{ record?.sexuality }}
                                                </p>
                                            </div>
                                            <div>
                                                <p class="font-bold">
                                                    {{ $t('citizens.nursingAreas.form.painAndSensoryImpressions') }}
                                                </p>
                                                <p class="text-sm">
                                                    {{ record?.pain_and_sensory_impressions }}
                                                </p>
                                            </div>
                                            <div>
                                                <p class="font-bold">
                                                    {{ $t('citizens.nursingAreas.form.sleepAndRest') }}
                                                </p>
                                                <p class="text-sm">
                                                    {{ record?.sleep_and_rest }}
                                                </p>
                                            </div>
                                            <div>
                                                <p class="font-bold">
                                                    {{ $t('citizens.nursingAreas.form.knowledgeAndDevelopment') }}
                                                </p>
                                                <p class="text-sm">
                                                    {{ record?.knowledge_and_development }}
                                                </p>
                                            </div>
                                            <div>
                                                <p class="font-bold">
                                                    {{ $t('citizens.nursingAreas.form.excretionOfWaste') }}
                                                </p>
                                                <p class="text-sm">
                                                    {{ record?.excretion_of_waste }}
                                                </p>
                                            </div>
                                        </div>
                                        <button @click="toggleExpanded(index)"
                                            class="text-primary text-sm hover:text-primary-700">
                                            {{ expandedRecords[index] ?
                                                $t('showLess') :
                                                $t('showMore') }}
                                        </button>
                                    </td>
                                    <td width="15%">
                                        <span>{{ record?.user?.firstname + ' ' + record?.user?.lastname }}</span>
                                    </td>
                                    <td width="15%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/citizens/${citizenUuid}/nursing-areas/${record.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('citizens.nursingAreas.table.actions.edit') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.records" @previous="previous" @next="next" />
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { nursingAreasService } from '@/components/api/NursingAreasService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const { formatDateToReadable } = useDatetimeFormatter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as any
const expandedRecords = reactive([] as boolean[])
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'citizens.nursingAreas.table.date', sorter: true, key: 'date' },
        { name: 'citizens.nursingAreas.table.data' },
        { name: 'citizens.nursingAreas.table.reportedBy' },
        { name: '' },
    ],
    error: {} as Error,
    isTableLoading: false,
    records: [] as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchNursingProfessionalRecords()
})

async function fetchNursingProfessionalRecords() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
        }
        const response = await nursingAreasService.getNursingProfessionalRecords(params)
        if (response) {
            state.records = response
            expandedRecords.splice(0, expandedRecords.length, ...response.data.map(() => false))
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchNursingProfessionalRecords()
}

function next() {
    currentTablePage++
    fetchNursingProfessionalRecords()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchNursingProfessionalRecords()
}

function toggleExpanded(index: number) {
    expandedRecords[index] = !expandedRecords[index]
}
</script>