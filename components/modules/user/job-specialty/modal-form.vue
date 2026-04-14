<template>
    <form @submit.prevent="submitForm()" class="max-w-xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <div class="flex justify-between items-center py-0.5" ref="jobTitleField">
                    <FormLabel for="job_title_uuid" :label="$t('jobSpecialties.form.jobTitle')" />
                    <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                        @click="state.modal.isAddJobTitleOpen = true">
                        {{ $t('jobTitles.addNewJobTitle') }}
                    </span>
                </div>
                <FormSelect id="job_title_uuid" :options="state.options.jobTitles"
                    v-model="state.formJobTitle.job_title_uuid" />
                <FormError :error="v$?.formJobTitle?.job_title_uuid?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.job_title_uuid?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="title" :label="$t('jobSpecialties.form.title')" />
                <FormTextField id="title" name="title" :placeholder="$t('jobSpecialties.form.title')"
                    v-model="state.formJobTitle.title" />
                <FormError :error="v$?.formJobTitle?.title?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.title?.[0]" />
            </div>
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
    <ModulesUserJobTitleModalNew :isModalOpen="state.modal.isAddJobTitleOpen"
        @close="state.modal.isAddJobTitleOpen = false" @refreshJobTitles="fetchJobTitles" />
</template>

<script setup lang="ts">
import { jobTitleService } from '@/components/api/user/JobTitleService'
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
        job_title_uuid: '',
        title: '',
    },
    modal: {
        isAddJobTitleOpen: false,
    },
    options: {
        jobTitles: [],
    },
})

watch(() => props.selectedJobTitle, (newValue: any) => {
    if (newValue != null) {
        state.formJobTitle = {
            job_title_uuid: newValue.job_title_uuid,
            title: newValue.title,
        }
    }
})

onMounted(() => {
    fetchJobTitles()
})

const rules = computed(() => {
    return {
        formJobTitle: {
            job_title_uuid: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
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

async function fetchJobTitles() {
    emit('isPageLoading', true)
    state.error = {}
    try {
        const response = await jobTitleService.getAllJobTitles()
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.title,
                })
            )
            state.options.jobTitles = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}
</script>