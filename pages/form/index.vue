<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('form.form') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('form.form') }}</template>

            <div class="max-w-5xl mx-auto space-y-5">
                <div class="space-y-3 px-4 py-6 sm:p-8 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
                    <div class="space-y-1">
                        <FormLabel for="form_title" :label="$t('form.formTitle')" />
                        <FormTextField id="form_title" name="form_title" :placeholder="$t('form.formTitle')" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="form_description" :label="$t('form.formDescription')" />
                        <FormTextArea id="form_description" name="form_description"
                            :placeholder="$t('form.formDescription')" :rows="2" />
                    </div>
                </div>

                <div class="space-y-3 px-4 py-6 sm:p-8 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
                    <div>
                        <div class="space-y-8 mt-5">
                            <div v-for="(field, fieldIndex) in state.fields" :key="fieldIndex" class="space-y-3">
                                <div class="bg-gray-100 rounded-md border-t-2 border-primary">
                                    <div>
                                        <div v-if="field.type === 'textfield'" class="grow">
                                            <div class="p-5 space-y-3">
                                                <div class="flex items-center justify-end">
                                                    <button @click="removeField(fieldIndex)">
                                                        <Icon name="ph:trash" class="h-5 w-5" aria-hidden="true" />
                                                    </button>
                                                </div>
                                                <div class="flex gap-x-3">
                                                    <div class="mt-2">{{ fieldIndex + 1 }}.</div>
                                                    <div class="grow space-y-3">
                                                        <FormTextField :name="'text_field_' + fieldIndex"
                                                            placeholder="Input your question title here"
                                                            v-model="state.fields[fieldIndex].value" />
                                                        <FormTextField :name="'text_field_' + fieldIndex"
                                                            placeholder="Enter your answer" :disabled="true" />
                                                    </div>
                                                </div>
                                            </div>
                                            <hr />
                                            <div class="px-5 py-3">
                                                <div class="flex items-center justify-end gap-x-2">
                                                    <FormSwitch :value="state.fields[fieldIndex].required"
                                                        @toggleSwitch="state.fields[fieldIndex].required = !state.fields[fieldIndex].required" />
                                                    <p>
                                                        {{ $t('form.fields.required') }}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div v-if="field.type === 'textarea'" class="grow">
                                            <div class="p-5 space-y-3">
                                                <div class="flex items-center justify-end">
                                                    <button @click="removeField(fieldIndex)">
                                                        <Icon name="ph:trash" class="h-5 w-5" aria-hidden="true" />
                                                    </button>
                                                </div>
                                                <div class="flex gap-x-3">
                                                    <div class="mt-2">{{ fieldIndex + 1 }}.</div>
                                                    <div class="grow space-y-3">
                                                        <FormTextField :name="'textarea_' + fieldIndex"
                                                            placeholder="Input your question title here"
                                                            v-model="state.fields[fieldIndex].value" />
                                                        <FormTextArea :name="'textarea_' + fieldIndex"
                                                            placeholder="Enter your answer" :disabled="true" />
                                                    </div>
                                                </div>
                                            </div>
                                            <hr />
                                            <div class="px-5 py-3">
                                                <div class="flex items-center justify-end gap-x-2">
                                                    <FormSwitch :value="state.fields[fieldIndex].required"
                                                        @toggleSwitch="state.fields[fieldIndex].required = !state.fields[fieldIndex].required" />
                                                    <p>
                                                        {{ $t('form.fields.required') }}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div v-if="field.type === 'choice'" class="grow">
                                            <div class="p-5 space-y-3">
                                                <div class="flex items-center justify-end">
                                                    <button @click="removeField(fieldIndex)">
                                                        <Icon name="ph:trash" class="h-5 w-5" aria-hidden="true" />
                                                    </button>
                                                </div>
                                                <div class="flex gap-x-3">
                                                    <div class="mt-2">{{ fieldIndex + 1 }}.</div>
                                                    <div class="grow space-y-3">
                                                        <FormTextField :name="'text_field_' + fieldIndex"
                                                            placeholder="Input your question title here"
                                                            v-model="state.fields[fieldIndex].value" />
                                                        <div class="space-y-3">
                                                            <div v-for="(radio, radioIndex) in state.fields[fieldIndex].options"
                                                                :key="radioIndex" class="flex items-center gap-x-2">
                                                                <FormRadioButton
                                                                    :name="`choice_${fieldIndex}_${radioIndex}`"
                                                                    :disabled="true" />
                                                                <FormTextField
                                                                    :name="`text_field_${fieldIndex}_${radioIndex}`"
                                                                    :placeholder="`Option ${radioIndex + 1}`"
                                                                    v-model="state.fields[fieldIndex].options[radioIndex]" />
                                                                <button class="flex items-center"
                                                                    @click="removeRadioButton(fieldIndex, radioIndex)"
                                                                    v-if="state.fields[fieldIndex].options.length > 2">
                                                                    <Icon name="ph:trash" class="h-5 w-5"
                                                                        aria-hidden="true" />
                                                                </button>
                                                            </div>
                                                            <button @click="addRadioOption(fieldIndex)" type="button"
                                                                class="text-primary-500 text-sm mt-2 hover:text-primary-700">
                                                                Add option
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <hr />
                                            <div class="px-5 py-3">
                                                <div class="flex items-center justify-end gap-x-2">
                                                    <FormSwitch :value="state.fields[fieldIndex].required"
                                                        @toggleSwitch="state.fields[fieldIndex].required = !state.fields[fieldIndex].required" />
                                                    <p>
                                                        {{ $t('form.fields.required') }}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div v-if="field.type === 'checkbox'" class="grow">
                                            <div class="p-5 space-y-3">
                                                <div class="flex items-center justify-end">
                                                    <button @click="removeField(fieldIndex)">
                                                        <Icon name="ph:trash" class="h-5 w-5" aria-hidden="true" />
                                                    </button>
                                                </div>
                                                <div class="flex gap-x-3">
                                                    <div class="mt-2">{{ fieldIndex + 1 }}.</div>
                                                    <div class="grow space-y-3">
                                                        <FormTextField :name="'text_field_' + fieldIndex"
                                                            placeholder="Input your question title here"
                                                            v-model="state.fields[fieldIndex].value" />
                                                        <div class="space-y-3">
                                                            <div v-for="(checkbox, checkboxIndex) in state.fields[fieldIndex].options"
                                                                :key="checkboxIndex" class="flex items-center gap-x-2">
                                                                <FormCheckbox
                                                                    :name="`choice_${fieldIndex}_${checkboxIndex}`"
                                                                    :disabled="true" />
                                                                <FormTextField
                                                                    :name="`text_field_${fieldIndex}_${checkboxIndex}`"
                                                                    :placeholder="`Option ${checkboxIndex + 1}`"
                                                                    v-model="state.fields[fieldIndex].options[checkboxIndex]" />
                                                                <button class="flex items-center"
                                                                    @click="removeCheckboxOption(fieldIndex, checkboxIndex)"
                                                                    v-if="state.fields[fieldIndex].options.length > 1">
                                                                    <Icon name="ph:trash" class="h-5 w-5"
                                                                        aria-hidden="true" />
                                                                </button>
                                                            </div>
                                                            <button @click="addCheckboxOption(fieldIndex)" type="button"
                                                                class="text-primary-500 text-sm mt-2 hover:text-primary-700">
                                                                Add option
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <hr />
                                            <div class="px-5 py-3">
                                                <div class="flex items-center justify-end gap-x-2">
                                                    <FormSwitch :value="state.fields[fieldIndex].required"
                                                        @toggleSwitch="state.fields[fieldIndex].required = !state.fields[fieldIndex].required" />
                                                    <p>
                                                        {{ $t('form.fields.required') }}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div v-if="field.type === 'rating'" class="grow">
                                            <div class="p-5 space-y-3">
                                                <div class="flex items-center justify-end">
                                                    <button @click="removeField(fieldIndex)">
                                                        <Icon name="ph:trash" class="h-5 w-5" aria-hidden="true" />
                                                    </button>
                                                </div>
                                                <div class="flex gap-x-3">
                                                    <div class="mt-2">{{ fieldIndex + 1 }}.</div>
                                                    <div class="grow space-y-3">
                                                        <FormTextField :name="'textarea_' + fieldIndex"
                                                            placeholder="Input your question title here"
                                                            v-model="state.fields[fieldIndex].value" />
                                                        <div class="flex items-center justify-between gap-x-2">
                                                            <div v-for="(rating, ratingIndex) in state.fields[fieldIndex].levels"
                                                                :key="ratingIndex"
                                                                class="w-full h-10 flex items-center justify-center border border-gray-300 rounded-sm">
                                                                {{ rating }}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            Levels:
                                                            <select v-model="state.fields[fieldIndex].levels"
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
                                                    <FormSwitch :value="state.fields[fieldIndex].required"
                                                        @toggleSwitch="state.fields[fieldIndex].required = !state.fields[fieldIndex].required" />
                                                    <p>
                                                        {{ $t('form.fields.required') }}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div v-if="field.type === 'datefield'" class="grow">
                                            <div class="p-5 space-y-3">
                                                <div class="flex items-center justify-end">
                                                    <button @click="removeField(fieldIndex)">
                                                        <Icon name="ph:trash" class="h-5 w-5" aria-hidden="true" />
                                                    </button>
                                                </div>
                                                <div class="flex gap-x-3">
                                                    <div class="mt-2">{{ fieldIndex + 1 }}.</div>
                                                    <div class="grow space-y-3">
                                                        <FormTextField :name="'date_field_' + fieldIndex"
                                                            placeholder="Input your question title here"
                                                            v-model="state.fields[fieldIndex].value" />
                                                        <div class="relative">
                                                            <FormDateField :name="'date_field_' + fieldIndex"
                                                                placeholder="Enter your answer" :disabled="true" />
                                                            <Icon name="ph:calendar"
                                                                class="h-5 w-5 absolute right-4 top-2.5 text-gray-500"
                                                                aria-hidden="true" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <hr />
                                            <div class="px-5 py-3">
                                                <div class="flex items-center justify-end gap-x-2">
                                                    <FormSwitch :value="state.fields[fieldIndex].required"
                                                        @toggleSwitch="state.fields[fieldIndex].required = !state.fields[fieldIndex].required" />
                                                    <p>
                                                        {{ $t('form.fields.required') }}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div v-if="field.type === 'uploadfile'" class="grow">
                                            <div>
                                                <div class="p-5 space-y-3">
                                                    <div class="flex items-center justify-end">
                                                        <button @click="removeField(fieldIndex)">
                                                            <Icon name="ph:trash" class="h-5 w-5" aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                    <div class="flex gap-x-3">
                                                        <div class="mt-2">{{ fieldIndex + 1 }}.</div>
                                                        <div class="grow space-y-4">
                                                            <FormTextField :name="'upload_file_' + fieldIndex"
                                                                placeholder="Input your question title here"
                                                                v-model="state.fields[fieldIndex].value" />
                                                            <div class="flex items-center gap-x-2 text-sm">
                                                                <Icon name="material-symbols:upload-rounded"
                                                                    class="w-4 h-4 text-primary" aria-hidden="true" />
                                                                Upload File
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <hr />
                                            <div class="px-5 py-3">
                                                <div class="flex items-center justify-end gap-x-2">
                                                    <FormSwitch :value="state.fields[fieldIndex].required"
                                                        @toggleSwitch="state.fields[fieldIndex].required = !state.fields[fieldIndex].required" />
                                                    <p>
                                                        {{ $t('form.fields.required') }}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="mt-8 space-y-3">
                            <div class="w-fit" @click="state.showFieldsAdder = !state.showFieldsAdder">
                                <div class="w-fit flex items-center gap-x-2 cursor-pointer">
                                    <Icon name="ph:x-circle-fill" class="h-5 w-5 text-primary" aria-hidden="true"
                                        v-if="state.showFieldsAdder" />
                                    <Icon name="ph:plus-circle-fill" class="h-5 w-5 text-primary" aria-hidden="true"
                                        v-else />
                                    <p v-if="state.fields?.length === 0">
                                        {{ $t('form.quickStartWith') }}
                                    </p>
                                    <p v-else>{{ $t('form.addNewQuestion') }}</p>
                                </div>
                            </div>
                            <div class="grid grid-cols-3 gap-x-3 gap-y-5" v-if="state.showFieldsAdder">
                                <button class="px-5 py-4 border border-primary rounded-md bg-gray-50 hover:bg-gray-100"
                                    @click="addTextField">
                                    <div class="flex items-center gap-x-2 text-sm">
                                        <Icon name="solar:text-outline" class="w-5 h-5 text-primary"
                                            aria-hidden="true" />
                                        {{ $t('form.fields.text') }}
                                    </div>
                                </button>
                                <button class="px-5 py-4 border border-primary rounded-md bg-gray-50 hover:bg-gray-100"
                                    @click="addTextarea">
                                    <div class="flex items-center gap-x-2 text-sm">
                                        <Icon name="ph:file-text" class="w-5 h-5 text-primary" aria-hidden="true" />
                                        {{ $t('form.fields.textarea') }}
                                    </div>
                                </button>
                                <button class="px-5 py-4 border border-primary rounded-md bg-gray-50 hover:bg-gray-100"
                                    @click="addDateField">
                                    <div class="flex items-center gap-x-2 text-sm">
                                        <Icon name="ph:calendar" class="w-5 h-5 text-primary" aria-hidden="true" />
                                        {{ $t('form.fields.date') }}
                                    </div>
                                </button>
                                <button class="px-5 py-4 border border-primary rounded-md bg-gray-50 hover:bg-gray-100"
                                    @click="addChoiceField">
                                    <div class="flex items-center gap-x-2 text-sm">
                                        <Icon name="mdi:circle-slice-8" class="w-5 h-5 text-primary"
                                            aria-hidden="true" />
                                        {{ $t('form.fields.choice') }}
                                    </div>
                                </button>
                                <button class="px-5 py-4 border border-primary rounded-md bg-gray-50 hover:bg-gray-100"
                                    @click="addCheckbox">
                                    <div class="flex items-center gap-x-2 text-sm">
                                        <Icon name="ph:check-square" class="w-5 h-5 text-primary" aria-hidden="true" />
                                        {{ $t('form.fields.checkbox') }}
                                    </div>
                                </button>
                                <button class="px-5 py-4 border border-primary rounded-md bg-gray-50 hover:bg-gray-100"
                                    @click="addRating">
                                    <div class="flex items-center gap-x-2 text-sm">
                                        <Icon name="material-symbols:thumb-up-outline-sharp"
                                            class="w-5 h-5 text-primary" aria-hidden="true" />
                                        {{ $t('form.fields.rating') }}
                                    </div>
                                </button>
                                <button class="px-5 py-4 border border-primary rounded-md bg-gray-50 hover:bg-gray-100"
                                    @click="addUploadFile">
                                    <div class="flex items-center gap-x-2 text-sm">
                                        <Icon name="material-symbols:upload-rounded" class="w-5 h-5 text-primary"
                                            aria-hidden="true" />
                                        {{ $t('form.fields.uploadFile') }}
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()

const state = reactive({
    fields: [] as any,
    showFieldsAdder: true,
})

function addTextField() {
    state.fields.push({ type: 'textfield', value: 'Question', required: false })
    state.showFieldsAdder = false
}

function addTextarea() {
    state.fields.push({ type: 'textarea', value: 'Question', required: false })
    state.showFieldsAdder = false
}

function addDateField() {
    state.fields.push({ type: 'datefield', value: 'Question', required: false })
    state.showFieldsAdder = false
}

function addChoiceField() {
    state.fields.push({ type: 'choice', value: '', required: false, options: ['Option 1', 'Option 2'] })
    state.showFieldsAdder = false
}

function addCheckbox() {
    state.fields.push({ type: 'checkbox', value: '', required: false, options: ['Option 1', 'Option 2'] })
    state.showFieldsAdder = false
}

function addRating() {
    state.fields.push({ type: 'rating', value: '', required: false, levels: 2 })
    state.showFieldsAdder = false
}

function addUploadFile() {
    state.fields.push({ type: 'uploadfile', value: 'Question', required: false })
    state.showFieldsAdder = false
}

function addRadioOption(fieldIndex: number) {
    if (state.fields[fieldIndex].type === 'choice') {
        state.fields[fieldIndex].options?.push(`Option ${state.fields[fieldIndex].options!.length + 1}`)
    }
}

function removeRadioButton(fieldIndex: number, radioIndex: number) {
    if (state.fields[fieldIndex].type === 'choice') {
        state.fields[fieldIndex].options.splice(radioIndex, 1)
    }
}

function addCheckboxOption(fieldIndex: number) {
    if (state.fields[fieldIndex].type === 'checkbox') {
        state.fields[fieldIndex].options?.push(`Option ${state.fields[fieldIndex].options!.length + 1}`)
    }
}

function removeCheckboxOption(fieldIndex: number, radioIndex: number) {
    if (state.fields[fieldIndex].type === 'checkbox') {
        state.fields[fieldIndex].options.splice(radioIndex, 1)
    }
}

function removeField(fieldIndex: number) {
    state.fields.splice(fieldIndex, 1)
}
</script>