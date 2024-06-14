<template>
    <div>
        <Modal size="md" :title="$t('citizens.citizenJournals.editJournal')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesCitizenJournalForm formType="update" :selectedJournal="props.selectedJournal"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="updateJournal" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { journalService } from '@/components/api/JournalService'
import { useI18n } from "vue-i18n"
import { notify } from "@kyvg/vue3-notification"

const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedJournal: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshJournal'])

const state = reactive({
    error: [],
    isPageLoading: false
})

function closeModal() {
    emit('close')
}

function refreshJournal() {
    emit('refreshJournal')
}

async function updateJournal(journalDetails: any) {
    state.isPageLoading = true
    try {
        const journalUuid = journalDetails.uuid
        const params = {
            title: journalDetails.title,
            date: journalDetails.date,
            content: journalDetails.content,
        }
        const response = await journalService.updateJournal(journalUuid, params)
        if (response?.data) {
            refreshJournal()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.citizenJournals.alert.successfullyUpdated')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function successAlert(title: string, message: string) {
    notify({
        title: title,
        text: message,
        type: 'success',
    })
}
</script>