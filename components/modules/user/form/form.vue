<template>
    <form @submit.prevent="submitForm()" class="max-w-5xl mx-auto space-y-5">
        <div class="space-y-3 px-4 py-6 sm:p-8 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
            <Alert type="danger" :text="state?.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />
            <div class="space-y-1">
                <FormLabel for="title" :label="$t('forms.formTitle')" />
                <FormTextField id="title" name="title" :placeholder="$t('forms.formTitle')"
                    v-model="state.form.title" />
                <FormError :error="v$?.form?.title?.$errors[0]?.$message.toString()" />
                <FormError :error="state?.error?.errors?.title?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="form_description" :label="$t('forms.formDescription')" />
                <FormTextArea id="form_description" name="form_description" :placeholder="$t('forms.formDescription')"
                    :rows="5" v-model="state.form.description" />
                <FormError :error="v$?.form?.description?.$errors[0]?.$message.toString()" />
                <FormError :error="state?.error?.errors?.description?.[0]" />
            </div>
            <div v-if="isAdmin" class="rounded-md border border-gray-200 bg-gray-50 p-4 space-y-3">
                <div class="flex items-center gap-x-3">
                    <FormSwitch :value="state.form.layout_mode === 'document'" @toggleSwitch="toggleLayoutMode" />
                    <label class="text-sm font-semibold text-gray-800 cursor-pointer" @click="toggleLayoutMode">
                        {{ $t('forms.layout.documentLayout') }}
                    </label>
                </div>
                <p class="text-xs text-gray-500">{{ $t('forms.layout.documentLayoutHint') }}</p>
                <div v-if="state.form.layout_mode === 'document'" class="flex items-center gap-x-3 pt-1">
                    <FormSwitch :value="state.form.show_numbering"
                        @toggleSwitch="state.form.show_numbering = !state.form.show_numbering" />
                    <label class="text-sm text-gray-700 cursor-pointer"
                        @click="state.form.show_numbering = !state.form.show_numbering">
                        {{ $t('forms.layout.showNumbering') }}
                    </label>
                </div>
            </div>

            <div class="space-y-1">
                <FormLabel for="document_title" :label="$t('forms.documentTitle')" />
                <FormTextField id="document_title" name="document_title" :placeholder="$t('forms.documentTitle')"
                    v-model="state.form.document_title" />
            </div>
            <div v-if="isAdmin" class="flex items-center gap-x-3 pt-2">
                <FormSwitch :value="state.form.is_follow_up_enabled"
                    @toggleSwitch="state.form.is_follow_up_enabled = !state.form.is_follow_up_enabled" />
                <label class="text-sm font-medium text-gray-700 cursor-pointer"
                    @click="state.form.is_follow_up_enabled = !state.form.is_follow_up_enabled">
                    {{ $t('forms.enableFollowUp') }}
                </label>
            </div>
            <div v-if="state.form.is_follow_up_enabled" class="space-y-3 ml-12">
                <div class="flex items-center gap-x-3">
                    <span class="text-sm text-gray-600">
                        {{ $t('plansandgoals.createStatusTemplate.form.followUpIn') }}
                    </span>
                    <div class="w-24">
                        <FormNumberField name="follow_up_number" placeholder="1" :min="1"
                            v-model="state.followUpNumber" />
                    </div>
                    <div class="w-40">
                        <FormSelect id="follow_up_unit" :options="followUpUnits" :canClear="false" :searchable="false"
                            v-model="state.followUpUnit" />
                    </div>
                </div>
            </div>
            <div v-if="isAdmin" class="flex items-center gap-x-3 pt-2">
                <FormSwitch :value="state.form.show_citizen_profile_data"
                    @toggleSwitch="state.form.show_citizen_profile_data = !state.form.show_citizen_profile_data" />
                <label class="text-sm font-medium text-gray-700 cursor-pointer"
                    @click="state.form.show_citizen_profile_data = !state.form.show_citizen_profile_data">
                    {{ $t('forms.showCitizenProfileData') }}
                </label>
            </div>
            <div v-if="isAdmin && state.form.show_citizen_profile_data" class="space-y-2 ml-12">
                <div v-for="option in citizenProfileFieldOptions" :key="option.key"
                    class="flex items-center gap-x-3 cursor-pointer w-fit"
                    @click="toggleCitizenProfileField(option.key)">
                    <FormCheckbox :value="isCitizenProfileFieldSelected(option.key)" />
                    <span class="text-sm text-gray-700">{{ option.label }}</span>
                </div>
            </div>
        </div>

        <div class="space-y-3 px-4 py-6 sm:p-8 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
            <div>
                <div class="space-y-8 mt-5" v-if="state.form.fields?.length > 0">
                    <div v-for="(field, fieldIndex) in state.form.fields" :key="fieldIndex" class="space-y-3">
                        <div class="bg-gray-100 rounded-md border-t-2 border-primary">
                            <div>
                                <div v-if="field.type === 'textfield'" class="grow">
                                    <div class="p-5 space-y-3">
                                        <div class="flex items-center justify-end">
                                            <button type="button" :disabled="fieldIndex === 0" class="disabled:opacity-30"
                                                :aria-label="$t('forms.fields.moveUp')" @click="moveField(fieldIndex, -1)">
                                                <Icon name="ph:arrow-up" class="h-5 w-5" aria-hidden="true" />
                                            </button>
                                            <button type="button" :disabled="fieldIndex === state.form.fields.length - 1"
                                                class="disabled:opacity-30" :aria-label="$t('forms.fields.moveDown')"
                                                @click="moveField(fieldIndex, 1)">
                                                <Icon name="ph:arrow-down" class="h-5 w-5" aria-hidden="true" />
                                            </button>
                                            <button type="button" :aria-label="$t('forms.fields.duplicate')"
                                                @click="duplicateField(fieldIndex)">
                                                <Icon name="ph:copy" class="h-5 w-5" aria-hidden="true" />
                                            </button>
                                            <button type="button" @click="removeField(fieldIndex)">
                                                <Icon name="ph:trash" class="h-5 w-5" aria-hidden="true" />
                                            </button>
                                        </div>
                                        <div class="flex gap-x-3">
                                            <div class="mt-2">{{ fieldIndex + 1 }}.</div>
                                            <div class="grow space-y-3">
                                                <FormTextField :name="'text_field_' + fieldIndex"
                                                    :placeholder="$t('forms.fields.inputYourQuestionTitleHere')"
                                                    v-model="state.form.fields[fieldIndex].value" />
                                                <FormTextField :name="'text_field_' + fieldIndex"
                                                    :placeholder="$t('forms.fields.enterYourAnswer')"
                                                    :disabled="true" />
                                            </div>
                                        </div>
                                    </div>
                                    <hr />
                                    <div class="px-5 py-3 space-y-3">
                                        <div class="flex items-center justify-end gap-x-2">
                                            <p>
                                                {{ $t('forms.fields.autoFill.label') }}
                                            </p>
                                            <div class="w-56">
                                                <FormSelect :id="'text_field_autofill_' + fieldIndex"
                                                    :options="citizenAutoFillOptions" :canClear="false"
                                                    :searchable="false"
                                                    v-model="state.form.fields[fieldIndex].autoFillSource" />
                                            </div>
                                        </div>
                                        <div class="flex items-center justify-end gap-x-2">
                                            <FormSwitch :value="state.form.fields[fieldIndex].required"
                                                @toggleSwitch="state.form.fields[fieldIndex].required = !state.form.fields[fieldIndex].required" />
                                            <p>
                                                {{ $t('forms.fields.required') }}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="field.type === 'textarea'" class="grow">
                                    <div class="p-5 space-y-3">
                                        <div class="flex items-center justify-end">
                                            <button type="button" :disabled="fieldIndex === 0" class="disabled:opacity-30"
                                                :aria-label="$t('forms.fields.moveUp')" @click="moveField(fieldIndex, -1)">
                                                <Icon name="ph:arrow-up" class="h-5 w-5" aria-hidden="true" />
                                            </button>
                                            <button type="button" :disabled="fieldIndex === state.form.fields.length - 1"
                                                class="disabled:opacity-30" :aria-label="$t('forms.fields.moveDown')"
                                                @click="moveField(fieldIndex, 1)">
                                                <Icon name="ph:arrow-down" class="h-5 w-5" aria-hidden="true" />
                                            </button>
                                            <button type="button" :aria-label="$t('forms.fields.duplicate')"
                                                @click="duplicateField(fieldIndex)">
                                                <Icon name="ph:copy" class="h-5 w-5" aria-hidden="true" />
                                            </button>
                                            <button @click="removeField(fieldIndex)">
                                                <Icon name="ph:trash" class="h-5 w-5" aria-hidden="true" />
                                            </button>
                                        </div>
                                        <div class="flex gap-x-3">
                                            <div class="mt-2">{{ fieldIndex + 1 }}.</div>
                                            <div class="grow space-y-3">
                                                <FormTextField :name="'textarea_' + fieldIndex"
                                                    :placeholder="$t('forms.fields.inputYourQuestionTitleHere')"
                                                    v-model="state.form.fields[fieldIndex].value" />
                                                <FormTextArea :name="'textarea_' + fieldIndex"
                                                    :placeholder="$t('forms.fields.enterYourAnswer')"
                                                    :disabled="true" />
                                            </div>
                                        </div>
                                    </div>
                                    <hr />
                                    <div class="px-5 py-3 space-y-3">
                                        <div class="flex items-center justify-end gap-x-2">
                                            <p>
                                                {{ $t('forms.fields.autoFill.label') }}
                                            </p>
                                            <div class="w-56">
                                                <FormSelect :id="'textarea_autofill_' + fieldIndex"
                                                    :options="citizenAutoFillOptions" :canClear="false"
                                                    :searchable="false"
                                                    v-model="state.form.fields[fieldIndex].autoFillSource" />
                                            </div>
                                        </div>
                                        <div class="flex items-center justify-end gap-x-2">
                                            <FormSwitch :value="state.form.fields[fieldIndex].required"
                                                @toggleSwitch="state.form.fields[fieldIndex].required = !state.form.fields[fieldIndex].required" />
                                            <p>
                                                {{ $t('forms.fields.required') }}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="field.type === 'choice'" class="grow">
                                    <div class="p-5 space-y-3">
                                        <div class="flex items-center justify-end">
                                            <button type="button" :disabled="fieldIndex === 0" class="disabled:opacity-30"
                                                :aria-label="$t('forms.fields.moveUp')" @click="moveField(fieldIndex, -1)">
                                                <Icon name="ph:arrow-up" class="h-5 w-5" aria-hidden="true" />
                                            </button>
                                            <button type="button" :disabled="fieldIndex === state.form.fields.length - 1"
                                                class="disabled:opacity-30" :aria-label="$t('forms.fields.moveDown')"
                                                @click="moveField(fieldIndex, 1)">
                                                <Icon name="ph:arrow-down" class="h-5 w-5" aria-hidden="true" />
                                            </button>
                                            <button type="button" :aria-label="$t('forms.fields.duplicate')"
                                                @click="duplicateField(fieldIndex)">
                                                <Icon name="ph:copy" class="h-5 w-5" aria-hidden="true" />
                                            </button>
                                            <button @click="removeField(fieldIndex)">
                                                <Icon name="ph:trash" class="h-5 w-5" aria-hidden="true" />
                                            </button>
                                        </div>
                                        <div class="flex gap-x-3">
                                            <div class="mt-2">{{ fieldIndex + 1 }}.</div>
                                            <div class="grow space-y-3">
                                                <FormTextField :name="'text_field_' + fieldIndex"
                                                    :placeholder="$t('forms.fields.inputYourQuestionTitleHere')"
                                                    v-model="state.form.fields[fieldIndex].value" />
                                                <div class="space-y-3">
                                                    <div v-for="(radio, radioIndex) in state.form.fields[fieldIndex].options"
                                                        :key="radioIndex" class="flex items-center gap-x-2">
                                                        <FormRadioButton :name="`choice_${fieldIndex}_${radioIndex}`"
                                                            :disabled="true" />
                                                        <FormTextField :name="`text_field_${fieldIndex}_${radioIndex}`"
                                                            :placeholder="`Option ${radioIndex + 1}`"
                                                            v-model="state.form.fields[fieldIndex].options[radioIndex]" />
                                                        <button class="flex items-center"
                                                            @click="removeRadioButton(fieldIndex, radioIndex)"
                                                            v-if="state.form.fields[fieldIndex].options.length > 2">
                                                            <Icon name="ph:trash" class="h-5 w-5" aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                    <button @click="addRadioOption(fieldIndex)" type="button"
                                                        class="text-primary-500 text-sm mt-2 hover:text-primary-700">
                                                        {{ $t('forms.addOption') }}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <hr />
                                    <div class="px-5 py-3">
                                        <div class="flex items-center justify-end gap-x-2">
                                            <FormSwitch :value="state.form.fields[fieldIndex].required"
                                                @toggleSwitch="state.form.fields[fieldIndex].required = !state.form.fields[fieldIndex].required" />
                                            <p>
                                                {{ $t('forms.fields.required') }}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="field.type === 'checkbox'" class="grow">
                                    <div class="p-5 space-y-3">
                                        <div class="flex items-center justify-end">
                                            <button type="button" :disabled="fieldIndex === 0" class="disabled:opacity-30"
                                                :aria-label="$t('forms.fields.moveUp')" @click="moveField(fieldIndex, -1)">
                                                <Icon name="ph:arrow-up" class="h-5 w-5" aria-hidden="true" />
                                            </button>
                                            <button type="button" :disabled="fieldIndex === state.form.fields.length - 1"
                                                class="disabled:opacity-30" :aria-label="$t('forms.fields.moveDown')"
                                                @click="moveField(fieldIndex, 1)">
                                                <Icon name="ph:arrow-down" class="h-5 w-5" aria-hidden="true" />
                                            </button>
                                            <button type="button" :aria-label="$t('forms.fields.duplicate')"
                                                @click="duplicateField(fieldIndex)">
                                                <Icon name="ph:copy" class="h-5 w-5" aria-hidden="true" />
                                            </button>
                                            <button @click="removeField(fieldIndex)">
                                                <Icon name="ph:trash" class="h-5 w-5" aria-hidden="true" />
                                            </button>
                                        </div>
                                        <div class="flex gap-x-3">
                                            <div class="mt-2">{{ fieldIndex + 1 }}.</div>
                                            <div class="grow space-y-3">
                                                <FormTextField :name="'text_field_' + fieldIndex"
                                                    :placeholder="$t('forms.fields.inputYourQuestionTitleHere')"
                                                    v-model="state.form.fields[fieldIndex].value" />
                                                <div class="space-y-3">
                                                    <div v-for="(checkbox, checkboxIndex) in state.form.fields[fieldIndex].options"
                                                        :key="checkboxIndex" class="flex items-center gap-x-2">
                                                        <FormCheckbox :name="`choice_${fieldIndex}_${checkboxIndex}`"
                                                            :disabled="true" />
                                                        <FormTextField
                                                            :name="`text_field_${fieldIndex}_${checkboxIndex}`"
                                                            :placeholder="`Option ${checkboxIndex + 1}`"
                                                            v-model="state.form.fields[fieldIndex].options[checkboxIndex]" />
                                                        <button class="flex items-center"
                                                            @click="removeCheckboxOption(fieldIndex, checkboxIndex)"
                                                            v-if="state.form.fields[fieldIndex].options.length > 1">
                                                            <Icon name="ph:trash" class="h-5 w-5" aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                    <button @click="addCheckboxOption(fieldIndex)" type="button"
                                                        class="text-primary-500 text-sm mt-2 hover:text-primary-700">
                                                        {{ $t('forms.addNewQuestion') }}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <hr />
                                    <div class="px-5 py-3">
                                        <div class="flex items-center justify-end gap-x-2">
                                            <FormSwitch :value="state.form.fields[fieldIndex].required"
                                                @toggleSwitch="state.form.fields[fieldIndex].required = !state.form.fields[fieldIndex].required" />
                                            <p>
                                                {{ $t('forms.fields.required') }}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="field.type === 'rating'" class="grow">
                                    <div class="p-5 space-y-3">
                                        <div class="flex items-center justify-end">
                                            <button type="button" :disabled="fieldIndex === 0" class="disabled:opacity-30"
                                                :aria-label="$t('forms.fields.moveUp')" @click="moveField(fieldIndex, -1)">
                                                <Icon name="ph:arrow-up" class="h-5 w-5" aria-hidden="true" />
                                            </button>
                                            <button type="button" :disabled="fieldIndex === state.form.fields.length - 1"
                                                class="disabled:opacity-30" :aria-label="$t('forms.fields.moveDown')"
                                                @click="moveField(fieldIndex, 1)">
                                                <Icon name="ph:arrow-down" class="h-5 w-5" aria-hidden="true" />
                                            </button>
                                            <button type="button" :aria-label="$t('forms.fields.duplicate')"
                                                @click="duplicateField(fieldIndex)">
                                                <Icon name="ph:copy" class="h-5 w-5" aria-hidden="true" />
                                            </button>
                                            <button @click="removeField(fieldIndex)">
                                                <Icon name="ph:trash" class="h-5 w-5" aria-hidden="true" />
                                            </button>
                                        </div>
                                        <div class="flex gap-x-3">
                                            <div class="mt-2">{{ fieldIndex + 1 }}.</div>
                                            <div class="grow space-y-3">
                                                <FormTextField :name="'textarea_' + fieldIndex"
                                                    :placeholder="$t('forms.fields.inputYourQuestionTitleHere')"
                                                    v-model="state.form.fields[fieldIndex].value" />
                                                <div class="flex items-center justify-between gap-x-2">
                                                    <div v-for="(rating, ratingIndex) in state.form.fields[fieldIndex].levels"
                                                        :key="ratingIndex"
                                                        class="w-full h-10 flex items-center justify-center border border-gray-300 rounded-sm">
                                                        {{ rating }}
                                                    </div>
                                                </div>
                                                <div>
                                                    {{ $t('forms.fields.levels') }}:
                                                    <select v-model="state.form.fields[fieldIndex].levels"
                                                        class="w-16 h-8 rounded-md pl-2 outline-none">
                                                        <option :value="2">2</option>
                                                        <option :value="3">3</option>
                                                        <option :value="4">4</option>
                                                        <option :value="5">5</option>
                                                        <option :value="6">6</option>
                                                        <option :value="7">7</option>
                                                        <option :value="8">8</option>
                                                        <option :value="9">9</option>
                                                        <option :value="10">10</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <hr />
                                    <div class="px-5 py-3">
                                        <div class="flex items-center justify-end gap-x-2">
                                            <FormSwitch :value="state.form.fields[fieldIndex].required"
                                                @toggleSwitch="state.form.fields[fieldIndex].required = !state.form.fields[fieldIndex].required" />
                                            <p>
                                                {{ $t('forms.fields.required') }}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="field.type === 'datefield'" class="grow">
                                    <div class="p-5 space-y-3">
                                        <div class="flex items-center justify-end">
                                            <button type="button" :disabled="fieldIndex === 0" class="disabled:opacity-30"
                                                :aria-label="$t('forms.fields.moveUp')" @click="moveField(fieldIndex, -1)">
                                                <Icon name="ph:arrow-up" class="h-5 w-5" aria-hidden="true" />
                                            </button>
                                            <button type="button" :disabled="fieldIndex === state.form.fields.length - 1"
                                                class="disabled:opacity-30" :aria-label="$t('forms.fields.moveDown')"
                                                @click="moveField(fieldIndex, 1)">
                                                <Icon name="ph:arrow-down" class="h-5 w-5" aria-hidden="true" />
                                            </button>
                                            <button type="button" :aria-label="$t('forms.fields.duplicate')"
                                                @click="duplicateField(fieldIndex)">
                                                <Icon name="ph:copy" class="h-5 w-5" aria-hidden="true" />
                                            </button>
                                            <button @click="removeField(fieldIndex)">
                                                <Icon name="ph:trash" class="h-5 w-5" aria-hidden="true" />
                                            </button>
                                        </div>
                                        <div class="flex gap-x-3">
                                            <div class="mt-2">{{ fieldIndex + 1 }}.</div>
                                            <div class="grow space-y-3">
                                                <FormTextField :name="'date_field_' + fieldIndex"
                                                    :placeholder="$t('forms.fields.inputYourQuestionTitleHere')"
                                                    v-model="state.form.fields[fieldIndex].value" />
                                                <div class="relative">
                                                    <FormDateField :name="'date_field_' + fieldIndex"
                                                        :placeholder="$t('forms.fields.enterYourAnswer')"
                                                        :disabled="true" />
                                                    <Icon name="ph:calendar"
                                                        class="h-5 w-5 absolute right-4 top-2.5 text-gray-500"
                                                        aria-hidden="true" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <hr />
                                    <div class="px-5 py-3 space-y-3">
                                        <div class="flex items-center justify-end gap-x-2">
                                            <p>
                                                {{ $t('forms.fields.autoFill.label') }}
                                            </p>
                                            <div class="w-56">
                                                <FormSelect :id="'date_field_autofill_' + fieldIndex"
                                                    :options="citizenAutoFillDateOptions" :canClear="false"
                                                    :searchable="false"
                                                    v-model="state.form.fields[fieldIndex].autoFillSource" />
                                            </div>
                                        </div>
                                        <div class="flex items-center justify-end gap-x-2">
                                            <FormSwitch :value="state.form.fields[fieldIndex].required"
                                                @toggleSwitch="state.form.fields[fieldIndex].required = !state.form.fields[fieldIndex].required" />
                                            <p>
                                                {{ $t('forms.fields.required') }}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="field.type === 'uploadfile'" class="grow">
                                    <div>
                                        <div class="p-5 space-y-3">
                                            <div class="flex items-center justify-end">
                                                <button type="button" :disabled="fieldIndex === 0" class="disabled:opacity-30"
                                                    :aria-label="$t('forms.fields.moveUp')" @click="moveField(fieldIndex, -1)">
                                                    <Icon name="ph:arrow-up" class="h-5 w-5" aria-hidden="true" />
                                                </button>
                                                <button type="button" :disabled="fieldIndex === state.form.fields.length - 1"
                                                    class="disabled:opacity-30" :aria-label="$t('forms.fields.moveDown')"
                                                    @click="moveField(fieldIndex, 1)">
                                                    <Icon name="ph:arrow-down" class="h-5 w-5" aria-hidden="true" />
                                                </button>
                                                <button type="button" :aria-label="$t('forms.fields.duplicate')"
                                                    @click="duplicateField(fieldIndex)">
                                                    <Icon name="ph:copy" class="h-5 w-5" aria-hidden="true" />
                                                </button>
                                                <button @click="removeField(fieldIndex)">
                                                    <Icon name="ph:trash" class="h-5 w-5" aria-hidden="true" />
                                                </button>
                                            </div>
                                            <div class="flex gap-x-3">
                                                <div class="mt-2">{{ fieldIndex + 1 }}.</div>
                                                <div class="grow space-y-4">
                                                    <FormTextField :name="'upload_file_' + fieldIndex"
                                                        :placeholder="$t('forms.fields.inputYourQuestionTitleHere')"
                                                        v-model="state.form.fields[fieldIndex].value" />
                                                    <div class="flex items-center gap-x-2 text-sm">
                                                        <Icon name="material-symbols:upload-rounded"
                                                            class="w-4 h-4 text-primary" aria-hidden="true" />
                                                        {{ $t('forms.fields.uploadFile') }}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <hr />
                                    <div class="px-5 py-3">
                                        <div class="flex items-center justify-end gap-x-2">
                                            <FormSwitch :value="state.form.fields[fieldIndex].required"
                                                @toggleSwitch="state.form.fields[fieldIndex].required = !state.form.fields[fieldIndex].required" />
                                            <p>
                                                {{ $t('forms.fields.required') }}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="field.type === 'scale'" class="grow">
                                    <div class="p-5 space-y-3">
                                        <div class="flex items-center justify-between">
                                            <span class="text-xs font-semibold uppercase tracking-wide text-primary">
                                                {{ $t('forms.fields.scale') }}
                                            </span>
                                            <button type="button" :disabled="fieldIndex === 0" class="disabled:opacity-30"
                                                :aria-label="$t('forms.fields.moveUp')" @click="moveField(fieldIndex, -1)">
                                                <Icon name="ph:arrow-up" class="h-5 w-5" aria-hidden="true" />
                                            </button>
                                            <button type="button" :disabled="fieldIndex === state.form.fields.length - 1"
                                                class="disabled:opacity-30" :aria-label="$t('forms.fields.moveDown')"
                                                @click="moveField(fieldIndex, 1)">
                                                <Icon name="ph:arrow-down" class="h-5 w-5" aria-hidden="true" />
                                            </button>
                                            <button type="button" :aria-label="$t('forms.fields.duplicate')"
                                                @click="duplicateField(fieldIndex)">
                                                <Icon name="ph:copy" class="h-5 w-5" aria-hidden="true" />
                                            </button>
                                            <button type="button" @click="removeField(fieldIndex)">
                                                <Icon name="ph:trash" class="h-5 w-5" aria-hidden="true" />
                                            </button>
                                        </div>
                                        <ModulesUserFormScaleEditor :field="state.form.fields[fieldIndex]"
                                            :fieldIndex="fieldIndex" />
                                    </div>
                                    <hr />
                                    <div class="px-5 py-3">
                                        <div class="flex items-center justify-end gap-x-2">
                                            <FormSwitch :value="state.form.fields[fieldIndex].required"
                                                @toggleSwitch="state.form.fields[fieldIndex].required = !state.form.fields[fieldIndex].required" />
                                            <p>
                                                {{ $t('forms.fields.required') }}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="isLayoutBlock(field.type)" class="grow">
                                    <div class="p-5 space-y-3">
                                        <div class="flex items-center justify-between">
                                            <span class="text-xs font-semibold uppercase tracking-wide text-primary">
                                                {{ $t('forms.fields.' + field.type) }}
                                            </span>
                                            <button type="button" :disabled="fieldIndex === 0" class="disabled:opacity-30"
                                                :aria-label="$t('forms.fields.moveUp')" @click="moveField(fieldIndex, -1)">
                                                <Icon name="ph:arrow-up" class="h-5 w-5" aria-hidden="true" />
                                            </button>
                                            <button type="button" :disabled="fieldIndex === state.form.fields.length - 1"
                                                class="disabled:opacity-30" :aria-label="$t('forms.fields.moveDown')"
                                                @click="moveField(fieldIndex, 1)">
                                                <Icon name="ph:arrow-down" class="h-5 w-5" aria-hidden="true" />
                                            </button>
                                            <button type="button" :aria-label="$t('forms.fields.duplicate')"
                                                @click="duplicateField(fieldIndex)">
                                                <Icon name="ph:copy" class="h-5 w-5" aria-hidden="true" />
                                            </button>
                                            <button @click="removeField(fieldIndex)">
                                                <Icon name="ph:trash" class="h-5 w-5" aria-hidden="true" />
                                            </button>
                                        </div>
                                        <FormTextField
                                            v-if="field.type === 'heading' || field.type === 'subheading'"
                                            :name="'heading_' + fieldIndex"
                                            :placeholder="$t('forms.fields.headingPlaceholder')"
                                            v-model="state.form.fields[fieldIndex].value" />
                                        <FormTextArea
                                            v-else-if="field.type === 'paragraph' || field.type === 'guidance'"
                                            :name="'paragraph_' + fieldIndex" :rows="3"
                                            :placeholder="$t('forms.fields.paragraphPlaceholder')"
                                            v-model="state.form.fields[fieldIndex].value" />
                                        <p v-else class="text-sm text-gray-500">
                                            {{ $t('forms.fields.pagebreakHint') }}
                                        </p>
                                        <p v-if="field.type === 'guidance'" class="text-xs text-gray-500">
                                            {{ $t('forms.fields.guidanceHint') }}
                                        </p>
                                        <ModulesUserFormMergeFieldPicker
                                            v-if="field.type !== 'pagebreak'"
                                            @insert="(key) => appendMergeField(fieldIndex, key)" />
                                    </div>
                                </div>
                                <div v-if="state.form.layout_mode === 'document' && !isLayoutBlock(field.type)"
                                    class="px-5 pb-4 space-y-3">
                                    <hr class="mb-3" />
                                    <div class="space-y-1">
                                        <FormLabel :for="'help_text_' + fieldIndex"
                                            :label="$t('forms.fields.helpText')" />
                                        <FormTextField :id="'help_text_' + fieldIndex"
                                            :name="'help_text_' + fieldIndex"
                                            :placeholder="$t('forms.fields.helpTextPlaceholder')"
                                            v-model="state.form.fields[fieldIndex].helpText" />
                                    </div>
                                    <div class="flex items-center gap-x-3">
                                        <span class="text-sm text-gray-600">{{ $t('forms.fields.width') }}</span>
                                        <div class="w-48">
                                            <FormSelect :id="'width_' + fieldIndex" :options="fieldWidthOptions"
                                                :canClear="false" :searchable="false"
                                                :modelValue="state.form.fields[fieldIndex].width ?? 'full'"
                                                @update:modelValue="(v) => state.form.fields[fieldIndex].width = v" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="space-y-3" :class="state.form.fields?.length > 0 && 'mt-8'">
                    <div class="w-fit" @click="state.showFieldsAdder = !state.showFieldsAdder">
                        <div class="w-fit flex items-center gap-x-2 cursor-pointer">
                            <Icon name="ph:x-circle-fill" class="h-5 w-5 text-primary" aria-hidden="true"
                                v-if="state.showFieldsAdder" />
                            <Icon name="ph:plus-circle-fill" class="h-5 w-5 text-primary" aria-hidden="true" v-else />
                            <p v-if="state.form.fields?.length === 0">
                                {{ $t('forms.quickStartWith') }}
                            </p>
                            <p v-else>{{ $t('forms.addNewQuestion') }}</p>
                        </div>
                    </div>
                    <div v-if="state.showFieldsAdder" class="space-y-5">
                        <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            {{ $t('forms.groups.questions') }}
                        </p>
                        <div class="grid grid-cols-3 gap-x-3 gap-y-5">
                        <button class="px-5 py-4 border border-primary rounded-md bg-gray-50 hover:bg-gray-100"
                                @click="addTextField">
                                <div class="flex items-center gap-x-2 text-sm">
                                    <Icon name="solar:text-outline" class="w-5 h-5 text-primary" aria-hidden="true" />
                                    {{ $t('forms.fields.text') }}
                                </div>
                            </button>
                        <button class="px-5 py-4 border border-primary rounded-md bg-gray-50 hover:bg-gray-100"
                                @click="addTextarea">
                                <div class="flex items-center gap-x-2 text-sm">
                                    <Icon name="ph:file-text" class="w-5 h-5 text-primary" aria-hidden="true" />
                                    {{ $t('forms.fields.textarea') }}
                                </div>
                            </button>
                        <button class="px-5 py-4 border border-primary rounded-md bg-gray-50 hover:bg-gray-100"
                                @click="addDateField">
                                <div class="flex items-center gap-x-2 text-sm">
                                    <Icon name="ph:calendar" class="w-5 h-5 text-primary" aria-hidden="true" />
                                    {{ $t('forms.fields.date') }}
                                </div>
                            </button>
                        <button class="px-5 py-4 border border-primary rounded-md bg-gray-50 hover:bg-gray-100"
                                @click="addChoiceField">
                                <div class="flex items-center gap-x-2 text-sm">
                                    <Icon name="mdi:circle-slice-8" class="w-5 h-5 text-primary" aria-hidden="true" />
                                    {{ $t('forms.fields.choice') }}
                                </div>
                            </button>
                        <button class="px-5 py-4 border border-primary rounded-md bg-gray-50 hover:bg-gray-100"
                                @click="addCheckbox">
                                <div class="flex items-center gap-x-2 text-sm">
                                    <Icon name="ph:check-square" class="w-5 h-5 text-primary" aria-hidden="true" />
                                    {{ $t('forms.fields.checkbox') }}
                                </div>
                            </button>
                        <button class="px-5 py-4 border border-primary rounded-md bg-gray-50 hover:bg-gray-100"
                                @click="addRating">
                                <div class="flex items-center gap-x-2 text-sm">
                                    <Icon name="material-symbols:thumb-up-outline-sharp" class="w-5 h-5 text-primary"
                                        aria-hidden="true" />
                                    {{ $t('forms.fields.rating') }}
                                </div>
                            </button>
                        <button class="px-5 py-4 border border-primary rounded-md bg-gray-50 hover:bg-gray-100"
                                @click="addUploadFile">
                                <div class="flex items-center gap-x-2 text-sm">
                                    <Icon name="material-symbols:upload-rounded" class="w-5 h-5 text-primary"
                                        aria-hidden="true" />
                                    {{ $t('forms.fields.uploadFile') }}
                                </div>
                            </button>
                        <button class="px-5 py-4 border border-primary rounded-md bg-gray-50 hover:bg-gray-100"
                                @click="addScale">
                                <div class="flex items-center gap-x-2 text-sm">
                                    <Icon name="ph:ruler" class="w-5 h-5 text-primary" aria-hidden="true" />
                                    {{ $t('forms.fields.scale') }}
                                </div>
                            </button>
                        </div>

                        <div>
                            <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                {{ $t('forms.groups.layout') }}
                            </p>
                            <p v-if="state.form.layout_mode !== 'document'" class="text-xs text-gray-500 mt-1">
                                {{ $t('forms.groups.layoutNeedsDocument') }}
                            </p>
                        </div>
                        <div class="grid grid-cols-3 gap-x-3 gap-y-5">
                        <button class="px-5 py-4 border border-primary rounded-md bg-gray-50 hover:bg-gray-100"
                                @click="addHeading">
                                <div class="flex items-center gap-x-2 text-sm">
                                    <Icon name="ph:text-h-one" class="w-5 h-5 text-primary" aria-hidden="true" />
                                    {{ $t('forms.fields.heading') }}
                                </div>
                            </button>
                        <button class="px-5 py-4 border border-primary rounded-md bg-gray-50 hover:bg-gray-100"
                                @click="addSubheading">
                                <div class="flex items-center gap-x-2 text-sm">
                                    <Icon name="ph:text-h-two" class="w-5 h-5 text-primary" aria-hidden="true" />
                                    {{ $t('forms.fields.subheading') }}
                                </div>
                            </button>
                        <button class="px-5 py-4 border border-primary rounded-md bg-gray-50 hover:bg-gray-100"
                                @click="addParagraph">
                                <div class="flex items-center gap-x-2 text-sm">
                                    <Icon name="ph:paragraph" class="w-5 h-5 text-primary" aria-hidden="true" />
                                    {{ $t('forms.fields.paragraph') }}
                                </div>
                            </button>
                        <button class="px-5 py-4 border border-primary rounded-md bg-gray-50 hover:bg-gray-100"
                                @click="addGuidance">
                                <div class="flex items-center gap-x-2 text-sm">
                                    <Icon name="ph:info" class="w-5 h-5 text-primary" aria-hidden="true" />
                                    {{ $t('forms.fields.guidance') }}
                                </div>
                            </button>
                        <button class="px-5 py-4 border border-primary rounded-md bg-gray-50 hover:bg-gray-100"
                                @click="addPageBreak">
                                <div class="flex items-center gap-x-2 text-sm">
                                    <Icon name="ph:scissors" class="w-5 h-5 text-primary" aria-hidden="true" />
                                    {{ $t('forms.fields.pagebreak') }}
                                </div>
                            </button>
                        </div>
                    </div>
                    <FormError :error="state?.error?.errors?.fields?.[0]" />
                </div>
            </div>
        </div>

        <div class="mt-6 space-y-3">
            <FormButton type="button" buttonStyle="action" @click="previewDocument" :disabled="state.isPreviewing">
                <Icon name="ph:file-magnifying-glass" class="h-4 w-4" aria-hidden="true" />
                {{ state.isPreviewing ? $t('forms.previewDocument.working') : $t('forms.previewDocument.button') }}
            </FormButton>
            <p class="text-xs text-gray-500">{{ $t('forms.previewDocument.hint') }}</p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" @click="navigateTo('/forms')">
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
import { useUserStore } from '@/store/user'
import { useTerminology } from '@/composables/useTerminology'
import type { Error } from '@/types'
import { formService } from '@/components/api/user/FormService'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedForm: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])

const { t } = useI18n()
const { term } = useTerminology()
const userStore = useUserStore() as any

const isAdmin = computed(() => {
    return userStore.getUser?.roles?.some((role: any) => role.name === 'Admin') ?? false
})

const state = reactive({
    error: {} as Error,
    form: {
        description: '',
        fields: [] as any,
        title: '',
        document_title: '',
        is_follow_up_enabled: false,
        follow_up_duration: '',
        show_citizen_profile_data: true,
        citizen_profile_fields: ['citizen_name'] as string[],
        layout_mode: 'classic',
        show_numbering: true,
    },
    showFieldsAdder: true,
    isPreviewing: false,
    followUpNumber: '1',
    followUpUnit: 'Days',
})

const followUpUnits = [
    { value: 'Days', label: t('plansandgoals.createStatusTemplate.form.days') },
    { value: 'Weeks', label: t('plansandgoals.createStatusTemplate.form.weeks') },
    { value: 'Months', label: t('plansandgoals.createStatusTemplate.form.months') },
    { value: 'Years', label: t('plansandgoals.createStatusTemplate.form.years') },
]

const citizenAutoFillOptions = [
    { value: '', label: t('forms.fields.autoFill.none') },
    { value: 'citizen_name', label: t('forms.fields.autoFill.citizenName') },
    { value: 'citizen_cpr', label: t('forms.fields.autoFill.citizenCpr') },
    { value: 'citizen_birthday', label: t('forms.fields.autoFill.citizenBirthday') },
    { value: 'citizen_admission_date', label: t('forms.fields.autoFill.citizenAdmissionDate') },
    { value: 'citizen_discharge_date', label: t('forms.fields.autoFill.citizenDischargeDate') },
]

const citizenAutoFillDateOptions = citizenAutoFillOptions.filter((option) =>
    ['', 'citizen_birthday', 'citizen_admission_date', 'citizen_discharge_date'].includes(option.value)
)

const citizenProfileFieldOptions = computed(() => [
    { key: 'citizen_name', label: t('forms.citizenProfileFields.citizenName') },
    { key: 'citizen_cpr', label: t('forms.citizenProfileFields.citizenCpr') },
    { key: 'citizen_email', label: t('forms.citizenProfileFields.citizenEmail') },
    { key: 'citizen_phone', label: t('forms.citizenProfileFields.citizenPhone') },
    { key: 'citizen_birthday', label: t('forms.citizenProfileFields.citizenBirthday') },
    { key: 'primary_case_worker', label: term('caseworker', t('forms.citizenProfileFields.primaryCaseWorker')) },
    { key: 'paying_municipality', label: t('forms.citizenProfileFields.payingMunicipality') },
])

function isCitizenProfileFieldSelected(key: string): boolean {
    return state.form.citizen_profile_fields.includes(key)
}

function toggleCitizenProfileField(key: string) {
    const index = state.form.citizen_profile_fields.indexOf(key)
    if (index === -1) {
        state.form.citizen_profile_fields.push(key)
    } else {
        state.form.citizen_profile_fields.splice(index, 1)
    }
}

function formatFollowUpDuration() {
    return `${state.followUpNumber} ${state.followUpUnit}`
}

watch(() => [state.followUpNumber, state.followUpUnit], () => {
    state.form.follow_up_duration = formatFollowUpDuration()
}, { immediate: true })

watch(() => props.selectedForm, (selectedForm: any) => {
    if (selectedForm) {
        state.form.title = selectedForm.title
        state.form.description = selectedForm.description
        state.form.fields = selectedForm.fields
        if (selectedForm.document_title) {
            state.form.document_title = selectedForm.document_title
        }
        if (selectedForm.is_follow_up_enabled !== undefined) {
            state.form.is_follow_up_enabled = selectedForm.is_follow_up_enabled
            if (selectedForm.follow_up_duration) {
                const parts = selectedForm.follow_up_duration.split(' ')
                if (parts.length === 2) {
                    state.followUpNumber = parts[0]
                    state.followUpUnit = parts[1]
                }
            }
        }
        if (selectedForm.show_citizen_profile_data !== undefined) {
            state.form.show_citizen_profile_data = selectedForm.show_citizen_profile_data
        }
        if (selectedForm.layout_mode) {
            state.form.layout_mode = selectedForm.layout_mode
        }
        if (selectedForm.show_numbering !== undefined) {
            state.form.show_numbering = selectedForm.show_numbering
        }
        if (selectedForm.citizen_profile_fields) {
            state.form.citizen_profile_fields = selectedForm.citizen_profile_fields
        }
    }
}, { immediate: true })

const rules = computed(() => {
    return {
        form: {
            title: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            description: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function addTextField() {
    state.form.fields.push({ type: 'textfield', value: `${t('forms.question')}`, required: false, autoFillSource: '' })
    state.showFieldsAdder = false
}

function addTextarea() {
    state.form.fields.push({ type: 'textarea', value: `${t('forms.question')}`, required: false, autoFillSource: '' })
    state.showFieldsAdder = false
}

function addDateField() {
    state.form.fields.push({ type: 'datefield', value: `${t('forms.question')}`, required: false, autoFillSource: '' })
    state.showFieldsAdder = false
}

function addChoiceField() {
    state.form.fields.push({ type: 'choice', value: `${t('forms.question')}`, required: false, options: [`${t('forms.option')} 1`, `${t('forms.option')} 2`] })
    state.showFieldsAdder = false
}

function addCheckbox() {
    state.form.fields.push({ type: 'checkbox', value: `${t('forms.question')}`, required: false, options: [`${t('forms.option')} 1`, `${t('forms.option')} 2`] })
    state.showFieldsAdder = false
}

function addRating() {
    state.form.fields.push({ type: 'rating', value: `${t('forms.question')}`, required: false, levels: 2 })
    state.showFieldsAdder = false
}

function addUploadFile() {
    state.form.fields.push({ type: 'uploadfile', value: `${t('forms.question')}`, required: false })
    state.showFieldsAdder = false
}

function addRadioOption(fieldIndex: number) {
    if (state.form.fields[fieldIndex].type === 'choice') {
        state.form.fields[fieldIndex].options?.push(`${t('forms.option')} ${state.form.fields[fieldIndex].options!.length + 1}`)
    }
}

function removeRadioButton(fieldIndex: number, radioIndex: number) {
    if (state.form.fields[fieldIndex].type === 'choice') {
        state.form.fields[fieldIndex].options.splice(radioIndex, 1)
    }
}

function addCheckboxOption(fieldIndex: number) {
    if (state.form.fields[fieldIndex].type === 'checkbox') {
        state.form.fields[fieldIndex].options?.push(`${t('forms.option')} ${state.form.fields[fieldIndex].options!.length + 1}`)
    }
}

function removeCheckboxOption(fieldIndex: number, radioIndex: number) {
    if (state.form.fields[fieldIndex].type === 'checkbox') {
        state.form.fields[fieldIndex].options.splice(radioIndex, 1)
    }
}

const LAYOUT_BLOCK_TYPES = ['heading', 'subheading', 'paragraph', 'guidance', 'pagebreak']

function isLayoutBlock(type: string): boolean {
    return LAYOUT_BLOCK_TYPES.includes(type)
}

const fieldWidthOptions = computed(() => [
    { value: 'full', label: t('forms.fields.widthFull') },
    { value: 'half', label: t('forms.fields.widthHalf') },
])

function toggleLayoutMode() {
    state.form.layout_mode = state.form.layout_mode === 'document' ? 'classic' : 'document'
}

/**
 * Seeded with the five steps Danish social-care reports use, so a new scale is
 * usable without setting anything up. Everything here is editable afterwards.
 */
function addScale() {
    state.form.fields.push({
        type: 'scale',
        value: `${t('forms.fields.scale')}`,
        required: false,
        scaleKey: 'trivsel',
        maxScore: 10,
        bands: [
            { to: 2, label: `${t('forms.scale.defaults.threatened')}`, color: '#96263a' },
            { to: 4, label: `${t('forms.scale.defaults.atRisk')}`, color: '#d9634a' },
            { to: 6, label: `${t('forms.scale.defaults.vulnerable')}`, color: '#e0ab3d' },
            { to: 8, label: `${t('forms.scale.defaults.moderate')}`, color: '#93b25c' },
            { to: 10, label: `${t('forms.scale.defaults.thriving')}`, color: '#2f8577' },
        ],
        raters: [
            { key: 'staff', label: `${t('forms.scale.defaults.staff')}` },
            { key: 'caseworker', label: `${t('forms.scale.defaults.caseworker')}` },
            { key: 'mother', label: `${t('forms.scale.defaults.mother')}` },
            { key: 'father', label: `${t('forms.scale.defaults.father')}` },
            { key: 'citizen', label: `${t('forms.scale.defaults.citizen')}` },
        ],
        showHistory: true,
        perGoal: false,
    })
}

/**
 * Appended rather than inserted at the caret: the block editors are plain
 * inputs, and reaching into their selection from here would tie the builder to
 * how each one happens to be rendered. The administrator moves it if it belongs
 * elsewhere in the line.
 */
function appendMergeField(fieldIndex: number, key: string) {
    const field = state.form.fields[fieldIndex]
    const current = field.value ?? ''
    field.value = current.length > 0 && !current.endsWith(' ') ? `${current} ${key}` : `${current}${key}`
}

function addHeading() {
    state.form.fields.push({ type: 'heading', value: `${t('forms.fields.heading')}` })
}

function addSubheading() {
    state.form.fields.push({ type: 'subheading', value: `${t('forms.fields.subheading')}` })
}

function addParagraph() {
    state.form.fields.push({ type: 'paragraph', value: '' })
}

function addGuidance() {
    state.form.fields.push({ type: 'guidance', value: '' })
}

function addPageBreak() {
    state.form.fields.push({ type: 'pagebreak', value: '' })
}

/**
 * Up and down rather than drag: the block editors are tall and a drag surface
 * over a form full of inputs is easy to trigger by accident.
 */
function moveField(fieldIndex: number, direction: number) {
    const target = fieldIndex + direction
    if (target < 0 || target >= state.form.fields.length) return

    const fields = state.form.fields
    const [moved] = fields.splice(fieldIndex, 1)
    fields.splice(target, 0, moved)
}

function duplicateField(fieldIndex: number) {
    const copy = JSON.parse(JSON.stringify(state.form.fields[fieldIndex]))
    state.form.fields.splice(fieldIndex + 1, 0, copy)
}

function removeField(fieldIndex: number) {
    state.form.fields.splice(fieldIndex, 1)
    if (state.form.fields?.length === 0) {
        state.showFieldsAdder = true
    }
}

/**
 * Opens the document the template would produce, with stand-in answers, without
 * saving anything. Before this the only way to see a change was to save, leave,
 * find a citizen, write a whole report and download it.
 */
async function previewDocument() {
    state.isPreviewing = true
    try {
        const pdf = await formService.previewForm({
            title: state.form.title,
            description: state.form.description,
            document_title: state.form.document_title,
            layout_mode: state.form.layout_mode,
            show_numbering: state.form.show_numbering,
            fields: state.form.fields,
        })
        if (pdf) {
            const url = URL.createObjectURL(pdf)
            window.open(url, '_blank', 'noopener')
            // Freed on the next tick; revoking at once leaves the new tab blank.
            setTimeout(() => URL.revokeObjectURL(url), 60000)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPreviewing = false
}

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.form)
    }
}
</script>