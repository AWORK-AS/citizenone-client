<template>
    <div>
        <Modal size="xs" :title="$t('scheduleTags.newScheduleTag')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserScheduleTagForm formType="create" :selectedTag="state.formTag" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveScheduleTag" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { scheduleTagService } from '@/components/api/user/ScheduleTagService'
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
const emit = defineEmits(['close', 'refreshScheduleTags'])

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

function refreshScheduleTags() {
    emit('refreshScheduleTags')
}

async function saveScheduleTag(tagDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            tag: tagDetails.name,
            color: tagDetails.color,
        }
        const response = await scheduleTagService.saveScheduleTag(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('scheduleTags.form.alert.newScheduleTagSuccessfullySaved')}.`)
            refreshScheduleTags()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>