<template>
    <form @submit.prevent="submitForm()" class="max-w-xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-1">
            <FormLabel for="title" :label="$t('jobTitles.form.title')" />
            <FormTextField id="title" name="title" :placeholder="$t('jobTitles.form.title')"
                v-model="state.formJobTitle.title" />
            <FormError :error="v$?.formJobTitle?.title?.$errors[0]?.$message.toString()" />
            <FormError :error="props?.error?.errors?.title?.[0]" />
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" @click="emit('closeModal')">
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
    selectedJobTitle: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['closeModal', 'isPageLoading', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formJobTitle: {
        title: '',
    },
})

watch(() => props.selectedJobTitle, (newValue: any) => {
    if (newValue != null) {
        state.formJobTitle = {
            title: newValue.title,
        }
    }
})

const rules = computed(() => {
    return {
        formJobTitle: {
            title: {
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
        emit('submitForm', state.formJobTitle)
    }
}
</script>