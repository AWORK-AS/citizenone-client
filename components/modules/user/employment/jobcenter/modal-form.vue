<template>
    <form @submit.prevent="submitForm()" class="mt-4">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="name" :label="$t('employment.jobcenters.form.name')" />
                <FormTextField id="name" name="name" :placeholder="$t('employment.jobcenters.form.name')"
                    v-model="state.formJobcenter.name" />
                <FormError :error="v$?.formJobcenter?.name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.name?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="municipality" :label="$t('employment.jobcenters.form.municipality')" />
                <FormTextField id="municipality" name="municipality"
                    :placeholder="$t('employment.jobcenters.form.municipality')"
                    v-model="state.formJobcenter.municipality" />
                <FormError :error="props?.error?.errors?.municipality?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="email" :label="$t('employment.jobcenters.form.email')" />
                <FormTextField id="email" name="email" :placeholder="$t('employment.jobcenters.form.email')"
                    v-model="state.formJobcenter.email" />
                <FormError :error="props?.error?.errors?.email?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="phone" :label="$t('employment.jobcenters.form.phone')" />
                <FormTextField id="phone" name="phone" :placeholder="$t('employment.jobcenters.form.phone')"
                    v-model="state.formJobcenter.phone" />
                <FormError :error="props?.error?.errors?.phone?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="contact_person" :label="$t('employment.jobcenters.form.contactPerson')" />
                <FormTextField id="contact_person" name="contact_person"
                    :placeholder="$t('employment.jobcenters.form.contactPerson')"
                    v-model="state.formJobcenter.contact_person" />
                <FormError :error="props?.error?.errors?.contact_person?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="sort_order" :label="$t('employment.jobcenters.form.sortOrder')" />
                <FormNumberField id="sort_order" name="sort_order" :min="0" v-model="state.formJobcenter.sort_order" />
                <FormError :error="props?.error?.errors?.sort_order?.[0]" />
            </div>
            <div class="flex items-center gap-x-3">
                <FormLabel for="is_active" :label="$t('employment.jobcenters.form.isActive')" />
                <FormSwitch :value="state.formJobcenter.is_active"
                    @toggleSwitch="state.formJobcenter.is_active = !state.formJobcenter.is_active" />
                <FormError :error="props?.error?.errors?.is_active?.[0]" />
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" @click="emit('closeModal')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary">
                    {{ $t('save') }}
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
    error: { type: Object, required: false },
})
const emit = defineEmits(['submitForm', 'closeModal'])

const { t } = useI18n()

const state = reactive({
    formJobcenter: {
        name: '',
        municipality: '',
        email: '',
        phone: '',
        contact_person: '',
        sort_order: 0,
        is_active: true,
    },
})

const rules = computed(() => ({
    formJobcenter: {
        name: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
    },
}))

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formJobcenter)
    }
}
</script>
