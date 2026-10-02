<template>
    <div>
        <Alert type="danger" :text="state?.error?.message" v-if="state.error?.message && state.error.message.length > 0" />
        <LoadingSpinner :isActive="state.isPageLoading">
            <div class="space-y-5">
                <div class="flex justify-end">
                    <FormButton buttonStyle="action" @click="state.modal.isAddJournalOpen = true"
                        v-if="isAtLeast('Admin') || can('create_citizen_journal')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('citizens.nursingAreas.newDoctorJournal') }}
                    </FormButton>
                </div>
                <div class="space-y-5 stagger-children">
                    <ModulesUserCitizenJournalCard v-for="(journal, index) in state.journals?.data" :key="index"
                        :journal="journal" @edit="editJournal" @copy="copyJournal" @move="moveJournal"
                        @favorite-updated="onJournalFavoriteUpdated" @lock-unlock="lockUnlockJournal"
                        @pin-unpin="pinUnpinJournal" @view-logs="viewJournalLogs"
                        @view-history="viewRecordHistory" @delete="confirmJournalDeletion" />
                    <div v-if="state.journals?.data?.length === 0"
                        class="flex flex-col items-center justify-center py-16 text-center">
                        <Icon name="ph:note-pencil" class="h-10 w-10 text-slate-300" aria-hidden="true" />
                        <p class="mt-3 text-slate-500">{{ $t('theresNoDataAvailableToDisplay') }}.</p>
                    </div>
                    <Pagination :data="state.journals" @previous="previous" @next="next" />
                </div>
            </div>
        </LoadingSpinner>

        <ModulesUserCitizenJournalModalNew :isModalOpen="state.modal.isAddJournalOpen" :isMedicalRecord="true"
            @close="state.modal.isAddJournalOpen = false" @refreshJournal="fetchJournals" />
        <ModulesUserCitizenJournalModalEdit :isModalOpen="state.modal.isEditJournalOpen"
            :selectedJournal="state.selectedJournal" @close="closeEditJournalModal"
            @refreshJournal="fetchJournals" />
        <ModulesUserCitizenJournalModalCopy :isModalOpen="state.modal.isCopyJournalOpen"
            :selectedJournal="state.selectedJournal" @close="state.modal.isCopyJournalOpen = false"
            @refreshJournal="fetchJournals" />
        <ModulesUserCitizenJournalModalMove :isModalOpen="state.modal.isMoveJournalOpen"
            :selectedJournal="state.selectedJournal" @close="state.modal.isMoveJournalOpen = false"
            @refreshJournal="fetchJournals" />
        <ModulesUserCitizenJournalModalIndividualLogs :isModalOpen="state.modal.isViewLogsOpen"
            :selectedJournal="state.selectedJournal" @close="state.modal.isViewLogsOpen = false" />
        <ModulesUserHistoryModalRecordHistory :isModalOpen="state.modal.isRecordHistoryOpen" type="journal"
            :uuid="state.selectedJournal?.uuid" :title="$t('recordHistory.title')"
            @close="state.modal.isRecordHistoryOpen = false" />
        <DialogConfirmation :isModalOpen="state.modal.isDeleteJournalOpen"
            :message="$t('citizens.citizenJournals.confirmation.deleteConfirmation') + '?'"
            @close="state.modal.isDeleteJournalOpen = false" @confirm="deleteJournal" />
    </div>
</template>

<script setup lang="ts">
import { journalService } from '@/components/api/user/JournalService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import { usePermissions } from '@/composables/usePermissions'
import { useTerminology } from '@/composables/useTerminology'
import type { Error } from '@/types'

const router = useRouter()
const { successAlert } = useAlert()
const { t } = useI18n()
const { isAtLeast, can } = usePermissions()
const { term } = useTerminology()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
let currentTablePage = 1

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    journals: [] as any,
    modal: {
        isAddJournalOpen: false,
        isCopyJournalOpen: false,
        isDeleteJournalOpen: false,
        isEditJournalOpen: false,
        isMoveJournalOpen: false,
        isViewLogsOpen: false,
        isRecordHistoryOpen: false,
    },
    selectedJournal: [] as any,
})

onMounted(() => {
    fetchJournals()
})

async function fetchJournals() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            page: currentTablePage,
            sortField: 'date',
            sortOrder: 'descend',
            is_medical_record: 1,
        }
        const response = await journalService.getJournals(params)
        if (response) {
            state.journals = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function previous() {
    currentTablePage--
    fetchJournals()
}

function next() {
    currentTablePage++
    fetchJournals()
}

function editJournal(journal: any) {
    state.selectedJournal = journal
    state.modal.isEditJournalOpen = true
}

function copyJournal(journal: any) {
    state.selectedJournal = journal
    state.modal.isCopyJournalOpen = true
}

function moveJournal(journal: any) {
    state.selectedJournal = journal
    state.modal.isMoveJournalOpen = true
}

function closeEditJournalModal() {
    state.modal.isEditJournalOpen = false
    state.selectedJournal = []
}

function onJournalFavoriteUpdated(updatedJournal: any) {
    if (!updatedJournal) return
    fetchJournals()
    successAlert(`${t('alert.success')}!`, updatedJournal?.is_favorite ? t('citizens.citizenJournals.alert.addedToFavorites', { journal: term('journal', 'Journal') }) : t('citizens.citizenJournals.alert.removedToFavorites', { journal: term('journal', 'Journal') }))
}

async function lockUnlockJournal(journalUuid: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await journalService.updateJournalLock(journalUuid)
        if (response?.data) {
            fetchJournals()
            successAlert(`${t('alert.success')}!`, response?.data?.is_locked ? t('citizens.citizenJournals.alert.lockJournal', { journal: term('journal', 'Journal') }) : t('citizens.citizenJournals.alert.unlockJournal', { journal: term('journal', 'Journal') }))
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function pinUnpinJournal(journalUuid: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await journalService.updateJournalPin(journalUuid)
        if (response?.data) {
            fetchJournals()
            successAlert(`${t('alert.success')}!`, response?.data?.is_pinned ? t('citizens.citizenJournals.alert.pinJournal', { journal: term('journal', 'Journal') }) : t('citizens.citizenJournals.alert.unpinJournal', { journal: term('journal', 'Journal') }))
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function viewJournalLogs(journal: any) {
    state.selectedJournal = journal
    state.modal.isViewLogsOpen = true
}

function viewRecordHistory(journal: any) {
    state.selectedJournal = journal
    state.modal.isRecordHistoryOpen = true
}

function confirmJournalDeletion(journal: any) {
    state.selectedJournal = journal
    state.modal.isDeleteJournalOpen = true
}

async function deleteJournal() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await journalService.deleteJournal(state.selectedJournal.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchJournals()
            successAlert(`${t('alert.success')}!`, `${t('citizens.citizenJournals.alert.deletedSuccessfully')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
