<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('epikrise.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks">
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/citizens')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ $t('citizens.citizens') }}
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <template #header>{{ $t('epikrise.title') }}</template>

            <div class="space-y-8">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserCitizenDetailsHeader />
                <ModulesUserCitizenJournalTabs />

                <LoadingSpinner :isActive="state.isTableLoading">
                    <div class="space-y-3">
                        <div class="flex items-center justify-between gap-3">
                            <p class="text-sm text-gray-600">{{ $t('epikrise.listIntro') }}</p>
                            <FormButton buttonStyle="action" v-if="epikrise.canCreate.value"
                                @click="state.modal.isNewOpen = true">
                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('epikrise.new.button') }}
                            </FormButton>
                        </div>
                        <div class="table-responsive">
                            <Table :columnHeaders="state.columnHeaders" :data="state.epikriser"
                                :isLoading="state.isTableLoading"
                                :emptyMessage="$t('epikrise.empty')">
                                <template #body
                                    v-if="!(state.isTableLoading || (state.epikriser?.data?.length === 0))">
                                    <tr v-for="item in state.epikriser?.data" :key="item.uuid">
                                        <td width="26%">
                                            <span class="font-medium">{{ item?.title }}</span>
                                        </td>
                                        <td width="12%">
                                            <Badge :type="item?.status === 'finalized' ? 'active' : 'pending'"
                                                class="w-fit">
                                                {{ item?.status === 'finalized'
                                                    ? $t('epikrise.status.finalized')
                                                    : $t('epikrise.status.draft') }}
                                            </Badge>
                                        </td>
                                        <td width="14%">
                                            <span>{{ item?.discharge_date ? formatDateToReadable(item.discharge_date) : '-' }}</span>
                                        </td>
                                        <td width="14%">
                                            <span>{{ personName(item?.author) }}</span>
                                        </td>
                                        <td width="18%">
                                            <span v-if="sentTo(item)">{{ sentTo(item) }}</span>
                                            <span v-else class="text-gray-400">{{ $t('epikrise.notSent') }}</span>
                                        </td>
                                        <td width="16%">
                                            <div class="flex items-end justify-end gap-2">
                                                <FormButton type="button" buttonStyle="action"
                                                    @click="openEpikrise(item)">
                                                    <Icon :name="item?.status === 'draft' && item?.can_edit ? 'ph:pencil-simple' : 'ph:eye'"
                                                        class="size-4" />
                                                    {{ item?.status === 'draft' && item?.can_edit
                                                        ? $t('epikrise.actions.edit')
                                                        : $t('epikrise.actions.open') }}
                                                </FormButton>
                                                <FormButton v-if="item?.status === 'draft' && item?.can_edit"
                                                    type="button" buttonStyle="danger"
                                                    @click="openDeleteConfirmation(item)">
                                                    <Icon name="ph:trash" class="size-4" />
                                                    {{ $t('epikrise.actions.delete') }}
                                                </FormButton>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </Table>
                        </div>
                    </div>
                </LoadingSpinner>
            </div>

            <ModulesUserEpikriseModalNew v-if="epikrise.canCreate.value" :isModalOpen="state.modal.isNewOpen"
                :citizenUuid="citizenUuid" @close="state.modal.isNewOpen = false" @created="onCreated" />

            <DialogConfirmation :isModalOpen="state.modal.isDeleteOpen"
                :message="$t('epikrise.confirm.delete') + '?'"
                @close="state.modal.isDeleteOpen = false"
                @confirm="deleteEpikrise" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { epikriseService } from '@/components/api/user/EpikriseService'
import { useAlert } from '@/composables/alert'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { formatDateToReadable } = useDatetimeFormatter()
const { t } = useI18n()
const route = useRoute()
const epikrise = useEpikrise()
const citizenUuid = route?.params?.uuid as string

const breadcrumbLinks = [
    { name: 'epikrise.title', translate: true, href: `/citizens/${citizenUuid}/epikriser` },
]

const state = reactive({
    columnHeaders: [
        { name: 'epikrise.table.title', isTranslateName: true, sorter: false, key: 'title' },
        { name: 'epikrise.table.status', isTranslateName: true, sorter: false, key: 'status' },
        { name: 'epikrise.table.dischargeDate', isTranslateName: true, sorter: false, key: 'discharge_date' },
        { name: 'epikrise.table.author', isTranslateName: true, sorter: false, key: 'author' },
        { name: 'epikrise.table.sentTo', isTranslateName: true, sorter: false, key: 'sent_to' },
        { name: '' },
    ],
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isNewOpen: false,
        isDeleteOpen: false,
    },
    epikriser: [] as any,
    selectedEpikrise: null as any,
})

onMounted(() => {
    fetchEpikriser()
})

async function fetchEpikriser() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await epikriseService.getEpikriserByCitizen(citizenUuid)
        if (response) {
            state.epikriser = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function personName(person: any): string {
    return [person?.firstname, person?.lastname].filter(Boolean).join(' ') || '-'
}

// The latest dispatch that went out; a failed one is not "sent to".
function sentTo(item: any): string {
    const sent = (item?.dispatches ?? []).filter((dispatch: any) => dispatch?.status === 'sent')
    if (!sent.length) return ''
    const latest = sent[sent.length - 1]

    return latest?.recipient_name || latest?.recipient_address || ''
}

function openEpikrise(item: any) {
    navigateTo(`/citizens/${citizenUuid}/epikriser/${item.uuid}`)
}

function onCreated(created: any) {
    state.modal.isNewOpen = false
    if (created?.uuid) {
        successAlert(`${t('alert.success')}!`, `${t('epikrise.alert.created')}.`)
        navigateTo(`/citizens/${citizenUuid}/epikriser/${created.uuid}`)
    }
}

function openDeleteConfirmation(item: any) {
    state.selectedEpikrise = item
    state.modal.isDeleteOpen = true
}

async function deleteEpikrise() {
    state.error = {}
    state.isTableLoading = true
    try {
        await epikriseService.deleteEpikrise(state.selectedEpikrise.uuid)
        successAlert(`${t('alert.success')}!`, `${t('epikrise.alert.deleted')}.`)
        fetchEpikriser()
    } catch (error: any) {
        state.error = error
        state.isTableLoading = false
    }
}
</script>
