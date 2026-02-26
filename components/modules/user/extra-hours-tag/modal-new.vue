<template>
    <div>
        <Modal size="xs" :title="$t('extraHoursTags.newExtraHoursTag')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserExtraHoursTagModalForm formType="create" :selectedTag="state.formTag"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveExtraHoursTag" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { extraHoursTagService } from '@/components/api/user/ExtraHoursTagService'
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
const emit = defineEmits(['close', 'refreshExtraHoursTags'])

const state = reactive({
    error: {} as Error,
    formTag: {
        name: '',
        departments: [],
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshExtraHoursTags() {
    emit('refreshExtraHoursTags')
}

async function saveExtraHoursTag(tagDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            tag: tagDetails.name,
            departments_uuid: tagDetails.departments,
        }
        const response = await extraHoursTagService.saveExtraHoursTag(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('extraHoursTags.form.alert.newExtraHoursTagSuccessfullySaved')}.`)
            refreshExtraHoursTags()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>