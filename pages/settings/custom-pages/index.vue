<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('customPages.customPages') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('customPages.customPages') }}</template>

            <div class="mt-8 bg-white border border-gray-200 rounded-lg p-5 space-y-4">
                <div>
                    <h3 class="text-sm font-semibold text-gray-700">{{ $t('settings.company.form.terminology') }}</h3>
                    <p class="text-xs text-gray-500 mt-1">{{ $t('settings.company.form.terminologyHint') }}</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <FormLabel for="term_journals" :label="$t('settings.company.form.termJournals')" />
                        <FormTextField id="term_journals" name="term_journals" placeholder="Journaler"
                            v-model="terms.term_journals" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="term_journal" :label="$t('settings.company.form.termJournal')" />
                        <FormTextField id="term_journal" name="term_journal" placeholder="Journal"
                            v-model="terms.term_journal" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="term_journal_note_tag" :label="$t('settings.company.form.termJournalNoteTag')" />
                        <FormTextField id="term_journal_note_tag" name="term_journal_note_tag" placeholder="Journalnotetag"
                            v-model="terms.term_journal_note_tag" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="term_journal_notes" :label="$t('settings.company.form.termJournalNotes')" />
                        <FormTextField id="term_journal_notes" name="term_journal_notes" placeholder="Journalnotater"
                            v-model="terms.term_journal_notes" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="term_caseworker" :label="$t('settings.company.form.termCaseworker')" />
                        <FormTextField id="term_caseworker" name="term_caseworker" placeholder="Sagsbehandler"
                            v-model="terms.term_caseworker" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="term_case" :label="$t('settings.company.form.termCase')" />
                        <FormTextField id="term_case" name="term_case" placeholder="Sag"
                            v-model="terms.term_case" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="term_agreement" :label="$t('settings.company.form.termAgreement')" />
                        <FormTextField id="term_agreement" name="term_agreement" placeholder="Aftale"
                            v-model="terms.term_agreement" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="term_jobcenter" :label="$t('settings.company.form.termJobcenter')" />
                        <FormTextField id="term_jobcenter" name="term_jobcenter" placeholder="Jobcenter"
                            v-model="terms.term_jobcenter" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="term_citizen" :label="$t('settings.company.form.termCitizen')" />
                        <FormTextField id="term_citizen" name="term_citizen" placeholder="Borger"
                            v-model="terms.term_citizen" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="term_citizen_definite" :label="$t('settings.company.form.termCitizenDefinite')" />
                        <FormTextField id="term_citizen_definite" name="term_citizen_definite" placeholder="Borgeren"
                            v-model="terms.term_citizen_definite" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="term_citizens" :label="$t('settings.company.form.termCitizens')" />
                        <FormTextField id="term_citizens" name="term_citizens" placeholder="Borgere"
                            v-model="terms.term_citizens" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="term_citizens_definite" :label="$t('settings.company.form.termCitizensDefinite')" />
                        <FormTextField id="term_citizens_definite" name="term_citizens_definite" placeholder="Borgerne"
                            v-model="terms.term_citizens_definite" />
                    </div>
                </div>
                <div class="flex justify-end">
                    <FormButton type="button" buttonStyle="primary" :disabled="terms.saving" @click="saveTerms">
                        {{ $t('save') }}
                    </FormButton>
                </div>
            </div>

            <div class="mt-8">
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.customPages"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.customPages?.data?.length === 0))">
                                <tr v-for="(customPages, index) in state.customPages?.data" :key="index">
                                    <td width="35%">
                                        <div>
                                            {{ customPages?.en_name }}
                                        </div>
                                    </td>
                                    <td width="35%">
                                        <div>
                                            {{ customPages?.dk_name }}
                                        </div>
                                    </td>
                                    <td width="30%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action"
                                                @click="navigateTo(`/settings/custom-pages/${customPages.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('customPages.table.actions.edit') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.customPages" @previous="previous" @next="next" />
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { customPagesService } from '@/components/api/user/CustomPagesService'
import { userService } from '@/components/api/user/UserService'
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()

// Journal terminology overrides (moved here from company settings).
const terms = reactive({
    term_journals: '',
    term_journal: '',
    term_journal_note_tag: '',
    term_journal_notes: '',
    term_caseworker: '',
    term_case: '',
    term_agreement: '',
    term_jobcenter: '',
    term_citizen: '',
    term_citizen_definite: '',
    term_citizens: '',
    term_citizens_definite: '',
    saving: false,
})

function loadTerms() {
    const company = userStore.getUser?.company
    terms.term_journals = company?.term_journals ?? ''
    terms.term_journal = company?.term_journal ?? ''
    terms.term_journal_note_tag = company?.term_journal_note_tag ?? ''
    terms.term_journal_notes = company?.term_journal_notes ?? ''
    terms.term_caseworker = company?.term_caseworker ?? ''
    terms.term_case = company?.term_case ?? ''
    terms.term_agreement = company?.term_agreement ?? ''
    terms.term_jobcenter = company?.term_jobcenter ?? ''
    terms.term_citizen = company?.term_citizen ?? ''
    terms.term_citizen_definite = company?.term_citizen_definite ?? ''
    terms.term_citizens = company?.term_citizens ?? ''
    terms.term_citizens_definite = company?.term_citizens_definite ?? ''
}

// The layout's own fetchUser() (GET /user) runs unawaited on mount, so on a
// hard reload userStore.getUser can still hold the stale, localStorage-
// persisted value when loadTerms() first runs below. Re-sync whenever the
// store actually updates, instead of only reading it once at mount.
watch(() => userStore.getUser, loadTerms)

async function saveTerms() {
    terms.saving = true
    try {
        const params = {
            name: userStore.getUser?.company?.name ?? '',
            term_journals: terms.term_journals,
            term_journal: terms.term_journal,
            term_journal_note_tag: terms.term_journal_note_tag,
            term_journal_notes: terms.term_journal_notes,
            term_caseworker: terms.term_caseworker,
            term_case: terms.term_case,
            term_agreement: terms.term_agreement,
            term_jobcenter: terms.term_jobcenter,
            term_citizen: terms.term_citizen,
            term_citizen_definite: terms.term_citizen_definite,
            term_citizens: terms.term_citizens,
            term_citizens_definite: terms.term_citizens_definite,
        }
        const response = await userService.updateCompany(params)
        if (response?.data) {
            const current: any = { ...userStore.getUser }
            if (current?.company) {
                current.company = { ...current.company, ...response.data }
                userStore.setUser(current)
            }
            loadTerms()
            successAlert(`${t('alert.success')}!`, `${t('customPages.wordListSuccessfullySaved')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    terms.saving = false
}
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'customPages.customPages',
        translate: true,
        href: '/settings/custom-pages',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'customPages.table.nameEnglish', isTranslateName: true, sorter: true, key: 'en_name' },
        { name: 'customPages.table.nameDanish', isTranslateName: true, sorter: true, key: 'dk_name' },
        { name: '' }
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    customPages: [] as any,
    pagination: {
        current_page: 1,
        last_page: 1,
        total: 0,
    },
    isTableLoading: false,
    selectedJournalNoteTag: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchCustomPages()
    loadTerms()
})

async function fetchCustomPages() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await customPagesService.getCustomPages(params)
        if (response) {
            state.customPages = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchCustomPages()
}

function next() {
    currentTablePage++
    fetchCustomPages()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchCustomPages()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] === '' ? [] : value
    fetchCustomPages()
}

</script>
