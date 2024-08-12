<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.polls.polls') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.polls.polls') }}</template>

            <div>
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg" @click="navigateTo('/superadmin/polls/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('superadmin.polls.newPoll') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch :columnFilter="state.columnFilter" :dataFilter="state.dataFilter"
                        @handleFilter="handleFilter" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.polls"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.polls?.data?.length === 0))">
                                <tr v-for="(poll, index) in state.polls?.data" :key="index">
                                    <td width="40%">
                                        <div>
                                            {{ poll?.title }}
                                        </div>
                                    </td>
                                    <td width="30%">
                                        <div class="flex items-center gap-x-2">
                                            <Badge :type="poll?.is_active ? 'active' : 'primary'">
                                                <p class="text-xs">
                                                    {{ poll?.is_active ?
                                                        $t('superadmin.polls.table.active') :
                                                        $t('superadmin.polls.table.inactive') }}
                                                </p>
                                            </Badge>
                                        </div>
                                    </td>
                                    <td width="30%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/superadmin/polls/${poll.uuid}`)">
                                                <Icon name="ph:eye" class="size-4" />
                                                {{ $t('superadmin.polls.table.actions.view') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/superadmin/polls/${poll.uuid}/edit`)">
                                                <Icon name="ph:pencil" class="size-4" />
                                                {{ $t('superadmin.polls.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                @click="deleteConfirmation(poll)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('superadmin.polls.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.polls" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeletePollOpen"
                :message="$t('superadmin.polls.confirmation.deletePollConfirmation') + '?'"
                @close="state.modal.isDeletePollOpen = false" @confirm="deletePoll" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { pollService } from '@/components/api/superadmin/PollService'
import { useI18n } from "vue-i18n"
import { notify } from "@kyvg/vue3-notification"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
let currentTablePage = 1

const state = reactive({
    columnFilter: [
        { column: 'title' },
        { column: 'status' },
    ],
    columnHeaders: [
        { name: 'superadmin.polls.table.title', sorter: true, key: 'title' },
        { name: 'superadmin.polls.table.status', sorter: true, key: 'is_active' },
        { name: '' },
    ],
    dataFilter: [],
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeletePollOpen: false
    },
    polls: [] as any,
    selectedPoll: [],
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchPolls()
})

async function fetchPolls() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await pollService.getPolls(params)
        if (response) {
            state.polls = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchPolls()
}

function next() {
    currentTablePage++
    fetchPolls()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchPolls()
}

function handleFilter(value: any) {
    currentTablePage = 1
    state.dataFilter = value
    fetchPolls()
}

function deleteConfirmation(poll: any) {
    state.selectedPoll = poll
    state.modal.isDeletePollOpen = true
}

async function deletePoll() {
    state.error = {}
    state.isTableLoading = true
    try {
        const pollUuid = state.selectedPoll?.uuid
        const response = await pollService.deletePoll(pollUuid)
        if (response) {
            fetchPolls()
            successAlert(`${t('alert.success')}!`, `${t('superadmin.polls.form.alert.pollSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function successAlert(title: string, message: string) {
    notify({
        title: title,
        text: message,
        type: 'success',
    })
}
</script>