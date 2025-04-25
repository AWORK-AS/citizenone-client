<template>
    <div>
        <Modal size="xs" :title="$t('clientInvoices.table.actions.sendInvoice')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="sendInvoice()">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="space-y-1">
                            <FormLabel for="recipient" :label="$t('clientInvoices.form.recipient')" />
                            <FormTextField id="recipient" name="recipient"
                                :placeholder="$t('clientInvoices.form.recipient')"
                                v-model="state.formSendInvoice.recipient" />
                            <FormError :error="v$?.formSendInvoice?.recipient?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.recipient?.[0]" />
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="closeModal()">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                                    {{ $t('clientInvoices.table.actions.sendInvoice') }}
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
import { clientInvoiceService } from '@/components/api/user/ClientInvoiceService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
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
    selectedClientInvoice: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close'])

const state = reactive({
    error: {} as Error,
    formSendInvoice: {
        recipient: '',
    },
    isPageLoading: false,
})

const rules = computed(() => {
    return {
        formSendInvoice: {
            recipient: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function closeModal() {
    emit('close')
}

async function sendInvoice() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        state.isPageLoading = true
        try {
            const invoiceUuid = props.selectedClientInvoice.uuid
            const params = {
                recipient: state.formSendInvoice.recipient,
            }
            const response = await clientInvoiceService.sendClientInvoiceDetails(invoiceUuid, params)
            if (response.data) {
                successAlert(`${t('alert.success')}!`, `${t('clientInvoices.table.alert.invoiceSuccessfullySent')}.`)
                closeModal()
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    }
}
</script>