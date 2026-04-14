<template>
    <div>
        <Modal size="sm" :title="$t('filter')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <form @submit.prevent="submitForm()" id="timeLogsFilterForm">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="space-y-3">
                        <div class="space-y-1">
                            <FormLabel for="statuses" :label="$t('timeLogs.filter.status')" />
                            <FormSelectMultiple id="statuses" :options="state.options.statuses"
                                v-model="state.formFilter.statuses" />
                        </div>
                    </div>
                    <div class="mt-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" @click="closeModal()">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="submit" buttonStyle="primary">
                                {{ $t('filter') }}
                            </FormButton>
                        </div>
                    </div>
                </form>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const { t } = useI18n()
const emit = defineEmits(['close', 'setFilter'])

const state = reactive({
    error: {} as Error,
    formFilter: {
        statuses: [],
    },
    isPageLoading: false,
    options: {
        statuses: [
            { value: 'cancelled_by_citizen', label: `${t('timeLogs.form.status.cancelledByCitizen')}` },
            { value: 'cancelled_by_employee', label: `${t('timeLogs.form.status.cancelledByEmployee')}` },
            { value: 'completed', label: `${t('timeLogs.form.status.completed')}` },
        ]
    }
})

function closeModal() {
    emit('close')
}

function submitForm() {
    emit('setFilter', state.formFilter)
    closeModal()
}
</script>

<style>
#timeLogsFilterForm .multiselect-dropdown {
    max-height: 5rem !important;
}
</style>