<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-6">
            <div class="space-y-1">
                <FormLabel for="name" :label="$t('nursingProfessionalRecordTemplates.form.name')" />
                <FormTextField id="name" name="name"
                    :placeholder="$t('nursingProfessionalRecordTemplates.form.name')"
                    v-model="state.formTemplate.name" />
                <FormError :error="v$?.formTemplate?.name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.name?.[0]" />
            </div>

            <div>
                <p class="text-sm font-medium text-gray-700 mb-3">
                    {{ $t('nursingProfessionalRecordTemplates.form.fieldConfiguration') }}
                </p>
                <div class="overflow-hidden ring-1 ring-gray-200 rounded-lg">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">
                                    {{ $t('nursingProfessionalRecordTemplates.form.field') }}
                                </th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                                    {{ $t('nursingProfessionalRecordTemplates.form.required') }}
                                </th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                                    {{ $t('nursingProfessionalRecordTemplates.form.optional') }}
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-100">
                            <tr v-for="area in areaFields" :key="area.field"
                                :class="state.formTemplate[area.field] === 'required' ? 'bg-red-50/40' : ''">
                                <td class="px-4 py-3 text-sm text-gray-700">
                                    {{ area.label }}
                                </td>
                                <td class="px-4 py-3 text-center">
                                    <input type="radio" :name="area.field" value="required"
                                        v-model="state.formTemplate[area.field]"
                                        class="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500 cursor-pointer" />
                                </td>
                                <td class="px-4 py-3 text-center">
                                    <input type="radio" :name="area.field" value="optional"
                                        v-model="state.formTemplate[area.field]"
                                        class="h-4 w-4 text-primary border-gray-300 focus:ring-primary cursor-pointer" />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel"
                    @click="navigateTo('/settings/nursing-professional-record-templates')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="w-full">
                    {{ props.formType === 'create' ? $t('save') : $t('update') }}
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
    selectedTemplate: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['submitForm'])
const { t } = useI18n()

const areaFields = computed(() => [
    { field: 'functional_level', label: t('citizens.nursingAreas.form.functionalLevel') },
    { field: 'musculoskeletal_system', label: t('citizens.nursingAreas.form.musculoskeletalSystem') },
    { field: 'nutrition', label: t('citizens.nursingAreas.form.nutrition') },
    { field: 'skin_and_mucous_membranes', label: t('citizens.nursingAreas.form.skinAndMucousMembranes') },
    { field: 'communication', label: t('citizens.nursingAreas.form.communication') },
    { field: 'psychosocial_conditions', label: t('citizens.nursingAreas.form.psychosocialConditions') },
    { field: 'respiration_and_circulation', label: t('citizens.nursingAreas.form.respirationAndCirculation') },
    { field: 'sexuality', label: t('citizens.nursingAreas.form.sexuality') },
    { field: 'pain_and_sensory_impressions', label: t('citizens.nursingAreas.form.painAndSensoryImpressions') },
    { field: 'sleep_and_rest', label: t('citizens.nursingAreas.form.sleepAndRest') },
    { field: 'knowledge_and_development', label: t('citizens.nursingAreas.form.knowledgeAndDevelopment') },
    { field: 'excretion_of_waste', label: t('citizens.nursingAreas.form.excretionOfWaste') },
])

const state = reactive({
    formTemplate: {
        name: '',
        functional_level: 'optional' as string,
        musculoskeletal_system: 'optional' as string,
        nutrition: 'optional' as string,
        skin_and_mucous_membranes: 'optional' as string,
        communication: 'optional' as string,
        psychosocial_conditions: 'optional' as string,
        respiration_and_circulation: 'optional' as string,
        sexuality: 'optional' as string,
        pain_and_sensory_impressions: 'optional' as string,
        sleep_and_rest: 'optional' as string,
        knowledge_and_development: 'optional' as string,
        excretion_of_waste: 'optional' as string,
    } as Record<string, string>,
})

onMounted(() => {
    syncFromProps(props.selectedTemplate)
})

watch(() => props.selectedTemplate, (newValue: any) => {
    if (newValue != null) {
        syncFromProps(newValue)
    }
})

function syncFromProps(tpl: any) {
    state.formTemplate = {
        name: tpl.name ?? '',
        functional_level: tpl.functional_level ?? 'optional',
        musculoskeletal_system: tpl.musculoskeletal_system ?? 'optional',
        nutrition: tpl.nutrition ?? 'optional',
        skin_and_mucous_membranes: tpl.skin_and_mucous_membranes ?? 'optional',
        communication: tpl.communication ?? 'optional',
        psychosocial_conditions: tpl.psychosocial_conditions ?? 'optional',
        respiration_and_circulation: tpl.respiration_and_circulation ?? 'optional',
        sexuality: tpl.sexuality ?? 'optional',
        pain_and_sensory_impressions: tpl.pain_and_sensory_impressions ?? 'optional',
        sleep_and_rest: tpl.sleep_and_rest ?? 'optional',
        knowledge_and_development: tpl.knowledge_and_development ?? 'optional',
        excretion_of_waste: tpl.excretion_of_waste ?? 'optional',
    }
}

const rules = computed(() => ({
    formTemplate: {
        name: {
            required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
        },
    },
}))

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formTemplate)
    }
}
</script>
