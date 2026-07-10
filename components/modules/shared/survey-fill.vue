<template>
    <div class="space-y-8">
        <div v-for="(formField, fieldIndex) in visibleFields" :key="formField.uuid" class="space-y-3">
            <div class="bg-gray-100 rounded-md border-t-2 border-primary">
                <div class="p-5 space-y-3">
                    <div class="flex gap-x-3">
                        <div>{{ fieldIndex + 1 }}.</div>
                        <div class="grow space-y-3">
                            <h3>
                                {{ parsed(formField)?.value }}
                                <span v-if="parsed(formField)?.required" class="text-red-500">*</span>
                            </h3>
                            <FormTextField v-if="parsed(formField)?.type === 'textfield'"
                                :name="'text_field_' + fieldIndex" :placeholder="$t('forms.fields.enterYourAnswer')"
                                :modelValue="answers[formField.uuid]"
                                @update:modelValue="answers[formField.uuid] = $event" />
                            <FormTextArea v-if="parsed(formField)?.type === 'textarea'"
                                :name="'textarea_' + fieldIndex" :placeholder="$t('forms.fields.enterYourAnswer')"
                                :modelValue="answers[formField.uuid]"
                                @update:modelValue="answers[formField.uuid] = $event" />
                            <div v-if="parsed(formField)?.type === 'datefield'" class="relative">
                                <FormDateField :name="'date_field_' + fieldIndex"
                                    :placeholder="$t('forms.fields.enterYourAnswer')"
                                    :modelValue="answers[formField.uuid]"
                                    @update:modelValue="answers[formField.uuid] = $event" />
                                <Icon name="ph:calendar" class="h-5 w-5 absolute right-4 top-2.5 text-gray-500"
                                    aria-hidden="true" />
                            </div>
                            <div v-if="parsed(formField)?.type === 'choice'" class="space-y-3">
                                <div v-for="(radio, radioIndex) in parsed(formField)?.options" :key="radioIndex"
                                    class="flex items-center gap-x-2">
                                    <label class="flex items-center gap-x-2 cursor-pointer"
                                        @click="answers[formField.uuid] = radioIndex">
                                        <span
                                            class="h-4 w-4 rounded-full border flex items-center justify-center"
                                            :class="answers[formField.uuid] === radioIndex ? 'border-primary' : 'border-gray-400'">
                                            <span v-if="answers[formField.uuid] === radioIndex"
                                                class="h-2.5 w-2.5 rounded-full bg-primary"></span>
                                        </span>
                                        <h3>{{ radio }}</h3>
                                    </label>
                                </div>
                            </div>
                            <div v-if="parsed(formField)?.type === 'checkbox'" class="space-y-3">
                                <div v-for="(checkbox, checkboxIndex) in parsed(formField)?.options"
                                    :key="checkboxIndex" class="flex items-center gap-x-2">
                                    <label class="flex items-center gap-x-2 cursor-pointer"
                                        @click="toggleCheckbox(formField.uuid, checkboxIndex)">
                                        <span class="h-4 w-4 rounded-sm border flex items-center justify-center"
                                            :class="isChecked(formField.uuid, checkboxIndex) ? 'border-primary bg-primary' : 'border-gray-400 bg-white'">
                                            <Icon v-if="isChecked(formField.uuid, checkboxIndex)" name="ph:check-bold"
                                                class="h-3 w-3 text-white" aria-hidden="true" />
                                        </span>
                                        <h3>{{ checkbox }}</h3>
                                    </label>
                                </div>
                            </div>
                            <div v-if="parsed(formField)?.type === 'rating'"
                                class="flex items-center justify-between gap-x-2">
                                <button v-for="rating in parsed(formField)?.levels" :key="rating" type="button"
                                    class="w-full h-10 flex items-center justify-center border border-gray-300 rounded-sm"
                                    :class="answers[formField.uuid] === rating && 'bg-primary text-white'"
                                    @click="answers[formField.uuid] = rating">
                                    {{ rating }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    fields: {
        type: Array as any,
        required: true,
    },
    answers: {
        type: Object as any,
        required: true,
    },
})

// File uploads are not supported in survey answers
const visibleFields = computed(() =>
    props.fields?.filter((formField: any) => parsed(formField)?.type !== 'uploadfile') ?? []
)

function parsed(formField: any) {
    try {
        return typeof formField?.field === 'string' ? JSON.parse(formField.field) : formField?.field
    } catch {
        return null
    }
}

function toggleCheckbox(fieldUuid: string, optionIndex: number) {
    if (!Array.isArray(props.answers[fieldUuid])) {
        props.answers[fieldUuid] = []
    }
    const index = props.answers[fieldUuid].indexOf(optionIndex)
    if (index === -1) {
        props.answers[fieldUuid].push(optionIndex)
    } else {
        props.answers[fieldUuid].splice(index, 1)
    }
}

function isChecked(fieldUuid: string, optionIndex: number) {
    return Array.isArray(props.answers[fieldUuid]) && props.answers[fieldUuid].includes(optionIndex)
}

function missingRequiredFields() {
    return visibleFields.value.filter((formField: any) => {
        const field = parsed(formField)
        if (!field?.required) return false
        const answer = props.answers[formField.uuid]
        if (answer === undefined || answer === null || answer === '') return true
        if (Array.isArray(answer) && answer.length === 0) return true
        return false
    })
}

defineExpose({ missingRequiredFields })
</script>
