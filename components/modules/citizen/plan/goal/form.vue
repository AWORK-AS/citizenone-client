<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="grid grid-cols-1 gap-y-3">
            <div class="grid grid-cols-2 gap-x-3">
                <div class="space-y-1">
                    <FormLabel for="name" :label="$t('plansandgoals.form.goalName')" />
                    <FormTextField id="name" name="name" :placeholder="$t('plansandgoals.form.goalName')"
                        v-model="state.formGoal.name" />
                    <FormError :error="v$?.formGoal?.name?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.name?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="completion_date" :label="$t('plansandgoals.form.completionDate')" />
                    <FormDateField id="completion_date" name="completion_date"
                        :placeholder="$t('plansandgoals.form.completionDate')"
                        v-model="state.formGoal.completion_date" />
                    <FormError :error="v$?.formGoal?.completion_date?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.completion_date?.[0]" />
                </div>
            </div>
            <div class="space-y-1">
                <FormLabel for="description" :label="$t('plansandgoals.form.description')" />
                <FormTextArea id="description" name="description" :placeholder="$t('plansandgoals.form.description')"
                    v-model="state.formGoal.description" />
                <FormError :error="v$?.formGoal?.description?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.description?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="status" :label="$t('plansandgoals.form.status')" />
                <FormTextArea id="status" name="status" :placeholder="$t('plansandgoals.form.status')"
                    v-model="state.formGoal.status" />
                <FormError :error="v$?.formGoal?.status?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.status?.[0]" />
            </div>
            <div v-if="props.formType === 'update'">
                <div class="w-fit flex items-center cursor-pointer" @click="changeIsCompletedCheckbox">
                    <FormCheckbox :value="state.formGoal.is_completed" />
                    {{ $t('plansandgoals.form.completed') }}
                </div>
            </div>
            <div class="space-y-1" v-if="state.formGoal.is_completed">
                <FormLabel for="date_completed" :label="$t('plansandgoals.form.dateCompleted')" />
                <FormDateField id="date_completed" name="date_completed"
                    :placeholder="$t('plansandgoals.form.dateCompleted')" v-model="state.formGoal.date_completed" />
                <FormError :error="v$?.formGoal?.date_completed?.$errors[0]?.$message.toString()" />
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
    selectedGoal: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    formGoal: {
        id: '',
        uuid: '',
        name: '',
        description: '',
        status: '',
        completion_date: '',
        date_completed: '',
        is_completed: false,
    },
})

onMounted(() => {
    state.formGoal = {
        id: props.selectedGoal.id,
        uuid: props.selectedGoal.uuid,
        name: props.selectedGoal.name,
        description: props.selectedGoal.description,
        status: props.selectedGoal.status,
        completion_date: props.selectedGoal.completion_date,
        date_completed: props.selectedGoal.date_completed,
        is_completed: props.selectedGoal.is_completed,
    }
    if (props.selectedGoal.date_completed) {
        state.formGoal.is_completed = true
    } else {
        state.formGoal.is_completed = false
    }
})

watch(() => props.selectedGoal, (newValue: any) => {
    if (newValue != null) {
        state.formGoal = {
            id: newValue.id,
            uuid: newValue.uuid,
            name: newValue.name,
            description: newValue.description,
            status: newValue.status,
            completion_date: newValue.completion_date,
            date_completed: newValue.date_completed,
            is_completed: newValue.is_completed,
        }
    }
})

const rules = computed(() => {
    return {
        formGoal: {
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
        emit('submitForm', state.formGoal)
    }
}

function changeIsCompletedCheckbox() {
    state.formGoal.is_completed = !state.formGoal.is_completed
    state.formGoal.date_completed = ''
}
</script>