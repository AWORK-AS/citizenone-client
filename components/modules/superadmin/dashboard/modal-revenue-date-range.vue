<template>
    <div>
        <Modal size="xs" :title="`${$t('superadmin.dashboard.revenue.filterDate')}`" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <form @submit.prevent="filterRevenue" class="mt-3">
                    <div class="space-y-3">
                        <FormDateRangeField name="date_range"
                            :placeholder="$t('superadmin.dashboard.revenue.filterDate')" @change="setDateRange" />
                        <FormError :error="v$?.date_range?.$errors[0]?.$message.toString()" />
                    </div>
                    <div class="mt-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="closeModal">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full">
                                {{ $t('superadmin.dashboard.revenue.filter') }}
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
    revenueData: {
        type: Object,
        required: true,
    }
})

const { t } = useI18n()
const emit = defineEmits(['close', 'filterDate'])

const state = reactive({
    date_range: '',
    error: {} as Error,
    isPageLoading: false,
    formDateRange: {
        start_date: props.revenueData?.formDateRange?.start_date,
        end_date: props.revenueData?.formDateRange?.end_date,
    },
})

watch(() => props.isModalOpen, (isModalOpen) => {
    if (isModalOpen) {
        state.error = {}
        state.date_range = ''
    }
})

const rules = computed(() => {
    return {
        date_range: {
            required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
        },
    }
})

const v$ = useVuelidate(rules, state)

function closeModal() {
    emit('close')
}

async function setDateRange(event: any) {
    const dateRange = event.target.value
    const dates = dateRange.split(" to ")
    const startDate = moment(dates[0], "DD. MMMM YYYY").format("YYYY-MM-DD")
    const endDate = dates[1] ? moment(dates[1], "DD. MMMM YYYY").format("YYYY-MM-DD") : startDate
    state.formDateRange.start_date = startDate
    state.formDateRange.end_date = endDate
    state.date_range = dateRange
}

function filterRevenue() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('filterDate', state.formDateRange)
        closeModal()
    }
}
</script>
