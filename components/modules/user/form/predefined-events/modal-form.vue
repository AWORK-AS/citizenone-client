<template>
    <Modal
        size="sm"
        :title="props.formType === 'create' ? $t('forms.predefinedEvents.newPredefinedEvent') : $t('forms.predefinedEvents.editPredefinedEvent')"
        :show="props.isOpen"
        @close="close"
    >
        <template #modal-body>
            <LoadingSpinner :isActive="state.isLoading">
                <form @submit.prevent="submit" class="space-y-4">
                    <Alert
                        type="danger"
                        :text="state.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0"
                    />

                    <div class="space-y-1">
                        <FormLabel for="pe_title" :label="$t('forms.predefinedEvents.form.title')" />
                        <FormTextField
                            id="pe_title"
                            name="pe_title"
                            :placeholder="$t('forms.predefinedEvents.form.title')"
                            v-model="state.form.title"
                        />
                        <FormError :error="v$?.form?.title?.$errors[0]?.$message.toString()" />
                        <FormError :error="state.error?.errors?.title?.[0]" />
                    </div>

                    <div class="space-y-1">
                        <FormLabel for="pe_description" :label="$t('forms.predefinedEvents.form.description')" />
                        <FormTextArea
                            id="pe_description"
                            name="pe_description"
                            :placeholder="$t('forms.predefinedEvents.form.description')"
                            :rows="3"
                            v-model="state.form.description"
                        />
                        <FormError :error="state.error?.errors?.description?.[0]" />
                    </div>

                    <div class="space-y-1">
                        <FormLabel for="pe_calendar_type" :label="$t('forms.predefinedEvents.form.calendarType')" />
                        <FormSelect
                            id="pe_calendar_type"
                            :options="calendarTypeOptions"
                            :canClear="false"
                            :searchable="false"
                            v-model="state.form.calendar_type"
                        />
                        <FormError :error="v$?.form?.calendar_type?.$errors[0]?.$message.toString()" />
                        <FormError :error="state.error?.errors?.calendar_type?.[0]" />
                    </div>

                    <div class="space-y-1">
                        <FormLabel for="pe_duration_minutes" :label="$t('forms.predefinedEvents.form.durationMinutes')" />
                        <FormNumberField
                            id="pe_duration_minutes"
                            name="pe_duration_minutes"
                            :placeholder="$t('forms.predefinedEvents.form.durationMinutes')"
                            :min="1"
                            v-model="state.form.duration_minutes"
                        />
                        <FormError :error="v$?.form?.duration_minutes?.$errors[0]?.$message.toString()" />
                        <FormError :error="state.error?.errors?.duration_minutes?.[0]" />
                    </div>

                    <div class="flex items-center gap-x-3">
                        <FormSwitch
                            :value="state.form.is_recurring"
                            @toggleSwitch="state.form.is_recurring = !state.form.is_recurring"
                        />
                        <label
                            class="text-sm font-medium text-gray-700 cursor-pointer"
                            @click="state.form.is_recurring = !state.form.is_recurring"
                        >
                            {{ $t('forms.predefinedEvents.form.isRecurring') }}
                        </label>
                    </div>

                    <template v-if="state.form.is_recurring">
                        <div class="space-y-1">
                            <FormLabel for="pe_recurring_type" :label="$t('forms.predefinedEvents.form.recurringType')" />
                            <FormSelect
                                id="pe_recurring_type"
                                :options="recurringTypeOptions"
                                :canClear="false"
                                :searchable="false"
                                v-model="state.form.recurring_type"
                            />
                            <FormError :error="v$?.form?.recurring_type?.$errors[0]?.$message.toString()" />
                            <FormError :error="state.error?.errors?.recurring_type?.[0]" />
                        </div>

                        <div class="space-y-1">
                            <FormLabel for="pe_recurring_end_date" :label="$t('forms.predefinedEvents.form.recurringEndDate')" />
                            <FormDateField
                                id="pe_recurring_end_date"
                                name="pe_recurring_end_date"
                                placeholder="YYYY-MM-DD"
                                v-model="state.form.recurring_end_date"
                            />
                            <p class="text-xs text-gray-500">{{ $t('forms.predefinedEvents.form.recurringEndDateHint') }}</p>
                            <FormError :error="state.error?.errors?.recurring_end_date?.[0]" />
                        </div>
                    </template>

                    <div class="flex items-center gap-x-3">
                        <FormSwitch
                            :value="state.form.is_active"
                            @toggleSwitch="state.form.is_active = !state.form.is_active"
                        />
                        <label
                            class="text-sm font-medium text-gray-700 cursor-pointer"
                            @click="state.form.is_active = !state.form.is_active"
                        >
                            {{ $t('forms.predefinedEvents.form.isActive') }}
                        </label>
                    </div>

                    <div class="flex items-center gap-x-3">
                        <FormSwitch
                            :value="state.form.is_private"
                            @toggleSwitch="state.form.is_private = !state.form.is_private"
                        />
                        <label
                            class="text-sm font-medium text-gray-700 cursor-pointer"
                            @click="state.form.is_private = !state.form.is_private"
                        >
                            {{ $t('forms.predefinedEvents.form.isPrivate') }}
                        </label>
                    </div>

                    <div class="grid grid-cols-2 gap-3 pt-2">
                        <FormButton type="button" buttonStyle="cancel" @click="close">
                            {{ $t('cancel') }}
                        </FormButton>
                        <FormButton type="submit" buttonStyle="primary">
                            {{ props.formType === 'create' ? $t('save') : $t('update') }}
                        </FormButton>
                    </div>
                </form>
            </LoadingSpinner>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { formPredefinedEventService } from '@/components/api/user/FormPredefinedEventService'
import { useVuelidate } from '@vuelidate/core'
import { required, minValue, helpers } from '@vuelidate/validators'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true,
    },
    formType: {
        type: String,
        required: true,
    },
    formUuid: {
        type: String,
        required: true,
    },
    selectedEvent: {
        type: Object,
        required: false,
        default: null,
    },
})

const emit = defineEmits(['close', 'saved'])
const { successAlert } = useAlert()
const { t } = useI18n()

const defaultForm = () => ({
    title: '',
    description: '',
    calendar_type: '',
    duration_minutes: null as number | null,
    is_active: true,
    is_private: false,
    is_recurring: false,
    recurring_type: '',
    recurring_end_date: '',
})

const state = reactive({
    error: {} as Error,
    form: defaultForm(),
    isLoading: false,
})

const calendarTypeOptions = computed(() => [
    { value: 'citizens', label: t('forms.predefinedEvents.calendarTypes.citizens') },
    { value: 'employees', label: t('forms.predefinedEvents.calendarTypes.employees') },
])

const recurringTypeOptions = computed(() => [
    { value: 'everyday', label: t('forms.predefinedEvents.recurringTypes.everyday') },
    { value: 'every_week', label: t('forms.predefinedEvents.recurringTypes.every_week') },
    { value: 'every_second_week', label: t('forms.predefinedEvents.recurringTypes.every_second_week') },
    { value: 'every_third_week', label: t('forms.predefinedEvents.recurringTypes.every_third_week') },
    { value: 'every_fourth_week', label: t('forms.predefinedEvents.recurringTypes.every_fourth_week') },
    { value: 'every_month', label: t('forms.predefinedEvents.recurringTypes.every_month') },
])

const rules = computed(() => ({
    form: {
        title: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
        calendar_type: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
        duration_minutes: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            minValue: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, minValue(1)),
        },
        recurring_type: state.form.is_recurring
            ? { required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required) }
            : {},
    },
}))

const v$ = useVuelidate(rules, state)

watch(() => props.selectedEvent, (newValue: any) => {
    if (newValue) {
        state.form = {
            title: newValue.title ?? '',
            description: newValue.description ?? '',
            calendar_type: newValue.calendar_type ?? '',
            duration_minutes: newValue.duration_minutes ?? null,
            is_active: Boolean(newValue.is_active),
            is_private: Boolean(newValue.is_private),
            is_recurring: Boolean(newValue.is_recurring),
            recurring_type: newValue.recurring_type ?? '',
            recurring_end_date: newValue.recurring_end_date ?? '',
        }
    }
})

watch(() => props.isOpen, (isOpen) => {
    if (!isOpen) {
        state.error = {}
        v$.value.$reset()
    }
    if (isOpen && props.formType === 'create') {
        state.form = defaultForm()
    }
})

function close() {
    emit('close')
}

async function submit() {
    state.error = {}
    v$.value.$validate()
    if (v$.value.$error) return

    state.isLoading = true
    try {
        const params: any = {
            title: state.form.title,
            description: state.form.description || null,
            calendar_type: state.form.calendar_type,
            duration_minutes: Number(state.form.duration_minutes),
            is_active: state.form.is_active,
            is_private: state.form.is_private,
            is_recurring: state.form.is_recurring,
            recurring_type: state.form.is_recurring ? state.form.recurring_type : null,
            recurring_end_date: state.form.is_recurring && state.form.recurring_end_date
                ? state.form.recurring_end_date
                : null,
        }

        if (props.formType === 'create') {
            const response = await formPredefinedEventService.createPredefinedEvent(props.formUuid, params)
            if (response.data) {
                successAlert(`${t('alert.success')}!`, `${t('forms.predefinedEvents.alert.predefinedEventSuccessfullySaved')}.`)
                emit('saved')
                close()
            }
        } else {
            const response = await formPredefinedEventService.updatePredefinedEvent(
                props.formUuid,
                props.selectedEvent?.uuid,
                params,
            )
            if (response.data) {
                successAlert(`${t('alert.success')}!`, `${t('forms.predefinedEvents.alert.predefinedEventSuccessfullyUpdated')}.`)
                emit('saved')
                close()
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}
</script>
