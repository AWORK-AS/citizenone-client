<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <LoadingSpinner :isActive="state.isPageLoading">
            <div class="space-y-3">
                <div class="space-y-1">
                    <FormLabel for="date_time_start" :label="$t('citizens.patientCareHours.form.datetimeStart')" />
                    <FormDateTimeField id="date_time_start" name="date_time_start"
                        :placeholder="`${$t('citizens.patientCareHours.form.datetimeStart')}`"
                        v-model="state.formPatientCareHours.date_time_start" />
                    <FormError :error="v$?.formPatientCareHours.date_time_start?.$errors[0]?.$message.toString()" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="date_time_end" :label="$t('citizens.patientCareHours.form.datetimeEnd')" />
                    <FormDateTimeField id="date_time_end" name="date_time_end"
                        :placeholder="`${$t('citizens.patientCareHours.form.datetimeEnd')}`"
                        v-model="state.formPatientCareHours.date_time_end" />
                    <FormError :error="v$?.formPatientCareHours.date_time_end?.$errors[0]?.$message.toString()" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="note" :label="$t('citizens.patientCareHours.form.note')" />
                    <FormTextArea id="note" name="note" :placeholder="$t('citizens.patientCareHours.form.note')"
                        v-model="state.formPatientCareHours.note" />
                    <FormError :error="v$?.formPatientCareHours?.note?.$errors[0]?.$message.toString()" />
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
    selectedPatientCareHours: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formPatientCareHours: {
        date_time_start: moment().startOf('day').add(8, 'hours').format('YYYY-MM-DD H:mm'),
        date_time_end: moment().startOf('day').add(17, 'hours').format('YYYY-MM-DD H:mm'),
        note: '',
    },
    isPageLoading: false,
})

onMounted(() => {
    state.formPatientCareHours = {
        date_time_start: props.selectedPatientCareHours?.date_time_start,
        date_time_end: props.selectedPatientCareHours?.date_time_end,
        note: props.selectedPatientCareHours?.note,
    }
})

watch(() => props.selectedPatientCareHours, (patientCareHours: any) => {
    if (newValue != null) {
        state.formPatientCareHours = {
            date_time_start: props.patientCareHours?.date_time_start,
            date_time_end: props.patientCareHours?.date_time_end,
            note: props.patientCareHours?.note,
        }
    }
})

const rules = computed(() => {
    return {
        formPatientCareHours: {
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
        emit('submitForm', state.formPatientCareHours)
    }
}
</script>