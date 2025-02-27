<template>
    <form @submit.prevent="submitForm()" class="mt-6">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <div class="grid grid-cols-1 gap-y-6">
            <div class="space-y-1">
                <FormLabel for="date" :label="$t('citizens.nursingAreas.form.date')" />
                <FormDateField id="date" name="birthday" :placeholder="$t('citizens.nursingAreas.form.date')"
                    v-model="state.formNursingProfessionalRecord.date" />
                <FormError :error="v$?.formNursingProfessionalRecord?.date?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.date?.[0]" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-5 gap-5">
                <div class="space-y-1 md:col-span-3">
                    <FormLabel for="functional_level" :label="$t('citizens.nursingAreas.form.functionalLevel')" />
                    <FormTextArea :rows="11" id="functional_level" name="functional_level"
                        :placeholder="$t('citizens.nursingAreas.form.functionalLevel')"
                        v-model="state.formNursingProfessionalRecord.functional_level" />
                    <FormError
                        :error="v$?.formNursingProfessionalRecord?.functional_level?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.functional_level?.[0]" />
                </div>
                <div class="space-y-1 md:col-span-2">
                    <div class="flex-row md:flex items-center">
                        <p class="text-sm text-gray-600">
                            {{ $t('citizens.nursingAreas.form.healthProfessionalDocumentation') }}
                        </p>
                        <div class="flex-1 flex justify-end">
                            <input ref="functionalLevelFileInput" type="file" @change="handleFunctionalLevelFileChange"
                                class="hidden" />
                            <div class="w-fit flex gap-2 item-center text-end text-sm cursor-pointer text-primary hover:text-primary-700"
                                @click="triggerFunctionalLevelFileInput">
                                <div>
                                    <Icon name="ph:upload" class="h-4 w-4" aria-hidden="true" />
                                </div>
                                {{ $t('citizens.citizenJournals.form.attachFile') }}
                            </div>
                        </div>
                    </div>
                    <ckeditor :editor="editor" v-model="state.formNursingProfessionalRecord.functional_level_note"
                        :config="editorFunctionalLevelConfig">
                    </ckeditor>
                    <FormError
                        :error="v$?.formNursingProfessionalRecord?.functional_level_note?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.functional_level_note?.[0]" />
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-5 gap-5">
                <div class="space-y-1 md:col-span-3">
                    <FormLabel for="musculoskeletal_system"
                        :label="$t('citizens.nursingAreas.form.musculoskeletalSystem')" />
                    <FormTextArea :rows="11" id="musculoskeletal_system" name="musculoskeletal_system"
                        :placeholder="$t('citizens.nursingAreas.form.musculoskeletalSystem')"
                        v-model="state.formNursingProfessionalRecord.musculoskeletal_system" />
                    <FormError
                        :error="v$?.formNursingProfessionalRecord?.musculoskeletal_system?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.musculoskeletal_system?.[0]" />
                </div>
                <div class="space-y-1 md:col-span-2">
                    <div class="flex-row md:flex items-center">
                        <p class="text-sm text-gray-600">
                            {{ $t('citizens.nursingAreas.form.healthProfessionalDocumentation') }}
                        </p>
                        <div class="flex-1 flex justify-end">
                            <input ref="musculoskeletalSystemFileInput" type="file"
                                @change="handleMusculoskeletalSystemFileChange" class="hidden" />
                            <div class="w-fit flex gap-2 item-center text-end text-sm cursor-pointer text-primary hover:text-primary-700"
                                @click="triggerMusculoskeletalSystemFileInput">
                                <div>
                                    <Icon name="ph:upload" class="h-4 w-4" aria-hidden="true" />
                                </div>
                                {{ $t('citizens.citizenJournals.form.attachFile') }}
                            </div>
                        </div>
                    </div>
                    <ckeditor :editor="editor" v-model="state.formNursingProfessionalRecord.musculoskeletal_system_note"
                        :config="editorMusculoskeletalSystemConfig">
                    </ckeditor>
                    <FormError
                        :error="v$?.formNursingProfessionalRecord?.musculoskeletal_system_note?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.musculoskeletal_system_note?.[0]" />
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-5 gap-5">
                <div class="space-y-1 md:col-span-3">
                    <FormLabel for="nutrition" :label="$t('citizens.nursingAreas.form.nutrition')" />
                    <FormTextArea :rows="11" id="nutrition" name="nutrition"
                        :placeholder="$t('citizens.nursingAreas.form.nutrition')"
                        v-model="state.formNursingProfessionalRecord.nutrition" />
                    <FormError :error="v$?.formNursingProfessionalRecord?.nutrition?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.nutrition?.[0]" />
                </div>
                <div class="space-y-1 md:col-span-2">
                    <div class="flex-row md:flex items-center">
                        <p class="text-sm text-gray-600">
                            {{ $t('citizens.nursingAreas.form.healthProfessionalDocumentation') }}
                        </p>
                        <div class="flex-1 flex justify-end">
                            <input ref="nutritionFileInput" type="file" @change="handleNutritionFileChange"
                                class="hidden" />
                            <div class="w-fit flex gap-2 item-center text-end text-sm cursor-pointer text-primary hover:text-primary-700"
                                @click="triggerNutritionFileInput">
                                <div>
                                    <Icon name="ph:upload" class="h-4 w-4" aria-hidden="true" />
                                </div>
                                {{ $t('citizens.citizenJournals.form.attachFile') }}
                            </div>
                        </div>
                    </div>
                    <ckeditor :editor="editor" v-model="state.formNursingProfessionalRecord.nutrition_note"
                        :config="editorNutritionConfig">
                    </ckeditor>
                    <FormError
                        :error="v$?.formNursingProfessionalRecord?.nutrition_note?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.nutrition_note?.[0]" />
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-5 gap-5">
                <div class="space-y-1 md:col-span-3">
                    <FormLabel for="skin_and_mucous_membranes"
                        :label="$t('citizens.nursingAreas.form.skinAndMucousMembranes')" />
                    <FormTextArea :rows="11" id="skin_and_mucous_membranes" name="skin_and_mucous_membranes"
                        :placeholder="$t('citizens.nursingAreas.form.skinAndMucousMembranes')"
                        v-model="state.formNursingProfessionalRecord.skin_and_mucous_membranes" />
                    <FormError
                        :error="v$?.formNursingProfessionalRecord?.skin_and_mucous_membranes?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.skin_and_mucous_membranes?.[0]" />
                </div>
                <div class="space-y-1 md:col-span-2">
                    <div class="flex-row md:flex items-center">
                        <p class="text-sm text-gray-600">
                            {{ $t('citizens.nursingAreas.form.healthProfessionalDocumentation') }}
                        </p>
                        <div class="flex-1 flex justify-end">
                            <input ref="skinAndMucousMembranesFileInput" type="file"
                                @change="handleSkinAndMucousMembranesFileChange" class="hidden" />
                            <div class="w-fit flex gap-2 item-center text-end text-sm cursor-pointer text-primary hover:text-primary-700"
                                @click="triggerSkinAndMucousMembranesFileInput">
                                <div>
                                    <Icon name="ph:upload" class="h-4 w-4" aria-hidden="true" />
                                </div>
                                {{ $t('citizens.citizenJournals.form.attachFile') }}
                            </div>
                        </div>
                    </div>
                    <ckeditor :editor="editor"
                        v-model="state.formNursingProfessionalRecord.skin_and_mucous_membranes_note"
                        :config="editorSkinAndMucousMembranesConfig">
                    </ckeditor>
                    <FormError
                        :error="v$?.formNursingProfessionalRecord?.skin_and_mucous_membranes_note?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.skin_and_mucous_membranes_note?.[0]" />
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-5 gap-5">
                <div class="space-y-1 md:col-span-3">
                    <FormLabel for="communication" :label="$t('citizens.nursingAreas.form.communication')" />
                    <FormTextArea :rows="11" id="communication" name="communication"
                        :placeholder="$t('citizens.nursingAreas.form.communication')"
                        v-model="state.formNursingProfessionalRecord.communication" />
                    <FormError
                        :error="v$?.formNursingProfessionalRecord?.communication?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.communication?.[0]" />
                </div>
                <div class="space-y-1 md:col-span-2">
                    <div class="flex-row md:flex items-center">
                        <p class="text-sm text-gray-600">
                            {{ $t('citizens.nursingAreas.form.healthProfessionalDocumentation') }}
                        </p>
                        <div class="flex-1 flex justify-end">
                            <input ref="communicationFileInput" type="file" @change="handleCommunicationFileChange"
                                class="hidden" />
                            <div class="w-fit flex gap-2 item-center text-end text-sm cursor-pointer text-primary hover:text-primary-700"
                                @click="triggerCommunicationFileInput">
                                <div>
                                    <Icon name="ph:upload" class="h-4 w-4" aria-hidden="true" />
                                </div>
                                {{ $t('citizens.citizenJournals.form.attachFile') }}
                            </div>
                        </div>
                    </div>
                    <ckeditor :editor="editor" v-model="state.formNursingProfessionalRecord.communication_note"
                        :config="editorCommunicationConfig">
                    </ckeditor>
                    <FormError
                        :error="v$?.formNursingProfessionalRecord?.communication_note?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.communication_note?.[0]" />
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-5 gap-5">
                <div class="space-y-1 md:col-span-3">
                    <FormLabel for="psychosocial_conditions"
                        :label="$t('citizens.nursingAreas.form.psychosocialConditions')" />
                    <FormTextArea :rows="11" id="psychosocial_conditions" name="psychosocial_conditions"
                        :placeholder="$t('citizens.nursingAreas.form.psychosocialConditions')"
                        v-model="state.formNursingProfessionalRecord.psychosocial_conditions" />
                    <FormError
                        :error="v$?.formNursingProfessionalRecord?.psychosocial_conditions?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.psychosocial_conditions?.[0]" />
                </div>
                <div class="space-y-1 md:col-span-2">
                    <div class="flex-row md:flex items-center">
                        <p class="text-sm text-gray-600">
                            {{ $t('citizens.nursingAreas.form.healthProfessionalDocumentation') }}
                        </p>
                        <div class="flex-1 flex justify-end">
                            <input ref="psychosocialConditionsFileInput" type="file"
                                @change="handlePsychosocialConditionsFileChange" class="hidden" />
                            <div class="w-fit flex gap-2 item-center text-end text-sm cursor-pointer text-primary hover:text-primary-700"
                                @click="triggerPsychosocialConditionsFileInput">
                                <div>
                                    <Icon name="ph:upload" class="h-4 w-4" aria-hidden="true" />
                                </div>
                                {{ $t('citizens.citizenJournals.form.attachFile') }}
                            </div>
                        </div>
                    </div>
                    <ckeditor :editor="editor"
                        v-model="state.formNursingProfessionalRecord.psychosocial_conditions_note"
                        :config="editorPsychosocialConditionsConfig">
                    </ckeditor>
                    <FormError
                        :error="v$?.formNursingProfessionalRecord?.psychosocial_conditions_note?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.psychosocial_conditions_note?.[0]" />
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-5 gap-5">
                <div class="space-y-1 md:col-span-3">
                    <FormLabel for="respiration_and_circulation"
                        :label="$t('citizens.nursingAreas.form.respirationAndCirculation')" />
                    <FormTextArea :rows="11" id="respiration_and_circulation" name="respiration_and_circulation"
                        :placeholder="$t('citizens.nursingAreas.form.respirationAndCirculation')"
                        v-model="state.formNursingProfessionalRecord.respiration_and_circulation" />
                    <FormError
                        :error="v$?.formNursingProfessionalRecord?.respiration_and_circulation?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.respiration_and_circulation?.[0]" />
                </div>
                <div class="space-y-1 md:col-span-2">
                    <div class="flex-row md:flex items-center">
                        <p class="text-sm text-gray-600">
                            {{ $t('citizens.nursingAreas.form.healthProfessionalDocumentation') }}
                        </p>
                        <div class="flex-1 flex justify-end">
                            <input ref="respirationAndCirculationFileInput" type="file"
                                @change="handleRespirationAndCirculationFileChange" class="hidden" />
                            <div class="w-fit flex gap-2 item-center text-end text-sm cursor-pointer text-primary hover:text-primary-700"
                                @click="triggerRespirationAndCirculationFileInput">
                                <div>
                                    <Icon name="ph:upload" class="h-4 w-4" aria-hidden="true" />
                                </div>
                                {{ $t('citizens.citizenJournals.form.attachFile') }}
                            </div>
                        </div>
                    </div>
                    <ckeditor :editor="editor"
                        v-model="state.formNursingProfessionalRecord.respiration_and_circulation_note"
                        :config="editorRespirationAndCirculationConfig">
                    </ckeditor>
                    <FormError
                        :error="v$?.formNursingProfessionalRecord?.respiration_and_circulation_note?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.respiration_and_circulation_note?.[0]" />
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-5 gap-5">
                <div class="space-y-1 md:col-span-3">
                    <FormLabel for="sexuality" :label="$t('citizens.nursingAreas.form.sexuality')" />
                    <FormTextArea :rows="11" id="sexuality" name="sexuality"
                        :placeholder="$t('citizens.nursingAreas.form.sexuality')"
                        v-model="state.formNursingProfessionalRecord.sexuality" />
                    <FormError :error="v$?.formNursingProfessionalRecord?.sexuality?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.sexuality?.[0]" />
                </div>
                <div class="space-y-1 md:col-span-2">
                    <div class="flex-row md:flex items-center">
                        <p class="text-sm text-gray-600">
                            {{ $t('citizens.nursingAreas.form.healthProfessionalDocumentation') }}
                        </p>
                        <div class="flex-1 flex justify-end">
                            <input ref="sexualityFileInput" type="file" @change="handleSexualityFileChange"
                                class="hidden" />
                            <div class="w-fit flex gap-2 item-center text-end text-sm cursor-pointer text-primary hover:text-primary-700"
                                @click="triggerSexualityFileInput">
                                <div>
                                    <Icon name="ph:upload" class="h-4 w-4" aria-hidden="true" />
                                </div>
                                {{ $t('citizens.citizenJournals.form.attachFile') }}
                            </div>
                        </div>
                    </div>
                    <ckeditor :editor="editor" v-model="state.formNursingProfessionalRecord.sexuality_note"
                        :config="editorSexualityConfig">
                    </ckeditor>
                    <FormError
                        :error="v$?.formNursingProfessionalRecord?.sexuality_note?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.sexuality_note?.[0]" />
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-5 gap-5">
                <div class="space-y-1 md:col-span-3">
                    <FormLabel for="pain_and_sensory_impressions"
                        :label="$t('citizens.nursingAreas.form.painAndSensoryImpressions')" />
                    <FormTextArea :rows="11" id="pain_and_sensory_impressions" name="pain_and_sensory_impressions"
                        :placeholder="$t('citizens.nursingAreas.form.painAndSensoryImpressions')"
                        v-model="state.formNursingProfessionalRecord.pain_and_sensory_impressions" />
                    <FormError
                        :error="v$?.formNursingProfessionalRecord?.pain_and_sensory_impressions?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.pain_and_sensory_impressions?.[0]" />
                </div>
                <div class="space-y-1 md:col-span-2">
                    <div class="flex-row md:flex items-center">
                        <p class="text-sm text-gray-600">
                            {{ $t('citizens.nursingAreas.form.healthProfessionalDocumentation') }}
                        </p>
                        <div class="flex-1 flex justify-end">
                            <input ref="painAndSensoryImpressionsFileInput" type="file"
                                @change="handlePainAndSensoryImpressionsFileChange" class="hidden" />
                            <div class="w-fit flex gap-2 item-center text-end text-sm cursor-pointer text-primary hover:text-primary-700"
                                @click="triggerPainAndSensoryImpressionsFileInput">
                                <div>
                                    <Icon name="ph:upload" class="h-4 w-4" aria-hidden="true" />
                                </div>
                                {{ $t('citizens.citizenJournals.form.attachFile') }}
                            </div>
                        </div>
                    </div>
                    <ckeditor :editor="editor"
                        v-model="state.formNursingProfessionalRecord.pain_and_sensory_impressions_note"
                        :config="editorPainAndSensoryImpressionsConfig">
                    </ckeditor>
                    <FormError
                        :error="v$?.formNursingProfessionalRecord?.pain_and_sensory_impressions_note?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.pain_and_sensory_impressions_note?.[0]" />
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-5 gap-5">
                <div class="space-y-1 md:col-span-3">
                    <FormLabel for="sleep_and_rest" :label="$t('citizens.nursingAreas.form.sleepAndRest')" />
                    <FormTextArea :rows="11" id="sleep_and_rest" name="sleep_and_rest"
                        :placeholder="$t('citizens.nursingAreas.form.sleepAndRest')"
                        v-model="state.formNursingProfessionalRecord.sleep_and_rest" />
                    <FormError
                        :error="v$?.formNursingProfessionalRecord?.sleep_and_rest?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.sleep_and_rest?.[0]" />
                </div>
                <div class="space-y-1 md:col-span-2">
                    <div class="flex-row md:flex items-center">
                        <p class="text-sm text-gray-600">
                            {{ $t('citizens.nursingAreas.form.healthProfessionalDocumentation') }}
                        </p>
                        <div class="flex-1 flex justify-end">
                            <input ref="sleepAndRestFileInput" type="file" @change="handleSleepAndRestFileChange"
                                class="hidden" />
                            <div class="w-fit flex gap-2 item-center text-end text-sm cursor-pointer text-primary hover:text-primary-700"
                                @click="triggerSleepAndRestFileInput">
                                <div>
                                    <Icon name="ph:upload" class="h-4 w-4" aria-hidden="true" />
                                </div>
                                {{ $t('citizens.citizenJournals.form.attachFile') }}
                            </div>
                        </div>
                    </div>
                    <ckeditor :editor="editor" v-model="state.formNursingProfessionalRecord.sleep_and_rest_note"
                        :config="editorSleepAndRestConfig">
                    </ckeditor>
                    <FormError
                        :error="v$?.formNursingProfessionalRecord?.sleep_and_rest_note?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.sleep_and_rest_note?.[0]" />
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-5 gap-5">
                <div class="space-y-1 md:col-span-3">
                    <FormLabel for="knowledge_and_development"
                        :label="$t('citizens.nursingAreas.form.knowledgeAndDevelopment')" />
                    <FormTextArea :rows="11" id="knowledge_and_development" name="knowledge_and_development"
                        :placeholder="$t('citizens.nursingAreas.form.knowledgeAndDevelopment')"
                        v-model="state.formNursingProfessionalRecord.knowledge_and_development" />
                    <FormError
                        :error="v$?.formNursingProfessionalRecord?.knowledge_and_development?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.knowledge_and_development?.[0]" />
                </div>
                <div class="space-y-1 md:col-span-2">
                    <div class="flex-row md:flex items-center">
                        <p class="text-sm text-gray-600">
                            {{ $t('citizens.nursingAreas.form.healthProfessionalDocumentation') }}
                        </p>
                        <div class="flex-1 flex justify-end">
                            <input ref="knowledgeAndDevelopmentFileInput" type="file"
                                @change="handleKnowledgeAndDevelopmentFileChange" class="hidden" />
                            <div class="w-fit flex gap-2 item-center text-end text-sm cursor-pointer text-primary hover:text-primary-700"
                                @click="triggerKnowledgeAndDevelopmentFileInput">
                                <div>
                                    <Icon name="ph:upload" class="h-4 w-4" aria-hidden="true" />
                                </div>
                                {{ $t('citizens.citizenJournals.form.attachFile') }}
                            </div>
                        </div>
                    </div>
                    <ckeditor :editor="editor"
                        v-model="state.formNursingProfessionalRecord.knowledge_and_development_note"
                        :config="editorKnowledgeAndDevelopmentConfig">
                    </ckeditor>
                    <FormError
                        :error="v$?.formNursingProfessionalRecord?.knowledge_and_development_note?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.knowledge_and_development_note?.[0]" />
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-5 gap-5">
                <div class="space-y-1 md:col-span-3">
                    <FormLabel for="excretion_of_waste" :label="$t('citizens.nursingAreas.form.excretionOfWaste')" />
                    <FormTextArea :rows="11" id="excretion_of_waste" name="excretion_of_waste"
                        :placeholder="$t('citizens.nursingAreas.form.excretionOfWaste')"
                        v-model="state.formNursingProfessionalRecord.excretion_of_waste" />
                    <FormError
                        :error="v$?.formNursingProfessionalRecord?.excretion_of_waste?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.excretion_of_waste?.[0]" />
                </div>
                <div class="space-y-1 md:col-span-2">
                    <div class="flex-row md:flex items-center">
                        <p class="text-sm text-gray-600">
                            {{ $t('citizens.nursingAreas.form.healthProfessionalDocumentation') }}
                        </p>
                        <div class="flex-1 flex justify-end">
                            <input ref="excretionOfWasteFileInput" type="file"
                                @change="handleExcretionOfWasteFileChange" class="hidden" />
                            <div class="w-fit flex gap-2 item-center text-end text-sm cursor-pointer text-primary hover:text-primary-700"
                                @click="triggerExcretionOfWasteFileInput">
                                <div>
                                    <Icon name="ph:upload" class="h-4 w-4" aria-hidden="true" />
                                </div>
                                {{ $t('citizens.citizenJournals.form.attachFile') }}
                            </div>
                        </div>
                    </div>
                    <ckeditor :editor="editor" v-model="state.formNursingProfessionalRecord.excretion_of_waste_note"
                        :config="editorExcretionOfWasteConfig">
                    </ckeditor>
                    <FormError
                        :error="v$?.formNursingProfessionalRecord?.excretion_of_waste_note?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.excretion_of_waste_note?.[0]" />
                </div>
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
        <DialogConfirmation :isModalOpen="state.modal.isUpgradeStorageOpen"
            :title="$t('citizens.documents.upgradeStorage')"
            :message="state.error?.message + ' ' + $t('citizens.documents.confirmation.upgradeStorageConfirmation') + '?'"
            @close="closeUpgradeStorageModal" @confirm="navigateTo(`/storage/upgrade`)" />
    </form>
</template>

<script setup lang="ts">
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { nursingAreasService } from '@/components/api/user/NursingAreasService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as any
const functionalLevelFileInput = ref(null) as any
const musculoskeletalSystemFileInput = ref(null) as any
const nutritionFileInput = ref(null) as any
const skinAndMucousMembranesFileInput = ref(null) as any
const communicationFileInput = ref(null) as any
const psychosocialConditionsFileInput = ref(null) as any
const respirationAndCirculationFileInput = ref(null) as any
const sexualityFileInput = ref(null) as any
const painAndSensoryImpressionsFileInput = ref(null) as any
const sleepAndRestFileInput = ref(null) as any
const knowledgeAndAevelopmentFileInput = ref(null) as any
const excretionOfWasteLevelFileInput = ref(null) as any
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
const editorToolbar = ['undo', 'redo', 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'imageUpload']
const editorHeading = {
    options: [
        { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
        { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
        { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
        { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
    ]
}

const editor = ref(ClassicEditor)
const editorFunctionalLevelConfig = ref({
    // Add your custom configuration here
    toolbar: editorToolbar,
    heading: editorHeading,
    extraPlugins: [FunctionalLevelUploadAdapterPlugin],
    height: 500  // Set the editor height here
})
const editorMusculoskeletalSystemConfig = ref({
    // Add your custom configuration here
    toolbar: editorToolbar,
    heading: editorHeading,
    extraPlugins: [MusculoskeletalSystemUploadAdapterPlugin],
    height: 500  // Set the editor height here
})
const editorNutritionConfig = ref({
    // Add your custom configuration here
    toolbar: editorToolbar,
    heading: editorHeading,
    extraPlugins: [NutritionUploadAdapterPlugin],
    height: 500  // Set the editor height here
})
const editorSkinAndMucousMembranesConfig = ref({
    // Add your custom configuration here
    toolbar: editorToolbar,
    heading: editorHeading,
    extraPlugins: [SkinAndMucousMembranesUploadAdapterPlugin],
    height: 500  // Set the editor height here
})
const editorCommunicationConfig = ref({
    // Add your custom configuration here
    toolbar: editorToolbar,
    heading: editorHeading,
    extraPlugins: [CommunicationUploadAdapterPlugin],
    height: 500  // Set the editor height here
})
const editorPsychosocialConditionsConfig = ref({
    // Add your custom configuration here
    toolbar: editorToolbar,
    heading: editorHeading,
    extraPlugins: [PsychosocialConditionsUploadAdapterPlugin],
    height: 500  // Set the editor height here
})
const editorRespirationAndCirculationConfig = ref({
    // Add your custom configuration here
    toolbar: editorToolbar,
    heading: editorHeading,
    extraPlugins: [RespirationAndCirculationUploadAdapterPlugin],
    height: 500  // Set the editor height here
})
const editorSexualityConfig = ref({
    // Add your custom configuration here
    toolbar: editorToolbar,
    heading: editorHeading,
    extraPlugins: [SexualityUploadAdapterPlugin],
    height: 500  // Set the editor height here
})
const editorPainAndSensoryImpressionsConfig = ref({
    // Add your custom configuration here
    toolbar: editorToolbar,
    heading: editorHeading,
    extraPlugins: [PainAndSensoryImpressionsUploadAdapterPlugin],
    height: 500  // Set the editor height here
})
const editorSleepAndRestConfig = ref({
    // Add your custom configuration here
    toolbar: editorToolbar,
    heading: editorHeading,
    extraPlugins: [SleepAndRestUploadAdapterPlugin],
    height: 500  // Set the editor height here
})
const editorKnowledgeAndDevelopmentConfig = ref({
    // Add your custom configuration here
    toolbar: editorToolbar,
    heading: editorHeading,
    extraPlugins: [KnowledgeAndDevelopmentUploadAdapterPlugin],
    height: 500  // Set the editor height here
})
const editorExcretionOfWasteConfig = ref({
    // Add your custom configuration here
    toolbar: editorToolbar,
    heading: editorHeading,
    extraPlugins: [ExcretionOfWasteUploadAdapterPlugin],
    height: 500  // Set the editor height here
})

const state = reactive({
    error: {} as Error,
    formNursingProfessionalRecord: {
        date: '',
        functional_level: '',
        functional_level_note: '',
        musculoskeletal_system: '',
        musculoskeletal_system_note: '',
        nutrition: '',
        nutrition_note: '',
        skin_and_mucous_membranes: '',
        skin_and_mucous_membranes_note: '',
        communication: '',
        communication_note: '',
        psychosocial_conditions: '',
        psychosocial_conditions_note: '',
        respiration_and_circulation: '',
        respiration_and_circulation_note: '',
        sexuality: '',
        sexuality_note: '',
        pain_and_sensory_impressions: '',
        pain_and_sensory_impressions_note: '',
        sleep_and_rest: '',
        sleep_and_rest_note: '',
        knowledge_and_development: '',
        knowledge_and_development_note: '',
        excretion_of_waste: '',
        excretion_of_waste_note: '',
    },
    modal: {
        isUpgradeStorageOpen: false
    },
})

watch(() => props.selectedRecord, (newValue: any) => {
    if (newValue != null) {
        state.formNursingProfessionalRecord = {
            date: newValue.date,
            functional_level: newValue.functional_level,
            functional_level_note: newValue.functional_level_note,
            musculoskeletal_system: newValue.musculoskeletal_system,
            musculoskeletal_system_note: newValue.musculoskeletal_system_note,
            nutrition: newValue.nutrition,
            nutrition_note: newValue.nutrition_note,
            skin_and_mucous_membranes: newValue.skin_and_mucous_membranes,
            skin_and_mucous_membranes_note: newValue.skin_and_mucous_membranes_note,
            communication: newValue.communication,
            communication_note: newValue.communication_note,
            psychosocial_conditions: newValue.psychosocial_conditions,
            psychosocial_conditions_note: newValue.psychosocial_conditions_note,
            respiration_and_circulation: newValue.respiration_and_circulation,
            respiration_and_circulation_note: newValue.respiration_and_circulation_note,
            sexuality: newValue.sexuality,
            sexuality_note: newValue.sexuality_note,
            pain_and_sensory_impressions: newValue.pain_and_sensory_impressions,
            pain_and_sensory_impressions_note: newValue.pain_and_sensory_impressions_note,
            sleep_and_rest: newValue.sleep_and_rest,
            sleep_and_rest_note: newValue.sleep_and_rest_note,
            knowledge_and_development: newValue.knowledge_and_development,
            knowledge_and_development_note: newValue.knowledge_and_development_note,
            excretion_of_waste: newValue.excretion_of_waste,
            excretion_of_waste_note: newValue.excretion_of_waste_note,
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

function closeUpgradeStorageModal() {
    state.modal.isUpgradeStorageOpen = false
    state.error = {}
}

const resetFileInput = () => {
    if (functionalLevelFileInput.value) {
        functionalLevelFileInput.value.value = null
    }
    if (musculoskeletalSystemFileInput.value) {
        musculoskeletalSystemFileInput.value.value = null
    }
    if (nutritionFileInput.value) {
        nutritionFileInput.value.value = null
    }
    if (skinAndMucousMembranesFileInput.value) {
        skinAndMucousMembranesFileInput.value.value = null
    }
    if (communicationFileInput.value) {
        communicationFileInput.value.value = null
    }
    if (psychosocialConditionsFileInput.value) {
        psychosocialConditionsFileInput.value.value = null
    }
    if (respirationAndCirculationFileInput.value) {
        respirationAndCirculationFileInput.value.value = null
    }
    if (sexualityFileInput.value) {
        sexualityFileInput.value.value = null
    }
    if (painAndSensoryImpressionsFileInput.value) {
        painAndSensoryImpressionsFileInput.value.value = null
    }
    if (sleepAndRestFileInput.value) {
        sleepAndRestFileInput.value.value = null
    }
    if (knowledgeAndAevelopmentFileInput.value) {
        knowledgeAndAevelopmentFileInput.value.value = null
    }
    if (excretionOfWasteLevelFileInput.value) {
        excretionOfWasteLevelFileInput.value.value = null
    }
}

const triggerFunctionalLevelFileInput = () => {
    functionalLevelFileInput.value?.click()
}

const triggerMusculoskeletalSystemFileInput = () => {
    musculoskeletalSystemFileInput.value?.click()
}

const triggerNutritionFileInput = () => {
    nutritionFileInput.value?.click()
}

const triggerSkinAndMucousMembranesFileInput = () => {
    skinAndMucousMembranesFileInput.value?.click()
}

const triggerCommunicationFileInput = () => {
    communicationFileInput.value?.click()
}

const triggerPsychosocialConditionsFileInput = () => {
    psychosocialConditionsFileInput.value?.click()
}

const triggerRespirationAndCirculationFileInput = () => {
    respirationAndCirculationFileInput.value?.click()
}

const triggerSexualityFileInput = () => {
    sexualityFileInput.value?.click()
}

const triggerPainAndSensoryImpressionsFileInput = () => {
    painAndSensoryImpressionsFileInput.value?.click()
}

const triggerSleepAndRestFileInput = () => {
    sleepAndRestFileInput.value?.click()
}

const triggerKnowledgeAndDevelopmentFileInput = () => {
    knowledgeAndAevelopmentFileInput.value?.click()
}

const triggerExcretionOfWasteFileInput = () => {
    excretionOfWasteLevelFileInput.value?.click()
}

const handleFunctionalLevelFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement; // Typecasting to HTMLInputElement
    if (input.files && input.files[0]) {
        const file = input.files[0]
        uploadFunctionalLevelAttachment(file)
    }
}

const handleMusculoskeletalSystemFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement; // Typecasting to HTMLInputElement
    if (input.files && input.files[0]) {
        const file = input.files[0]
        uploadMusculoskeletalSystemAttachment(file)
    }
}

const handleNutritionFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement; // Typecasting to HTMLInputElement
    if (input.files && input.files[0]) {
        const file = input.files[0]
        uploadNutritionAttachment(file)
    }
}

const handleSkinAndMucousMembranesFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement; // Typecasting to HTMLInputElement
    if (input.files && input.files[0]) {
        const file = input.files[0]
        uploadSkinAndMucousMembranesAttachment(file)
    }
}

const handleCommunicationFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement; // Typecasting to HTMLInputElement
    if (input.files && input.files[0]) {
        const file = input.files[0]
        uploadCommunicationAttachment(file)
    }
}

const handlePsychosocialConditionsFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement; // Typecasting to HTMLInputElement
    if (input.files && input.files[0]) {
        const file = input.files[0]
        uploadPsychosocialConditionsAttachment(file)
    }
}

const handleRespirationAndCirculationFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement; // Typecasting to HTMLInputElement
    if (input.files && input.files[0]) {
        const file = input.files[0]
        uploadRespirationAndCirculationAttachment(file)
    }
}

const handleSexualityFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement; // Typecasting to HTMLInputElement
    if (input.files && input.files[0]) {
        const file = input.files[0]
        uploadSexualityAttachment(file)
    }
}

const handlePainAndSensoryImpressionsFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement; // Typecasting to HTMLInputElement
    if (input.files && input.files[0]) {
        const file = input.files[0]
        uploadPainAndSensoryImpressionsAttachment(file)
    }
}

const handleSleepAndRestFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement; // Typecasting to HTMLInputElement
    if (input.files && input.files[0]) {
        const file = input.files[0]
        uploadSleepAndRestAttachment(file)
    }
}

const handleKnowledgeAndDevelopmentFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement; // Typecasting to HTMLInputElement
    if (input.files && input.files[0]) {
        const file = input.files[0]
        uploadKnowledgeAndDevelopmentAttachment(file)
    }
}

const handleExcretionOfWasteFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement; // Typecasting to HTMLInputElement
    if (input.files && input.files[0]) {
        const file = input.files[0]
        uploadExcretionOfWasteAttachment(file)
    }
}

const uploadFunctionalLevelAttachment = async (file: any) => {
    emit('isPageLoading', true)
    try {
        const params = new FormData()
        params.append('file', file)
        params.append('citizen_uuid', String(citizenUuid))
        const response = await nursingAreasService.uploadNursingFile(params)
        if (response) {
            state.formNursingProfessionalRecord.functional_level_note += `<p><a href="${response?.data?.file_url}" target="_blank">${response?.data?.file_name}</a></p>`
        }
    } catch (error: any) {
        state.error = error
        resetFileInput()
        if (error?.message === 'You do not have enough storage space to upload new files.') {
            state.modal.isUpgradeStorageOpen = true
        } else if (error?.message === 'Du har ikke nok lagerplads til at uploade nye filer.') {
            state.modal.isUpgradeStorageOpen = true
        }
    }
    emit('isPageLoading', false)
}

const uploadMusculoskeletalSystemAttachment = async (file: any) => {
    emit('isPageLoading', true)
    try {
        const params = new FormData()
        params.append('file', file)
        params.append('citizen_uuid', String(citizenUuid))
        const response = await nursingAreasService.uploadNursingFile(params)
        if (response) {
            state.formNursingProfessionalRecord.musculoskeletal_system_note += `<p><a href="${response?.data?.file_url}" target="_blank">${response?.data?.file_name}</a></p>`
        }
    } catch (error: any) {
        state.error = error
        resetFileInput()
        if (error?.message === 'You do not have enough storage space to upload new files.') {
            state.modal.isUpgradeStorageOpen = true
        } else if (error?.message === 'Du har ikke nok lagerplads til at uploade nye filer.') {
            state.modal.isUpgradeStorageOpen = true
        }
    }
    emit('isPageLoading', false)
}

const uploadNutritionAttachment = async (file: any) => {
    emit('isPageLoading', true)
    try {
        const params = new FormData()
        params.append('file', file)
        params.append('citizen_uuid', String(citizenUuid))
        const response = await nursingAreasService.uploadNursingFile(params)
        if (response) {
            state.formNursingProfessionalRecord.nutrition_note += `<p><a href="${response?.data?.file_url}" target="_blank">${response?.data?.file_name}</a></p>`
        }
    } catch (error: any) {
        state.error = error
        resetFileInput()
        if (error?.message === 'You do not have enough storage space to upload new files.') {
            state.modal.isUpgradeStorageOpen = true
        } else if (error?.message === 'Du har ikke nok lagerplads til at uploade nye filer.') {
            state.modal.isUpgradeStorageOpen = true
        }
    }
    emit('isPageLoading', false)
}

const uploadSkinAndMucousMembranesAttachment = async (file: any) => {
    emit('isPageLoading', true)
    try {
        const params = new FormData()
        params.append('file', file)
        params.append('citizen_uuid', String(citizenUuid))
        const response = await nursingAreasService.uploadNursingFile(params)
        if (response) {
            state.formNursingProfessionalRecord.skin_and_mucous_membranes_note += `<p><a href="${response?.data?.file_url}" target="_blank">${response?.data?.file_name}</a></p>`
        }
    } catch (error: any) {
        state.error = error
        resetFileInput()
        if (error?.message === 'You do not have enough storage space to upload new files.') {
            state.modal.isUpgradeStorageOpen = true
        } else if (error?.message === 'Du har ikke nok lagerplads til at uploade nye filer.') {
            state.modal.isUpgradeStorageOpen = true
        }
    }
    emit('isPageLoading', false)
}

const uploadCommunicationAttachment = async (file: any) => {
    emit('isPageLoading', true)
    try {
        const params = new FormData()
        params.append('file', file)
        params.append('citizen_uuid', String(citizenUuid))
        const response = await nursingAreasService.uploadNursingFile(params)
        if (response) {
            state.formNursingProfessionalRecord.communication_note += `<p><a href="${response?.data?.file_url}" target="_blank">${response?.data?.file_name}</a></p>`
        }
    } catch (error: any) {
        state.error = error
        resetFileInput()
        if (error?.message === 'You do not have enough storage space to upload new files.') {
            state.modal.isUpgradeStorageOpen = true
        } else if (error?.message === 'Du har ikke nok lagerplads til at uploade nye filer.') {
            state.modal.isUpgradeStorageOpen = true
        }
    }
    emit('isPageLoading', false)
}

const uploadPsychosocialConditionsAttachment = async (file: any) => {
    emit('isPageLoading', true)
    try {
        const params = new FormData()
        params.append('file', file)
        params.append('citizen_uuid', String(citizenUuid))
        const response = await nursingAreasService.uploadNursingFile(params)
        if (response) {
            state.formNursingProfessionalRecord.psychosocial_conditions_note += `<p><a href="${response?.data?.file_url}" target="_blank">${response?.data?.file_name}</a></p>`
        }
    } catch (error: any) {
        state.error = error
        resetFileInput()
        if (error?.message === 'You do not have enough storage space to upload new files.') {
            state.modal.isUpgradeStorageOpen = true
        } else if (error?.message === 'Du har ikke nok lagerplads til at uploade nye filer.') {
            state.modal.isUpgradeStorageOpen = true
        }
    }
    emit('isPageLoading', false)
}

const uploadRespirationAndCirculationAttachment = async (file: any) => {
    emit('isPageLoading', true)
    try {
        const params = new FormData()
        params.append('file', file)
        params.append('citizen_uuid', String(citizenUuid))
        const response = await nursingAreasService.uploadNursingFile(params)
        if (response) {
            state.formNursingProfessionalRecord.respiration_and_circulation_note += `<p><a href="${response?.data?.file_url}" target="_blank">${response?.data?.file_name}</a></p>`
        }
    } catch (error: any) {
        state.error = error
        resetFileInput()
        if (error?.message === 'You do not have enough storage space to upload new files.') {
            state.modal.isUpgradeStorageOpen = true
        } else if (error?.message === 'Du har ikke nok lagerplads til at uploade nye filer.') {
            state.modal.isUpgradeStorageOpen = true
        }
    }
    emit('isPageLoading', false)
}

const uploadSexualityAttachment = async (file: any) => {
    emit('isPageLoading', true)
    try {
        const params = new FormData()
        params.append('file', file)
        params.append('citizen_uuid', String(citizenUuid))
        const response = await nursingAreasService.uploadNursingFile(params)
        if (response) {
            state.formNursingProfessionalRecord.sexuality_note += `<p><a href="${response?.data?.file_url}" target="_blank">${response?.data?.file_name}</a></p>`
        }
    } catch (error: any) {
        state.error = error
        resetFileInput()
        if (error?.message === 'You do not have enough storage space to upload new files.') {
            state.modal.isUpgradeStorageOpen = true
        } else if (error?.message === 'Du har ikke nok lagerplads til at uploade nye filer.') {
            state.modal.isUpgradeStorageOpen = true
        }
    }
    emit('isPageLoading', false)
}

const uploadPainAndSensoryImpressionsAttachment = async (file: any) => {
    emit('isPageLoading', true)
    try {
        const params = new FormData()
        params.append('file', file)
        params.append('citizen_uuid', String(citizenUuid))
        const response = await nursingAreasService.uploadNursingFile(params)
        if (response) {
            state.formNursingProfessionalRecord.pain_and_sensory_impressions_note += `<p><a href="${response?.data?.file_url}" target="_blank">${response?.data?.file_name}</a></p>`
        }
    } catch (error: any) {
        state.error = error
        resetFileInput()
        if (error?.message === 'You do not have enough storage space to upload new files.') {
            state.modal.isUpgradeStorageOpen = true
        } else if (error?.message === 'Du har ikke nok lagerplads til at uploade nye filer.') {
            state.modal.isUpgradeStorageOpen = true
        }
    }
    emit('isPageLoading', false)
}

const uploadSleepAndRestAttachment = async (file: any) => {
    emit('isPageLoading', true)
    try {
        const params = new FormData()
        params.append('file', file)
        params.append('citizen_uuid', String(citizenUuid))
        const response = await nursingAreasService.uploadNursingFile(params)
        if (response) {
            state.formNursingProfessionalRecord.sleep_and_rest_note += `<p><a href="${response?.data?.file_url}" target="_blank">${response?.data?.file_name}</a></p>`
        }
    } catch (error: any) {
        state.error = error
        resetFileInput()
        if (error?.message === 'You do not have enough storage space to upload new files.') {
            state.modal.isUpgradeStorageOpen = true
        } else if (error?.message === 'Du har ikke nok lagerplads til at uploade nye filer.') {
            state.modal.isUpgradeStorageOpen = true
        }
    }
    emit('isPageLoading', false)
}

const uploadKnowledgeAndDevelopmentAttachment = async (file: any) => {
    emit('isPageLoading', true)
    try {
        const params = new FormData()
        params.append('file', file)
        params.append('citizen_uuid', String(citizenUuid))
        const response = await nursingAreasService.uploadNursingFile(params)
        if (response) {
            state.formNursingProfessionalRecord.knowledge_and_development_note += `<p><a href="${response?.data?.file_url}" target="_blank">${response?.data?.file_name}</a></p>`
        }
    } catch (error: any) {
        state.error = error
        resetFileInput()
        if (error?.message === 'You do not have enough storage space to upload new files.') {
            state.modal.isUpgradeStorageOpen = true
        } else if (error?.message === 'Du har ikke nok lagerplads til at uploade nye filer.') {
            state.modal.isUpgradeStorageOpen = true
        }
    }
    emit('isPageLoading', false)
}

const uploadExcretionOfWasteAttachment = async (file: any) => {
    emit('isPageLoading', true)
    try {
        const params = new FormData()
        params.append('file', file)
        params.append('citizen_uuid', String(citizenUuid))
        const response = await nursingAreasService.uploadNursingFile(params)
        if (response) {
            state.formNursingProfessionalRecord.excretion_of_waste_note += `<p><a href="${response?.data?.file_url}" target="_blank">${response?.data?.file_name}</a></p>`
        }
    } catch (error: any) {
        state.error = error
        resetFileInput()
        if (error?.message === 'You do not have enough storage space to upload new files.') {
            state.modal.isUpgradeStorageOpen = true
        } else if (error?.message === 'Du har ikke nok lagerplads til at uploade nye filer.') {
            state.modal.isUpgradeStorageOpen = true
        }
    }
    emit('isPageLoading', false)
}

function FunctionalLevelUploadAdapterPlugin(editor: any) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
        return new FunctionalLevelUploadAdapter(loader)
    }
}

function MusculoskeletalSystemUploadAdapterPlugin(editor: any) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
        return new MusculoskeletalSystemUploadAdapter(loader)
    }
}

function NutritionUploadAdapterPlugin(editor: any) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
        return new NutritionUploadAdapter(loader)
    }
}

function SkinAndMucousMembranesUploadAdapterPlugin(editor: any) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
        return new SkinAndMucousMembranesUploadAdapter(loader)
    }
}

function CommunicationUploadAdapterPlugin(editor: any) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
        return new CommunicationUploadAdapter(loader)
    }
}

function PsychosocialConditionsUploadAdapterPlugin(editor: any) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
        return new PsychosocialConditionsUploadAdapter(loader)
    }
}

function RespirationAndCirculationUploadAdapterPlugin(editor: any) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
        return new RespirationAndCirculationUploadAdapter(loader)
    }
}

function SexualityUploadAdapterPlugin(editor: any) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
        return new SexualityUploadAdapter(loader)
    }
}

function PainAndSensoryImpressionsUploadAdapterPlugin(editor: any) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
        return new PainAndSensoryImpressionsUploadAdapter(loader)
    }
}

function SleepAndRestUploadAdapterPlugin(editor: any) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
        return new SleepAndRestUploadAdapter(loader)
    }
}

function KnowledgeAndDevelopmentUploadAdapterPlugin(editor: any) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
        return new KnowledgeAndDevelopmentUploadAdapter(loader)
    }
}

function ExcretionOfWasteUploadAdapterPlugin(editor: any) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
        return new ExcretionOfWasteUploadAdapter(loader)
    }
}

class FunctionalLevelUploadAdapter {
    private loader: { file: Promise<File> }

    constructor(loader: { file: Promise<File> }) {
        this.loader = loader
    }

    async upload(): Promise<{ default: string }> {
        emit('isPageLoading', true)
        try {
            const file = await this.loader.file
            const params = new FormData()
            params.append('file', file)
            params.append('citizen_uuid', String(citizenUuid))
            const response = await nursingAreasService.uploadNursingFile(params)
            if (response?.data) {
                emit('isPageLoading', false)
                return { default: response.data?.file_url }
            } else {
                emit('isPageLoading', false)
                throw new Error('No data returned from the server')
            }
        } catch (error: any) {
            state.error = error
            if (error?.message === 'You do not have enough storage space to upload new files.') {
                state.modal.isUpgradeStorageOpen = true
            } else if (error?.message === 'Du har ikke nok lagerplads til at uploade nye filer.') {
                state.modal.isUpgradeStorageOpen = true
            }
            emit('isPageLoading', false)
            throw null
        }
    }
}

class MusculoskeletalSystemUploadAdapter {
    private loader: { file: Promise<File> }

    constructor(loader: { file: Promise<File> }) {
        this.loader = loader
    }

    async upload(): Promise<{ default: string }> {
        emit('isPageLoading', true)
        try {
            const file = await this.loader.file
            const params = new FormData()
            params.append('file', file)
            params.append('citizen_uuid', String(citizenUuid))
            const response = await nursingAreasService.uploadNursingFile(params)
            if (response?.data) {
                emit('isPageLoading', false)
                return { default: response.data?.file_url }
            } else {
                emit('isPageLoading', false)
                throw new Error('No data returned from the server')
            }
        } catch (error: any) {
            state.error = error
            if (error?.message === 'You do not have enough storage space to upload new files.') {
                state.modal.isUpgradeStorageOpen = true
            } else if (error?.message === 'Du har ikke nok lagerplads til at uploade nye filer.') {
                state.modal.isUpgradeStorageOpen = true
            }
            emit('isPageLoading', false)
            throw null
        }
    }
}

class NutritionUploadAdapter {
    private loader: { file: Promise<File> }

    constructor(loader: { file: Promise<File> }) {
        this.loader = loader
    }

    async upload(): Promise<{ default: string }> {
        emit('isPageLoading', true)
        try {
            const file = await this.loader.file
            const params = new FormData()
            params.append('file', file)
            params.append('citizen_uuid', String(citizenUuid))
            const response = await nursingAreasService.uploadNursingFile(params)
            if (response?.data) {
                emit('isPageLoading', false)
                return { default: response.data?.file_url }
            } else {
                emit('isPageLoading', false)
                throw new Error('No data returned from the server')
            }
        } catch (error: any) {
            state.error = error
            if (error?.message === 'You do not have enough storage space to upload new files.') {
                state.modal.isUpgradeStorageOpen = true
            } else if (error?.message === 'Du har ikke nok lagerplads til at uploade nye filer.') {
                state.modal.isUpgradeStorageOpen = true
            }
            emit('isPageLoading', false)
            throw null
        }
    }
}

class SkinAndMucousMembranesUploadAdapter {
    private loader: { file: Promise<File> }

    constructor(loader: { file: Promise<File> }) {
        this.loader = loader
    }

    async upload(): Promise<{ default: string }> {
        emit('isPageLoading', true)
        try {
            const file = await this.loader.file
            const params = new FormData()
            params.append('file', file)
            params.append('citizen_uuid', String(citizenUuid))
            const response = await nursingAreasService.uploadNursingFile(params)
            if (response?.data) {
                emit('isPageLoading', false)
                return { default: response.data?.file_url }
            } else {
                emit('isPageLoading', false)
                throw new Error('No data returned from the server')
            }
        } catch (error: any) {
            state.error = error
            if (error?.message === 'You do not have enough storage space to upload new files.') {
                state.modal.isUpgradeStorageOpen = true
            } else if (error?.message === 'Du har ikke nok lagerplads til at uploade nye filer.') {
                state.modal.isUpgradeStorageOpen = true
            }
            emit('isPageLoading', false)
            throw null
        }
    }
}

class CommunicationUploadAdapter {
    private loader: { file: Promise<File> }

    constructor(loader: { file: Promise<File> }) {
        this.loader = loader
    }

    async upload(): Promise<{ default: string }> {
        emit('isPageLoading', true)
        try {
            const file = await this.loader.file
            const params = new FormData()
            params.append('file', file)
            params.append('citizen_uuid', String(citizenUuid))
            const response = await nursingAreasService.uploadNursingFile(params)
            if (response?.data) {
                emit('isPageLoading', false)
                return { default: response.data?.file_url }
            } else {
                emit('isPageLoading', false)
                throw new Error('No data returned from the server')
            }
        } catch (error: any) {
            state.error = error
            if (error?.message === 'You do not have enough storage space to upload new files.') {
                state.modal.isUpgradeStorageOpen = true
            } else if (error?.message === 'Du har ikke nok lagerplads til at uploade nye filer.') {
                state.modal.isUpgradeStorageOpen = true
            }
            emit('isPageLoading', false)
            throw null
        }
    }
}

class PsychosocialConditionsUploadAdapter {
    private loader: { file: Promise<File> }

    constructor(loader: { file: Promise<File> }) {
        this.loader = loader
    }

    async upload(): Promise<{ default: string }> {
        emit('isPageLoading', true)
        try {
            const file = await this.loader.file
            const params = new FormData()
            params.append('file', file)
            params.append('citizen_uuid', String(citizenUuid))
            const response = await nursingAreasService.uploadNursingFile(params)
            if (response?.data) {
                emit('isPageLoading', false)
                return { default: response.data?.file_url }
            } else {
                emit('isPageLoading', false)
                throw new Error('No data returned from the server')
            }
        } catch (error: any) {
            state.error = error
            if (error?.message === 'You do not have enough storage space to upload new files.') {
                state.modal.isUpgradeStorageOpen = true
            } else if (error?.message === 'Du har ikke nok lagerplads til at uploade nye filer.') {
                state.modal.isUpgradeStorageOpen = true
            }
            emit('isPageLoading', false)
            throw null
        }
    }
}

class RespirationAndCirculationUploadAdapter {
    private loader: { file: Promise<File> }

    constructor(loader: { file: Promise<File> }) {
        this.loader = loader
    }

    async upload(): Promise<{ default: string }> {
        emit('isPageLoading', true)
        try {
            const file = await this.loader.file
            const params = new FormData()
            params.append('file', file)
            params.append('citizen_uuid', String(citizenUuid))
            const response = await nursingAreasService.uploadNursingFile(params)
            if (response?.data) {
                emit('isPageLoading', false)
                return { default: response.data?.file_url }
            } else {
                emit('isPageLoading', false)
                throw new Error('No data returned from the server')
            }
        } catch (error: any) {
            state.error = error
            if (error?.message === 'You do not have enough storage space to upload new files.') {
                state.modal.isUpgradeStorageOpen = true
            } else if (error?.message === 'Du har ikke nok lagerplads til at uploade nye filer.') {
                state.modal.isUpgradeStorageOpen = true
            }
            emit('isPageLoading', false)
            throw null
        }
    }
}

class SexualityUploadAdapter {
    private loader: { file: Promise<File> }

    constructor(loader: { file: Promise<File> }) {
        this.loader = loader
    }

    async upload(): Promise<{ default: string }> {
        emit('isPageLoading', true)
        try {
            const file = await this.loader.file
            const params = new FormData()
            params.append('file', file)
            params.append('citizen_uuid', String(citizenUuid))
            const response = await nursingAreasService.uploadNursingFile(params)
            if (response?.data) {
                emit('isPageLoading', false)
                return { default: response.data?.file_url }
            } else {
                emit('isPageLoading', false)
                throw new Error('No data returned from the server')
            }
        } catch (error: any) {
            state.error = error
            if (error?.message === 'You do not have enough storage space to upload new files.') {
                state.modal.isUpgradeStorageOpen = true
            } else if (error?.message === 'Du har ikke nok lagerplads til at uploade nye filer.') {
                state.modal.isUpgradeStorageOpen = true
            }
            emit('isPageLoading', false)
            throw null
        }
    }
}

class PainAndSensoryImpressionsUploadAdapter {
    private loader: { file: Promise<File> }

    constructor(loader: { file: Promise<File> }) {
        this.loader = loader
    }

    async upload(): Promise<{ default: string }> {
        emit('isPageLoading', true)
        try {
            const file = await this.loader.file
            const params = new FormData()
            params.append('file', file)
            params.append('citizen_uuid', String(citizenUuid))
            const response = await nursingAreasService.uploadNursingFile(params)
            if (response?.data) {
                emit('isPageLoading', false)
                return { default: response.data?.file_url }
            } else {
                emit('isPageLoading', false)
                throw new Error('No data returned from the server')
            }
        } catch (error: any) {
            state.error = error
            if (error?.message === 'You do not have enough storage space to upload new files.') {
                state.modal.isUpgradeStorageOpen = true
            } else if (error?.message === 'Du har ikke nok lagerplads til at uploade nye filer.') {
                state.modal.isUpgradeStorageOpen = true
            }
            emit('isPageLoading', false)
            throw null
        }
    }
}

class SleepAndRestUploadAdapter {
    private loader: { file: Promise<File> }

    constructor(loader: { file: Promise<File> }) {
        this.loader = loader
    }

    async upload(): Promise<{ default: string }> {
        emit('isPageLoading', true)
        try {
            const file = await this.loader.file
            const params = new FormData()
            params.append('file', file)
            params.append('citizen_uuid', String(citizenUuid))
            const response = await nursingAreasService.uploadNursingFile(params)
            if (response?.data) {
                emit('isPageLoading', false)
                return { default: response.data?.file_url }
            } else {
                emit('isPageLoading', false)
                throw new Error('No data returned from the server')
            }
        } catch (error: any) {
            state.error = error
            if (error?.message === 'You do not have enough storage space to upload new files.') {
                state.modal.isUpgradeStorageOpen = true
            } else if (error?.message === 'Du har ikke nok lagerplads til at uploade nye filer.') {
                state.modal.isUpgradeStorageOpen = true
            }
            emit('isPageLoading', false)
            throw null
        }
    }
}

class KnowledgeAndDevelopmentUploadAdapter {
    private loader: { file: Promise<File> }

    constructor(loader: { file: Promise<File> }) {
        this.loader = loader
    }

    async upload(): Promise<{ default: string }> {
        emit('isPageLoading', true)
        try {
            const file = await this.loader.file
            const params = new FormData()
            params.append('file', file)
            params.append('citizen_uuid', String(citizenUuid))
            const response = await nursingAreasService.uploadNursingFile(params)
            if (response?.data) {
                emit('isPageLoading', false)
                return { default: response.data?.file_url }
            } else {
                emit('isPageLoading', false)
                throw new Error('No data returned from the server')
            }
        } catch (error: any) {
            state.error = error
            if (error?.message === 'You do not have enough storage space to upload new files.') {
                state.modal.isUpgradeStorageOpen = true
            } else if (error?.message === 'Du har ikke nok lagerplads til at uploade nye filer.') {
                state.modal.isUpgradeStorageOpen = true
            }
            emit('isPageLoading', false)
            throw null
        }
    }
}

class ExcretionOfWasteUploadAdapter {
    private loader: { file: Promise<File> }

    constructor(loader: { file: Promise<File> }) {
        this.loader = loader
    }

    async upload(): Promise<{ default: string }> {
        emit('isPageLoading', true)
        try {
            const file = await this.loader.file
            const params = new FormData()
            params.append('file', file)
            params.append('citizen_uuid', String(citizenUuid))
            const response = await nursingAreasService.uploadNursingFile(params)
            if (response?.data) {
                emit('isPageLoading', false)
                return { default: response.data?.file_url }
            } else {
                emit('isPageLoading', false)
                throw new Error('No data returned from the server')
            }
        } catch (error: any) {
            state.error = error
            if (error?.message === 'You do not have enough storage space to upload new files.') {
                state.modal.isUpgradeStorageOpen = true
            } else if (error?.message === 'Du har ikke nok lagerplads til at uploade nye filer.') {
                state.modal.isUpgradeStorageOpen = true
            }
            emit('isPageLoading', false)
            throw null
        }
    }
}
</script>