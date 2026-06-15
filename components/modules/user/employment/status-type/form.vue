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
                <FormLabel for="sort_order" :label="$t('employment.statusTypes.form.sortOrder')" />
                <FormNumberField id="sort_order" name="sort_order" :min="0"
                    :placeholder="$t('employment.statusTypes.form.sortOrder')"
                    v-model="state.formStatusType.sort_order" />
                <FormError :error="props?.error?.errors?.sort_order?.[0]" />
            </div>
            <div class="flex items-center gap-x-3">
                <FormLabel for="is_billable" :label="$t('employment.statusTypes.form.isBillable')" />
                <FormSwitch :value="state.formStatusType.is_billable"
                    @toggleSwitch="state.formStatusType.is_billable = !state.formStatusType.is_billable" />
                <FormError :error="props?.error?.errors?.is_billable?.[0]" />
            </div>
            <p class="text-xs text-[#8891A4] -mt-1">
                {{ $t('employment.statusTypes.form.isBillableHint') }}
            </p>
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
        is_billable: true,
        sort_order: '0' as string,
    },
})

watch(() => props.selectedStatusType, (newValue: any) => {
    if (newValue != null) {
        state.formStatusType = {
            name: newValue.name ?? '',
            color: newValue.color ?? '#000000',
            is_active: newValue.is_active ?? true,
            is_billable: newValue.is_billable ?? true,
            sort_order: newValue.sort_order != null ? String(newValue.sort_order) : '0',
        }
    }
})

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
