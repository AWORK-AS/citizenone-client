<template>
    <div class="mt-8 max-w-xl">
        <h3 class="text-base font-semibold text-gray-900 mb-1">
            {{ $t('employment.agreements.statusTypes.title') }}
        </h3>
        <p class="text-sm text-gray-500 mb-4">
            {{ $t('employment.agreements.statusTypes.description') }}
        </p>

        <Alert type="danger" :text="state.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />

        <LoadingSpinner :isActive="state.isLoading">
            <div v-if="state.allStatusTypes.length === 0" class="text-sm text-gray-400">
                {{ $t('employment.agreements.statusTypes.noStatusTypesAvailable') }}
            </div>
            <div v-else class="space-y-2">
                <div v-for="statusType in state.allStatusTypes" :key="statusType.uuid"
                    class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-white cursor-pointer"
                    @click="toggleStatusType(statusType.uuid)">
                    <FormCheckbox :value="state.selectedUuids.includes(statusType.uuid)" />
                    <span v-if="statusType.color"
                        :style="{ backgroundColor: statusType.color }"
                        class="inline-block w-4 h-4 rounded shrink-0" />
                    <span class="text-sm text-gray-700 flex-1">
                        {{ statusType.name }}
                        <span v-if="!statusType.is_active" class="ml-2 text-xs text-gray-400">({{ $t('no') }})</span>
                    </span>
                    <span v-if="statusType.billing_rule" class="text-xs text-gray-500">
                        {{ statusType.billing_rule.name }}
                    </span>
                </div>
            </div>

            <div class="mt-4">
                <FormButton type="button" buttonStyle="primary" @click="saveConfig" :disabled="state.isSaving">
                    {{ $t('employment.agreements.statusTypes.saveConfiguration') }}
                </FormButton>
            </div>
        </LoadingSpinner>
    </div>
</template>

<script setup lang="ts">
import { employmentService } from '@/components/api/user/EmploymentService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const props = defineProps({
    agreementUuid: {
        type: String,
        required: true,
    },
})

const { t } = useI18n()
const { successAlert } = useAlert()

const state = reactive({
    allStatusTypes: [] as any[],
    selectedUuids: [] as string[],
    isLoading: false,
    isSaving: false,
    error: {} as Error,
})

onMounted(() => { fetchData() })

async function fetchData() {
    state.isLoading = true
    state.error = {}
    try {
        const [allRes, configuredRes] = await Promise.all([
            employmentService.getAllStatusTypes(),
            employmentService.getAgreementStatusTypes(props.agreementUuid),
        ])
        if (allRes?.data) state.allStatusTypes = allRes.data
        if (configuredRes?.data) {
            state.selectedUuids = configuredRes.data.map((st: any) => st.uuid)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function toggleStatusType(uuid: string) {
    const idx = state.selectedUuids.indexOf(uuid)
    if (idx === -1) {
        state.selectedUuids.push(uuid)
    } else {
        state.selectedUuids.splice(idx, 1)
    }
}

async function saveConfig() {
    state.isSaving = true
    state.error = {}
    try {
        const ordered = state.allStatusTypes
            .filter((st: any) => state.selectedUuids.includes(st.uuid))
            .map((st: any) => st.uuid)
        await employmentService.updateAgreementStatusTypes(props.agreementUuid, {
            status_type_uuids: ordered,
        })
        successAlert(`${t('alert.success')}!`, `${t('employment.agreements.statusTypes.alert.configurationSaved')}.`)
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}
</script>
