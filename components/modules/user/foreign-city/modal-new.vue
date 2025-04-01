<template>
    <div>
        <Modal size="xs" :title="$t('foreignCities.newForeignCity')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserForeignCityModalForm formType="create" :selectedForeignCity="state.formForeignCity"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveForeignCity" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { foreignCityService } from '@/components/api/user/ForeignCityService'
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
const emit = defineEmits(['close', 'refreshForeignCities'])

const state = reactive({
    error: {} as Error,
    formForeignCity: {
        name: '',
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshForeignCities() {
    emit('refreshForeignCities')
}

async function saveForeignCity(foreignCityDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: foreignCityDetails.name,
        }
        const response = await foreignCityService.saveForeignCity(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('foreignCities.form.alert.newForeignCitySuccessfullySaved')}.`)
            refreshForeignCities()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>