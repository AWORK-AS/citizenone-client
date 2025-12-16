<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="en_title" :label="$t('contactJobTitles.form.titleEnglish')" />
                <FormTextField id="en_title" name="en_title" :placeholder="$t('contactJobTitles.form.titleEnglish')"
                    v-model="state.formContactJobTitle.en_title" />
                <FormError :error="v$?.formContactJobTitle?.en_title?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.en_title?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="dk_title" :label="$t('contactJobTitles.form.titleDanish')" />
                <FormTextField id="dk_title" name="dk_title" :placeholder="$t('contactJobTitles.form.titleDanish')"
                    v-model="state.formContactJobTitle.dk_title" />
                <FormError :error="v$?.formContactJobTitle?.dk_title?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.dk_title?.[0]" />
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                    @click="navigateTo('/settings/contact-job-titles')">
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
    selectedContactJobTitle: {
        type: Object,
        required: false,
    },
})

const emit = defineEmits(['isPageLoading', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formContactJobTitle: {
        en_title: '',
        dk_title: '',
    },
})

watch(() => props.selectedContactJobTitle, (newValue: any) => {
    if (newValue != null) {
        state.formContactJobTitle = {
            en_title: newValue.en_title,
            dk_title: newValue.dk_title,
        }
    }
})

const rules = computed(() => {
    return {
        formContactJobTitle: {
            en_title: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            dk_title: {
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
        emit('submitForm', state.formContactJobTitle)
    }
}
</script>