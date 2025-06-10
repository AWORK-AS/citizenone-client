<template>
    <div>
        <Modal size="xs" :title="$t('calendarTags.newCalendarTag')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCalendarTagForm formType="create" :selectedTag="state.formTag" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveCalendarTag" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { calendarTagService } from '@/components/api/user/CalendarTagService'
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
const emit = defineEmits(['close', 'refreshCalendarTags'])

const state = reactive({
    error: {} as Error,
    formTag: {
        name: '',
        color: '#000000',
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshCalendarTags() {
    emit('refreshCalendarTags')
}

async function saveCalendarTag(tagDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            tag: tagDetails.name,
            color: tagDetails.color,
        }
        const response = await calendarTagService.saveCalendarTag(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('calendarTags.form.alert.newCalendarTagSuccessfullySaved')}.`)
            refreshCalendarTags()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>