<template>
    <div>
        <Modal size="xs" :title="$t('contactJobTitles.newContactJobTitle')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenContactJobTitleForm formType="create"
                        :selectedContactJobTitle="state.formContactJobTitle" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveContactJobTitle" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { contactJobTitlesService } from '@/components/api/user/ContactJobTitlesService'
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
const emit = defineEmits(['close', 'refreshContactJobTitles'])

const state = reactive({
    error: {} as Error,
    formContactJobTitle: {
        en_title: '',
        dk_title: '',
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshContactJobTitles() {
    emit('refreshContactJobTitles')
}

async function saveContactJobTitle(contactJobTitleDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            en_title: contactJobTitleDetails.en_title,
            dk_title: contactJobTitleDetails.dk_title,
        }
        const response = await contactJobTitlesService.saveContactJobTitle(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('contactJobTitles.form.alert.newContactJobTitleSuccessfullySaved')}.`)
            refreshContactJobTitles()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>