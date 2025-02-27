<template>
    <div>
        <Modal size="xs" :title="`${$t('filterDate')}`" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <form @submit.prevent="filterDailyOverview" class="mt-3">
                    <div class="space-y-3">
                        <FormDateRangeField name="date_range" :placeholder="$t('filterDate')" @change="setDateRange"
                            v-model="state.date_range" />
                        <FormError :error="v$?.date_range?.$errors[0]?.$message.toString()" />
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
    date_range: [] as any,
    error: {} as Error,
    isPageLoading: false,
    formDateRange: {
        start_date: props.dateRange?.formDateRange?.start_date,
        end_date: props.dateRange?.formDateRange?.end_date,
    },
})

watch(() => props.isModalOpen, (isModalOpen) => {
    if (isModalOpen) {

        const startDate = moment(props?.dateRange?.formDateRange?.start_date, "YYYY-MM-DD").format("DD. MMMM YYYY")
        const endDate = moment(props?.dateRange?.formDateRange?.end_date, "YYYY-MM-DD").format("DD. MMMM YYYY")

        state.error = {}
        state.date_range = [startDate, endDate]
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
    state.date_range = [dates[0], dates[1]]
}

function filterDailyOverview() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('filterDate', state.formDateRange)
        closeModal()
    }
}
</script>
