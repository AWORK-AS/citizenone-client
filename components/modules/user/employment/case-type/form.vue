<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="name" :label="$t('employment.caseTypes.form.name')" />
                <FormTextField id="name" name="name" :placeholder="$t('employment.caseTypes.form.name')"
                    v-model="state.formCaseType.name" />
                <FormError :error="v$?.formCaseType?.name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.name?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="description" :label="$t('employment.caseTypes.form.description')" />
                <FormTextArea id="description" name="description"
                    :placeholder="$t('employment.caseTypes.form.description')"
                    v-model="state.formCaseType.description" />
                <FormError :error="props?.error?.errors?.description?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="sort_order" :label="$t('employment.caseTypes.form.sortOrder')" />
                <FormNumberField id="sort_order" name="sort_order" :min="0"
                    v-model="state.formCaseType.sort_order" />
                <FormError :error="props?.error?.errors?.sort_order?.[0]" />
            </div>
            <div class="flex items-center gap-x-3">
                <FormLabel for="is_active" :label="$t('employment.caseTypes.form.isActive')" />
                <FormSwitch :value="state.formCaseType.is_active"
                    @toggleSwitch="state.formCaseType.is_active = !state.formCaseType.is_active" />
                <FormError :error="props?.error?.errors?.is_active?.[0]" />
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel"
                    @click="navigateTo('/settings/employment-case-types')">
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
    selectedCaseType: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formCaseType: {
        name: '',
        description: '',
        is_active: true,
        sort_order: 0,
    },
})

watch(() => props.selectedCaseType, (newValue: any) => {
    if (newValue != null) {
        state.formCaseType = {
            name: newValue.name ?? '',
            description: newValue.description ?? '',
            is_active: newValue.is_active ?? true,
            sort_order: newValue.sort_order ?? 0,
        }
    }
})

const rules = computed(() => {
    return {
        formCaseType: {
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
        emit('submitForm', state.formCaseType)
    }
}
</script>
