<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.tabs.emails') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks">
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/citizens')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ customPagesStore.getCustomPagesName?.citizens }}
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <template #header>{{ $t('citizens.tabs.emails') }}</template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserCitizenDetailsHeader />
                <ModulesUserCitizenJournalTabs />

                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.emails"
                            :isLoading="state.isTableLoading" :sortData="state.sortData"
                            :emptyMessage="$t('citizens.emails.noEmailsFound')" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.emails?.data?.length === 0))">
                                <template v-for="(email, index) in state.emails?.data" :key="index">
                                    <tr class="cursor-pointer hover:bg-gray-50" @click="toggleExpanded(email.uuid)">
                                        <td width="30%">
                                            <span class="truncate font-medium">{{ email?.subject || '—' }}</span>
                                        </td>
                                        <td width="20%">
                                            <span class="truncate">{{ email?.from_name || email?.from_email || '—' }}</span>
                                        </td>
                                        <td width="15%">
                                            <span class="truncate">{{ email?.email_date && formatDateTimeToReadable(email.email_date) }}</span>
                                        </td>
                                        <td width="15%">
                                            <select v-if="isAtLeast('Manager')" :value="email.visible_to_role"
                                                @change="changeVisibility(email, ($event.target as HTMLSelectElement).value)"
                                                @click.stop
                                                class="text-sm border border-gray-200 rounded-md px-2 py-1">
                                                <option value="Admin">{{ $t('citizens.emails.roles.admin') }}</option>
                                                <option value="Manager">{{ $t('citizens.emails.roles.manager') }}</option>
                                                <option value="User">{{ $t('citizens.emails.roles.user') }}</option>
                                            </select>
                                            <span v-else>{{ email.visible_to_role }}</span>
                                        </td>
                                        <td width="20%">
                                            <div class="flex items-end justify-end gap-2" @click.stop>
                                                <FormButton type="button" buttonStyle="danger"
                                                    @click="confirmUntag(email)">
                                                    <Icon name="ph:trash" class="size-4" />
                                                </FormButton>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr v-if="state.expandedUuid === email.uuid">
                                        <td colspan="5" class="bg-gray-50">
                                            <div class="p-4 space-y-3">
                                                <div v-safe-html="email.body_html" class="prose max-w-none text-sm"></div>
                                                <div v-if="email.attachments?.length" class="space-y-1">
                                                    <p class="text-xs font-semibold text-gray-500">
                                                        {{ $t('citizens.emails.attachments') }}
                                                    </p>
                                                    <a v-for="attachment in email.attachments" :key="attachment.uuid"
                                                        :href="attachment.url" target="_blank"
                                                        class="text-tertiary hover:underline text-sm flex items-center gap-x-1">
                                                        <Icon name="ph:paperclip" class="size-4" />
                                                        {{ attachment.filename }}
                                                    </a>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.emails" @previous="previous" @next="next" />
                </div>

                <DialogConfirmation :isModalOpen="state.modal.isUntagOpen"
                    :message="$t('citizens.emails.confirmation.untagConfirmation') + '?'"
                    @close="state.modal.isUntagOpen = false" @confirm="untagEmail" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { citizenEmailService } from '@/components/api/user/CitizenEmailService'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { usePermissions } from '@/composables/usePermissions'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateTimeToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const customPagesStore = useCustomPagesStore() as any
const { isAtLeast } = usePermissions()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as any
let currentTablePage = 1
const selectedEmail = ref() as any

const breadcrumbLinks = [
    {
        name: 'citizens.tabs.emails',
        translate: true,
        href: `/citizens/${citizenUuid}/emails`,
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'citizens.emails.table.subject', isTranslateName: true },
        { name: 'citizens.emails.table.from', isTranslateName: true },
        { name: 'citizens.emails.table.date', isTranslateName: true, sorter: true, key: 'email_date' },
        { name: 'citizens.emails.table.visibleTo', isTranslateName: true },
        { name: '' },
    ],
    error: {} as Error,
    isTableLoading: false,
    emails: [] as any,
    expandedUuid: null as string | null,
    modal: {
        isUntagOpen: false,
    },
    sortData: {
        sortField: 'email_date',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchEmails()
})

async function fetchEmails() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
        }
        const response = await citizenEmailService.getCitizenEmails(params)
        if (response) {
            state.emails = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function toggleExpanded(uuid: string) {
    state.expandedUuid = state.expandedUuid === uuid ? null : uuid
}

function previous() {
    currentTablePage--
    fetchEmails()
}

function next() {
    currentTablePage++
    fetchEmails()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchEmails()
}

async function changeVisibility(email: any, visibleToRole: string) {
    state.error = {}
    try {
        const response = await citizenEmailService.updateEmailVisibility(email.uuid, { visible_to_role: visibleToRole })
        if (response?.data) {
            email.visible_to_role = response.data.visible_to_role
            successAlert(`${t('alert.success')}!`, '')
        }
    } catch (error: any) {
        state.error = error
    }
}

function confirmUntag(email: any) {
    selectedEmail.value = email
    state.modal.isUntagOpen = true
}

async function untagEmail() {
    state.error = {}
    state.isTableLoading = true
    try {
        await citizenEmailService.untagEmail(selectedEmail.value.uuid)
        state.modal.isUntagOpen = false
        fetchEmails()
        successAlert(`${t('alert.success')}!`, '')
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
