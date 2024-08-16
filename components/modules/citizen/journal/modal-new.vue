<template>
    <div>
        <Modal size="lg" :title="$t('citizens.citizenJournals.newJournal')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesCitizenJournalForm formType="create" :selectedJournal="state.formJournal"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveJournal" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { journalService } from '@/components/api/JournalService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const emit = defineEmits(['close', 'refreshJournal'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formJournal: {
        id: '',
        uuid: '',
        content: '',
        date: '',
        title: '',
        is_draft: false,
        assessment: null,
        note: '',
    },
})

function closeModal() {
    emit('close')
}

function refreshJournal() {
    emit('refreshJournal')
}

async function saveJournal(journalDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            title: journalDetails.title,
            date: journalDetails.date,
            content: journalDetails.content,
            is_draft: journalDetails.is_draft,
            assessment: journalDetails.assessment,
            note: journalDetails.note,
        }
        const response = await journalService.saveJournal(params)
        if (response?.data) {
            refreshJournal()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.citizenJournals.alert.successfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>