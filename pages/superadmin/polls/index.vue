<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.polls.polls') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('superadmin.polls.polls') }}</template>

            <div class="p-1">
                <div class="flex items-center justify-between mb-5">
                    <div>
                        <h1 class="text-[22px] font-semibold text-[#1F2533]">
                            {{ $t('superadmin.polls.polls') }}
                        </h1>
                    </div>
                    <button @click="navigateTo('/superadmin/polls/new')"
                        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition-colors"
                        style="background:#205E77">
                        <Icon name="ph:plus" class="w-4 h-4" />
                        {{ $t('superadmin.polls.newPoll') }}
                    </button>
                </div>

                <div class="flex flex-wrap items-center gap-3 mb-4">
                    <SuperadminTableSearch v-model="searchQuery" :placeholder="$t('search') + '...'"
                        @input="debouncedSearch" />
                </div>

                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <SuperadminTable :columnHeaders="state.columnHeaders" :data="state.polls"
                    :isLoading="state.isTableLoading" :sortData="state.sortData"
                    :emptyMessage="$t('superadmin.polls.noPollsFound')" emptyIcon="ph:chats-circle" rowKey="uuid"
                    @sort="handleSort">
                    <template #body>
                        <tr v-for="(poll, index) in state.polls?.data" :key="index"
                            class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors group">
                            <td class="co-td text-[13px] font-medium text-[#1F2533]">
                                {{ poll?.title }}
                            </td>
                            <td class="co-td">
                                <span v-if="poll?.is_active" class="co-badge co-badge-green">
                                    <span class="w-1.5 h-1.5 rounded-full bg-[#2E9E33]"></span>
                                    {{ $t('superadmin.polls.table.active') }}
                                </span>
                                <span v-else class="co-badge co-badge-gray">
                                    <span class="w-1.5 h-1.5 rounded-full bg-[#8891A4]"></span>
                                    {{ $t('superadmin.polls.table.inactive') }}
                                </span>
                            </td>
                            <td class="co-td" @click.stop>
                                <div
                                    class="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <SuperadminTableButton @click="navigateTo(`/superadmin/polls/${poll.uuid}`)">
                                        <Icon name="ph:eye" class="w-3.5 h-3.5" />
                                        {{ $t('superadmin.polls.table.actions.view') }}
                                    </SuperadminTableButton>
                                    <SuperadminTableButton @click="navigateTo(`/superadmin/polls/${poll.uuid}/edit`)">
                                        <Icon name="ph:pencil-simple" class="w-3.5 h-3.5" />
                                        {{ $t('superadmin.polls.table.actions.edit') }}
                                    </SuperadminTableButton>
                                    <SuperadminTableButton buttonStyle="danger" @click="deleteConfirmation(poll)">
                                        <Icon name="ph:trash" class="w-3.5 h-3.5" />
                                        {{ $t('superadmin.polls.table.actions.delete') }}
                                    </SuperadminTableButton>
                                </div>
                            </td>
                        </tr>
                    </template>
                </SuperadminTable>

                <Pagination :data="state.polls" @previous="previous" @next="next" />
            </div>

            <DialogConfirmation :isModalOpen="state.modal.isDeletePollOpen"
                :message="$t('superadmin.polls.confirmation.deletePollConfirmation') + '?'"
                @close="state.modal.isDeletePollOpen = false" @confirm="deletePoll" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { pollService } from '@/components/api/superadmin/PollService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

let currentTablePage = 1
let searchTimeout: any = null
const searchQuery = ref('')

const state = reactive({
    columnHeaders: computed(() => [
        { key: 'title', name: t('superadmin.polls.table.title'), sorter: true },
        { key: 'is_active', name: t('superadmin.polls.table.status'), sorter: true },
        { key: 'actions', name: '' },
    ]),
    dataFilter: {
        search: ''
    } as any,
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeletePollOpen: false
    },
    polls: [] as any,
    selectedPoll: {} as any,
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
            ...state.dataFilter,
        }
        const response = await pollService.getPolls(params)
        if (response) state.polls = response
    } catch (error: any) { state.error = error }
    state.isTableLoading = false
}

function debouncedSearch() {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        state.dataFilter.search = Array(searchQuery.value.trim().split(/\s+/))
        currentTablePage = 1
        fetchPolls()
    }, 350)
}

function handleSort({ sort, column }: { sort: string | null; column: string | null }) {
    state.sortData.sortField = column ?? 'id'
    state.sortData.sortOrder = sort ?? 'descend'
    currentTablePage = 1
    fetchPolls()
}

function previous() {
    currentTablePage--
    fetchPolls()
}

function next() {
    currentTablePage++
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
        const response = await pollService.deletePoll(state.selectedPoll?.uuid)
        if (response) {
            fetchPolls()
            successAlert(`${t('alert.success')}!`, `${t('superadmin.polls.form.alert.pollSuccessfullyDeleted')}.`)
        }
    } catch (error: any) { state.error = error }
    state.isTableLoading = false
}
</script>
