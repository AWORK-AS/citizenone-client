<template>
    <div>
        <Modal size="xs" :title="`${$t('filterDate.filterDate')}`" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="filterDate" class="mt-3">
                        <div class="space-y-3">
                            <Alert type="danger" :text="state?.error?.message"
                                v-if="state.error?.message && state.error.message.length > 0" />
                            <div class="space-y-1">
                                <div class="flex justify-end">
                                    <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                                        @click="setToday">
                                        {{ $t('filterDate.setToday') }}
                                    </span>
                                </div>
                                <FormDateRangeField name="date_range" :placeholder="$t('filterDate.filterDate')"
                                    v-model="state.filter.date_range" />
                                <FormError :error="v$?.filter.date_range?.$errors[0]?.$message.toString()" />
                            </div>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="closeModal">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full">
                                    {{ $t('filter') }}
                                </FormButton>
                            </div>
                        </div>
                    </form>
                </LoadingSpinner>
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
    formDateRange: {
        date_start: props.dateRange?.date_start,
        date_end: props.dateRange?.date_end,
    },
})

watch(() => props.isModalOpen, (isModalOpen) => {
    if (isModalOpen) {
        const startDate = moment(props?.dateRange?.date_start).format('YYYY-MM-DD')
        const endDate = moment(props?.dateRange?.date_end).format('YYYY-MM-DD')
        state.error = {}
        state.filter.date_range = [startDate, endDate]
    }
})

watch(() => props.dateRange, (formDateRange) => {
    if (formDateRange) {
        const startDate = moment(formDateRange?.date_start).format('YYYY-MM-DD')
        const endDate = moment(formDateRange?.date_end).format('YYYY-MM-DD')
        state.error = {}
        state.filter.date_range = [startDate, endDate]
    }
})

watch(() => state.filter.date_range, (dates: any) => {
    state.formDateRange.date_start = dates?.[0]
    state.formDateRange.date_end = dates?.[1]
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

function setToday() {
    const today = moment().format('YYYY-MM-DD')
    state.filter.date_range = [today, today]
}

async function filterDate() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('filterDate', state.formDateRange)
        closeModal()
    }
}
</script>
