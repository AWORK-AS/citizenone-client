<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-1">
            <FormLabel for="name" :label="$t('dutySchedules.draft.preset.form.name')" />
            <FormTextField id="name" name="name" :placeholder="$t('dutySchedules.draft.preset.form.name')"
                v-model="state.formDutySchedulePreset.name" />
            <FormError :error="v$?.formDutySchedulePreset?.name?.$errors[0]?.$message.toString()" />
            <FormError :error="props?.error?.errors?.name?.[0]" />
        </div>
        <div class="space-y-1">
            <FormLabel for="description" :label="$t('dutySchedules.draft.preset.form.description')" />
            <FormTextArea id="description" name="description"
                :placeholder="$t('dutySchedules.draft.preset.form.description')"
                v-model="state.formDutySchedulePreset.description" />
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" @click="closeForm()">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary">
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
    selectedPreset: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm', 'closeModal'])

const { t } = useI18n()

const state = reactive({
    currentStep: 1,
    error: {} as Error,
    formDutySchedulePreset: {
        name: '',
        description: '',
    },
})

watch(() => props.selectedPreset, (newValue: any) => {
    if (newValue != null) {
        state.formDutySchedulePreset = {
            name: newValue.name,
            description: newValue.description,
        }
    }
}, { immediate: true })

const rules = computed(() => {
    return {
        formDutySchedulePreset: {
            name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

onMounted(() => {

})

function closeForm() {
    emit('closeModal')
}

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formDutySchedulePreset)
    }
}
</script>
