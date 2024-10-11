<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-1">
            <FormLabel for="title" :label="$t('jobSpecialties.form.title')" />
            <FormTextField id="title" name="title" :placeholder="$t('jobSpecialties.form.title')"
                v-model="state.formJobSpecialty.title" />
            <FormError :error="v$?.formJobSpecialty?.title?.$errors[0]?.$message.toString()" />
            <FormError :error="props?.error?.errors?.title?.[0]" />
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                    @click="navigateTo(`/settings/job-titles/${jobTitleUuid}`)">
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
    selectedJobSpecialty: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])
const router = useRouter()
const jobTitleUuid = router?.currentRoute?.value?.params?.job_title_uuid
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formJobSpecialty: {
        title: '',
    },
})

watch(() => props.selectedJobSpecialty, (newValue: any) => {
    if (newValue != null) {
        state.formJobSpecialty = {
            title: newValue.title,
        }
    }
})

const rules = computed(() => {
    return {
        formJobSpecialty: {
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
        emit('submitForm', state.formJobSpecialty)
    }
}
</script>