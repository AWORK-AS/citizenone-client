<template>
    <div>
        <Modal size="lg" :title="$t('stripeInvoices.createInvoice')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="handleSendInvoice()">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <Alert type="success" :text="state?.successMessage"
                            v-if="state.successMessage && state.successMessage.length > 0" />

                        <div class="rounded-lg border border-gray-200 bg-gray-50 p-4 mb-4">
                            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div>
                                    <p class="text-sm font-semibold text-gray-900">Stripe Connect</p>
                                    <p class="text-xs text-gray-600 mt-1" v-if="state.connect.isLoading">
                                        Checking your Stripe Connect status...
                                    </p>
                                    <p class="text-xs text-green-700 mt-1" v-else-if="state.connect.onboarded">
                                        Connected and ready. Invoice payments are collected on your connected Stripe account.
                                    </p>
                                    <p class="text-xs text-amber-700 mt-1" v-else>
                                        Connect your Stripe account so your customers pay you directly.
                                    </p>
                                </div>

                                <div class="flex flex-wrap gap-2">
                                    <FormButton
                                        type="button"
                                        buttonStyle="action"
                                        class="rounded-md"
                                        @click="refreshConnectStatus"
                                        :disabled="state.connect.isLoading"
                                    >
                                        Refresh Status
                                    </FormButton>

                                    <FormButton
                                        type="button"
                                        buttonStyle="primary"
                                        class="rounded-md"
                                        @click="state.connect.onboarded ? openConnectDashboard() : startConnectOnboarding()"
                                        :disabled="state.connect.isStartingOnboarding || state.connect.isOpeningDashboard"
                                    >
                                        {{ state.connect.onboarded ? 'Open Stripe Dashboard' : 'Connect Stripe Account' }}
                                    </FormButton>
                                </div>
                            </div>
                        </div>
                        
                        <div class="space-y-3">
                            <!-- Citizen Selector -->
                            <div class="space-y-1">
                                <FormLabel for="citizen_select" :label="$t('stripeInvoices.form.selectCustomer')" />
                                <Multiselect
                                    id="citizen_select"
                                    v-model="state.selectedCitizenUuid"
                                    :options="citizenOptions"
                                    :searchable="true"
                                    :can-clear="true"
                                    :close-on-select="true"
                                    :placeholder="$t('stripeInvoices.form.selectCustomer')"
                                    value-prop="value"
                                    label="label"
                                    track-by="value"
                                    :no-options-text="$t('theListIsEmpty')"
                                    :no-results-text="$t('noResultFound')"
                                />
                                <p class="text-xs text-gray-500" v-if="!props.citizens?.length">
                                    Customers are currently unavailable. You can enter name and email manually.
                                </p>
                            </div>

                            <!-- Customer Details -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div class="space-y-1">
                                    <FormLabel for="customer_name" :label="$t('stripeInvoices.form.customerName')" />
                                    <FormTextField id="customer_name" name="customer_name"
                                        :placeholder="$t('stripeInvoices.form.customerName')"
                                        v-model="state.formInvoice.customer_name" />
                                    <FormError :error="v$?.formInvoice?.customer_name?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.customer_name?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="customer_email" :label="$t('stripeInvoices.form.customerEmail')" />
                                    <FormTextField id="customer_email" name="customer_email" type="email"
                                        :placeholder="$t('stripeInvoices.form.customerEmail')"
                                        v-model="state.formInvoice.customer_email" />
                                    <FormError :error="v$?.formInvoice?.customer_email?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.customer_email?.[0]" />
                                </div>
                            </div>

                            <!-- Invoice Description -->
                            <div class="space-y-1">
                                <FormLabel for="invoice_description" label="Beskrivelse af køb" />
                                <FormTextField id="invoice_description" name="invoice_description"
                                    placeholder="Beskrivelse af køb"
                                    v-model="state.formInvoice.invoice_description" />
                            </div>

                            <!-- Invoice Items -->
                            <div class="space-y-3">
                                <p class="font-medium">
                                    {{ $t('stripeInvoices.invoiceItems') }}
                                </p>
                                <div class="space-y-6">
                                    <div v-for="(item, itemIndex) in state.formInvoice.items"
                                        :key="itemIndex" class="relative">
                                        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50 rounded-lg px-4 py-6">
                                            <div class="space-y-1">
                                                <FormLabel :for="`description_${itemIndex}`"
                                                    :label="$t('stripeInvoices.form.description')" />
                                                <FormTextField :id="`description_${itemIndex}`"
                                                    :name="`description_${itemIndex}`"
                                                    :placeholder="$t('stripeInvoices.form.description')"
                                                    v-model="item.description" />
                                            </div>
                                            <div class="space-y-1">
                                                <FormLabel :for="`quantity_${itemIndex}`"
                                                    :label="$t('stripeInvoices.form.quantity')" />
                                                <FormTextField :id="`quantity_${itemIndex}`"
                                                    :name="`quantity_${itemIndex}`"
                                                    type="number"
                                                    :placeholder="$t('stripeInvoices.form.quantity')"
                                                    v-model="item.quantity" />
                                            </div>
                                            <div class="space-y-1">
                                                <FormLabel :for="`price_${itemIndex}`"
                                                    :label="$t('stripeInvoices.form.unitPrice')" />
                                                <FormTextField :id="`price_${itemIndex}`"
                                                    :name="`price_${itemIndex}`"
                                                    type="number"
                                                    step="0.01"
                                                    :placeholder="$t('stripeInvoices.form.unitPrice')"
                                                    v-model="item.unit_amount" />
                                            </div>
                                        </div>
                                        <button type="button"
                                            class="absolute -top-3 -right-3 bg-red-700 hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center"
                                            @click="removeInvoiceItem(itemIndex)"
                                            v-if="state.formInvoice.items?.length !== 1">
                                            <Icon name="ph:trash" class="h-4 w-4 text-white" aria-hidden="true" />
                                        </button>
                                        <button type="button"
                                            class="absolute -bottom-4 inset-x-1/2 shadow-md bg-secondary hover:bg-secondary-800 rounded-full w-8 h-8 flex items-center justify-center"
                                            @click="addInvoiceItem()">
                                            <Icon name="ph:plus" class="h-4 w-4 text-white" aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Email Recipient for Sending -->
                            <div class="space-y-1 pt-3 border-t" v-if="state.createdInvoiceId">
                                <FormLabel for="recipient_email" :label="$t('stripeInvoices.form.sendToEmail')" />
                                <FormTextField id="recipient_email" name="recipient_email" type="email"
                                    :placeholder="$t('stripeInvoices.form.sendToEmailPlaceholder')"
                                    v-model="state.recipientEmail" />
                                <p class="text-xs text-gray-500">{{ $t('stripeInvoices.form.sendToEmailHint') }}</p>
                            </div>
                        </div>

                        <div class="mt-6">
                            <div class="mb-3" v-if="!state.createdInvoiceId">
                                <FormButton type="button" buttonStyle="primary" class="rounded-md w-full"
                                    @click="createInvoice()" :disabled="state.isCreating">
                                    {{ state.isCreating ? $t('stripeInvoices.creating') : $t('stripeInvoices.createInvoice') }}
                                </FormButton>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <FormButton type="button" buttonStyle="action" class="rounded-md" @click="goToAllInvoices()">
                                    Gå til alle fakturaer
                                </FormButton>
                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                    @click="downloadInvoice()" :disabled="state.isDownloading || !state.createdInvoiceId">
                                    <Icon name="ph:file-arrow-down" class="h-4 w-4" aria-hidden="true" />
                                    {{ state.isDownloading ? $t('stripeInvoices.downloading') : $t('stripeInvoices.download') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="rounded-md"
                                    :disabled="state.isSending || !state.createdInvoiceId || !state.recipientEmail">
                                    <Icon name="ph:paper-plane-tilt" class="h-4 w-4" aria-hidden="true" />
                                    {{ state.isSending ? $t('stripeInvoices.sending') : $t('stripeInvoices.sendEmail') }}
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
import stripeApi from '@/components/api/stripeApi'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'
import { useVuelidate } from "@vuelidate/core"
import { required, email, helpers } from '@vuelidate/validators'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'
import { saveAs } from 'file-saver'

const { successAlert } = useAlert()
const { t } = useI18n()
const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const route = useRoute()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    citizens: {
        type: Array as PropType<any[]>,
        required: true,
    },
})

const emit = defineEmits(['close', 'success'])

const state = reactive({
    error: {} as Error,
    successMessage: '',
    selectedCitizenUuid: '',
    formInvoice: {
        customer_name: '',
        customer_email: '',
        invoice_description: '',
        items: [{
            description: '',
            quantity: '1',
            unit_amount: '0',
        }],
    },
    recipientEmail: '',
    isPageLoading: false,
    isCreating: false,
    isDownloading: false,
    isSending: false,
    createdInvoiceId: null as string | null,
    connect: {
        isLoading: false,
        connected: false,
        onboarded: false,
        detailsSubmitted: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        accountId: null as string | null,
        isStartingOnboarding: false,
        isOpeningDashboard: false,
    },
})

const rules = computed(() => {
    return {
        formInvoice: {
            customer_name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            customer_email: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                email: helpers.withMessage(`${t('validation.invalidEmail')}.`, email),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

const citizenOptions = computed(() => {
    return (props.citizens || []).map((citizen: any) => ({
        value: citizen.uuid,
        label: `${citizen.firstname} ${citizen.lastname}`,
    }))
})

watch(() => props.isModalOpen, async (isOpen) => {
    if (isOpen) {
        resetForm()
        await fetchConnectStatus()
        applyConnectQueryFeedback()
    }
})

watch(() => state.selectedCitizenUuid, () => {
    handleCitizenChange()
})

function handleCitizenChange() {
    const selectedCitizen = props.citizens.find((c: any) => c.uuid === state.selectedCitizenUuid)
    if (selectedCitizen) {
        state.formInvoice.customer_name = `${selectedCitizen.firstname} ${selectedCitizen.lastname}`
        state.formInvoice.customer_email = selectedCitizen.email || ''
        state.recipientEmail = selectedCitizen.email || ''
    }
}

function addInvoiceItem() {
    state.formInvoice.items.push({
        description: '',
        quantity: '1',
        unit_amount: '0',
    })
}

function removeInvoiceItem(index: number) {
    state.formInvoice.items.splice(index, 1)
}

function resetForm() {
    state.error = {}
    state.successMessage = ''
    state.selectedCitizenUuid = ''
    state.formInvoice = {
        customer_name: '',
        customer_email: '',
        invoice_description: '',
        items: [{
            description: '',
            quantity: '1',
            unit_amount: '0',
        }],
    }
    state.recipientEmail = ''
    state.createdInvoiceId = null
    v$.value.$reset()
}

function applyConnectQueryFeedback() {
    const connectState = String(route.query?.stripe_connect || '').toLowerCase()

    if (connectState === 'return') {
        state.successMessage = 'Stripe Connect onboarding completed. You can now create invoices.'
    }

    if (connectState === 'refresh') {
        state.error = { message: 'Stripe Connect onboarding was not completed yet. Continue onboarding to receive payments.' } as Error
    }
}

async function fetchConnectStatus() {
    state.connect.isLoading = true

    try {
        const status = await stripeApi.getConnectStatus()

        state.connect.connected = Boolean(status?.connected)
        state.connect.onboarded = Boolean(status?.onboarded)
        state.connect.detailsSubmitted = Boolean(status?.details_submitted)
        state.connect.chargesEnabled = Boolean(status?.charges_enabled)
        state.connect.payoutsEnabled = Boolean(status?.payouts_enabled)
        state.connect.accountId = status?.account_id ?? null
    } catch (error: any) {
        state.connect.connected = false
        state.connect.onboarded = false
    } finally {
        state.connect.isLoading = false
    }
}

async function refreshConnectStatus() {
    await fetchConnectStatus()
}

async function startConnectOnboarding() {
    state.connect.isStartingOnboarding = true
    state.error = {}

    try {
        const response = await stripeApi.createConnectOnboardingLink()
        const url = response?.url

        if (!url) {
            throw new Error('Failed to start Stripe Connect onboarding.')
        }

        window.location.href = url
    } catch (error: any) {
        state.error = { message: error?.message || 'Could not start Stripe Connect onboarding.' } as Error
    } finally {
        state.connect.isStartingOnboarding = false
    }
}

async function openConnectDashboard() {
    state.connect.isOpeningDashboard = true
    state.error = {}

    try {
        const response = await stripeApi.createConnectDashboardLink()
        const url = response?.url

        if (!url) {
            throw new Error('Failed to open Stripe dashboard.')
        }

        window.open(url, '_blank', 'noopener,noreferrer')
    } catch (error: any) {
        state.error = { message: error?.message || 'Could not open Stripe dashboard.' } as Error
    } finally {
        state.connect.isOpeningDashboard = false
    }
}

function closeModal() {
    emit('close')
}

function goToAllInvoices() {
    emit('close')
    router.push('/invoices')
}

async function createInvoice() {
    state.error = {}
    state.successMessage = ''
    v$.value.$validate()
    
    if (v$.value.$error) {
        return null
    }

    state.isCreating = true

    try {
        const params = {
            customer_name: state.formInvoice.customer_name,
            customer_email: state.formInvoice.customer_email,
            description: state.formInvoice.invoice_description,
            items: state.formInvoice.items.map(item => ({
                description: item.description,
                quantity: Number(item.quantity),
                unit_amount: Math.round(Number(item.unit_amount) * 100), // Convert to cents
            })),
            metadata: {
                created_from: 'citizens_page',
                citizen_uuid: state.selectedCitizenUuid || null,
            }
        }
        
        const response = await stripeApi.createStripeInvoice(params)
        
        if (response?.invoice_id) {
            state.createdInvoiceId = response.invoice_id
            state.successMessage = t('stripeInvoices.invoiceCreatedSuccess')
            successAlert(`${t('alert.success')}!`, `${t('stripeInvoices.invoiceCreatedSuccess')}.`)
            return response.invoice_id
        }
        
        throw new Error('Invoice creation failed')
    } catch (error: any) {
        state.error = error
        throw error
    } finally {
        state.isCreating = false
    }
}

async function downloadInvoice() {
    if (!state.createdInvoiceId) {
        return
    }

    state.isDownloading = true
    state.error = {}
    state.successMessage = ''
    
    try {
        const response = await fetch(
            `${runtimeConfig.public.apiBaseURL}/stripe/invoices/${state.createdInvoiceId}/pdf`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('_token') || ''}`,
                    Accept: 'application/pdf',
                },
            }
        )

        if (!response.ok) {
            throw new Error('Unable to download PDF.')
        }

        const blob = await response.blob()
        const fileURL = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = fileURL
        link.download = `invoice_${state.createdInvoiceId}.pdf`
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(fileURL)
        
        successAlert(`${t('alert.success')}!`, `${t('stripeInvoices.invoiceDownloaded')}.`)
    } catch (error: any) {
        state.error = { message: error?.message || 'Failed to download invoice PDF.' } as Error
    } finally {
        state.isDownloading = false
    }
}

async function handleSendInvoice() {
    if (!state.createdInvoiceId) {
        return
    }

    if (!state.recipientEmail) {
        state.error = { message: t('stripeInvoices.form.emailRequired') } as Error
        return
    }
    
    state.isSending = true
    state.error = {}
    state.successMessage = ''
    
    try {
        const params = {
            recipient_email: state.recipientEmail,
        }
        
        const response = await stripeApi.sendStripeInvoice(state.createdInvoiceId, params)
        
        if (response?.message) {
            state.successMessage = t('stripeInvoices.invoiceSentSuccess')
            successAlert(`${t('alert.success')}!`, `${t('stripeInvoices.invoiceSentSuccess')}.`)
            emit('success')
            
            // Auto-close after 2 seconds
            setTimeout(() => {
                closeModal()
            }, 2000)
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.isSending = false
    }
}
</script>
