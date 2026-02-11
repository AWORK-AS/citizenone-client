<template>
    <div>
        <Modal size="xs" :title="$t('normPeriod.addCustomNormPeriod')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserNormPeriodForm formType="create" :selectedNormPeriod="state.formNormPeriod" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="saveNormPeriod" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { normPeriodService } from '@/components/api/user/NormPeriodService'
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
const emit = defineEmits(['close', 'refreshNormPeriods'])

const state = reactive({
    error: {} as Error,
    formNormPeriod: {
        name: '',
        start_month: '',
        start_day: '',
        end_month: '',
        end_day: '',
        description: '',
        department_uuids: [] as Array<string>,
        is_active: true
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

async function saveNormPeriod(normPeriodDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: normPeriodDetails.name,
            start_month: normPeriodDetails.start_month,
            start_day: normPeriodDetails.start_day,
            end_month: normPeriodDetails.end_month,
            end_day: normPeriodDetails.end_day,
            description: normPeriodDetails.description,
            department_uuids: normPeriodDetails.department_uuids,
            is_active: normPeriodDetails.is_active
        }
        const response = await normPeriodService.saveNormPeriod(params)
        emit('refreshNormPeriods')
        emit('close')
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>