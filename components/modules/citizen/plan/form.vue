<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error && props.error.length > 0 || props.error?.message" />
        <div class="grid grid-cols-1 gap-y-3">
            <div class="grid grid-cols-2 gap-x-3">
                <div class="space-y-1">
                    <FormLabel for="name" :label="$t('plansandgoals.form.planName')" />
                    <FormTextField id="name" name="name" :placeholder="$t('plansandgoals.form.planName')"
                        v-model="state.formPlan.name" />
                    <FormError :error="v$?.formPlan?.name?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.name?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="completion_date" :label="$t('plansandgoals.form.completionDate')" />
                    <FormDateField id="completion_date" name="completion_date"
                        :placeholder="$t('plansandgoals.form.completionDate')"
                        v-model="state.formPlan.completion_date" />
                    <FormError :error="v$?.formPlan?.completion_date?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.completion_date?.[0]" />
                </div>
            </div>
            <div v-if="props.formType === 'update'">
                <div class="w-fit flex items-center cursor-pointer" @click="changeIsCompletedCheckbox">
                    <FormCheckbox :value="state.formPlan.is_completed" />
                    {{ $t('plansandgoals.form.completed') }}
                </div>
            </div>
            <div class="space-y-1" v-if="state.formPlan.is_completed">
                <FormLabel for="date_completed" :label="$t('plansandgoals.form.dateCompleted')" />
                <FormDateField id="date_completed" name="date_completed"
                    :placeholder="$t('plansandgoals.form.dateCompleted')" v-model="state.formPlan.date_completed" />
                <FormError :error="v$?.formPlan?.date_completed?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.date_completed?.[0]" />
            </div>
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
    selectedPlan: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    formPlan: {
        id: '',
        uuid: '',
        name: '',
        completion_date: '',
        date_completed: '',
        is_completed: false,
    },
})

onMounted(() => {
    state.formPlan = {
        id: props.selectedPlan.id,
        uuid: props.selectedPlan.uuid,
        name: props.selectedPlan.name,
        completion_date: props.selectedPlan.completion_date,
        date_completed: props.selectedPlan.date_completed,
        is_completed: props.selectedPlan.is_completed,
    }
})

watch(() => props.selectedPlan, (newValue: any) => {
    if (newValue != null) {
        state.formPlan = {
            id: newValue.id,
            uuid: newValue.uuid,
            name: newValue.name,
            completion_date: newValue.completion_date,
            date_completed: newValue.date_completed,
            is_completed: newValue.is_completed,
        }
    }
})

const rules = computed(() => {
    return {
        formPlan: {
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
        emit('submitForm', state.formPlan)
    }
}

function changeIsCompletedCheckbox() {
    state.formPlan.is_completed = !state.formPlan.is_completed
    state.formPlan.date_completed = ''
}
</script>