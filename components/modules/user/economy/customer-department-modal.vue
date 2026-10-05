<template>
    <Modal size="lg" :title="props.department?.uuid ? $t('socialWelfare.customerDepartments.edit') : $t('socialWelfare.customerDepartments.new')"
        :show="props.isModalOpen" @close="emit('close')">
        <template #modal-body>
            <form @submit.prevent="save">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <LoadingSpinner :isActive="state.isSaving">
                    <div class="space-y-5">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="space-y-1">
                                <FormLabel :label="$t('socialWelfare.customerDepartments.municipality')" />
                                <FormSelect :options="state.municipalities" v-model="state.form.municipality_uuid"
                                    :placeholder="$t('socialWelfare.customerDepartments.municipality')" />
                                <p class="text-[12px] text-slate-400">{{ $t('socialWelfare.customerDepartments.customerHelp') }}</p>
                            </div>
                            <div class="space-y-1">
                                <FormLabel :label="$t('socialWelfare.customerDepartments.customerName')" />
                                <input type="text" class="co-cell-input w-full" v-model="state.form.customer_name"
                                    :placeholder="$t('socialWelfare.customerDepartments.customerNamePlaceholder')" />
                            </div>
                            <div class="space-y-1 md:col-span-2">
                                <FormLabel :label="$t('socialWelfare.customerDepartments.name')" />
                                <input type="text" class="co-cell-input w-full" v-model="state.form.name" required />
                                <FormError :error="state.error?.errors?.name?.[0]" />
                            </div>
                            <div class="space-y-1 md:col-span-2">
                                <FormLabel :label="$t('socialWelfare.customerDepartments.street')" />
                                <input type="text" class="co-cell-input w-full" v-model="state.form.street" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel :label="$t('socialWelfare.customerDepartments.postCode')" />
                                <input type="text" class="co-cell-input w-full" v-model="state.form.post_code" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel :label="$t('socialWelfare.customerDepartments.city')" />
                                <input type="text" class="co-cell-input w-full" v-model="state.form.city" />
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-surface-200 pt-4">
                            <div class="space-y-1">
                                <FormLabel :label="$t('socialWelfare.customerDepartments.eanNumber')" />
                                <input type="text" inputmode="numeric" maxlength="13" class="co-cell-input w-full"
                                    v-model="state.form.ean_number" />
                                <FormError :error="state.error?.errors?.ean_number?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel :label="$t('socialWelfare.customerDepartments.customerNumber')" />
                                <input type="text" class="co-cell-input w-full" v-model="state.form.customer_number" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel :label="$t('socialWelfare.customerDepartments.paymentTermsDays')" />
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
                            <div class="space-y-1">
                                <FormLabel :label="$t('socialWelfare.customerDepartments.email')" />
                                <input type="email" class="co-cell-input w-full" v-model="state.form.email" />
                                <FormError :error="state.error?.errors?.email?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel :label="$t('socialWelfare.customerDepartments.contactPerson')" />
                                <input type="text" class="co-cell-input w-full" v-model="state.form.contact_person" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel :label="$t('socialWelfare.customerDepartments.phone')" />
                                <input type="text" class="co-cell-input w-full" v-model="state.form.phone" />
                            </div>
                            <div class="space-y-1 md:col-span-2">
                                <FormLabel :label="$t('socialWelfare.customerDepartments.noticeTerms')" />
                                <textarea rows="2" class="co-cell-input w-full" v-model="state.form.notice_terms"></textarea>
                            </div>
                            <div class="space-y-1 md:col-span-2">
                                <FormLabel :label="$t('socialWelfare.customerDepartments.priceRegulation')" />
                                <textarea rows="2" class="co-cell-input w-full" v-model="state.form.price_regulation"></textarea>
                            </div>
                            <label class="flex items-center gap-2 text-sm text-slate-700">
                                <input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary"
                                    v-model="state.form.is_active" />
                                {{ $t('socialWelfare.customerDepartments.isActive') }}
                            </label>
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

const emptyForm = () => ({
    municipality_uuid: null as string | null,
    customer_name: '',
    name: '',
    street: '',
    post_code: '',
    city: '',
    ean_number: '',
    customer_number: '',
    email: '',
    contact_person: '',
    phone: '',
    payment_terms_days: '' as any,
    notice_terms: '',
    price_regulation: '',
    is_active: true,
})

const state = reactive({
    error: {} as Error,
    isSaving: false,
    municipalities: [] as any[],
    paymentTerms: [] as PaymentTerm[],
    form: emptyForm(),
})

watch(() => props.isModalOpen, (open) => {
    if (!open) return

    state.error = {} as Error
    const d: any = props.department

    state.form = d ? {
        municipality_uuid: d.municipality_uuid ?? null,
        customer_name: d.customer_name ?? '',
        name: d.name ?? '',
        street: d.street ?? '',
        post_code: d.post_code ?? '',
        city: d.city ?? '',
        ean_number: d.ean_number ?? '',
        customer_number: d.customer_number ?? '',
        email: d.email ?? '',
        contact_person: d.contact_person ?? '',
        phone: d.phone ?? '',
        payment_terms_days: d.payment_terms_days ?? '',
        notice_terms: d.notice_terms ?? '',
        price_regulation: d.price_regulation ?? '',
        is_active: d.is_active !== false,
    } : emptyForm()

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

// Empty strings go to the server as nothing, so a cleared field clears.
function payload() {
    const blankToNull = (value: any) => (value === '' || value === undefined ? null : value)

    return {
        municipality_uuid: blankToNull(state.form.municipality_uuid),
        customer_name: blankToNull(state.form.customer_name),
        name: state.form.name,
        street: blankToNull(state.form.street),
        post_code: blankToNull(state.form.post_code),
        city: blankToNull(state.form.city),
        ean_number: blankToNull(String(state.form.ean_number ?? '').replace(/\s/g, '')),
        customer_number: blankToNull(state.form.customer_number),
        email: blankToNull(state.form.email),
        contact_person: blankToNull(state.form.contact_person),
        phone: blankToNull(state.form.phone),
        payment_terms_days: blankToNull(state.form.payment_terms_days) === null ? null : Number(state.form.payment_terms_days),
        notice_terms: blankToNull(state.form.notice_terms),
        price_regulation: blankToNull(state.form.price_regulation),
        is_active: state.form.is_active,
    }
}

async function save() {
    state.error = {} as Error
    state.isSaving = true
    try {
        const d: any = props.department

        const response = d?.uuid
            ? await socialWelfareService.updateCustomerDepartment(d.uuid, payload())
            : await socialWelfareService.saveCustomerDepartment(payload())

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
