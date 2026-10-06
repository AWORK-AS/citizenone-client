<template>
    <section class="border border-[#EAECF0] rounded-xl p-4">
        <div class="flex items-center gap-1">
            <SuperadminFormLabel :label="$t('superadmin.companies.form.economicCustomerNumber')" />
            <Tooltip :text="$t('superadmin.companies.form.economicCustomerNumberHelp')" position="top" wrap>
                <Icon name="ph:info" class="w-3.5 h-3.5 text-[#B4BBC7] mb-[5px]"
                    :aria-label="$t('superadmin.companies.form.economicCustomerNumberHelp')" />
            </Tooltip>
        </div>
        <form class="flex flex-wrap items-start gap-2" @submit.prevent="save">
            <div class="w-48">
                <Tooltip :text="$t('superadmin.companies.form.economicCustomerNumberHelp')" position="top" wrap
                    class="!block">
                    <input class="co-input" type="number" min="1" step="1" inputmode="numeric" v-model="state.value"
                        :disabled="state.isSaving"
                        :placeholder="$t('superadmin.companies.form.economicCustomerNumberPlaceholder')"
                        :aria-label="$t('superadmin.companies.form.economicCustomerNumber')" />
                </Tooltip>
            </div>
            <Tooltip :text="$t('superadmin.companies.form.economicCustomerNumberSaveHelp')" position="top" wrap>
                <FormButton type="submit" buttonStyle="action" :disabled="state.isSaving || !isDirty">
                    <Icon name="ph:floppy-disk" class="w-4 h-4" aria-hidden="true" />
                    {{ $t('superadmin.companies.form.economicCustomerNumberSave') }}
                </FormButton>
            </Tooltip>
        </form>
        <p class="text-[11px] text-[#8891A4] mt-1">
            {{ $t('superadmin.companies.form.economicCustomerNumberHelp') }}
        </p>
        <SuperadminFormError :error="state.error" />
    </section>
</template>

<script setup lang="ts">
import { companyService } from '@/components/api/superadmin/CompanyService'
import { parseEconomicCustomerNumber, unwrapData } from '@/composables/agreements'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

/**
 * Superadmin only. The number is saved through its own endpoint (manage_financials),
 * never through the company form: a customer without a number gets no e-conomic draft.
 */
const props = defineProps({
    companyUuid: { type: String, required: true },
    /** The saved number, as the company resource sends it. */
    number: { type: [Number, String], default: null },
})
const emit = defineEmits(['saved'])

const { t } = useI18n()
const { successAlert } = useAlert()

const state = reactive({ value: '' as string | number | null, isSaving: false, error: '' as string | undefined })

watch(() => props.number, (n) => { state.value = n ?? '' }, { immediate: true })

const isDirty = computed(() => parseEconomicCustomerNumber(state.value) !== parseEconomicCustomerNumber(props.number))

async function save() {
    if (state.isSaving || !isDirty.value) return
    const raw = state.value
    const number = parseEconomicCustomerNumber(raw)
    if (raw !== '' && raw !== null && number === null) {
        state.error = t('superadmin.companies.form.economicCustomerNumberInvalid')
        return
    }
    state.error = ''
    state.isSaving = true
    try {
        const response = await companyService.updateEconomicCustomerNumber(props.companyUuid, number)
        const saved = unwrapData(response)?.economic_customer_number
        emit('saved', saved === undefined ? number : saved)
        successAlert(`${t('alert.success')}!`, t('superadmin.companies.form.economicCustomerNumberSaved'))
    } catch (error: any) {
        // 422: the number is already used by another company (the server says so).
        state.error = error?.errors?.economic_customer_number?.[0]
            ?? error?.message
            ?? t('superadmin.companies.form.economicCustomerNumberTaken')
    }
    state.isSaving = false
}
</script>
