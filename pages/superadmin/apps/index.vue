<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.apps.apps') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.apps.apps') }}</template>

            <div>
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg" @click="navigateTo('/superadmin/apps/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('superadmin.apps.newApp') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.apps" :isLoading="state.isTableLoading"
                            :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.apps?.data?.length === 0))">
                                <tr v-for="(app, index) in state.apps?.data" :key="index">
                                    <td width="30%">
                                        <div class="space-y-1 w-fit" :class="app.url_field && 'cursor-pointer'"
                                            @click="navigateToExternalLink(app?.url_field)">
                                            <Badge type="harmless" class="text-xxs truncate w-fit"
                                                v-if="app?.is_thirdparty">
                                                {{
                                                    $t('superadmin.apps.table.thirdPartyApp')
                                                }}
                                            </Badge>
                                            <div class="flex items-center gap-x-2">
                                                <img :src="app.logo" alt="App logo" class="w-10" />
                                                <p>{{ app?.name }}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td width="20%">
                                        <p v-if="app?.is_one_time_fee">
                                            <span class="font-semibold">
                                                {{ $t('superadmin.apps.table.oneTimeFee') }}:
                                            </span>
                                            {{ app?.price }}
                                        </p>
                                        <div v-else>
                                            <p>
                                                <span class="font-semibold">
                                                    {{ $t('superadmin.apps.table.monthlyPrice') }}:
                                                </span>
                                                {{ app?.monthly_price }}
                                            </p>
                                            <p>
                                                <span class="font-semibold">
                                                    {{ $t('superadmin.apps.table.yearlyPrice') }}:
                                                </span>
                                                {{ app?.yearly_price }}
                                            </p>
                                        </div>
                                    </td>
                                    <td width="20%">
                                        <p class="capitalize">
                                            {{ app?.type }}
                                        </p>
                                    </td>
                                    <td width="30%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/superadmin/apps/${app.uuid}/edit`)">
                                                <Icon name="ph:pencil" class="size-4" />
                                                {{ $t('superadmin.apps.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="primary" class="rounded-md"
                                                @click="deleteConfirmation(app)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('superadmin.apps.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.apps" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteAppOpen"
                :message="$t('superadmin.apps.confirmation.deleteAppConfirmation') + '?'"
                @close="state.modal.isDeleteAppOpen = false" @confirm="deleteApp" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { appService } from '@/components/api/superadmin/AppService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1

const state = reactive({
    apps: [] as any,
    columnFilter: [
        { column: 'name' },
        { column: 'type' },
    ],
    columnHeaders: [
        { name: 'superadmin.apps.table.name', sorter: true, key: 'name' },
        { name: 'superadmin.apps.table.price', sorter: true, key: 'price' },
        { name: 'superadmin.apps.table.type', sorter: true, key: 'type' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteAppOpen: false
    },
    selectedApp: [] as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchApps()
})

async function fetchApps() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await appService.getApps(params)
        if (response) {
            state.apps = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchApps()
}

function next() {
    currentTablePage++
    fetchApps()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchApps()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchApps()
}

function deleteConfirmation(app: any) {
    state.selectedApp = app
    state.modal.isDeleteAppOpen = true
}

async function deleteApp() {
    state.error = {}
    state.isTableLoading = true
    try {
        const appUuid = state.selectedApp?.uuid
        const response = await appService.deleteApp(appUuid)
        if (response) {
            fetchApps()
            successAlert(`${t('alert.success')}!`, `${t('superadmin.apps.alert.appSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function navigateToExternalLink(link: any) {
    if (link) {
        await navigateTo(link, {
            external: true,
            open: {
                target: '_blank',
            }
        })
    }
}
</script>