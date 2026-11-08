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
                <ModulesSuperadminPageHeader :title="$t('superadmin.users.users')"
                    :subtitle="$t('superadmin.users.totalUsers', { count: state.users?.meta?.total ?? 0 })">
                    <template #actions>
                        <button @click="showNewUserSlider = true"
                            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition-colors bg-tertiary">
                            <Icon name="ph:plus" class="w-4 h-4" />
                            {{ $t('superadmin.users.newUser') }}
                        </button>
                    </template>
                </ModulesSuperadminPageHeader>

                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <ModulesSuperadminDataTable :columns="columns" :rows="state.users?.data ?? []" rowKey="uuid"
                    :loading="state.isTableLoading" :error="state.loadError" :meta="meta"
                    :sort="list.state.sort" :order="list.state.order"
                    v-model:search="list.searchInput.value"
                    :searchPlaceholder="$t('superadmin.users.searchPlaceholder')"
                    :filtered="list.isFiltered.value" clickable
                    emptyIcon="ph:user" :emptyTitle="$t('superadmin.users.noUsersFound')"
                    :emptyHint="$t('superadmin.users.createFirstUser')"
                    :exportName="$t('superadmin.users.users')" :exportPage="exportPage"
                    :exportColumns="exportColumns"
                    @sort="list.toggleSort" @page="list.setPage" @reset="list.reset" @retry="list.reload"
                    @row-click="openEditSlider">
                    <template #filters>
                        <ModulesSuperadminDataTableTabs :modelValue="list.state.filters.status || 'all'" :tabs="tabs"
                            @update:modelValue="(tab) => list.setFilter('status', tab === 'all' ? '' : tab)" />
                        <ModulesSuperadminDataTableSelect :modelValue="sortLabel" :options="sortOptions"
                            :placeholder="sortOptions.some(o => o.value === sortLabel) ? undefined : '—'"
                            @update:modelValue="handleSortChange" />
                    </template>

                    <template #cell-firstname="{ row: user }">
                        <div class="flex items-center gap-3">
                            <img :src="user?.image ?? avatarUrl(`${(user?.firstname || '?') + '+' + (user?.lastname || '')}`)"
                                class="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                            <p class="text-[13px] font-semibold text-ink">
                                {{ user?.firstname }} {{ user?.lastname }}
                            </p>
                        </div>
                    </template>
                    <template #cell-company="{ row: user }">
                        <span v-if="user?.company?.name" class="text-[12px] font-medium text-ink">
                            {{ user.company.name }}
                        </span>
                        <span v-else class="text-ink-muted">—</span>
                    </template>
                    <template #cell-role="{ row: user }">
                        <span v-if="user?.is_superadmin" class="co-badge co-badge-navy">
                            <Icon name="ph:crown-simple" class="w-3 h-3" />
                            {{ $t('superadmin.sidebar.superAdmin') }}
                        </span>
                        <span v-else-if="user?.roles?.length" class="co-badge co-badge-gray">
                            {{ user.roles[0]?.name }}
                        </span>
                        <span v-else class="text-ink-muted text-[12px]">—</span>
                    </template>
                    <template #cell-status="{ row: user }">
                        <ModulesSuperadminStatusPill v-if="user?.is_active !== false" variant="success">
                            {{ $t('superadmin.companies.table.active') }}
                        </ModulesSuperadminStatusPill>
                        <ModulesSuperadminStatusPill v-else variant="neutral">
                            {{ $t('superadmin.companies.table.inactive') }}
                        </ModulesSuperadminStatusPill>
                    </template>
                    <template #cell-two_factor="{ row: user }">
                        <ModulesSuperadminTwoFactorStatusBadge :user="user" />
                    </template>
                    <template #cell-actions="{ row: user }">
                        <div
                            class="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                            <SuperadminTableButton @click="openEditSlider(user)">
                                <Icon name="ph:pencil-simple" class="w-3.5 h-3.5" />
                                {{ $t('superadmin.users.table.actions.edit') }}
                            </SuperadminTableButton>
                            <SuperadminTableButton buttonStyle="danger" @click="deleteConfirmation(user)">
                                <Icon name="ph:trash" class="w-3.5 h-3.5" />
                            </SuperadminTableButton>
                        </div>
                    </template>
                </ModulesSuperadminDataTable>
            </div>

            <ModulesSuperadminUserSlideOverNewUser :isOpen="showNewUserSlider" @close="showNewUserSlider = false"
                @saved="fetchUsers" />
            <ModulesSuperadminUserSlideOverEditUser :isOpen="showEditUserSlider" :userUuid="editUserUuid"
                @close="showEditUserSlider = false" @saved="fetchUsers" />
            <DialogConfirmation :isModalOpen="state.modal.isDeleteUserOpen"
                :message="`${$t('superadmin.users.confirmation.deleteUserConfirmation')} ${state.selectedUser?.firstname} ${state.selectedUser?.lastname}?`"
                @close="state.modal.isDeleteUserOpen = false" @confirm="deleteUser" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { userService } from '@/components/api/superadmin/UserService'
import { useAlert } from '@/composables/alert'
import { useListQuery } from '@/composables/useListQuery'
import { apiSearchParam } from '@/composables/listQuery'
import { normalizePageMeta, responseRows, type DataTableColumn } from '@/composables/dataTable'
import type { CsvColumn } from '@/composables/csvExport'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

const showNewUserSlider = ref(false)
const showEditUserSlider = ref(false)
const editUserUuid = ref<string | null>(null)

const state = reactive({
    activeCount: 0,
    adminCount: 0,
    allCount: 0,
    error: {} as Error,
    loadError: null as string | null,
    inactiveCount: 0,
    isTableLoading: false,
    modal: { isDeleteUserOpen: false },
    selectedUser: {} as any,
    users: [] as any,
})

const list = useListQuery({
    filters: { status: '' },
    defaultSort: 'id',
    defaultOrder: 'desc',
    onChange: fetchUsers,
})

const meta = computed(() => normalizePageMeta(state.users))

const columns = computed<DataTableColumn[]>(() => [
    { key: 'firstname', label: t('superadmin.users.table.name'), sortable: true },
    { key: 'email', label: t('superadmin.users.table.email'), sortable: true },
    { key: 'company', label: t('superadmin.users.table.company') },
    { key: 'phone', label: t('superadmin.users.table.phone') },
    { key: 'role', label: t('superadmin.users.table.role') },
    { key: 'status', label: t('superadmin.users.table.status') },
    { key: 'two_factor', label: t('superadmin.twoFactor.column') },
    { key: 'actions', label: '', align: 'right' },
])

const exportColumns = computed<CsvColumn[]>(() => [
    { label: t('superadmin.users.table.name'), value: u => [u?.firstname, u?.lastname].filter(Boolean).join(' ') },
    { label: t('superadmin.users.table.email'), value: u => u?.email },
    { label: t('superadmin.users.table.company'), value: u => u?.company?.name },
    { label: t('superadmin.users.table.phone'), value: u => u?.phone },
    { label: t('superadmin.users.table.role'), value: u => (u?.is_superadmin ? t('superadmin.sidebar.superAdmin') : u?.roles?.[0]?.name) },
    { label: t('superadmin.users.table.status'), value: u => t(u?.is_active !== false ? 'superadmin.companies.table.active' : 'superadmin.companies.table.inactive') },
])

const tabs = computed(() => [
    { key: 'all', label: t('superadmin.users.tabs.all'), count: (state.activeCount + state.inactiveCount) || 0 },
    { key: 'active', label: t('superadmin.users.tabs.active'), count: state.activeCount },
    { key: 'inactive', label: t('superadmin.users.tabs.inactive'), count: state.inactiveCount },
    { key: 'admins', label: t('superadmin.users.tabs.admins'), count: state.adminCount },
])

const sortOptions = computed(() => [
    { value: 'firstname_asc', label: t('superadmin.users.sort.nameAsc') },
    { value: 'firstname_desc', label: t('superadmin.users.sort.nameDesc') },
    { value: 'id_desc', label: t('superadmin.users.sort.newestFirst') },
    { value: 'id_asc', label: t('superadmin.users.sort.oldestFirst') },
])

const sortLabel = computed(() => `${list.state.sort}_${list.state.order}`)

function handleSortChange(value: string) {
    if (!value) return
    const parts = value.split('_')
    const order = parts.pop()
    list.setSort(parts.join('_'), order === 'asc' ? 'asc' : 'desc')
}

function listParams(page: number) {
    const params: any = { page, ...list.apiSort() }
    const search = apiSearchParam(list.state.search)
    if (search) params.search = search
    const tab = list.state.filters.status
    if (tab === 'active') params.is_active = true
    if (tab === 'inactive') params.is_active = false
    if (tab === 'admins') params.is_superadmin = true
    return params
}

let requestSeq = 0

async function fetchUsers() {
    const seq = ++requestSeq
    state.loadError = null
    state.isTableLoading = true
    try {
        const response = await userService.getUsers(listParams(list.state.page))
        if (seq !== requestSeq) return
        if (response) {
            state.users = response
            const items = response?.data ?? []
            state.allCount = response?.total ?? items.length
            state.activeCount = response?.active_count || 0
            state.inactiveCount = response?.inactive_count || 0
            state.adminCount = response?.admins_count || 0
        }
    } catch (error: any) {
        if (seq !== requestSeq) return
        state.loadError = error?.message || t('superadmin.dataTable.errorTitle')
    }
    if (seq === requestSeq) state.isTableLoading = false
}

async function exportPage(page: number) {
    const response = await userService.getUsers(listParams(page))
    const pageMeta = normalizePageMeta(response)
    return { rows: responseRows(response), lastPage: pageMeta?.lastPage ?? 1, total: pageMeta?.total ?? 0 }
}

function openEditSlider(user: any) {
    editUserUuid.value = user.uuid
    showEditUserSlider.value = true
}

function deleteConfirmation(user: any) {
    state.selectedUser = user
    state.modal.isDeleteUserOpen = true
}

async function deleteUser() {
    state.error = {}
    try {
        const response = await userService.deleteUser(state.selectedUser?.uuid)
        if (response) {
            fetchUsers()
            successAlert(`${t('alert.success')}!`, `${t('superadmin.users.form.alert.userSuccessfullyDeleted')}.`)
        }
    } catch (error: any) { state.error = error }
}
</script>
