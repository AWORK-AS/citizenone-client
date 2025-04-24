<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div class="space-y-1 md:col-span-2">
                    <FormLabel for="bill_to_name"
                        :label="`${$t('clientInvoices.form.billTo')} (${$t('clientInvoices.form.name')})`" />
                    <FormTextField id="bill_to_name" name="bill_to_name"
                        :placeholder="`${$t('clientInvoices.form.billTo')} (${$t('clientInvoices.form.name')})`"
                        v-model="state.formInvoice.bill_to_name" />
                    <FormError :error="v$?.formInvoice?.bill_to_name?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.bill_to_name?.[0]" />
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-1">
                    <FormLabel for="bill_to_address" :label="$t('clientInvoices.form.address')" />
                    <FormTextField id="bill_to_address" name="bill_to_address"
                        :placeholder="$t('clientInvoices.form.address')" v-model="state.formInvoice.bill_to_address" />
                    <FormError :error="v$?.formInvoice?.bill_to_address?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.bill_to_address?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="bill_to_number" :label="$t('clientInvoices.form.number')" />
                    <FormTextField id="bill_to_number" name="bill_to_number"
                        :placeholder="$t('clientInvoices.form.number')" v-model="state.formInvoice.bill_to_number" />
                    <FormError :error="v$?.formInvoice?.bill_to_number?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.bill_to_number?.[0]" />
                </div>
            </div>
            <div class="space-y-3">
                <p class="col-span-3">
                    {{ $t('clientInvoices.invoiceDetails') }}
                </p>
                <div class="space-y-6">
                    <div v-for="(invoiceDetail, invoiceDetailIndex) in state.formInvoice.invoice_details"
                        :key="invoiceDetailIndex" class="relative">
                        <div
                            class="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6 sm:p-8">
                            <div class="space-y-1">
                                <FormLabel :for="`description_${invoiceDetailIndex}`"
                                    :label="$t('clientInvoices.form.description')" />
                                <FormTextField :id="`description_${invoiceDetailIndex}`"
                                    :name="`description_${invoiceDetailIndex}`"
                                    :placeholder="$t('clientInvoices.form.description')"
                                    v-model="state.formInvoice.invoice_details[invoiceDetailIndex].description" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel :for="`quantity_${invoiceDetailIndex}`"
                                    :label="$t('clientInvoices.form.quantity')" />
                                <FormTextField :id="`quantity_${invoiceDetailIndex}`"
                                    :name="`quantity_${invoiceDetailIndex}`"
                                    :placeholder="$t('clientInvoices.form.quantity')"
                                    v-model="state.formInvoice.invoice_details[invoiceDetailIndex].quantity" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel :for="`price_${invoiceDetailIndex}`"
                                    :label="$t('clientInvoices.form.price')" />
                                <FormTextField :id="`price_${invoiceDetailIndex}`" :name="`price_${invoiceDetailIndex}`"
                                    :placeholder="$t('clientInvoices.form.price')"
                                    v-model="state.formInvoice.invoice_details[invoiceDetailIndex].price" />
                            </div>
                        </div>
                        <button type="button"
                            class="absolute -top-3 -right-3 bg-red-700 hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center"
                            @click="removeInvoiceDetails(invoiceDetailIndex)"
                            v-if="state.formInvoice.invoice_details?.length !== 1">
                            <Icon name="ph:trash" class="h-4 w-4 text-white" aria-hidden="true" />
                        </button>
                        <button type="button"
                            class="absolute -bottom-4 inset-x-1/2 shadow-md bg-secondary hover:bg-secondary-800 rounded-full w-8 h-8 flex items-center justify-center"
                            @click="addInvoiceDetails()">
                            <Icon name="ph:plus" class="h-4 w-4 text-white" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="navigateTo('/invoices')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                    {{ props.formType === 'create' ? $t('save') :
                        $t('update') }}
                </FormButton>
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedInvoice: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formInvoice: {
        bill_to_name: '',
        bill_to_address: '',
        bill_to_number: '',
        invoice_details: [{
            description: '',
            quantity: '',
            price: '',
        }],
    },
})

watch(() => props.selectedInvoice, (newValue: any) => {
    if (newValue != null) {
        state.formInvoice = {
            bill_to_name: newValue.bill_to_name,
            bill_to_address: newValue.bill_to_address,
            bill_to_number: newValue.bill_to_number,
            invoice_details: [],
        }
        newValue.client_invoice_details.forEach((detail: any) => {
            state.formInvoice.invoice_details.push({
                description: detail?.description,
                quantity: detail?.quantity?.toString(),
                price: detail?.price?.toString(),
            })
        })
    }
})

const rules = computed(() => {
    return {
        formInvoice: {
            bill_to_name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

function addInvoiceDetails() {
    state.formInvoice.invoice_details.push({
        description: '',
        quantity: '',
        price: '',
    })
}

function removeInvoiceDetails(index: number) {
    state.formInvoice.invoice_details.splice(index, 1)
}

const v$ = useVuelidate(rules, state)

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formInvoice)
    }
}
</script>