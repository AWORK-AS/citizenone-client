<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="ip_address" :label="$t('ipRestrictions.ipAddress')" />
                <FormTextField id="ip_address" name="ip_address"
                    :placeholder="$t('ipRestrictions.ipAddress')"
                    v-model="state.form.ip_address" />
                <FormError :error="v$?.form?.ip_address?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.ip_address?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="label" :label="$t('ipRestrictions.label')" />
                <FormTextField id="label" name="label"
                    :placeholder="$t('ipRestrictions.label')"
                    v-model="state.form.label" />
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

const { t } = useI18n()

const props = defineProps({
    formType: {
        type: String,
        required: true,
    },
    selectedIpRestriction: {
        type: Object,
        default: () => ({}),
    },
    error: {
        type: Object as () => Error,
        default: () => ({} as Error),
    },
})

const emit = defineEmits(['submitForm', 'closeModal'])

const state = reactive({
    form: {
        ip_address: '',
        label: '',
    },
})

watch(() => props.selectedIpRestriction, (val) => {
    if (val && props.formType === 'update') {
        state.form.ip_address = val.ip_address ?? ''
        state.form.label = val.label ?? ''
    }
}, { immediate: true })

const rules = computed(() => ({
    form: {
        ip_address: {
            required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
        },
    },
}))

const v$ = useVuelidate(rules, state)

async function submitForm() {
    v$.value.$reset()
    await v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', { ...state.form })
    }
}
</script>
