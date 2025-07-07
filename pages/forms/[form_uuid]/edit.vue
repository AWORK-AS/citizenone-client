<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('forms.editForm') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('forms.editForm') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/forms">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>

            <LoadingSpinner :isActive="state.isPageLoading">
                <div class="max-w-5xl mx-auto space-y-5">
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
                            <FormTextArea id="form_description" name="form_description"
                                :placeholder="$t('forms.formDescription')" :rows="2" v-model="state.form.description" />
                            <FormError :error="v$?.form?.description?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.description?.[0]" />
                        </div>
                    </div>

                    <div class="space-y-3 px-4 py-6 sm:p-8 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
                        <div>
                            <div class="space-y-8 mt-5" v-if="state.form.fields?.length > 0">
                                <div v-for="(field, fieldIndex) in state.form.fields" :key="fieldIndex"
                                    class="space-y-3">
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
                                                                v-model="state.form.fields[fieldIndex].value" />
                                                            <FormTextField :name="'text_field_' + fieldIndex"
                                                                placeholder="Enter your answer" :disabled="true" />
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
                                                                v-model="state.form.fields[fieldIndex].value" />
                                                            <FormTextArea :name="'textarea_' + fieldIndex"
                                                                placeholder="Enter your answer" :disabled="true" />
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
                                                                v-model="state.form.fields[fieldIndex].value" />
                                                            <div class="space-y-3">
                                                                <div v-for="(radio, radioIndex) in state.form.fields[fieldIndex].options"
                                                                    :key="radioIndex" class="flex items-center gap-x-2">
                                                                    <FormRadioButton
                                                                        :name="`choice_${fieldIndex}_${radioIndex}`"
                                                                        :disabled="true" />
                                                                    <FormTextField
                                                                        :name="`text_field_${fieldIndex}_${radioIndex}`"
                                                                        :placeholder="`Option ${radioIndex + 1}`"
                                                                        v-model="state.form.fields[fieldIndex].options[radioIndex]" />
                                                                    <button class="flex items-center"
                                                                        @click="removeRadioButton(fieldIndex, radioIndex)"
                                                                        v-if="state.form.fields[fieldIndex].options.length > 2">
                                                                        <Icon name="ph:trash" class="h-5 w-5"
                                                                            aria-hidden="true" />
                                                                    </button>
                                                                </div>
                                                                <button @click="addRadioOption(fieldIndex)"
                                                                    type="button"
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
                                                        <button @click="removeField(fieldIndex)">
                                                            <Icon name="ph:trash" class="h-5 w-5" aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                    <div class="flex gap-x-3">
                                                        <div class="mt-2">{{ fieldIndex + 1 }}.</div>
                                                        <div class="grow space-y-3">
                                                            <FormTextField :name="'text_field_' + fieldIndex"
                                                                placeholder="Input your question title here"
                                                                v-model="state.form.fields[fieldIndex].value" />
                                                            <div class="space-y-3">
                                                                <div v-for="(checkbox, checkboxIndex) in state.form.fields[fieldIndex].options"
                                                                    :key="checkboxIndex"
                                                                    class="flex items-center gap-x-2">
                                                                    <FormCheckbox
                                                                        :name="`choice_${fieldIndex}_${checkboxIndex}`"
                                                                        :disabled="true" />
                                                                    <FormTextField
                                                                        :name="`text_field_${fieldIndex}_${checkboxIndex}`"
                                                                        :placeholder="`Option ${checkboxIndex + 1}`"
                                                                        v-model="state.form.fields[fieldIndex].options[checkboxIndex]" />
                                                                    <button class="flex items-center"
                                                                        @click="removeCheckboxOption(fieldIndex, checkboxIndex)"
                                                                        v-if="state.form.fields[fieldIndex].options.length > 1">
                                                                        <Icon name="ph:trash" class="h-5 w-5"
                                                                            aria-hidden="true" />
                                                                    </button>
                                                                </div>
                                                                <button @click="addCheckboxOption(fieldIndex)"
                                                                    type="button"
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
                                                        <button @click="removeField(fieldIndex)">
                                                            <Icon name="ph:trash" class="h-5 w-5" aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                    <div class="flex gap-x-3">
                                                        <div class="mt-2">{{ fieldIndex + 1 }}.</div>
                                                        <div class="grow space-y-3">
                                                            <FormTextField :name="'textarea_' + fieldIndex"
                                                                placeholder="Input your question title here"
                                                                v-model="state.form.fields[fieldIndex].value" />
                                                            <div class="flex items-center justify-between gap-x-2">
                                                                <div v-for="(rating, ratingIndex) in state.form.fields[fieldIndex].levels"
                                                                    :key="ratingIndex"
                                                                    class="w-full h-10 flex items-center justify-center border border-gray-300 rounded-sm">
                                                                    {{ rating }}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                Levels:
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
                                                        <button @click="removeField(fieldIndex)">
                                                            <Icon name="ph:trash" class="h-5 w-5" aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                    <div class="flex gap-x-3">
                                                        <div class="mt-2">{{ fieldIndex + 1 }}.</div>
                                                        <div class="grow space-y-3">
                                                            <FormTextField :name="'date_field_' + fieldIndex"
                                                                placeholder="Input your question title here"
                                                                v-model="state.form.fields[fieldIndex].value" />
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
                                                            <button @click="removeField(fieldIndex)">
                                                                <Icon name="ph:trash" class="h-5 w-5"
                                                                    aria-hidden="true" />
                                                            </button>
                                                        </div>
                                                        <div class="flex gap-x-3">
                                                            <div class="mt-2">{{ fieldIndex + 1 }}.</div>
                                                            <div class="grow space-y-4">
                                                                <FormTextField :name="'upload_file_' + fieldIndex"
                                                                    placeholder="Input your question title here"
                                                                    v-model="state.form.fields[fieldIndex].value" />
                                                                <div class="flex items-center gap-x-2 text-sm">
                                                                    <Icon name="material-symbols:upload-rounded"
                                                                        class="w-4 h-4 text-primary"
                                                                        aria-hidden="true" />
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
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="space-y-3" :class="state.form.fields?.length > 0 && 'mt-8'">
                                <div class="w-fit" @click="state.showFieldsAdder = !state.showFieldsAdder">
                                    <div class="w-fit flex items-center gap-x-2 cursor-pointer">
                                        <Icon name="ph:x-circle-fill" class="h-5 w-5 text-primary" aria-hidden="true"
                                            v-if="state.showFieldsAdder" />
                                        <Icon name="ph:plus-circle-fill" class="h-5 w-5 text-primary" aria-hidden="true"
                                            v-else />
                                        <p v-if="state.form.fields?.length === 0">
                                            {{ $t('forms.quickStartWith') }}
                                        </p>
                                        <p v-else>{{ $t('forms.addNewQuestion') }}</p>
                                    </div>
                                </div>
                                <div class="grid grid-cols-3 gap-x-3 gap-y-5" v-if="state.showFieldsAdder">
                                    <button
                                        class="px-5 py-4 border border-primary rounded-md bg-gray-50 hover:bg-gray-100"
                                        @click="addTextField">
                                        <div class="flex items-center gap-x-2 text-sm">
                                            <Icon name="solar:text-outline" class="w-5 h-5 text-primary"
                                                aria-hidden="true" />
                                            {{ $t('forms.fields.text') }}
                                        </div>
                                    </button>
                                    <button
                                        class="px-5 py-4 border border-primary rounded-md bg-gray-50 hover:bg-gray-100"
                                        @click="addTextarea">
                                        <div class="flex items-center gap-x-2 text-sm">
                                            <Icon name="ph:file-text" class="w-5 h-5 text-primary" aria-hidden="true" />
                                            {{ $t('forms.fields.textarea') }}
                                        </div>
                                    </button>
                                    <button
                                        class="px-5 py-4 border border-primary rounded-md bg-gray-50 hover:bg-gray-100"
                                        @click="addDateField">
                                        <div class="flex items-center gap-x-2 text-sm">
                                            <Icon name="ph:calendar" class="w-5 h-5 text-primary" aria-hidden="true" />
                                            {{ $t('forms.fields.date') }}
                                        </div>
                                    </button>
                                    <button
                                        class="px-5 py-4 border border-primary rounded-md bg-gray-50 hover:bg-gray-100"
                                        @click="addChoiceField">
                                        <div class="flex items-center gap-x-2 text-sm">
                                            <Icon name="mdi:circle-slice-8" class="w-5 h-5 text-primary"
                                                aria-hidden="true" />
                                            {{ $t('forms.fields.choice') }}
                                        </div>
                                    </button>
                                    <button
                                        class="px-5 py-4 border border-primary rounded-md bg-gray-50 hover:bg-gray-100"
                                        @click="addCheckbox">
                                        <div class="flex items-center gap-x-2 text-sm">
                                            <Icon name="ph:check-square" class="w-5 h-5 text-primary"
                                                aria-hidden="true" />
                                            {{ $t('forms.fields.checkbox') }}
                                        </div>
                                    </button>
                                    <button
                                        class="px-5 py-4 border border-primary rounded-md bg-gray-50 hover:bg-gray-100"
                                        @click="addRating">
                                        <div class="flex items-center gap-x-2 text-sm">
                                            <Icon name="material-symbols:thumb-up-outline-sharp"
                                                class="w-5 h-5 text-primary" aria-hidden="true" />
                                            {{ $t('forms.fields.rating') }}
                                        </div>
                                    </button>
                                    <button
                                        class="px-5 py-4 border border-primary rounded-md bg-gray-50 hover:bg-gray-100"
                                        @click="addUploadFile">
                                        <div class="flex items-center gap-x-2 text-sm">
                                            <Icon name="material-symbols:upload-rounded" class="w-5 h-5 text-primary"
                                                aria-hidden="true" />
                                            {{ $t('forms.fields.uploadFile') }}
                                        </div>
                                    </button>
                                </div>
                                <FormError :error="state?.error?.errors?.fields?.[0]" />
                            </div>
                        </div>
                    </div>

                    <div class="mt-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                                @click="navigateTo('/forms')">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="primary" class="rounded-md" @click="updateForm">
                                {{ $t('update') }}
                            </FormButton>
                        </div>
                    </div>
                </div>
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { formService } from '@/components/api/user/FormService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const formUuid = router?.currentRoute?.value?.params?.uuid
const breadcrumbLinks = [
    {
        name: 'forms.forms',
        translate: true,
        href: '/forms',
    },
    {
        name: 'forms.editForm',
        translate: true,
        href: `/forms/${formUuid}/edit`,
    },
]

const state = reactive({
    error: {} as Error,
    form: {
        description: '',
        fields: [] as any,
        title: '',
    },
    isPageLoading: false,
    showFieldsAdder: true,
})

const rules = computed(() => {
    return {
        form: {
            title: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            description: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function addTextField() {
    state.form.fields.push({ type: 'textfield', value: `${t('forms.question')}`, required: false })
    state.showFieldsAdder = false
}

function addTextarea() {
    state.form.fields.push({ type: 'textarea', value: `${t('forms.question')}`, required: false })
    state.showFieldsAdder = false
}

function addDateField() {
    state.form.fields.push({ type: 'datefield', value: `${t('forms.question')}`, required: false })
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

function removeField(fieldIndex: number) {
    state.form.fields.splice(fieldIndex, 1)
    if (state.form.fields?.length === 0) {
        state.showFieldsAdder = true
    }
}

async function updateForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        state.error = {}
        state.isPageLoading = true
        try {
            const params = {
                title: state.form.title,
                description: state.form.description,
                fields: state.form.fields,
                is_active: true,
            }
            const response = await formService.updateForm(formUuid, params)
            if (response.data) {
                successAlert(`${t('alert.success')}!`, `${t('forms.alert.formSuccessfullyUpdated')}.`)
                navigateTo('/forms')
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    }
} 
</script>