<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="name" :label="$t('employment.statusTypes.form.name')" />
                <FormTextField id="name" name="name" :placeholder="$t('employment.statusTypes.form.name')"
                    v-model="state.formStatusType.name" />
                <FormError :error="v$?.formStatusType?.name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.name?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="color" :label="$t('employment.statusTypes.form.color')" />
                <FormColorPicker id="color" v-model="state.formStatusType.color" />
                <FormError :error="props?.error?.errors?.color?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="billing_rule_uuid" :label="$t('employment.statusTypes.form.billingRule')" />
                <FormSelect id="billing_rule_uuid" :options="state.options.billingRules"
                    v-model="state.formStatusType.billing_rule_uuid" />
                <FormError :error="props?.error?.errors?.billing_rule_uuid?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="sort_order" :label="$t('employment.statusTypes.form.sortOrder')" />
                <FormNumberField id="sort_order" name="sort_order" :min="0"
                    :placeholder="$t('employment.statusTypes.form.sortOrder')"
                    v-model="state.formStatusType.sort_order" />
                <FormError :error="props?.error?.errors?.sort_order?.[0]" />
            </div>
            <div class="flex items-center gap-x-3">
                <FormLabel for="is_active" :label="$t('employment.statusTypes.form.isActive')" />
                <FormSwitch :value="state.formStatusType.is_active"
                    @toggleSwitch="state.formStatusType.is_active = !state.formStatusType.is_active" />
                <FormError :error="props?.error?.errors?.is_active?.[0]" />
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" @click="navigateTo('/settings/employment-status-types')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary">
                    {{ props.formType === 'create' ? $t('save') : $t('update') }}
                </FormButton>
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">
import { employmentService } from '@/components/api/user/EmploymentService'
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
    selectedStatusType: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formStatusType: {
        name: '',
        color: '#000000',
        is_active: true,
        sort_order: '0' as string,
        billing_rule_uuid: null as string | null,
    },
    options: {
        billingRules: [] as any[],
    },
})

onMounted(() => { fetchBillingRules() })

watch(() => props.selectedStatusType, (newValue: any) => {
    if (newValue != null) {
        state.formStatusType = {
            name: newValue.name ?? '',
            color: newValue.color ?? '#000000',
            is_active: newValue.is_active ?? true,
            sort_order: newValue.sort_order != null ? String(newValue.sort_order) : '0',
            billing_rule_uuid: newValue.billing_rule?.uuid ?? newValue.billing_rule_uuid ?? null,
        }
    }
})

async function fetchBillingRules() {
    emit('isPageLoading', true)
    try {
        const response = await employmentService.getAllBillingRules()
        if (response?.data) {
            state.options.billingRules = response.data.map((item: any) => ({
                value: item.uuid,
                label: item.name,
            }))
        }
    } catch { /* ignore */ }
    emit('isPageLoading', false)
}

const rules = computed(() => {
    return {
        formStatusType: {
            name: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', {
            ...state.formStatusType,
            sort_order: Number(state.formStatusType.sort_order),
        })
    }
}
</script>
