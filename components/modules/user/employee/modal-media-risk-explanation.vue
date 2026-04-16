<template>
    <div>
        <Modal size="xs" :title="$t('employees.form.mediaRisks.mediaRisks')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div>
                    <p class="text-sm text-gray-600">
                        {{ $t('employees.form.mediaRisks.mediaRiskExplanation') }}.
                    </p>
                    <div class="mt-5 flex gap-x-3 justify-end">
                        <FormButton buttonStyle="cancel" @click="closeModal">
                            {{ $t('close') }}
                        </FormButton>
                    </div>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { unitService } from '@/components/api/user/UnitService'
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
const emit = defineEmits(['close', 'refreshUnits'])

const state = reactive({
    error: {} as Error,
    formUnit: {
        name: '',
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshUnits() {
    emit('refreshUnits')
}

async function saveUnit(unitDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: unitDetails.name,
        }
        const response = await unitService.saveUnit(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('units.form.alert.newUnitSuccessfullySaved')}.`)
            refreshUnits()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>