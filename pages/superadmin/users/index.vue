<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>
                    {{ $t('superadmin.users.users') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>
            <template #header>
                {{ $t('superadmin.users.users') }}
            </template>

            <div class="p-1">
                <div class="flex items-center justify-between mb-5">
                    <div>
                        <h1 class="text-[22px] font-semibold text-[#1F2533]">
                            {{ $t('superadmin.users.users') }}
                        </h1>
                        <p class="text-sm text-[#5C6478] mt-0.5">
                            {{ $t('superadmin.users.totalUsers', {
                                count: state.users?.meta?.total ?? 0
                            }) }}
                        </p>
                    </div>
                    <button @click="userSlideOverRef?.open()"
                        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition-colors"
                        style="background:#205E77">
                        <Icon name="ph:plus" class="w-4 h-4" />
                        {{ $t('superadmin.users.newUser') }}
                    </button>
                </div>

                <div class="flex flex-wrap items-center gap-3 mb-4">
                    <SuperadminTableSearch v-model="searchQuery" :placeholder="$t('superadmin.users.searchPlaceholder')"
                        @input="debouncedSearch" />

                    <div class="flex items-center bg-white border border-[#EAECF0] rounded-lg p-0.5">
                        <button v-for="tab in tabs" :key="tab.key"
                            class="px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors flex items-center gap-1.5"
                            :style="state.activeTab === tab.key ? 'background:#205E77;color:#fff' : 'color:#5C6478'"
                            @click="setTab(tab.key)">
                            {{ tab.label }}
                            <span class="text-[11px] font-normal opacity-70">({{ tab.count }})</span>
                        </button>
                    </div>

                    <select v-model="sortLabel"
                        class="text-sm border border-[#EAECF0] rounded-lg px-3 py-2 bg-white text-[#5C6478] outline-none focus:border-[#42AED9] transition-colors ml-auto"
                        @change="handleSortChange">
                        <option value="firstname_asc">{{ $t('superadmin.users.sort.nameAsc') }}</option>
                        <option value="firstname_desc">{{ $t('superadmin.users.sort.nameDesc') }}</option>
                        <option value="id_desc">{{ $t('superadmin.users.sort.newestFirst') }}</option>
                        <option value="id_asc">{{ $t('superadmin.users.sort.oldestFirst') }}</option>
                    </select>
                </div>

                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <SuperadminTable :columnHeaders="state.columnHeaders" :data="state.users"
                    :isLoading="state.isTableLoading" :sortData="state.sortData"
                    :emptyMessage="$t('superadmin.users.noUsersFound')"
                    :emptySubMessage="$t('superadmin.users.createFirstUser')" emptyIcon="ph:user" rowKey="uuid"
                    @sort="handleSort">
                    <template #body>
                        <tr v-for="(user, index) in state.users?.data" :key="index"
                            class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors group">
                            <td class="co-td">
                                <div class="flex items-center gap-3">
                                    <img :src="user?.image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${encodeURIComponent((user?.firstname || '?') + '+' + (user?.lastname || ''))}&size=32`"
                                        class="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                                    <p class="text-[13px] font-semibold text-[#1F2533]">
                                        {{ user?.firstname }} {{ user?.lastname }}
                                    </p>
                                </div>
                            </td>
                            <td class="co-td text-[13px] text-[#5C6478]">
                                {{ user?.email }}
                            </td>
                            <td class="co-td">
                                <span v-if="user?.company?.name" class="text-[12px] font-medium text-[#1F2533]">
                                    {{ user.company.name }}
                                </span>
                                <span v-else class="text-[#8891A4] text-[13px]">—</span>
                            </td>
                            <td class="co-td text-[13px] text-[#5C6478]">
                                {{ user?.phone || '—' }}
                            </td>
                            <td class="co-td">
                                <span v-if="user?.is_superadmin" class="co-badge co-badge-navy">
                                    <Icon name="ph:crown-simple" class="w-3 h-3" />
                                    {{ $t('superadmin.sidebar.superAdmin') }}
                                </span>
                                <span v-else-if="user?.roles?.length" class="co-badge co-badge-gray">
                                    {{ user.roles[0]?.name }}
                                </span>
                                <span v-else class="text-[#8891A4] text-[12px]">—</span>
                            </td>
                            <td class="co-td">
                                <span v-if="user?.is_active !== false" class="co-badge co-badge-green">
                                    <span class="w-1.5 h-1.5 rounded-full bg-[#2E9E33]"></span>
                                    {{ $t('superadmin.companies.table.active') }}
                                </span>
                                <span v-else class="co-badge co-badge-red">
                                    <span class="w-1.5 h-1.5 rounded-full bg-[#CC3B2D]"></span>
                                    {{ $t('superadmin.companies.table.inactive') }}
                                </span>
                            </td>
                            <td class="co-td" @click.stop>
                                <div
                                    class="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <SuperadminTableButton @click="navigateTo(`/superadmin/users/edit/${user.uuid}`)">
                                        <Icon name="ph:pencil-simple" class="w-3.5 h-3.5" />
                                        {{ $t('superadmin.users.table.actions.edit') }}
                                    </SuperadminTableButton>
                                    <SuperadminTableButton buttonStyle="danger" @click="deleteConfirmation(user)">
                                        <Icon name="ph:trash" class="w-3.5 h-3.5" />
                                    </SuperadminTableButton>
                                </div>
                            </td>
                        </tr>
                    </template>
                </SuperadminTable>
                <Pagination :data="state.users" @previous="previous" @next="next" />
            </div>

            <ModulesSuperadminUserSlideOverNewUser ref="userSlideOverRef" @saved="fetchUsers" />
            <DialogConfirmation :isModalOpen="state.modal.isDeleteUserOpen"
                :message="`${$t('superadmin.users.confirmation.deleteUserConfirmation')} ${state.selectedUser?.firstname} ${state.selectedUser?.lastname}?`"
                @close="state.modal.isDeleteUserOpen = false" @confirm="deleteUser" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { userService } from '@/components/api/superadmin/UserService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

const userSlideOverRef = ref<any>(null)

let currentTablePage = 1
let searchTimeout: any = null
const searchQuery = ref('')
const sortLabel = ref('id_desc')

const state = reactive({
    activeCount: 0,
    activeTab: 'all',
    adminCount: 0,
    allCount: 0,
    columnHeaders: computed(() => [
        { key: 'firstname', name: t('superadmin.users.table.name'), sorter: true },
        { key: 'email', name: t('superadmin.users.table.email'), sorter: true },
        { key: 'company', name: t('superadmin.users.table.company') },
        { key: 'phone', name: t('superadmin.users.table.phone') },
        { key: 'role', name: t('superadmin.users.table.role') },
        { key: 'status', name: t('superadmin.users.table.status') },
        { key: 'actions', name: '' },
    ]),
    dataFilter: {
        search: ''
    } as any,
    error: {} as Error,
    inactiveCount: 0,
    isTableLoading: false,
    modal: { isDeleteUserOpen: false },
    selectedUser: {} as any,
    sortData: { sortField: 'id', sortOrder: 'descend' },
    users: [] as any,
})

const tabs = computed(() => [
    { key: 'all', label: t('superadmin.users.tabs.all'), count: state.allCount },
    { key: 'active', label: t('superadmin.users.tabs.active'), count: state.activeCount },
    { key: 'inactive', label: t('superadmin.users.tabs.inactive'), count: state.inactiveCount },
    { key: 'admins', label: t('superadmin.users.tabs.admins'), count: state.adminCount },
])

onMounted(() => {
    fetchUsers()
})

async function fetchUsers() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params: any = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter,
        }
        if (state.activeTab === 'active') params.is_active = true
        if (state.activeTab === 'inactive') params.is_active = false
        if (state.activeTab === 'admins') params.is_superadmin = true

        const response = await userService.getUsers(params)
        if (response) {
            state.users = response
            const items = response?.data ?? []
            state.allCount = response?.total ?? items.length
            state.activeCount = items.filter((u: any) => u.is_active !== false).length
            state.inactiveCount = items.filter((u: any) => u.is_active === false).length
            state.adminCount = items.filter((u: any) => u.roles?.some((r: any) => r.name === 'Superadmin')).length
        }
    } catch (error: any) { state.error = error }
    state.isTableLoading = false
}

function debouncedSearch() {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        state.dataFilter.search = Array(searchQuery.value.trim().split(/\s+/))
        currentTablePage = 1
        fetchUsers()
    }, 350)
}

function setTab(tab: string) { state.activeTab = tab; currentTablePage = 1; fetchUsers() }

function handleSortChange() {
    const parts = sortLabel.value.split('_')
    const order = parts.pop()
    state.sortData.sortField = parts.join('_')
    state.sortData.sortOrder = order === 'asc' ? 'ascend' : 'descend'
    currentTablePage = 1
    fetchUsers()
}

function handleSort({ sort, column }: { sort: string | null; column: string | null }) {
    state.sortData.sortField = column ?? 'id'
    state.sortData.sortOrder = sort ?? 'descend'
    currentTablePage = 1
    fetchUsers()
}

function previous() {
    currentTablePage--
    fetchUsers()
}

function next() {
    currentTablePage++
    fetchUsers()
}

function deleteConfirmation(user: any) {
    state.selectedUser = user
    state.modal.isDeleteUserOpen = true
}

async function deleteUser() {
    state.isTableLoading = true
    try {
        const response = await userService.deleteUser(state.selectedUser?.uuid)
        if (response) {
            fetchUsers()
            successAlert(`${t('alert.success')}!`, `${t('superadmin.users.form.alert.userSuccessfullyDeleted')}.`)
        }
    } catch (error: any) { state.error = error }
    state.isTableLoading = false
}
</script>
