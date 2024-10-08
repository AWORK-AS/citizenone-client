<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-1">
            <FormLabel for="name" :label="$t('plansandgoals.form.planName')" />
            <FormTextField id="name" name="name" :placeholder="$t('plansandgoals.form.planName')"
                v-model="state.formContact.name" />
            <FormError :error="v$?.formContact?.name?.$errors[0]?.$message.toString()" />
            <FormError :error="props?.error?.errors?.name?.[0]" />
        </div>
        <div class="space-y-1">
            <FormLabel for="description" :label="$t('plansandgoals.form.description')" />
            <FormTextArea id="description" name="description" :placeholder="$t('plansandgoals.form.description')"
                v-model="state.formContact.description" />
            <FormError :error="v$?.formContact?.description?.$errors[0]?.$message.toString()" />
            <FormError :error="props?.error?.errors?.description?.[0]" />
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
    selectedContact: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    formContact: {
        id: '',
        uuid: '',
        name: '',
        description: '',
        completion_date: '',
        date_completed: '',
        is_completed: false,
    },
})

onMounted(() => {
    state.formContact = {
        id: props.selectedContact.id,
        uuid: props.selectedContact.uuid,
        name: props.selectedContact.name,
        completion_date: props.selectedContact.completion_date,
        date_completed: props.selectedContact.date_completed,
        description: props.selectedContact.description,
        is_completed: props.selectedContact.is_completed,
    }
})

watch(() => props.selectedContact, (newValue: any) => {
    if (newValue != null) {
        state.formContact = {
            id: newValue.id,
            uuid: newValue.uuid,
            name: newValue.name,
            description: newValue.description,
            completion_date: newValue.completion_date,
            date_completed: newValue.date_completed,
            is_completed: newValue.is_completed,
        }
    }
})

const rules = computed(() => {
    return {
        formContact: {
            name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            completion_date: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formContact)
    }
}

function changeIsCompletedCheckbox() {
    state.formContact.is_completed = !state.formContact.is_completed
    state.formContact.date_completed = ''
}
</script>