<template>
    <Modal size="xl" :title="props.department?.uuid ? $t('socialWelfare.customerDepartments.edit') : $t('socialWelfare.customerDepartments.new')"
        :show="props.isModalOpen" @close="emit('close')">
        <template #modal-body>
            <form @submit.prevent="save">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <LoadingSpinner :isActive="state.isSaving">
                    <div class="space-y-5">
                        <div class="space-y-3 border-t border-surface-200 pt-4 first:border-0 first:pt-0">
                            <p class="text-sm font-semibold text-slate-900">{{ $t('socialWelfare.customerDepartments.sections.stamdata') }}</p>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="space-y-1">
                                <div class="flex items-center gap-1">
                                    <FormLabel :label="$t('socialWelfare.customerDepartments.externalId')" />
                                    <Tooltip :text="$t('socialWelfare.customerDepartments.help.externalId')" wrap position="top">
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-slate-400 hover:text-primary transition" aria-hidden="true" />
                                    </Tooltip>
                                </div>
                                <input type="text" class="co-cell-input w-full" v-model="state.form.external_id" :aria-label="$t('socialWelfare.customerDepartments.externalId')" />
                                <FormError :error="state.error?.errors?.external_id?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <div class="flex items-center gap-1">
                                    <FormLabel :label="$t('socialWelfare.customerDepartments.customerName')" />
                                    <Tooltip :text="$t('socialWelfare.customerDepartments.help.customerName')" wrap position="top">
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-slate-400 hover:text-primary transition" aria-hidden="true" />
                                    </Tooltip>
                                </div>
                                <input type="text" class="co-cell-input w-full" v-model="state.form.customer_name" :aria-label="$t('socialWelfare.customerDepartments.customerName')" />
                                <FormError :error="state.error?.errors?.customer_name?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <div class="flex items-center gap-1">
                                    <FormLabel :label="$t('socialWelfare.customerDepartments.municipality')" />
                                    <Tooltip :text="$t('socialWelfare.customerDepartments.customerHelp')" wrap position="top">
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-slate-400 hover:text-primary transition" aria-hidden="true" />
                                    </Tooltip>
                                </div>
                                <FormSelect :options="state.municipalities" v-model="state.form.municipality_uuid"
                                    :placeholder="$t('socialWelfare.customerDepartments.municipality')" />
                            </div>
                            <div class="space-y-1 md:col-span-2">
                                <div class="flex items-center gap-1">
                                    <FormLabel :label="$t('socialWelfare.customerDepartments.name')" />
                                    <Tooltip :text="$t('socialWelfare.customerDepartments.help.name')" wrap position="top">
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-slate-400 hover:text-primary transition" aria-hidden="true" />
                                    </Tooltip>
                                </div>
                                <input type="text" class="co-cell-input w-full" v-model="state.form.name" :aria-label="$t('socialWelfare.customerDepartments.name')" />
                                <FormError :error="state.error?.errors?.name?.[0]" />
                            </div>
                            <div class="space-y-1 md:col-span-2">
                                <div class="flex items-center gap-1">
                                    <FormLabel :label="$t('socialWelfare.customerDepartments.street')" />
                                    <Tooltip :text="$t('socialWelfare.customerDepartments.help.street')" wrap position="top">
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-slate-400 hover:text-primary transition" aria-hidden="true" />
                                    </Tooltip>
                                </div>
                                <input type="text" class="co-cell-input w-full" v-model="state.form.street" :aria-label="$t('socialWelfare.customerDepartments.street')" />
                                <FormError :error="state.error?.errors?.street?.[0]" />
                            </div>
                            <div class="space-y-1 md:col-span-2">
                                <div class="flex items-center gap-1">
                                    <FormLabel :label="$t('socialWelfare.customerDepartments.addressLine2')" />
                                    <Tooltip :text="$t('socialWelfare.customerDepartments.help.addressLine2')" wrap position="top">
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-slate-400 hover:text-primary transition" aria-hidden="true" />
                                    </Tooltip>
                                </div>
                                <input type="text" class="co-cell-input w-full" v-model="state.form.address_line_2" :aria-label="$t('socialWelfare.customerDepartments.addressLine2')" />
                                <FormError :error="state.error?.errors?.address_line_2?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <div class="flex items-center gap-1">
                                    <FormLabel :label="$t('socialWelfare.customerDepartments.postCode')" />
                                    <Tooltip :text="$t('socialWelfare.customerDepartments.help.postCode')" wrap position="top">
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-slate-400 hover:text-primary transition" aria-hidden="true" />
                                    </Tooltip>
                                </div>
                                <input type="text" class="co-cell-input w-full" v-model="state.form.post_code" :aria-label="$t('socialWelfare.customerDepartments.postCode')" />
                                <FormError :error="state.error?.errors?.post_code?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <div class="flex items-center gap-1">
                                    <FormLabel :label="$t('socialWelfare.customerDepartments.city')" />
                                    <Tooltip :text="$t('socialWelfare.customerDepartments.help.city')" wrap position="top">
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-slate-400 hover:text-primary transition" aria-hidden="true" />
                                    </Tooltip>
                                </div>
                                <input type="text" class="co-cell-input w-full" v-model="state.form.city" :aria-label="$t('socialWelfare.customerDepartments.city')" />
                                <FormError :error="state.error?.errors?.city?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <div class="flex items-center gap-1">
                                    <FormLabel :label="$t('socialWelfare.customerDepartments.addressType')" />
                                    <Tooltip :text="$t('socialWelfare.customerDepartments.help.addressType')" wrap position="top">
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-slate-400 hover:text-primary transition" aria-hidden="true" />
                                    </Tooltip>
                                </div>
                                <input type="text" class="co-cell-input w-full" v-model="state.form.address_type" :aria-label="$t('socialWelfare.customerDepartments.addressType')" />
                                <FormError :error="state.error?.errors?.address_type?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <div class="flex items-center gap-1">
                                    <FormLabel :label="$t('socialWelfare.customerDepartments.region')" />
                                    <Tooltip :text="$t('socialWelfare.customerDepartments.help.region')" wrap position="top">
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-slate-400 hover:text-primary transition" aria-hidden="true" />
                                    </Tooltip>
                                </div>
                                <input type="text" class="co-cell-input w-full" v-model="state.form.region" :aria-label="$t('socialWelfare.customerDepartments.region')" />
                                <FormError :error="state.error?.errors?.region?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <div class="flex items-center gap-1">
                                    <FormLabel :label="$t('socialWelfare.customerDepartments.email')" />
                                    <Tooltip :text="$t('socialWelfare.customerDepartments.help.email')" wrap position="top">
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-slate-400 hover:text-primary transition" aria-hidden="true" />
                                    </Tooltip>
                                </div>
                                <input type="email" class="co-cell-input w-full" v-model="state.form.email" :aria-label="$t('socialWelfare.customerDepartments.email')" />
                                <FormError :error="state.error?.errors?.email?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <div class="flex items-center gap-1">
                                    <FormLabel :label="$t('socialWelfare.customerDepartments.phone')" />
                                    <Tooltip :text="$t('socialWelfare.customerDepartments.help.phone')" wrap position="top">
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-slate-400 hover:text-primary transition" aria-hidden="true" />
                                    </Tooltip>
                                </div>
                                <input type="text" class="co-cell-input w-full" v-model="state.form.phone" :aria-label="$t('socialWelfare.customerDepartments.phone')" />
                                <FormError :error="state.error?.errors?.phone?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <div class="flex items-center gap-1">
                                    <FormLabel :label="$t('socialWelfare.customerDepartments.mobilePhone')" />
                                    <Tooltip :text="$t('socialWelfare.customerDepartments.help.mobilePhone')" wrap position="top">
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-slate-400 hover:text-primary transition" aria-hidden="true" />
                                    </Tooltip>
                                </div>
                                <input type="text" class="co-cell-input w-full" v-model="state.form.mobile_phone" :aria-label="$t('socialWelfare.customerDepartments.mobilePhone')" />
                                <FormError :error="state.error?.errors?.mobile_phone?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <div class="flex items-center gap-1">
                                    <FormLabel :label="$t('socialWelfare.customerDepartments.contactPerson')" />
                                    <Tooltip :text="$t('socialWelfare.customerDepartments.help.contactPerson')" wrap position="top">
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-slate-400 hover:text-primary transition" aria-hidden="true" />
                                    </Tooltip>
                                </div>
                                <input type="text" class="co-cell-input w-full" v-model="state.form.contact_person" :aria-label="$t('socialWelfare.customerDepartments.contactPerson')" />
                                <FormError :error="state.error?.errors?.contact_person?.[0]" />
                            </div>
                            </div>
                        </div>

                        <div class="space-y-3 border-t border-surface-200 pt-4 first:border-0 first:pt-0">
                            <p class="text-sm font-semibold text-slate-900">{{ $t('socialWelfare.customerDepartments.sections.economy') }}</p>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="space-y-1">
                                <div class="flex items-center gap-1">
                                    <FormLabel :label="$t('socialWelfare.customerDepartments.eanNumber')" />
                                    <Tooltip :text="$t('socialWelfare.customerDepartments.help.eanNumber')" wrap position="top">
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-slate-400 hover:text-primary transition" aria-hidden="true" />
                                    </Tooltip>
                                </div>
                                <input type="text" inputmode="numeric" maxlength="13" class="co-cell-input w-full" v-model="state.form.ean_number" :aria-label="$t('socialWelfare.customerDepartments.eanNumber')" />
                                <FormError :error="state.error?.errors?.ean_number?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <div class="flex items-center gap-1">
                                    <FormLabel :label="$t('socialWelfare.customerDepartments.customerNumber')" />
                                    <Tooltip :text="$t('socialWelfare.customerDepartments.help.customerNumber')" wrap position="top">
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-slate-400 hover:text-primary transition" aria-hidden="true" />
                                    </Tooltip>
                                </div>
                                <input type="text" class="co-cell-input w-full" v-model="state.form.customer_number" :aria-label="$t('socialWelfare.customerDepartments.customerNumber')" />
                                <FormError :error="state.error?.errors?.customer_number?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <div class="flex items-center gap-1">
                                    <FormLabel :label="$t('socialWelfare.customerDepartments.customerGroup')" />
                                    <Tooltip :text="$t('socialWelfare.customerDepartments.help.customerGroup')" wrap position="top">
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-slate-400 hover:text-primary transition" aria-hidden="true" />
                                    </Tooltip>
                                </div>
                                <input type="text" class="co-cell-input w-full" v-model="state.form.customer_group" :aria-label="$t('socialWelfare.customerDepartments.customerGroup')" />
                                <FormError :error="state.error?.errors?.customer_group?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <div class="flex items-center gap-1">
                                    <FormLabel :label="$t('socialWelfare.customerDepartments.customerDivision')" />
                                    <Tooltip :text="$t('socialWelfare.customerDepartments.help.customerDivision')" wrap position="top">
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-slate-400 hover:text-primary transition" aria-hidden="true" />
                                    </Tooltip>
                                </div>
                                <input type="text" class="co-cell-input w-full" v-model="state.form.customer_division" :aria-label="$t('socialWelfare.customerDepartments.customerDivision')" />
                                <FormError :error="state.error?.errors?.customer_division?.[0]" />
                            </div>
                            <Tooltip :text="$t('socialWelfare.customerDepartments.help.hasSpecialContract')" wrap position="top">
                                <label class="flex items-center gap-2 text-sm text-slate-700">
                                    <input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary" v-model="state.form.has_special_contract" />
                                    {{ $t('socialWelfare.customerDepartments.hasSpecialContract') }}
                                </label>
                            </Tooltip>
                            <div class="space-y-1">
                                <div class="flex items-center gap-1">
                                    <FormLabel :label="$t('socialWelfare.customerDepartments.paymentTermsDays')" />
                                    <Tooltip :text="$t('socialWelfare.customerDepartments.help.paymentTermsDays')" wrap position="top">
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-slate-400 hover:text-primary transition" aria-hidden="true" />
                                    </Tooltip>
                                </div>
                                <select class="co-cell-input w-full" v-model="state.form.payment_terms_days"
                                    :aria-label="$t('socialWelfare.customerDepartments.paymentTermsDays')">
                                    <option :value="''">{{ $t('socialWelfare.contract.noPaymentTerms') }}</option>
                                    <option v-for="term in paymentTermOptions" :key="term.days" :value="term.days">
                                        {{ term.label }}
                                    </option>
                                </select>
                                <FormError :error="state.error?.errors?.payment_terms_days?.[0]" />
                                <NuxtLink v-if="!state.paymentTerms.length" to="/settings/payment-terms"
                                    class="text-[12px] text-primary hover:underline">
                                    {{ $t('socialWelfare.contract.createPaymentTerms') }}
                                </NuxtLink>
                            </div>
                            <div class="space-y-1 md:col-span-2">
                                <div class="flex items-center gap-1">
                                    <FormLabel :label="$t('socialWelfare.customerDepartments.paymentTermsText')" />
                                    <Tooltip :text="$t('socialWelfare.customerDepartments.help.paymentTermsText')" wrap position="top">
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-slate-400 hover:text-primary transition" aria-hidden="true" />
                                    </Tooltip>
                                </div>
                                <textarea rows="3" class="co-cell-input w-full" v-model="state.form.payment_terms_text" :aria-label="$t('socialWelfare.customerDepartments.paymentTermsText')"></textarea>
                                <FormError :error="state.error?.errors?.payment_terms_text?.[0]" />
                            </div>
                            </div>
                        </div>

                        <div class="space-y-3 border-t border-surface-200 pt-4 first:border-0 first:pt-0">
                            <p class="text-sm font-semibold text-slate-900">{{ $t('socialWelfare.customerDepartments.sections.terms') }}</p>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="space-y-1 md:col-span-2">
                                <div class="flex items-center gap-1">
                                    <FormLabel :label="$t('socialWelfare.customerDepartments.priceRegulation')" />
                                    <Tooltip :text="$t('socialWelfare.customerDepartments.help.priceRegulation')" wrap position="top">
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-slate-400 hover:text-primary transition" aria-hidden="true" />
                                    </Tooltip>
                                </div>
                                <textarea rows="3" class="co-cell-input w-full" v-model="state.form.price_regulation" :aria-label="$t('socialWelfare.customerDepartments.priceRegulation')"></textarea>
                                <FormError :error="state.error?.errors?.price_regulation?.[0]" />
                            </div>
                            <div class="space-y-1 md:col-span-2">
                                <div class="flex items-center gap-1">
                                    <FormLabel :label="$t('socialWelfare.customerDepartments.noticeTerms')" />
                                    <Tooltip :text="$t('socialWelfare.customerDepartments.help.noticeTerms')" wrap position="top">
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-slate-400 hover:text-primary transition" aria-hidden="true" />
                                    </Tooltip>
                                </div>
                                <textarea rows="3" class="co-cell-input w-full" v-model="state.form.notice_terms" :aria-label="$t('socialWelfare.customerDepartments.noticeTerms')"></textarea>
                                <FormError :error="state.error?.errors?.notice_terms?.[0]" />
                            </div>
                            </div>
                        </div>

                        <div class="space-y-3 border-t border-surface-200 pt-4 first:border-0 first:pt-0">
                            <p class="text-sm font-semibold text-slate-900">{{ $t('socialWelfare.customerDepartments.sections.cooperation') }}</p>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="space-y-1">
                                <div class="flex items-center gap-1">
                                    <FormLabel :label="$t('socialWelfare.customerDepartments.cooperationStatus')" />
                                    <Tooltip :text="$t('socialWelfare.customerDepartments.help.cooperationStatus')" wrap position="top">
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-slate-400 hover:text-primary transition" aria-hidden="true" />
                                    </Tooltip>
                                </div>
                                <input type="text" class="co-cell-input w-full" v-model="state.form.cooperation_status" :aria-label="$t('socialWelfare.customerDepartments.cooperationStatus')" />
                                <FormError :error="state.error?.errors?.cooperation_status?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <div class="flex items-center gap-1">
                                    <FormLabel :label="$t('socialWelfare.customerDepartments.cooperationStatusDate')" />
                                    <Tooltip :text="$t('socialWelfare.customerDepartments.help.cooperationStatusDate')" wrap position="top">
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-slate-400 hover:text-primary transition" aria-hidden="true" />
                                    </Tooltip>
                                </div>
                                <input type="date" class="co-cell-input w-full" v-model="state.form.cooperation_status_date" :aria-label="$t('socialWelfare.customerDepartments.cooperationStatusDate')" />
                                <FormError :error="state.error?.errors?.cooperation_status_date?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <div class="flex items-center gap-1">
                                    <FormLabel :label="$t('socialWelfare.customerDepartments.cooperationProtectionStart')" />
                                    <Tooltip :text="$t('socialWelfare.customerDepartments.help.cooperationProtectionStart')" wrap position="top">
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-slate-400 hover:text-primary transition" aria-hidden="true" />
                                    </Tooltip>
                                </div>
                                <input type="date" class="co-cell-input w-full" v-model="state.form.cooperation_protection_start" :aria-label="$t('socialWelfare.customerDepartments.cooperationProtectionStart')" />
                                <FormError :error="state.error?.errors?.cooperation_protection_start?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <div class="flex items-center gap-1">
                                    <FormLabel :label="$t('socialWelfare.customerDepartments.cooperationProtectionEnd')" />
                                    <Tooltip :text="$t('socialWelfare.customerDepartments.help.cooperationProtectionEnd')" wrap position="top">
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-slate-400 hover:text-primary transition" aria-hidden="true" />
                                    </Tooltip>
                                </div>
                                <input type="date" class="co-cell-input w-full" v-model="state.form.cooperation_protection_end" :aria-label="$t('socialWelfare.customerDepartments.cooperationProtectionEnd')" />
                                <FormError :error="state.error?.errors?.cooperation_protection_end?.[0]" />
                            </div>
                            <Tooltip :text="$t('socialWelfare.customerDepartments.help.isActive')" wrap position="top">
                                <label class="flex items-center gap-2 text-sm text-slate-700">
                                    <input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary" v-model="state.form.is_active" />
                                    {{ $t('socialWelfare.customerDepartments.isActive') }}
                                </label>
                            </Tooltip>
                            </div>
                        </div>
                    </div>

                    <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormButton type="button" buttonStyle="cancel" @click="emit('close')">{{ $t('cancel') }}</FormButton>
                        <FormButton type="submit" buttonStyle="primary" class="w-full">
                            {{ props.department?.uuid ? $t('update') : $t('save') }}
                        </FormButton>
                    </div>
                </LoadingSpinner>
            </form>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { socialWelfareService } from '@/components/api/user/SocialWelfareService'
import { municipalityService } from '@/components/api/user/MunicipalityService'
import { departmentPayload, emptyDepartmentForm, formFromDepartment } from '@/composables/customerDepartment'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'
import type { PaymentTerm } from '@/types/contract'

const props = defineProps({
    isModalOpen: { type: Boolean, required: true },
    department: { type: Object, required: false, default: null },
})
const emit = defineEmits(['close', 'saved'])

const { t } = useI18n()
const { successAlert } = useAlert()

const state = reactive({
    error: {} as Error,
    isSaving: false,
    municipalities: [] as any[],
    paymentTerms: [] as PaymentTerm[],
    form: emptyDepartmentForm(),
})

watch(() => props.isModalOpen, (open) => {
    if (!open) return

    state.error = {} as Error
    const d: any = props.department

    state.form = formFromDepartment(d)

    if (!state.municipalities.length) fetchMunicipalities()
    fetchPaymentTerms()
})

// A term the department already carries stays selectable even if the catalogue
// has since lost it; the API allows an unchanged legacy value.
const paymentTermOptions = computed(() => {
    const options = state.paymentTerms.map(term => ({ days: term.days, label: term.display_label }))
    const current = state.form.payment_terms_days

    if (current !== '' && current !== null && !options.some(option => option.days === Number(current))) {
        options.push({ days: Number(current), label: t('socialWelfare.contract.legacyTerms', { days: current }) })
    }

    return options
})

async function fetchPaymentTerms() {
    try {
        const response = await socialWelfareService.getPaymentTerms({ active_only: 1 })
        state.paymentTerms = (response?.data ?? []).filter(item => item.is_active !== false)
    } catch (error: any) {
        // The department can still be saved without terms.
    }
}

async function fetchMunicipalities() {
    try {
        const response = await municipalityService.getAllMunicipalities()
        state.municipalities = (response?.data ?? []).map((item: any) => ({ value: item.uuid, label: item.name }))
    } catch (error: any) {
        // The customer can still be typed as a name.
    }
}

async function save() {
    state.error = {} as Error
    state.isSaving = true
    try {
        const d: any = props.department

        const response = d?.uuid
            ? await socialWelfareService.updateCustomerDepartment(d.uuid, departmentPayload(state.form))
            : await socialWelfareService.saveCustomerDepartment(departmentPayload(state.form))

        successAlert(`${t('alert.success')}!`, t('socialWelfare.customerDepartments.saved'))
        // The saved department, so a caller that opened this to create one can
        // pick it straight away.
        emit('saved', response?.data ?? null)
        emit('close')
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}
</script>
