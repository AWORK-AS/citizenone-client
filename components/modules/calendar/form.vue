<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error && props.error.length > 0 || props.error?.message" />
        <div class="grid grid-cols-1 gap-y-3">
            <div class="space-y-1">
                <FormLabel for="title" :label="$t('schedules.form.title')" />
                <FormTextField id="title" name="title" :placeholder="$t('schedules.form.title')"
                    v-model="state.formSchedule.title" />
                <FormError :error="v$?.formSchedule?.title?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.title?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="date_time_start" :label="$t('schedules.form.startDateTime')" />
                <FormDateTimeField id="date_time_start" name="date_time_start"
                    :placeholder="$t('schedules.form.startDateTime')" v-model="state.formSchedule.date_time_start" />
                <FormError :error="v$?.formSchedule?.date_time_start?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.date_time_start?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="date_time_end" :label="$t('schedules.form.endDateTime')" />
                <FormDateTimeField id="date_time_end" name="date_time_end"
                    :placeholder="$t('schedules.form.endDateTime')" v-model="state.formSchedule.date_time_end" />
                <FormError :error="v$?.formSchedule?.date_time_end?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.date_time_end?.[0]" />
            </div>
            <div class="space-y-1">
                <div class="w-fit flex items-center cursor-pointer"
                    @click="state.formSchedule.is_private = !state.formSchedule.is_private">
                    <FormCheckbox :value="state.formSchedule.is_private" />
                    {{ $t('schedules.form.private') }}
                </div>
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
    selectedSchedule: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    formSchedule: {
        id: '',
        uuid: '',
        title: '',
        date_time_start: '',
        date_time_end: '',
        is_private: false,
    },
})

onMounted(() => {
    state.formSchedule = {
        id: props.selectedSchedule.id,
        uuid: props.selectedSchedule.uuid,
        title: props.selectedSchedule.title,
        date_time_start: props.selectedSchedule.date_time_start,
        date_time_end: props.selectedSchedule.date_time_end,
        is_private: props.selectedSchedule.is_private,
    }
})

watch(() => props.selectedSchedule, (newValue: any) => {
    if (newValue != null) {
        state.formSchedule = {
            id: newValue.id,
            uuid: newValue.uuid,
            title: newValue.title,
            date_time_start: newValue.date_time_start,
            date_time_end: newValue.date_time_end,
            is_private: newValue.is_private,
        }
    }
})

const rules = computed(() => {
    return {
        formSchedule: {
            title: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
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
        emit('submitForm', state.formSchedule)
    }
}
</script>