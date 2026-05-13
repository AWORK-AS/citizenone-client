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

                <!-- Header -->
                <div class="flex items-center justify-between mb-5">
                    <div>
                        <h1 class="text-[22px] font-semibold text-[#1F2533]">{{ $t('superadmin.users.users') }}</h1>
                        <p class="text-sm text-[#5C6478] mt-0.5">{{ $t('superadmin.users.totalUsers', {
                            count:
                                state.users?.meta?.total ??
                                0
                        }) }}</p>
                    </div>
                    <button @click="userSlideOverRef?.open()"
                        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition-colors"
                        style="background:#205E77">
                        <Icon name="ph:plus" class="w-4 h-4" />
                        {{ $t('superadmin.users.newUser') }}
                    </button>
                </div>

                <!-- Search + tabs + sort -->
                <div class="flex flex-wrap items-center gap-3 mb-4">
                    <div class="relative flex-1 min-w-[220px] max-w-[380px]">
                        <Icon name="ph:magnifying-glass"
                            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8891A4]" />
                        <input v-model="searchQuery" type="text" :placeholder="$t('superadmin.users.searchPlaceholder')"
                            class="w-full pl-9 pr-3 py-2 text-sm border border-[#EAECF0] rounded-lg bg-white text-[#1F2533] placeholder-[#8891A4] outline-none focus:border-[#42AED9] focus:ring-2 focus:ring-[#42AED9]/10 transition-colors"
                            @input="debouncedSearch" />
                    </div>

                    <div class="flex items-center bg-white border border-[#EAECF0] rounded-lg p-0.5">
                        <button v-for="tab in tabs" :key="tab.key"
                            class="px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors flex items-center gap-1.5"
                            :style="state.activeTab === tab.key ? 'background:#205E77;color:#fff' : 'color:#5C6478'"
                            @click="setTab(tab.key)">
                            {{ tab.label }}
                            <span class="text-[11px] font-normal opacity-70">
                                ({{ tab.count }})
                            </span>
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

                <!-- Table -->
                <div class="bg-white border border-[#EAECF0] rounded-xl overflow-hidden shadow-sm">
                    <div v-if="state.isTableLoading" class="flex items-center justify-center py-16">
                        <Icon name="ph:spinner" class="w-7 h-7 text-[#42AED9] animate-spin" />
                    </div>

                    <div v-else-if="!state.users?.data?.length"
                        class="flex flex-col items-center gap-3 py-16 text-[#8891A4]">
                        <Icon name="ph:user" class="w-12 h-12 opacity-30" />
                        <p class="text-sm font-medium">{{ $t('superadmin.users.noUsersFound') }}</p>
                        <p class="text-xs">{{ $t('superadmin.users.createFirstUser') }}</p>
                        <button @click="userSlideOverRef?.open()"
                            class="mt-1 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
                            style="background:#205E77">
                            {{ $t('superadmin.users.createUser') }}
                        </button>
                    </div>

                    <table v-else class="w-full">
                        <thead>
                            <tr class="border-b border-[#EAECF0] bg-[#F9FAFB]">
                                <th class="co-th cursor-pointer" @click="toggleSort('firstname')">
                                    <div class="flex items-center gap-1">
                                        {{ $t('superadmin.users.table.name') }}
                                        <Icon name="ph:arrows-down-up" class="w-3 h-3 opacity-50" />
                                    </div>
                                </th>
                                <th class="co-th cursor-pointer" @click="toggleSort('email')">
                                    <div class="flex items-center gap-1">
                                        {{ $t('superadmin.users.table.email') }}
                                        <Icon name="ph:arrows-down-up" class="w-3 h-3 opacity-50" />
                                    </div>
                                </th>
                                <th class="co-th">{{ $t('superadmin.users.table.company') }}</th>
                                <th class="co-th">{{ $t('superadmin.users.table.phone') }}</th>
                                <th class="co-th">{{ $t('superadmin.users.table.role') }}</th>
                                <th class="co-th">{{ $t('superadmin.users.table.status') }}</th>
                                <th class="co-th"></th>
                            </tr>
                        </thead>
                        <tbody>
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
                                <td class="co-td">
                                    <div
                                        class="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button class="co-action-btn"
                                            @click="navigateTo(`/superadmin/users/edit/${user.uuid}`)">
                                            <Icon name="ph:pencil-simple" class="w-3.5 h-3.5" />
                                            {{ $t('superadmin.users.table.actions.edit') }}
                                        </button>
                                        <button class="co-action-btn !text-[#CC3B2D] hover:!bg-red-50 !border-red-200"
                                            @click="deleteConfirmation(user)">
                                            <Icon name="ph:trash" class="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <Pagination :data="state.users" @previous="previous" @next="next" />
            </div>

            <!-- New user slide-over -->
            <ModulesSuperadminUserSlideOverNewUser ref="userSlideOverRef" @saved="fetchUsers" />

            <!-- Delete confirmation -->
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
    users: [] as any,
    activeTab: 'all',
    allCount: 0, activeCount: 0, inactiveCount: 0, adminCount: 0,
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteUserOpen: false
    },
    selectedUser: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend'
    },
    dataFilter: {
        search: ''
    },
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
        if (state.activeTab === 'active') {
            params.is_active = true
        }
        if (state.activeTab === 'inactive') {
            params.is_active = false
        }
        if (state.activeTab === 'admins') {
            params.is_superadmin = true
        }
        const response = await userService.getUsers(params)
        if (response) {
            state.users = response
            const items = response?.data ?? []
            state.allCount = response?.total ?? items.length
            state.activeCount = items.filter((user: any) => user.is_active !== false).length
            state.inactiveCount = items.filter((user: any) => user.is_active === false).length
            state.adminCount = items.filter((user: any) => user.roles?.some((role: any) => role.name === 'Superadmin')).length
        }
    } catch (error: any) { state.error = error }
    state.isTableLoading = false
}

function debouncedSearch() {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        state.dataFilter.search = searchQuery.value
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
    currentTablePage = 1; fetchUsers()
}

function toggleSort(field: string) {
    state.sortData.sortOrder = state.sortData.sortField === field && state.sortData.sortOrder === 'ascend' ? 'descend' : 'ascend'
    state.sortData.sortField = field; currentTablePage = 1; fetchUsers()
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
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

</script>

<style scoped>
.co-th {
    text-align: left;
    padding: 10px 16px;
    font-size: 11px;
    font-weight: 600;
    color: #8891A4;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    white-space: nowrap
}

.co-td {
    padding: 12px 16px;
    vertical-align: middle
}

.co-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap
}

.co-badge-green {
    background: #EDF7EE;
    color: #2E9E33
}

.co-badge-red {
    background: #FFF0F0;
    color: #CC3B2D
}

.co-badge-navy {
    background: #E4F1F6;
    color: #205E77
}

.co-badge-gray {
    background: #F5F6F8;
    color: #5C6478
}

.co-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    background: #F5F6F8;
    color: #5C6478;
    border: 1px solid #EAECF0;
    transition: all 0.15s;
    cursor: pointer
}

.co-action-btn:hover {
    background: #EEF4FB;
    color: #205E77
}

.co-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #1F2533;
    margin-bottom: 5px
}

.co-input {
    width: 100%;
    padding: 9px 13px;
    font-size: 14px;
    color: #1F2533;
    background: white;
    border: 1px solid #D5D9E2;
    border-radius: 10px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s
}

.co-input:focus {
    border-color: #42AED9;
    box-shadow: 0 0 0 3px rgba(66, 174, 217, 0.12)
}

.co-input::placeholder {
    color: #B0B8C4
}

.co-error {
    font-size: 11px;
    color: #CC3B2D;
    margin-top: 4px
}
</style>
