<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <LoadingSpinner :isActive="state.isPageLoading">
            <div class="space-y-3">
                <div class="space-y-1">
                    <FormLabel for="date_time_start" :label="$t('citizens.interventionHours.form.datetimeStart')" />
                    <FormDateTimeField id="date_time_start" name="date_time_start"
                        :placeholder="`${$t('citizens.interventionHours.form.datetimeStart')}`"
                        v-model="state.formInterventionHours.date_time_start" />
                    <FormError :error="v$?.formInterventionHours.date_time_start?.$errors[0]?.$message.toString()" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="date_time_end" :label="$t('citizens.interventionHours.form.datetimeEnd')" />
                    <FormDateTimeField id="date_time_end" name="date_time_end"
                        :placeholder="`${$t('citizens.interventionHours.form.datetimeEnd')}`"
                        v-model="state.formInterventionHours.date_time_end" />
                    <FormError :error="v$?.formInterventionHours.date_time_end?.$errors[0]?.$message.toString()" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="note" :label="$t('citizens.interventionHours.form.note')" />
                    <FormTextArea id="note" name="note" :placeholder="$t('citizens.interventionHours.form.note')"
                        v-model="state.formInterventionHours.note" />
                    <FormError :error="v$?.formInterventionHours?.note?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.note?.[0]" />
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
        </LoadingSpinner>
    </form>
</template>

<script setup lang="ts">
import moment from 'moment'
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
    selectedInterventionHours: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formInterventionHours: {
        date_time_start: moment().startOf('day').add(8, 'hours').format('YYYY-MM-DD H:mm'),
        date_time_end: moment().startOf('day').add(17, 'hours').format('YYYY-MM-DD H:mm'),
        note: '',
    },
    isPageLoading: false,
})

onMounted(() => {
    state.formInterventionHours = {
        date_time_start: props.selectedInterventionHours?.date_time_start,
        date_time_end: props.selectedInterventionHours?.date_time_end,
        note: props.selectedInterventionHours?.note,
    }
})

watch(() => props.selectedInterventionHours, (interventionHours: any) => {
    if (interventionHours != null) {
        state.formInterventionHours = {
            date_time_start: props.selectedInterventionHours?.date_time_start,
            date_time_end: props.selectedInterventionHours?.date_time_end,
            note: props.selectedInterventionHours?.note,
        }
    }
})

const rules = computed(() => {
    return {
        formInterventionHours: {
            date_time_start: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            date_time_end: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formInterventionHours)
    }
}
</script>