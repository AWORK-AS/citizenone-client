<template>
    <div class="bg-white rounded-xl border border-gray-200 p-5" data-testid="billing-method-section">
        <div class="flex items-start justify-between gap-4">
            <div>
                <h3 class="text-sm font-semibold text-gray-700">{{ $t('paymentDunning.company.title') }}</h3>
                <p class="text-sm text-gray-500 mt-1 max-w-2xl">{{ $t('paymentDunning.company.intro') }}</p>
            </div>
        </div>

        <Alert v-if="state.error" class="mt-3" type="danger" :text="state.error" />

        <div v-if="state.isLoading" class="flex justify-center py-6">
            <Icon name="ph:spinner" class="w-5 h-5 text-gray-400 animate-spin" aria-hidden="true" />
        </div>

        <div v-else-if="state.loaded" class="mt-4 space-y-4">
            <p v-if="!canManage" class="text-[13px] text-gray-500">{{ $t('paymentDunning.company.readOnly') }}</p>

            <p v-if="state.saved.under_agreement || props.underAgreement"
                class="flex items-start gap-2 rounded-lg bg-[#E4F1F6] px-3 py-2 text-[13px] text-[#205E77]">
                <Icon name="ph:handshake" class="w-4 h-4 mt-px flex-shrink-0" aria-hidden="true" />
                {{ $t('paymentDunning.company.agreementNote') }}
            </p>

            <fieldset :disabled="!canManage || state.isSaving">
                <legend class="sr-only">{{ $t('paymentDunning.company.title') }}</legend>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Tooltip v-for="option in methods" :key="option" :text="$t(`paymentDunning.company.${option}Help`)"
                        position="top" wrap class="!block">
                        <label class="flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors"
                            :class="state.form.billing_method === option
                                ? 'border-[#0F4C75] bg-[#EEF4FB]' : 'border-gray-200 hover:bg-gray-50'">
                            <input type="radio" name="billing_method" class="text-[#0F4C75]" :value="option"
                                v-model="state.form.billing_method" />
                            <Icon :name="option === 'card' ? 'ph:credit-card' : 'ph:file-text'" class="w-4 h-4 text-gray-500" aria-hidden="true" />
                            <span class="text-sm font-medium text-gray-800">{{ $t(`paymentDunning.company.${option}`) }}</span>
                        </label>
                    </Tooltip>
                </div>

                <div v-if="state.form.billing_method === 'invoice'" class="mt-4 space-y-3 pl-1">
                    <Tooltip :text="$t('paymentDunning.company.cardSecurityHelp')" position="top" wrap class="!block">
                        <label class="inline-flex items-center gap-2 text-sm text-gray-800 cursor-pointer">
                            <input type="checkbox" class="rounded border-gray-300" v-model="state.form.invoice_card_security" />
                            {{ $t('paymentDunning.company.cardSecurity') }}
                        </label>
                    </Tooltip>

                    <div v-if="state.form.invoice_card_security" class="ml-6 text-[13px]">
                        <span class="text-gray-500">{{ $t('paymentDunning.company.cardState') }}: </span>
                        <span v-if="cardState === 'attached'" class="font-medium text-gray-800">
                            {{ $t('paymentDunning.company.cardAttached', { masked: state.saved.card_masked, expiry: state.saved.card_expiry ?? '—' }) }}
                        </span>
                        <Tooltip v-else :text="$t('paymentDunning.company.cardMissingHelp')" position="top" wrap>
                            <span class="co-badge co-badge-red">{{ $t('paymentDunning.company.cardMissing') }}</span>
                        </Tooltip>
                    </div>

                    <Tooltip :text="$t('paymentDunning.company.leverandorserviceHelp')" position="top" wrap class="!block">
                        <label class="inline-flex items-center gap-2 text-sm text-gray-800 cursor-pointer">
                            <input type="checkbox" class="rounded border-gray-300" v-model="state.form.leverandorservice" />
                            {{ $t('paymentDunning.company.leverandorservice') }}
                        </label>
                    </Tooltip>
                </div>
            </fieldset>

            <div v-if="canManage" class="flex justify-end">
                <Tooltip :text="$t('paymentDunning.company.saveHelp')" position="top" wrap>
                    <FormButton type="button" buttonStyle="primary" :disabled="!dirty || state.isSaving" @click="save">
                        {{ $t('paymentDunning.company.save') }}
                    </FormButton>
                </Tooltip>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { billingService } from '@/components/api/superadmin/BillingService'
import { useAlert } from '@/composables/alert'
import {
    billingMethodDirty,
    billingMethodPayload,
    cardSecurityState,
    normalizeCompanyBilling,
    type BillingMethod,
    type CompanyBilling,
} from '@/composables/billingMethod'
import { useI18n } from 'vue-i18n'

/**
 * Betalingsmåde on the company overview. Has its own save and its own endpoint:
 * these fields are never sent through the ordinary company update.
 */
const props = defineProps({
    companyUuid: { type: String, required: true },
    /** The company has a running agreement (known by the page from its subscription). */
    underAgreement: { type: Boolean, default: false },
})
const emit = defineEmits(['saved'])

const { t } = useI18n()
const { successAlert } = useAlert()
const { can } = usePermissions()

const methods: BillingMethod[] = ['card', 'invoice']
const canManage = computed(() => can('manage_financials'))

const state = reactive({
    isLoading: true,
    isSaving: false,
    loaded: false,
    error: '' as string,
    saved: normalizeCompanyBilling({}) as CompanyBilling,
    form: { billing_method: 'card' as BillingMethod, invoice_card_security: false, leverandorservice: false },
})

const dirty = computed(() => billingMethodDirty(state.saved, state.form))
const cardState = computed(() => cardSecurityState({ invoice_card_security: state.form.invoice_card_security, card_masked: state.saved.card_masked }))

function apply(billing: CompanyBilling) {
    state.saved = billing
    state.form = {
        billing_method: billing.billing_method,
        invoice_card_security: billing.invoice_card_security,
        leverandorservice: billing.leverandorservice,
    }
}

async function load() {
    state.error = ''
    state.isLoading = true
    try {
        apply(await billingService.getBillingMethod(props.companyUuid))
        state.loaded = true
    } catch (error: any) {
        state.error = error?.message || t('paymentDunning.company.loadFailed')
    }
    state.isLoading = false
}

async function save() {
    state.error = ''
    state.isSaving = true
    try {
        apply(await billingService.saveBillingMethod(props.companyUuid, billingMethodPayload(state.form)))
        successAlert(`${t('alert.success')}!`, t('paymentDunning.company.saved'))
        emit('saved', state.saved)
    } catch (error: any) {
        state.error = error?.message || t('paymentDunning.company.saveFailed')
    }
    state.isSaving = false
}

onMounted(load)
</script>
