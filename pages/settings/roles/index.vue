<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('roles.roles') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('roles.roles') }}</template>

            <ModulesUserSettingsTab />

            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" @click="navigateTo('/settings/roles/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('roles.addNewRole') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.roles"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.roles?.data?.length === 0))">
                                <tr v-for="(role, index) in state.roles?.data" :key="index">
                                    <td width="20%">
                                        <span v-if="role.name === 'Admin'">
                                            {{ $t('roles.table.admin') }}
                                        </span>
                                        <span v-else-if="role.name === 'User'">
                                            {{ $t('roles.table.user') }}
                                        </span>
                                        <span v-else-if="role.name === 'Referrer'">
                                            {{ $t('roles.table.referrer') }}
                                        </span>
                                        <span v-else-if="role.name === 'Company'">
                                            {{ $t('roles.table.company') }}
                                        </span>
                                        <span v-else>
                                            {{ role?.name }}
                                        </span>
                                    </td>
                                    <td width="12%">
                                        <span v-if="role?.level === 80"
                                            class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-md font-medium">
                                            {{ $t('roles.table.admin') }}
                                        </span>
                                        <span v-else-if="role?.level === 50"
                                            class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md font-medium">
                                            {{ $t('roles.table.manager') }}
                                        </span>
                                        <span v-else
                                            class="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md font-medium">
                                            {{ $t('roles.table.regular') }}
                                        </span>
                                    </td>
                                    <td width="26%">
                                        <div class="text-xxs flex flex-wrap gap-1">
                                            <span v-for="(permission, index) in role?.permissions" :key=index
                                                class="bg-primary px-2 py-1 text-white rounded-md">
                                                {{ getPermissionLabel(permission, locale) }}
                                            </span>
                                        </div>
                                    </td>
                                    <td width="22%">
                                        <div class="text-xxs flex flex-wrap gap-1">
                                            <span v-for="(page, index) in role?.pages" :key=index
                                                class="bg-green-100 text-green-800 px-2 py-1 rounded-md">
                                                {{ page?.name }}
                                            </span>
                                        </div>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action"
                                                @click="navigateTo(`/settings/roles/${role.id}/edit`)"
                                                v-if="role?.is_editable">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('roles.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger"
                                                @click="deleteRoleConfirmation(role)" v-if="role?.is_deletable">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('roles.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.roles" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteRoleOpen"
                :message="$t('roles.table.confirmation.deleteRoleConfirmation') + '?'"
                @close="state.modal.isDeleteRoleOpen = false" @confirm="deleteRole" />
        </NuxtLayout>
    </div>
</template>


<script setup lang="ts">
import { roleService } from '@/components/api/user/RoleService'
import { getPermissionLabel } from '@/composables/usePermissions'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t, locale } = useI18n()
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'roles.roles',
        translate: true,
        href: '/settings/roles',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'roles.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: 'roles.table.level', isTranslateName: true },
        { name: 'roles.table.permissions', isTranslateName: true, },
        { name: 'roles.table.pages', isTranslateName: true, },
        { name: '' }
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteRoleOpen: false,
    },
    pagination: {
        current_page: 1,
        last_page: 1,
        total: 0,
    },
    roles: [] as any,
    selectedRole: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchRoles()
})

async function fetchRoles() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await roleService.getRoles(params)
        if (response) {
            state.roles = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchRoles()
}

function next() {
    currentTablePage++
    fetchRoles()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchRoles()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] === '' ? [] : value
    fetchRoles()
}

function deleteRoleConfirmation(role: any) {
    state.selectedRole = role
    state.modal.isDeleteRoleOpen = true
}

async function deleteRole() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await roleService.deleteRole(state.selectedRole.id)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchRoles()
            successAlert(`${t('alert.success')}!`, `${t('roles.alert.roleSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
