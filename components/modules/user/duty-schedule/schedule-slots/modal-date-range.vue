<template>
    <div>
        <Modal size="xs" :title="`${$t('dutySchedules.filter.filterDate')}`" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <form @submit.prevent="filterRevenue" class="mt-3">
                    <div class="space-y-3">
                        <FormDateRangeField name="date_range" :placeholder="$t('dutySchedules.filter.filterDate')"
                            v-model="state.filter.date_range" />
                        <FormError :error="v$?.date_range?.$errors[0]?.$message.toString()" />
                    </div>
                    <div class="mt-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="submit" buttonStyle="primary" class="w-full">
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
import moment from 'moment'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import type { Error } from '@/types'
import { useI18n } from "vue-i18n"

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    dateRange: {
        type: Object,
        required: true,
    }
})

const { t } = useI18n()
const emit = defineEmits(['close', 'filterDate'])

const state = reactive({
    error: {} as Error,
    filter: {
        date_range: [] as any,
    },
    isPageLoading: false,
})

watch(() => props.isModalOpen, (isModalOpen) => {
    if (isModalOpen) {
        const startDate = moment(props?.dateRange?.formDateRange?.start_date).format('YYYY-MM-DD')
        const endDate = moment(props?.dateRange?.formDateRange?.end_date).format('YYYY-MM-DD')

        state.error = {}
        state.filter.date_range = [startDate, endDate]
    }
})

const rules = computed(() => {
    return {
        filter: {
            date_range: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        }
    }
})

const v$ = useVuelidate(rules, state)

function closeModal() {
    emit('close')
}

function filterRevenue() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('filterDate', state.filter.date_range)
        closeModal()
    }
}
</script>
