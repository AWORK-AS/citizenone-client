<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.tabs.children') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('citizens.tabs.children') }}</template>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks">
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo(`/citizens`)"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ customPagesStore.getCustomPagesName?.citizens }}
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserCitizenDetailsHeader />
                <ModulesUserCitizenJournalTabs />

                <div>
                    <div class="mt-8 flex justify-end items-center mb-5 gap-x-2">
                        <FormButton buttonStyle="action" class="rounded-lg" @click="state.modal.isAddChildOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('children.newChild') }}
                        </FormButton>
                    </div>
                </div>

                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.children"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.children?.data?.length === 0))">
                                <tr v-for="(child, index) in state.children?.data" :key="index">
                                    <td width="30%">
                                        <div class="flex items-center gap-x-2">
                                            <span>{{ child?.firstname }} {{ child?.lastname }}</span>
                                        </div>
                                    </td>
                                    <td width="20%">
                                        <p v-if="child?.email">{{ child?.email }}</p>
                                    </td>
                                    <td width="15%">
                                        <span>{{ child?.social_security_number }}</span>
                                    </td>
                                    <td width="15%">
                                        <span>{{ child?.phone }}</span>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-end justify-end gap-2">
                                            <Tooltip :text="$t('children.table.actions.view')">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="navigateTo(`/citizens/${citizenUuid}/children/${child.uuid}/journals`)">
                                                    <Icon name="ph:eye" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('children.table.actions.edit')">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="editChild(child)">
                                                    <Icon name="ph:pencil-simple" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('children.table.actions.delete')">
                                                <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                    @click="deleteChildConfirmation(child)">
                                                    <Icon name="heroicons:trash" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.children" @previous="previous" @next="next" />
                </div>
                <ModulesUserCitizenChildModalNew :isModalOpen="state.modal.isAddChildOpen"
                    @close="state.modal.isAddChildOpen = false" @refreshChildren="fetchChildren" />
                <ModulesUserCitizenChildModalEdit :isModalOpen="state.modal.isEditChildOpen"
                    :selectedChild="state.selectedChild" @close="state.modal.isEditChildOpen = false"
                    @refreshChildren="fetchChildren" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteChildOpen"
                    :message="$t('children.table.confirmation.deleteConfirmation') + '?'"
                    @close="state.modal.isDeleteChildOpen = false" @confirm="deleteContact" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { citizenChildService } from '@/components/api/user/CitizenChildService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const customPagesStore = useCustomPagesStore() as any
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as any
const userStore = useUserStore() as any
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'citizens.tabs.children',
        translate: true,
        href: `/citizens/${citizenUuid}/children`,
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'children.table.name', isTranslateName: true, sorter: true, key: 'firstname' },
        { name: 'children.table.emailAddress', isTranslateName: true, sorter: true, key: 'email' },
        { name: 'children.table.ssn', isTranslateName: true, sorter: true, key: 'social_security_number' },
        { name: 'children.table.phone', isTranslateName: true, sorter: true, key: 'phone' },
        { name: '' },
    ],
    children: [] as any,
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isAddChildOpen: false,
        isDeleteChildOpen: false,
        isEditChildOpen: false,
    },
    selectedChild: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchChildren()
})

async function fetchChildren() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter,
        }
        const response = await citizenChildService.getCitizenChildren(params)
        if (response) {
            state.children = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchChildren()
}

function next() {
    currentTablePage++
    fetchChildren()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchChildren()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchChildren()
}

function editChild(child: any) {
    state.selectedChild = child
    state.modal.isEditChildOpen = true
}

function deleteChildConfirmation(child: any) {
    state.selectedChild = child
    state.modal.isDeleteChildOpen = true
}

async function deleteContact() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await citizenChildService.deleteCitizenChild(state.selectedChild.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchChildren()
            successAlert(`${t('alert.success')}!`, `${t('children.table.alert.childSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>