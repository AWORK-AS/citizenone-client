<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>Form - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>Form</template>

            <div class="max-w-5xl mx-auto space-y-5">
                <div class="space-y-3 px-4 py-6 sm:p-8 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
                    <div class="space-y-1">
                        <FormLabel for="form_title" label="Form title" />
                        <FormTextField id="form_title" name="form_title" placeholder="Form title" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="form_description" label="Form description" />
                        <FormTextArea id="form_description" name="form_description" placeholder="Form description"
                            :rows="2" />
                    </div>
                </div>

                {{ typeof (state.fields) }}

                <div class="space-y-3 px-4 py-6 sm:p-8 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
                    <div>
                        <!-- Dynamically added text state.fields -->
                        <div class="space-y-8 mt-5">
                            <div v-for="(field, fieldIndex) in state.fields" :key="fieldIndex" class="space-y-3">
                                <div class="bg-gray-100 rounded-md p-5 border-t-2 border-primary">
                                    <div class="gap-x-3">
                                        <div v-if="field.type === 'textfield'" class="grow space-y-3">
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
                                        <div v-if="field.type === 'textarea'" class="grow space-y-3">
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
                                        <div v-if="field.type === 'choice'" class="grow space-y-3">
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
                                                            class="text-blue-500 text-sm mt-2">
                                                            Add option
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <!-- <div v-if="field.type === 'choice'" class="grow space-y-3">
                                            <div class="flex items-center gap-x-3">
                                                <div>{{ index + 1 }}.</div>
                                                <FormTextField :name="'dynamic_text_' + index"
                                                    placeholder="Enter text" />
                                            </div>
                                            <div class="ml-5">
                                                <FormTextField :name="'dynamic_text_' + index"
                                                    placeholder="Enter your answer" :disabled="true" />
                                            </div>
                                        </div> -->
                                        <!-- <div v-else-if="field.type === 'choice'" class="space-y-1">
                                            <FormLabel :for="'dynamic_choice_' + index"
                                                :label="'Choice Field ' + (index + 1)" />
                                            <FormTextField :id="'dynamic_choice_' + index"
                                                :name="'dynamic_choice_' + index" placeholder="Enter choice text" />
                                            <div class="flex items-center space-x-4 mt-2">
                                                <label v-for="n in 2" :key="n" class="flex items-center space-x-2">
                                                    <input type="radio" :name="'choice_' + index"
                                                        :id="'choice_' + index + '_option' + n" />
                                                    <span>Option {{ n }}</span>
                                                </label>
                                            </div>
                                            <button @click="addRadioOption(index)" type="button"
                                                class="text-blue-500 text-sm mt-2">Add
                                                Option</button>
                                        </div> -->
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="mt-5 grid grid-cols-3 gap-x-3 gap-y-5">
                            <button class="px-5 py-4 border border-primary rounded-md bg-gray-50 hover:bg-gray-100"
                                @click="addTextField">
                                <div class="flex items-center gap-x-2 text-sm">
                                    <Icon name="solar:text-outline" class="w-4 h-4 text-primary" aria-hidden="true" />
                                    Text
                                </div>
                            </button>
                            <button class="px-5 py-4 border border-primary rounded-md bg-gray-50 hover:bg-gray-100"
                                @click="addTextarea">
                                <div class="flex items-center gap-x-2 text-sm">
                                    <Icon name="ph:file-text" class="w-4 h-4 text-primary" aria-hidden="true" />
                                    Text area
                                </div>
                            </button>
                            <button class="px-5 py-4 border border-primary rounded-md bg-gray-50 hover:bg-gray-100"
                                @click="addChoiceField">
                                <div class="flex items-center gap-x-2 text-sm">
                                    <Icon name="mdi:circle-slice-8" class="w-4 h-4 text-primary" aria-hidden="true" />
                                    Choice
                                </div>
                            </button>
                            <button class="px-5 py-4 border border-primary rounded-md bg-gray-50 hover:bg-gray-100">
                                <div class="flex items-center gap-x-2 text-sm">
                                    <Icon name="material-symbols:thumb-up-outline-sharp" class="w-4 h-4 text-primary"
                                        aria-hidden="true" />
                                    Rating
                                </div>
                            </button>
                            <button class="px-5 py-4 border border-primary rounded-md bg-gray-50 hover:bg-gray-100">
                                <div class="flex items-center gap-x-2 text-sm">
                                    <Icon name="ph:calendar" class="w-4 h-4 text-primary" aria-hidden="true" />
                                    Date
                                </div>
                            </button>
                            <button class="px-5 py-4 border border-primary rounded-md bg-gray-50 hover:bg-gray-100">
                                <div class="flex items-center gap-x-2 text-sm">
                                    <Icon name="material-symbols:upload-rounded" class="w-4 h-4 text-primary"
                                        aria-hidden="true" />
                                    Upload File
                                </div>
                            </button>
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
    fields: [] as any
})

function addTextField() {
    state.fields.push({ type: 'textfield', value: 'Question' })
}

function addTextarea() {
    state.fields.push({ type: 'textarea', value: 'Question' })
}

function addChoiceField() {
    state.fields.push({ type: 'choice', value: '', options: ['Option 1', 'Option 2'] })
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

function removeField(fieldIndex: number) {
    state.fields.splice(fieldIndex, 1)
}
</script>