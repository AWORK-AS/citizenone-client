<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="en_name" :label="$t('dosageForms.form.nameEnglish')" />
                <FormTextField id="en_name" name="en_name" :placeholder="$t('dosageForms.form.nameEnglish')"
                    v-model="state.formDosageForm.en_name" />
                <FormError :error="v$?.formDosageForm?.en_name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.en_name?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="dk_name" :label="$t('dosageForms.form.nameDanish')" />
                <FormTextField id="dk_name" name="dk_name" :placeholder="$t('dosageForms.form.nameDanish')"
                    v-model="state.formDosageForm.dk_name" />
                <FormError :error="v$?.formDosageForm?.dk_name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.dk_name?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="no_name" :label="$t('dosageForms.form.nameNorwegian')" />
                <FormTextField id="no_name" name="no_name" :placeholder="$t('dosageForms.form.nameNorwegian')"
                    v-model="state.formDosageForm.no_name" />
                <FormError :error="v$?.formDosageForm?.no_name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.no_name?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="sv_name" :label="$t('dosageForms.form.nameSwedish')" />
                <FormTextField id="sv_name" name="sv_name" :placeholder="$t('dosageForms.form.nameSwedish')"
                    v-model="state.formDosageForm.sv_name" />
                <FormError :error="v$?.formDosageForm?.sv_name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.sv_name?.[0]" />
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" @click="navigateTo('/settings/dosage-forms')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary">
                    {{ props.formType === 'create' ? $t('save') :
                        $t('update') }}
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
    selectedDosageForm: {
        type: Object,
        required: false,
    },
})

const emit = defineEmits(['isPageLoading', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formDosageForm: {
        en_name: '',
        dk_name: '',
        no_name: '',
        sv_name: '',
    },
})

watch(() => props.selectedDosageForm, (newValue: any) => {
    if (newValue != null) {
        state.formDosageForm = {
            en_name: newValue.en_name,
            dk_name: newValue.dk_name,
            no_name: newValue.no_name ?? '',
            sv_name: newValue.sv_name ?? '',
        }
    }
})

const rules = computed(() => {
    return {
        formDosageForm: {
            en_name: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            dk_name: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            no_name: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            sv_name: {
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
        emit('submitForm', state.formDosageForm)
    }
}
</script>