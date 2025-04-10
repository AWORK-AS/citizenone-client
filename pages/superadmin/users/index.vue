<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.users.users') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.users.users') }}</template>

            <div>
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg" @click="navigateTo('/superadmin/users/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('superadmin.users.newUser') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.users"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.users?.data?.length === 0))">
                                <tr v-for="(user, index) in state.users?.data" :key="index">
                                    <td width="30%">
                                        <div class="flex items-center gap-x-2">
                                            <img :src="user?.image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${user?.firstname + ' ' + user?.lastname}`"
                                                class="rounded-full w-11" />
                                            <span>{{ user?.firstname }} {{ user?.lastname }}</span>
                                        </div>
                                    </td>
                                    <td width="25%">
                                        <span>{{ user?.email }}</span>
                                    </td>
                                    <td width="25%">
                                        <span>{{ user?.phone }}</span>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/superadmin/users/edit/${user.uuid}`)">
                                                <Icon name="ph:pencil" class="size-4" />
                                                {{ $t('superadmin.users.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="primary" class="rounded-md"
                                                @click="deleteConfirmation(user)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('superadmin.users.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.users" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteUserOpen"
                :message="$t('superadmin.users.confirmation.deleteUserConfirmation') + '?'"
                @close="state.modal.isDeleteUserOpen = false" @confirm="deleteUser" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { userService } from '@/components/api/superadmin/UserService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1

const state = reactive({
    columnFilter: [
        { column: 'name' },
        { column: 'email' },
        { column: 'phone' },
    ],
    columnHeaders: [
        { name: 'superadmin.users.table.name', sorter: true, key: 'firstname' },
        { name: 'superadmin.users.table.email', sorter: true, key: 'email' },
        { name: 'superadmin.users.table.phone', sorter: true, key: 'phone' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    users: [] as any,
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteUserOpen: false
    },
    selectedUser: [] as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchUsers()
})

async function fetchUsers() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await userService.getUsers(params)
        if (response) {
            state.users = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchUsers()
}

function next() {
    currentTablePage++
    fetchUsers()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchUsers()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchUsers()
}

function deleteConfirmation(user: any) {
    state.selectedUser = user
    state.modal.isDeleteUserOpen = true
}

async function deleteUser() {
    state.error = {}
    state.isTableLoading = true
    try {
        const userUuid = state.selectedUser?.uuid
        const response = await userService.deleteUser(userUuid)
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