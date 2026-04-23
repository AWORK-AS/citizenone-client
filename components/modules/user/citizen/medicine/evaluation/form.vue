<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                <p class="text-xs opacity-75 mt-0.5">
                    {{
                        $t('citizens.medicineJournals.historyModal.scheduledAt')
                    }} {{
                        props.selectedMedicineEvaluation.time
                    }} · {{
                        props.selectedMedicineEvaluation.medicine_name
                    }}
                </p>
                <p class="text-xs text-blue-700">
                    {{ $t('citizens.medicineJournals.historyModal.describeReaction') }}.
                </p>
            </div>
            <div class="space-y-1">
                <FormLabel for="evaluation" :label="$t('citizens.medicineJournals.historyModal.observation')" />
                <FormTextArea id="evaluation" name="evaluation"
                    :placeholder="$t('citizens.medicineJournals.historyModal.evaluationPlaceholder')"
                    v-model="state.formEvaluation.evaluation" />
                <FormError :error="v$?.formEvaluation?.evaluation?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.evaluation?.[0]" />
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" @click="emit('closeModal')">
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
    selectedMedicineEvaluation: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['closeModal', 'isPageLoading', 'submitForm'])
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formEvaluation: {
        evaluation: '',
    },
})

watch(() => props.selectedMedicineEvaluation, (newValue: any) => {
    if (newValue != null) {
        state.formEvaluation = {
            evaluation: newValue.evaluation,
        }
    }
})

onMounted(() => {
    state.formEvaluation.evaluation = props.selectedMedicineEvaluation.evaluation
})

const rules = computed(() => {
    return {
        formEvaluation: {
            evaluation: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formEvaluation)
    }
}
</script>