<template>
    <div>
        <Modal size="xs" :title="$t('bookingTags.newBookingTag')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserBookingTagModalForm formType="create" :selectedTag="state.formTag" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveBookingTag" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { bookingTagService } from '@/components/api/user/BookingTagService'
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
const emit = defineEmits(['close', 'refreshBookingTags'])

const state = reactive({
    error: {} as Error,
    formTag: {
        name: '',
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshBookingTags() {
    emit('refreshBookingTags')
}

async function saveBookingTag(tagDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            tag: tagDetails.name,
        }
        const response = await bookingTagService.saveBookingTag(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('bookingTags.form.alert.newBookingTagSuccessfullySaved')}.`)
            refreshBookingTags()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>