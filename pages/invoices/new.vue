<template>
    <div>
        <NuxtLayout name="user">
            <Head>
                <Title>{{ $t('stripeInvoices.createInvoice') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks">
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/invoices')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ $t('clientInvoices.clientInvoices') }}
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <template #header>{{ $t('stripeInvoices.createInvoice') }}</template>

            <div class="space-y-4">
                <NuxtLink class="flex items-center gap-x-2 max-w-fit hover:cursor-pointer" to="/invoices">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <div class="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 p-6 sm:p-8">
                    <LoadingSpinner :isActive="state.isPageLoading">
                        <form @submit.prevent="handleSendInvoice">
                            <Alert type="danger" :text="state?.error?.message"
                                v-if="state.error?.message && state.error.message.length > 0" />
                            <Alert type="success" :text="state?.successMessage"
                                v-if="state.successMessage && state.successMessage.length > 0" />

                            <div class="space-y-3">
                                <div class="space-y-1">
                                    <FormLabel for="citizen_select" :label="$t('stripeInvoices.form.selectCustomer')" />
                                    <select id="citizen_select" name="citizen_select" v-model="state.selectedCitizenUuid"
                                        @change="handleCitizenChange"
                                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6">
                                        <option value="">{{ $t('stripeInvoices.form.selectCustomer') }}</option>
                                        <option v-for="citizen in state.citizens" :key="citizen.uuid" :value="citizen.uuid">
                                            {{ citizen.firstname }} {{ citizen.lastname }}
                                        </option>
                                    </select>
                                    <FormError :error="v$?.selectedCitizenUuid?.$errors[0]?.$message.toString()" />
                                </div>

                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div class="space-y-1">
                                        <FormLabel for="customer_name" :label="$t('stripeInvoices.form.customerName')" />
                                        <FormTextField id="customer_name" name="customer_name"
                                            :placeholder="$t('stripeInvoices.form.customerName')"
                                            v-model="state.formInvoice.customer_name" />
                                        <FormError :error="v$?.formInvoice?.customer_name?.$errors[0]?.$message.toString()" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel for="customer_email" :label="$t('stripeInvoices.form.customerEmail')" />
                                        <FormTextField id="customer_email" name="customer_email" type="email"
                                            :placeholder="$t('stripeInvoices.form.customerEmail')"
                                            v-model="state.formInvoice.customer_email" />
                                        <FormError :error="v$?.formInvoice?.customer_email?.$errors[0]?.$message.toString()" />
                                    </div>
                                </div>

                                <div class="space-y-3">
                                    <p class="font-medium">{{ $t('stripeInvoices.invoiceItems') }}</p>
                                    <div class="space-y-6">
                                        <div v-for="(item, itemIndex) in state.formInvoice.items" :key="itemIndex" class="relative">
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
                                                    <FormTextField :id="`quantity_${itemIndex}`" :name="`quantity_${itemIndex}`"
                                                        type="number" :placeholder="$t('stripeInvoices.form.quantity')"
                                                        v-model="item.quantity" />
                                                </div>
                                                <div class="space-y-1">
                                                    <FormLabel :for="`price_${itemIndex}`"
                                                        :label="$t('stripeInvoices.form.unitPrice')" />
                                                    <FormTextField :id="`price_${itemIndex}`" :name="`price_${itemIndex}`"
                                                        type="number" step="0.01"
                                                        :placeholder="$t('stripeInvoices.form.unitPrice')"
                                                        v-model="item.unit_amount" />
                                                </div>
                                            </div>
                                            <button type="button"
                                                class="absolute -top-3 -right-3 bg-red-700 hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center"
                                                @click="removeInvoiceItem(itemIndex)" v-if="state.formInvoice.items?.length !== 1">
                                                <Icon name="ph:trash" class="h-4 w-4 text-white" aria-hidden="true" />
                                            </button>
                                            <button type="button"
                                                class="absolute -bottom-4 inset-x-1/2 shadow-md bg-secondary hover:bg-secondary-800 rounded-full w-8 h-8 flex items-center justify-center"
                                                @click="addInvoiceItem">
                                                <Icon name="ph:plus" class="h-4 w-4 text-white" aria-hidden="true" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

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
                                        @click="createInvoice" :disabled="state.isCreating">
                                        {{ state.isCreating ? $t('stripeInvoices.creating') : $t('stripeInvoices.createInvoice') }}
                                    </FormButton>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                                        @click="navigateTo('/invoices')">
                                        {{ $t('cancel') }}
                                    </FormButton>
                                    <FormButton type="button" buttonStyle="action" class="rounded-md"
                                        @click="downloadInvoice" :disabled="state.isDownloading || !state.createdInvoiceId">
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
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import stripeApi from '@/components/api/stripeApi'
import { citizenService } from '@/components/api/user/CitizenService'
import { useVuelidate } from '@vuelidate/core'
import { required, email, helpers } from '@vuelidate/validators'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

const breadcrumbLinks = [
    {
        name: 'clientInvoices.newInvoice',
        translate: true,
        href: '/invoices/new',
    },
]

const state = reactive({
    error: {} as Error,
    successMessage: '',
    citizens: [] as any[],
    selectedCitizenUuid: '',
    formInvoice: {
        customer_name: '',
        customer_email: '',
        items: [
            {
                description: '',
                quantity: '1',
                unit_amount: '0',
            },
        ],
    },
    recipientEmail: '',
    isPageLoading: false,
    isCreating: false,
    isDownloading: false,
    isSending: false,
    createdInvoiceId: null as string | null,
})

const rules = computed(() => {
    return {
        selectedCitizenUuid: {
            required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
        },
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

onMounted(() => {
    fetchCitizens()
})

async function fetchCitizens() {
    state.isPageLoading = true
    try {
        const response = await citizenService.getCitizens({ per_page: 1000 })
        if (response?.data?.data) {
            state.citizens = response.data.data
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.isPageLoading = false
    }
}

function handleCitizenChange() {
    const selectedCitizen = state.citizens.find((c: any) => c.uuid === state.selectedCitizenUuid)
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
            items: state.formInvoice.items.map((item: any) => ({
                description: item.description,
                quantity: Number(item.quantity),
                unit_amount: Math.round(Number(item.unit_amount) * 100),
            })),
            metadata: {
                created_from: 'invoices_new_page',
                citizen_uuid: state.selectedCitizenUuid,
            },
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
            navigateTo('/invoices')
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.isSending = false
    }
}
</script>