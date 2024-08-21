<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-1">
            <FormLabel for="status" :label="$t('plansandgoals.form.status')" />
            <FormTextArea id="status" name="status" :placeholder="$t('plansandgoals.form.status')"
                v-model="state.formStatus.status" />
            <FormError :error="v$?.formStatus?.status?.$errors[0]?.$message.toString()" />
            <FormError :error="props?.error?.errors?.status?.[0]" />
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="emit('closeModal')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full">
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

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedStatus: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    formStatus: {
        status: '',
    },
})

onMounted(() => {
    state.formStatus = {
        status: props.selectedStatus.status,
    }
})

watch(() => props.selectedStatus, (newValue: any) => {
    if (newValue != null) {
        state.formStatus = {
            status: newValue.status,
        }
    }
})

const rules = computed(() => {
    return {
        formStatus: {
            status: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formStatus)
    }
}
</script>