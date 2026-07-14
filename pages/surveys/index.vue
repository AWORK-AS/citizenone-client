<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('surveys.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('surveys.title') }}</template>

            <div class="flex justify-end items-center mb-5">
                <FormButton buttonStyle="action" data-tour="surveys-new" @click="navigateTo('/surveys/new')">
                    <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                    {{ $t('surveys.newSurvey') }}
                </FormButton>
            </div>

            <div class="space-y-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <TableSearch @search="handleSearch" />
                <div class="table-responsive">
                    <Table :columnHeaders="state.columnHeaders" :data="state.surveys" :isLoading="state.isTableLoading"
                        :sortData="state.sortData" @sort="sort">
                        <template #body v-if="!(state.isTableLoading || (state.surveys?.data?.length === 0))">
                            <tr v-for="(survey, index) in state.surveys?.data" :key="index">
                                <td width="45%">
                                    <p>{{ survey?.title }}</p>
                                </td>
                                <td width="35%">
                                    <p class="text-gray-500 truncate max-w-md" v-html="survey?.description"></p>
                                </td>
                                <td width="20%">
                                    <div class="flex items-end justify-end gap-2">
                                        <FormButton type="button" buttonStyle="action" data-tour="survey-results"
                                            @click="navigateTo(`/surveys/${survey.uuid}/assignments`)">
                                            <Icon name="ph:chart-line" class="size-4" />
                                            {{ $t('surveys.results') }}
                                        </FormButton>
                                        <FormButton type="button" buttonStyle="action"
                                            @click="navigateTo(`/surveys/${survey.uuid}/edit`)">
                                            <Icon name="ph:pencil-simple" class="size-4" />
                                            {{ $t('surveys.table.edit') }}
                                        </FormButton>
                                        <FormButton type="button" buttonStyle="action" @click="deleteConfirmation(survey)">
                                            <Icon name="ph:trash" class="size-4" />
                                            {{ $t('surveys.table.delete') }}
                                        </FormButton>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </Table>
                </div>
                <Pagination :data="state.surveys" @previous="previous" @next="next" />
            </div>

            <DialogConfirmation :isModalOpen="state.modal.isDeleteOpen"
                :message="$t('surveys.confirmation.deleteSurvey') + '?'"
                @close="state.modal.isDeleteOpen = false" @confirm="deleteSurvey" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { surveyService } from '@/components/api/user/SurveyService'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore() as any
let currentTablePage = 1

watch(() => userStore.getUser, (user: any) => {
    if (user?.uuid && user?.is_surveys_active === false) navigateTo('/apps')
}, { immediate: true })

const state = reactive({
    columnHeaders: [
        { name: 'surveys.table.title', isTranslateName: true, sorter: true, key: 'title' },
        { name: 'surveys.table.description', isTranslateName: true },
        { name: '' },
    ],
    dataFilter: { search: '' },
    error: {} as Error,
    surveys: [] as any,
    isTableLoading: false,
    modal: { isDeleteOpen: false },
    selectedSurvey: {} as any,
    sortData: { sortField: 'id', sortOrder: 'descend' },
})

onMounted(() => fetchSurveys())

async function fetchSurveys() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await surveyService.getSurveys({
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter,
        })
        if (response) state.surveys = response
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() { currentTablePage--; fetchSurveys() }
function next() { currentTablePage++; fetchSurveys() }
function sort(s: any) { currentTablePage = 1; state.sortData = { sortField: s.column, sortOrder: s.sort }; fetchSurveys() }
function handleSearch(v: any) { currentTablePage = 1; state.dataFilter.search = v?.[0] == '' ? [] : v; fetchSurveys() }

function deleteConfirmation(survey: any) {
    state.selectedSurvey = survey
    state.modal.isDeleteOpen = true
}

async function deleteSurvey() {
    state.error = {}
    state.modal.isDeleteOpen = false
    state.isTableLoading = true
    try {
        const response = await surveyService.deleteSurvey(state.selectedSurvey?.uuid)
        if (response) {
            successAlert(`${t('alert.success')}!`, `${t('surveys.alert.deleted')}.`)
            fetchSurveys()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
