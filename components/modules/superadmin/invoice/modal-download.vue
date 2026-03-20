<template>
    <div>
        <Modal size="xs" :title="$t('superadmin.invoices.download.download')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="space-y-3">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <form @submit.prevent="handleDownload()">
                            <div class="space-y-3">
                                <div class="space-y-1">
                                    <FormLabel for="date" :label="$t('superadmin.invoices.download.date')" />
                                    <FormDateRangeField id="date" name="date_range"
                                        :placeholder="$t('superadmin.invoices.download.filter.filterDate')"
                                        v-model="state.filter.date_range" />
                                    <FormError :error="v$?.filter.date_range?.$errors[0]?.$message.toString()" />
                                </div>
                            </div>
                            <div class="mt-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                                        @click="closeModal">
                                        {{ $t('cancel') }}
                                    </FormButton>
                                    <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full">
                                        {{ $t('superadmin.invoices.download.download') }}
                                    </FormButton>
                                </div>
                            </div>
                        </form>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { invoiceService } from '@/components/api/superadmin/InvoiceService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { saveAs } from 'file-saver'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const { t } = useI18n()
const emit = defineEmits(['close'])

const state = reactive({
    error: {} as Error,
    filter: {
        date_range: [] as any,
    },
    isPageLoading: false,
    formDownload: {
        date_start: '',
        date_end: '',
    } as any,
})

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        state.error = {}
        state.formDownload.date_start = moment().startOf('isoWeek').format('YYYY-MM-DD')
        state.formDownload.date_end = moment().endOf('isoWeek').format('YYYY-MM-DD')
        state.filter.date_range = [
            moment().startOf('isoWeek').format('YYYY-MM-DD'),
            moment().endOf('isoWeek').format('YYYY-MM-DD'),
        ]
    }
})

const rules = computed(() => {
    return {
        filter: {
            date_range: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})
const v$ = useVuelidate(rules, state)

function closeModal() {
    emit('close')
}

watch(() => state.filter.date_range, (dates: any) => {
    state.formDownload.date_start = dates?.[0]
    state.formDownload.date_end = dates?.[1]
})

async function handleDownload() {
    v$.value.$validate()
    if (!v$.value.$error) {
        downloadInvoices()
    }
}

async function downloadInvoices() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            date_start: state.formDownload.date_start,
            date_end: state.formDownload.date_end,
        }
        const response = await invoiceService.downloadInvoices(params)
        if (response) {
            if (response) {
                saveAs(response, t('superadmin.invoices.invoices'))
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>