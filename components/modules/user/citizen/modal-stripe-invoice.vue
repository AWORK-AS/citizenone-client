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

                        <!-- Stripe Connect Banner -->
                        <div class="rounded-lg border border-amber-200 bg-amber-50 p-4 mb-5">
                            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div class="flex items-start gap-2">
                                    <Icon name="ph:warning-circle" class="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                                    <div>
                                        <p class="text-sm font-semibold text-gray-900">Stripe Connect</p>
                                        <p class="text-xs text-gray-500 mt-0.5" v-if="state.connect.isLoading">
                                            Tjekker din Stripe Connect status...
                                        </p>
                                        <p class="text-xs text-green-700 mt-0.5" v-else-if="state.connect.onboarded">
                                            Forbundet og klar. Betalinger modtages på
                                            <span class="font-medium">{{ state.connect.businessName || state.connect.email || state.connect.accountId }}</span>.
                                        </p>
                                        <p class="text-xs text-amber-700 mt-0.5" v-else>
                                            Tilslut din Stripe-konto så dine kunder kan betale dig direkte.
                                        </p>
                                    </div>
                                </div>
                                <div class="flex flex-wrap gap-2 shrink-0">
                                    <button type="button"
                                        class="flex items-center px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                        @click="refreshConnectStatus" :disabled="state.connect.isLoading">
                                        Opdater status
                                    </button>
                                    <FormButton type="button" buttonStyle="primary" class="rounded-md !py-1.5 !px-3"
                                        @click="state.connect.onboarded ? openConnectDashboard() : startConnectOnboarding()"
                                        :disabled="state.connect.isStartingOnboarding || state.connect.isOpeningDashboard">
                                        {{ state.connect.onboarded ? 'Åben Stripe Dashboard' : 'Tilslut Stripe-konto' }}
                                    </FormButton>
                                </div>
                            </div>
                        </div>

                        <!-- Kundeoplysninger -->
                        <div class="border border-gray-200 rounded-xl p-5 mb-4">
                            <h3 class="text-base font-semibold text-primary mb-4">Kundeoplysninger</h3>

                            <div class="space-y-1 mb-3">
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
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
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

                            <div class="space-y-1">
                                <FormLabel for="invoice_description" label="Beskrivelse af køb" />
                                <FormTextField id="invoice_description" name="invoice_description"
                                    placeholder="Beskrivelse af køb"
                                    v-model="state.formInvoice.invoice_description" />
                            </div>
                        </div>

                        <!-- Faktura varer -->
                        <div class="border border-gray-200 rounded-xl p-5 mb-4">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="text-base font-semibold text-primary">Faktura varer</h3>
                                <button type="button"
                                    class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-800"
                                    @click="addInvoiceItem()">
                                    <Icon name="ph:plus" class="h-4 w-4" />
                                    Tilføj vare
                                </button>
                            </div>

                            <!-- Column headers -->
                            <div class="grid grid-cols-12 gap-2 mb-1 px-1">
                                <p class="col-span-5 text-xs text-gray-500">Beskrivelse</p>
                                <p class="col-span-2 text-xs text-gray-500">Antal</p>
                                <p class="col-span-3 text-xs text-gray-500">Enhedspris</p>
                                <p class="col-span-2 text-xs text-gray-500 text-right">Beløb</p>
                            </div>

                            <!-- Items -->
                            <div class="space-y-2">
                                <div v-for="(item, itemIndex) in state.formInvoice.items" :key="itemIndex"
                                    class="grid grid-cols-12 gap-2 items-center">
                                    <div class="col-span-5">
                                        <FormTextField :id="`description_${itemIndex}`" :name="`description_${itemIndex}`"
                                            :placeholder="$t('stripeInvoices.form.description')"
                                            v-model="item.description" />
                                    </div>
                                    <div class="col-span-2">
                                        <FormTextField :id="`quantity_${itemIndex}`" :name="`quantity_${itemIndex}`"
                                            type="number" placeholder="1"
                                            v-model="item.quantity" />
                                    </div>
                                    <div class="col-span-3">
                                        <FormTextField :id="`price_${itemIndex}`" :name="`price_${itemIndex}`"
                                            type="number" step="0.01" placeholder="0" maxlength="7"
                                            :max="9999999" v-model="item.unit_amount" />
                                    </div>
                                    <div class="col-span-1 text-sm text-right text-gray-700">
                                        {{ (Number(item.quantity) * Number(item.unit_amount)).toFixed(2) }}
                                    </div>
                                    <div class="col-span-1 flex justify-end">
                                        <button type="button" class="text-gray-400 hover:text-red-500"
                                            @click="removeInvoiceItem(itemIndex)"
                                            v-if="state.formInvoice.items?.length !== 1">
                                            <Icon name="ph:trash" class="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Total -->
                            <div class="mt-4 pt-3 border-t border-gray-100 flex flex-col items-end gap-1">
                                <div class="flex justify-end items-center gap-3">
                                    <span class="text-sm text-gray-500">Subtotal (ekskl. moms):</span>
                                    <span class="text-sm text-gray-700 w-28 text-right">{{ state.formInvoice.items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unit_amount), 0).toFixed(2) }} DKK</span>
                                </div>
                                <div class="flex justify-end items-center gap-3">
                                    <span class="text-sm text-gray-500">Moms 25%:</span>
                                    <span class="text-sm text-gray-700 w-28 text-right">{{ (state.formInvoice.items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unit_amount), 0) * 0.25).toFixed(2) }} DKK</span>
                                </div>
                                <div class="flex justify-end items-center gap-3 pt-2 border-t border-gray-200">
                                    <span class="text-sm font-semibold text-gray-700">Total inkl. moms:</span>
                                    <span class="text-xl font-bold text-primary w-28 text-right">{{ (state.formInvoice.items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unit_amount), 0) * 1.25).toFixed(2) }} DKK</span>
                                </div>
                            </div>
                        </div>

                        <!-- Email recipient (shown after invoice is created) -->
                        <div class="border border-gray-200 rounded-xl p-5 mb-4" v-if="state.createdInvoiceId">
                            <FormLabel for="recipient_email" :label="$t('stripeInvoices.form.sendToEmail')" />
                            <FormTextField id="recipient_email" name="recipient_email" type="email"
                                :placeholder="$t('stripeInvoices.form.sendToEmailPlaceholder')"
                                v-model="state.recipientEmail" class="mt-1" />
                            <p class="text-xs text-gray-500 mt-1">{{ $t('stripeInvoices.form.sendToEmailHint') }}</p>
                        </div>

                        <!-- Footer actions -->
                        <div class="flex justify-between items-center pt-4 border-t border-gray-100 pr-4">
                            <button type="button"
                                class="flex items-center px-3 py-1.5 text-sm font-medium bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                                @click="goToAllInvoices()">
                                Gå til alle fakturaer
                            </button>
                            <div class="flex gap-2">
                                <button type="button"
                                    class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                    @click="downloadInvoice()" :disabled="state.isDownloading || !state.createdInvoiceId">
                                    <Icon name="ph:file-arrow-down" class="h-4 w-4" aria-hidden="true" />
                                    {{ state.isDownloading ? $t('stripeInvoices.downloading') : $t('stripeInvoices.download') }}
                                </button>
                                <button type="submit"
                                    class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                    :disabled="state.isSending || !state.createdInvoiceId || !state.recipientEmail">
                                    <Icon name="ph:paper-plane-tilt" class="h-4 w-4" aria-hidden="true" />
                                    {{ state.isSending ? $t('stripeInvoices.sending') : $t('stripeInvoices.sendEmail') }}
                                </button>
                                <FormButton type="button" buttonStyle="primary" class="rounded-lg !py-1.5 !px-3"
                                    @click="createInvoice()" :disabled="state.isCreating || !!state.createdInvoiceId">
                                    {{ state.isCreating ? $t('stripeInvoices.creating') : $t('stripeInvoices.createInvoice') }}
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
    stripeCustomers: [] as Array<{id: string, name: string, email: string}>,
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
        email: null as string | null,
        businessName: null as string | null,
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
    const stripeOptions = state.stripeCustomers.map((customer: any) => ({
        value: customer.id,
        label: customer.name ? `${customer.name} – ${customer.email}` : customer.email,
    }))
    const stripeIds = new Set(stripeOptions.map((o: any) => o.value))
    const platformOptions = (props.citizens || [])
        .filter((citizen: any) => !stripeIds.has(citizen.uuid))
        .map((citizen: any) => ({
            value: citizen.uuid,
            label: `${citizen.firstname} ${citizen.lastname}`,
        }))
    return [...stripeOptions, ...platformOptions]
})

watch(() => props.isModalOpen, async (isOpen) => {
    if (isOpen) {
        resetForm()
        await fetchConnectStatus()
        applyConnectQueryFeedback()
        fetchStripeCustomers()
    }
})

watch(() => state.selectedCitizenUuid, () => {
    handleCitizenChange()
})

function handleCitizenChange() {
    const val = state.selectedCitizenUuid
    if (!val) return

    if (val.startsWith('cus_')) {
        const stripeCustomer = state.stripeCustomers.find((c: any) => c.id === val)
        if (stripeCustomer) {
            state.formInvoice.customer_name = stripeCustomer.name || ''
            state.formInvoice.customer_email = stripeCustomer.email || ''
            state.recipientEmail = stripeCustomer.email || ''
        }
    } else {
        const selectedCitizen = props.citizens.find((c: any) => c.uuid === val)
        if (selectedCitizen) {
            state.formInvoice.customer_name = `${selectedCitizen.firstname} ${selectedCitizen.lastname}`
            state.formInvoice.customer_email = selectedCitizen.email || ''
            state.recipientEmail = selectedCitizen.email || ''
        }
    }
}

async function fetchStripeCustomers() {
    try {
        const response = await stripeApi.getStripeCustomers()
        state.stripeCustomers = response?.data || []
    } catch {
        state.stripeCustomers = []
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
        state.connect.email = status?.email ?? null
        state.connect.businessName = status?.business_name ?? null
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
