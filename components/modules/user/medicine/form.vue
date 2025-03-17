<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="en_name" :label="$t('medicines.form.nameEnglish')" />
                <FormTextField id="en_name" name="en_name" :placeholder="$t('medicines.form.nameEnglish')"
                    v-model="state.formMedicine.en_name" />
                <FormError :error="v$?.formMedicine?.en_name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.en_name?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="dk_name" :label="$t('medicines.form.nameDanish')" />
                <FormTextField id="dk_name" name="dk_name" :placeholder="$t('medicines.form.nameDanish')"
                    v-model="state.formMedicine.dk_name" />
                <FormError :error="v$?.formMedicine?.dk_name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.dk_name?.[0]" />
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                    @click="navigateTo('/settings/medicines')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="rounded-md">
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
    selectedMedicine: {
        type: Object,
        required: false,
    },
})

const emit = defineEmits(['isPageLoading', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formMedicine: {
        en_name: '',
        dk_name: '',
    },
})

watch(() => props.selectedMedicine, (newValue: any) => {
    if (newValue != null) {
        state.formMedicine = {
            en_name: newValue.en_name,
            dk_name: newValue.dk_name,
        }
    }
})

const rules = computed(() => {
    return {
        formMedicine: {
            en_name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            dk_name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formMedicine)
    }
}
</script>