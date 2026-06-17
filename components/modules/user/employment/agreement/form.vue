<template>
    <div>
        <form @submit.prevent="submitForm()" class="mt-6 max-w-xl">
            <Alert type="danger" :text="props?.error?.message"
                v-if="props.error?.message && props.error.message.length > 0" />
            <div class="space-y-3">
                <div class="space-y-1">
                    <FormLabel for="name" :label="$t('employment.agreements.form.name')" />
                    <FormTextField id="name" name="name" :placeholder="$t('employment.agreements.form.name')"
                        v-model="state.formAgreement.name" />
                    <FormError :error="v$?.formAgreement?.name?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.name?.[0]" />
                </div>
                <div class="space-y-1">
                    <div class="flex justify-between items-center py-0.5">
                        <FormLabel for="jobcenter_uuid" :label="$t('employment.agreements.form.jobcenter')" />
                        <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                            @click="state.modal.isAddJobcenterOpen = true">
                            {{ $t('employment.jobcenters.addNewJobcenter') }}
                        </span>
                    </div>
                    <FormSelect id="jobcenter_uuid" :options="state.options.jobcenters"
                        v-model="state.formAgreement.jobcenter_uuid" />
                    <FormError :error="props?.error?.errors?.jobcenter_uuid?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="description" :label="$t('employment.agreements.form.description')" />
                    <FormTextArea id="description" name="description"
                        :placeholder="$t('employment.agreements.form.description')"
                        v-model="state.formAgreement.description" />
                    <FormError :error="props?.error?.errors?.description?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="default_duration_weeks"
                        :label="$t('employment.agreements.form.defaultDurationWeeks')" />
                    <FormNumberField id="default_duration_weeks" name="default_duration_weeks" :min="1"
                        v-model="state.formAgreement.default_duration_weeks" />
                    <FormError :error="props?.error?.errors?.default_duration_weeks?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="sort_order" :label="$t('employment.agreements.form.sortOrder')" />
                    <FormNumberField id="sort_order" name="sort_order" :min="0"
                        v-model="state.formAgreement.sort_order" />
                    <FormError :error="props?.error?.errors?.sort_order?.[0]" />
                </div>
                <div class="flex items-center gap-x-3">
                    <FormLabel for="is_active" :label="$t('employment.agreements.form.isActive')" />
                    <FormSwitch :value="state.formAgreement.is_active"
                        @toggleSwitch="state.formAgreement.is_active = !state.formAgreement.is_active" />
                    <FormError :error="props?.error?.errors?.is_active?.[0]" />
                </div>
            </div>
            <div class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormButton type="button" buttonStyle="cancel"
                        @click="navigateTo('/settings/employment-agreements')">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton type="submit" buttonStyle="primary">
                        {{ props.formType === 'create' ? $t('save') : $t('update') }}
                    </FormButton>
                </div>
            </div>
        </form>

        <ModulesUserEmploymentJobcenterModalNew :isModalOpen="state.modal.isAddJobcenterOpen"
            @close="state.modal.isAddJobcenterOpen = false" @created="onJobcenterCreated" />
    </div>
</template>

<script setup lang="ts">
import { employmentService } from '@/components/api/user/EmploymentService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    error: { type: Object, required: false },
    formType: { type: String, required: true },
    selectedAgreement: { type: Object, required: false },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formAgreement: {
        name: '',
        jobcenter_uuid: null as string | null,
        description: '',
        default_duration_weeks: null as number | null,
        sort_order: 0,
        is_active: true,
    },
    modal: {
        isAddJobcenterOpen: false,
    },
    options: {
        jobcenters: [] as any[],
    },
})

onMounted(() => { fetchJobcenters() })

watch(() => props.selectedAgreement, (newValue: any) => {
    if (newValue != null) {
        state.formAgreement = {
            name: newValue.name ?? '',
            jobcenter_uuid: newValue.jobcenter?.uuid ?? null,
            description: newValue.description ?? '',
            default_duration_weeks: newValue.default_duration_weeks ?? null,
            sort_order: newValue.sort_order ?? 0,
            is_active: newValue.is_active ?? true,
        }
    }
})

function onJobcenterCreated(newJobcenter: any) {
    state.options.jobcenters.push({ value: newJobcenter.uuid, label: newJobcenter.name })
    state.formAgreement.jobcenter_uuid = newJobcenter.uuid
}

async function fetchJobcenters() {
    emit('isPageLoading', true)
    try {
        const response = await employmentService.getAllJobcenters()
        if (response?.data) {
            state.options.jobcenters = response.data.map((item: any) => ({
                value: item.uuid,
                label: item.name,
            }))
        }
    } catch (error: any) {
        // silently fail — jobcenters are optional
    }
    emit('isPageLoading', false)
}

const rules = computed(() => ({
    formAgreement: {
        name: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
    },
}))

const v$ = useVuelidate(rules, state)

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formAgreement)
    }
}
</script>
