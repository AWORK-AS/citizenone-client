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
        date_start: '',
        date_end: '',
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
        let dateStart = normPeriodDetails.date_start.split('-')
        let dateEnd = normPeriodDetails.date_end.split('-')

        const params = {
            name: normPeriodDetails.name,
            start_year: parseInt(dateStart[0]),
            start_month: parseInt(dateStart[1]),
            start_day: parseInt(dateStart[2]),
            end_year: parseInt(dateEnd[0]),
            end_month: parseInt(dateEnd[1]),
            end_day: parseInt(dateEnd[2]),
            description: normPeriodDetails.description,
            department_uuids: normPeriodDetails.department_uuids,
            is_active: normPeriodDetails.is_active
        }
        await normPeriodService.saveNormPeriod(params)
        successAlert(`${t('alert.success')}!`, `${t('normPeriod.form.alert.newNormPeriodSuccessfullySaved')}.`)
        emit('refreshNormPeriods')
        emit('close')
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>