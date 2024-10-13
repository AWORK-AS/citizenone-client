<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-5xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <div class="grid grid-cols-1 gap-y-3">
            <div class="space-y-1">
                <FormLabel for="date" :label="$t('citizens.nursingAreas.form.date')" />
                <FormDateField id="date" name="birthday" :placeholder="$t('citizens.nursingAreas.form.date')"
                    v-model="state.formNursingProfessionalRecord.date" />
                <FormError :error="v$?.formNursingProfessionalRecord?.date?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.date?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="functional_level" :label="$t('citizens.nursingAreas.form.functionalLevel')" />
                <FormTextArea id="functional_level" name="functional_level"
                    :placeholder="$t('citizens.nursingAreas.form.functionalLevel')"
                    v-model="state.formNursingProfessionalRecord.functional_level" />
                <FormError
                    :error="v$?.formNursingProfessionalRecord?.functional_level?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.functional_level?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="musculoskeletal_system"
                    :label="$t('citizens.nursingAreas.form.musculoskeletalSystem')" />
                <FormTextArea id="musculoskeletal_system" name="musculoskeletal_system"
                    :placeholder="$t('citizens.nursingAreas.form.musculoskeletalSystem')"
                    v-model="state.formNursingProfessionalRecord.musculoskeletal_system" />
                <FormError
                    :error="v$?.formNursingProfessionalRecord?.musculoskeletal_system?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.musculoskeletal_system?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="nutrition" :label="$t('citizens.nursingAreas.form.nutrition')" />
                <FormTextArea id="nutrition" name="nutrition" :placeholder="$t('citizens.nursingAreas.form.nutrition')"
                    v-model="state.formNursingProfessionalRecord.nutrition" />
                <FormError :error="v$?.formNursingProfessionalRecord?.nutrition?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.nutrition?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="skin_and_mucous_membranes"
                    :label="$t('citizens.nursingAreas.form.skinAndMucousMembranes')" />
                <FormTextArea id="skin_and_mucous_membranes" name="skin_and_mucous_membranes"
                    :placeholder="$t('citizens.nursingAreas.form.skinAndMucousMembranes')"
                    v-model="state.formNursingProfessionalRecord.skin_and_mucous_membranes" />
                <FormError
                    :error="v$?.formNursingProfessionalRecord?.skin_and_mucous_membranes?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.skin_and_mucous_membranes?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="communication" :label="$t('citizens.nursingAreas.form.communication')" />
                <FormTextArea id="communication" name="communication"
                    :placeholder="$t('citizens.nursingAreas.form.communication')"
                    v-model="state.formNursingProfessionalRecord.communication" />
                <FormError :error="v$?.formNursingProfessionalRecord?.communication?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.communication?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="psychosocial_conditions"
                    :label="$t('citizens.nursingAreas.form.psychosocialConditions')" />
                <FormTextArea id="psychosocial_conditions" name="psychosocial_conditions"
                    :placeholder="$t('citizens.nursingAreas.form.psychosocialConditions')"
                    v-model="state.formNursingProfessionalRecord.psychosocial_conditions" />
                <FormError
                    :error="v$?.formNursingProfessionalRecord?.psychosocial_conditions?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.psychosocial_conditions?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="respiration_and_circulation"
                    :label="$t('citizens.nursingAreas.form.respirationAndCirculation')" />
                <FormTextArea id="respiration_and_circulation" name="respiration_and_circulation"
                    :placeholder="$t('citizens.nursingAreas.form.respirationAndCirculation')"
                    v-model="state.formNursingProfessionalRecord.respiration_and_circulation" />
                <FormError
                    :error="v$?.formNursingProfessionalRecord?.respiration_and_circulation?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.respiration_and_circulation?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="sexuality" :label="$t('citizens.nursingAreas.form.sexuality')" />
                <FormTextArea id="sexuality" name="sexuality" :placeholder="$t('citizens.nursingAreas.form.sexuality')"
                    v-model="state.formNursingProfessionalRecord.sexuality" />
                <FormError :error="v$?.formNursingProfessionalRecord?.sexuality?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.sexuality?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="pain_and_sensory_impressions"
                    :label="$t('citizens.nursingAreas.form.painAndSensoryImpressions')" />
                <FormTextArea id="pain_and_sensory_impressions" name="pain_and_sensory_impressions"
                    :placeholder="$t('citizens.nursingAreas.form.painAndSensoryImpressions')"
                    v-model="state.formNursingProfessionalRecord.pain_and_sensory_impressions" />
                <FormError
                    :error="v$?.formNursingProfessionalRecord?.pain_and_sensory_impressions?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.pain_and_sensory_impressions?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="sleep_and_rest" :label="$t('citizens.nursingAreas.form.sleepAndRest')" />
                <FormTextArea id="sleep_and_rest" name="sleep_and_rest"
                    :placeholder="$t('citizens.nursingAreas.form.sleepAndRest')"
                    v-model="state.formNursingProfessionalRecord.sleep_and_rest" />
                <FormError
                    :error="v$?.formNursingProfessionalRecord?.sleep_and_rest?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.sleep_and_rest?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="knowledge_and_development"
                    :label="$t('citizens.nursingAreas.form.knowledgeAndDevelopment')" />
                <FormTextArea id="knowledge_and_development" name="knowledge_and_development"
                    :placeholder="$t('citizens.nursingAreas.form.knowledgeAndDevelopment')"
                    v-model="state.formNursingProfessionalRecord.knowledge_and_development" />
                <FormError
                    :error="v$?.formNursingProfessionalRecord?.knowledge_and_development?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.knowledge_and_development?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="excretion_of_waste" :label="$t('citizens.nursingAreas.form.excretionOfWaste')" />
                <FormTextArea id="excretion_of_waste" name="excretion_of_waste"
                    :placeholder="$t('citizens.nursingAreas.form.excretionOfWaste')"
                    v-model="state.formNursingProfessionalRecord.excretion_of_waste" />
                <FormError
                    :error="v$?.formNursingProfessionalRecord?.excretion_of_waste?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.excretion_of_waste?.[0]" />
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                    @click="navigateTo(`/citizens/${citizenUuid}/nursing-areas`)">
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
import type { Error } from '@/types'

const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as any
const { t } = useI18n()

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedRecord: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])

const state = reactive({
    error: {} as Error,
    formNursingProfessionalRecord: {
        date: '',
        functional_level: '',
        musculoskeletal_system: '',
        nutrition: '',
        skin_and_mucous_membranes: '',
        communication: '',
        psychosocial_conditions: '',
        respiration_and_circulation: '',
        sexuality: '',
        pain_and_sensory_impressions: '',
        sleep_and_rest: '',
        knowledge_and_development: '',
        excretion_of_waste: '',
    },
})

watch(() => props.selectedRecord, (newValue: any) => {
    if (newValue != null) {
        state.formNursingProfessionalRecord = {
            date: newValue.date,
            functional_level: newValue.functional_level,
            musculoskeletal_system: newValue.musculoskeletal_system,
            nutrition: newValue.nutrition,
            skin_and_mucous_membranes: newValue.skin_and_mucous_membranes,
            communication: newValue.communication,
            psychosocial_conditions: newValue.psychosocial_conditions,
            respiration_and_circulation: newValue.respiration_and_circulation,
            sexuality: newValue.sexuality,
            pain_and_sensory_impressions: newValue.pain_and_sensory_impressions,
            sleep_and_rest: newValue.sleep_and_rest,
            knowledge_and_development: newValue.knowledge_and_development,
            excretion_of_waste: newValue.excretion_of_waste,
        }
    }
})

const rules = computed(() => {
    return {
        formNursingProfessionalRecord: {
            date: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            functional_level: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            musculoskeletal_system: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            nutrition: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            skin_and_mucous_membranes: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            communication: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            psychosocial_conditions: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            respiration_and_circulation: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            sexuality: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            pain_and_sensory_impressions: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            sleep_and_rest: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            knowledge_and_development: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            excretion_of_waste: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formNursingProfessionalRecord)
    }
}
</script>