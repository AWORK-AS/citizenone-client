<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-1">
                    <FormLabel for="bill_to_name"
                        :label="`${$t('clientInvoices.form.billTo')} (${$t('clientInvoices.form.name')})`" />
                    <Multiselect 
                        id="bill_to_name"
                        v-model="state.selectedCitizen"
                        :options="state.citizenOptions"
                        :searchable="true"
                        :filterable="true"
                        :placeholder="`${$t('clientInvoices.form.billTo')} (${$t('clientInvoices.form.name')})`"
                        track-by="uuid"
                        label="fullName"
                        @select="handleCitizenSelect"
                        no-options-text="No citizens found"
                        no-results-text="No match found"
                        class="w-full"
                    />
                    <FormError :error="v$?.formInvoice?.bill_to_name?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.bill_to_name?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="bill_to_address" :label="$t('clientInvoices.form.address')" />
                    <FormTextField id="bill_to_address" name="bill_to_address"
                        :placeholder="$t('clientInvoices.form.address')" v-model="state.formInvoice.bill_to_address" />
                    <FormError :error="v$?.formInvoice?.bill_to_address?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.bill_to_address?.[0]" />
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-1">
                    <FormLabel for="bill_to_number" :label="$t('clientInvoices.form.number')" />
                    <FormTextField id="bill_to_number" name="bill_to_number"
                        :placeholder="$t('clientInvoices.form.number')" v-model="state.formInvoice.bill_to_number" />
                    <FormError :error="v$?.formInvoice?.bill_to_number?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.bill_to_number?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="note" :label="$t('clientInvoices.form.note')" />
                    <FormTextField id="note" name="note" :placeholder="$t('clientInvoices.form.note')"
                        v-model="state.formInvoice.note" />
                    <FormError :error="v$?.formInvoice?.note?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.note?.[0]" />
                </div>
            </div>
            
            <!-- Stripe Integration Checkbox -->
            <div class="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <FormSwitch 
                    id="create_stripe_invoice"
                    v-model="state.createStripeInvoice"
                    :disabled="!state.selectedCitizen || !state.selectedCitizen.email"
                />
                <div>
                    <FormLabel for="create_stripe_invoice" class="mb-0">
                        {{ $t('clientInvoices.form.createStripeInvoice') || 'Create Stripe Invoice' }}
                    </FormLabel>
                    <p class="text-xs text-gray-600 mt-1">
                        {{ state.selectedCitizen && !state.selectedCitizen.email 
                            ? ($t('clientInvoices.form.citizenEmailRequired') || 'Selected citizen must have an email address') 
                            : ($t('clientInvoices.form.stripeInvoiceNote') || 'Invoice will be sent via Stripe and can be paid online') 
                        }}
                    </p>
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
            
            <!-- Invoice Summary -->
            <div v-if="state.formInvoice.invoice_details.length > 0" class="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 class="font-semibold text-sm mb-3">{{ $t('clientInvoices.form.invoiceSummary') || 'Invoice Summary' }}</h3>
                <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                        <span>{{ $t('clientInvoices.form.subtotal') || 'Subtotal' }}:</span>
                        <span>{{ subtotal }} DKK</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span>{{ $t('clientInvoices.form.vat') || 'VAT (25%)' }}:</span>
                        <span>{{ vatAmount }} DKK</span>
                    </div>
                    <div class="border-t pt-2 flex justify-between font-semibold">
                        <span>{{ $t('clientInvoices.form.total') || 'Total' }}:</span>
                        <span>{{ totalAmount }} DKK</span>
                    </div>
                </div>
                <p class="text-xs text-gray-600 mt-3">
                    ⚠️ {{ $t('clientInvoices.form.taxNote') || 'Note: Prices entered are before VAT. Tax (25%) will be added automatically.' }}
                </p>
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
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'
import { citizenService } from '@/components/api/user/CitizenService'
import stripeApi from '@/components/api/stripeApi'
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
    selectedCitizen: null as any,
    citizenOptions: [] as any[],
    allCitizens: [] as any[],
    createStripeInvoice: false,
    formInvoice: {
        bill_to_name: '',
        bill_to_address: '',
        bill_to_number: '',
        note: '',
        invoice_details: [{
            description: '',
            quantity: '',
            price: '',
        }],
    },
})

// Fetch citizens on component mount
onMounted(async () => {
    await fetchCitizens()
})

async function fetchCitizens() {
    try {
        const response = await citizenService.getCitizens({ per_page: 1000 })
        if (response?.data?.data) {
            state.allCitizens = response.data.data
            state.citizenOptions = response.data.data.map((citizen: any) => ({
                uuid: citizen.uuid,
                fullName: `${citizen.firstname} ${citizen.lastname}`,
                firstname: citizen.firstname,
                lastname: citizen.lastname,
                email: citizen.email,
                phone: citizen.phone,
                address: citizen.address,
            }))
        }
    } catch (error) {
        console.error('Failed to fetch citizens:', error)
    }
}

function handleCitizenSelect(citizen: any) {
    if (!citizen) return

    // Set the name
    state.formInvoice.bill_to_name = citizen.fullName

    // Auto-fill address if available
    if (citizen.address?.street) {
        const addressParts = [
            citizen.address.street,
            citizen.address.post_code,
            citizen.address.city,
        ].filter(Boolean)
        state.formInvoice.bill_to_address = addressParts.join(', ')
    }

    // Auto-fill phone number if available
    if (citizen.phone) {
        state.formInvoice.bill_to_number = citizen.phone
    }
}

watch(() => props.selectedInvoice, (newValue: any) => {
    if (newValue != null) {
        state.formInvoice = {
            bill_to_name: newValue.bill_to_name,
            bill_to_address: newValue.bill_to_address,
            bill_to_number: newValue.bill_to_number,
            note: newValue.note,
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

const subtotal = computed(() => {
    return state.formInvoice.invoice_details.reduce((sum: number, detail: any) => {
        const price = parseFloat(detail.price) || 0
        const quantity = parseFloat(detail.quantity) || 0
        return sum + (price * quantity)
    }, 0).toFixed(2)
})

const vatAmount = computed(() => {
    return (parseFloat(subtotal.value) * 0.25).toFixed(2)
})

const totalAmount = computed(() => {
    return (parseFloat(subtotal.value) + parseFloat(vatAmount.value)).toFixed(2)
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

async function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        // If Stripe invoice is enabled, validate email
        if (state.createStripeInvoice) {
            if (!state.selectedCitizen || !state.selectedCitizen.email) {
                state.error = { message: 'Please select a citizen with an email address to create a Stripe invoice' } as any
                return
            }
        }

        // If creating a Stripe invoice, create it first
        if (state.createStripeInvoice && state.selectedCitizen?.email) {
            try {
                emit('isPageLoading', true)

                // Convert invoice details to Stripe format
                const stripeItems = state.formInvoice.invoice_details.map((item: any) => ({
                    description: item.description || 'No description',
                    quantity: parseInt(item.quantity) || 1,
                    unit_amount: Math.round((parseFloat(item.price) || 0) * 100), // Convert to cents/øre
                }))

                // Create Stripe invoice
                const stripeResponse = await stripeApi.createStripeInvoice({
                    customer_email: state.selectedCitizen.email,
                    customer_name: state.formInvoice.bill_to_name,
                    items: stripeItems,
                    metadata: {
                        source: 'client_invoice_form',
                        invoice_note: state.formInvoice.note || '',
                    }
                })

                if (stripeResponse?.data?.invoice_id) {
                    // Add Stripe invoice ID to form data
                    const invoiceData = {
                        ...state.formInvoice,
                        stripe_invoice_id: stripeResponse.data.invoice_id
                    }

                    // Now submit the local invoice with Stripe invoice ID
                    emit('submitForm', invoiceData)
                } else {
                    throw new Error('Failed to create Stripe invoice')
                }
            } catch (error: any) {
                state.error = { message: error?.message || 'Failed to create Stripe invoice' } as any
                emit('isPageLoading', false)
            }
        } else {
            // Normal local invoice creation without Stripe
            emit('submitForm', state.formInvoice)
        }
    }
}
</script>