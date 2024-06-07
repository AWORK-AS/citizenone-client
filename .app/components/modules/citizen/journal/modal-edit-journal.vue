<template>
    <TairoModal :open="props.isModalOpen" size="2xl" @close="closeModal">
        <template #header>
            <div class="flex w-full items-center justify-between p-4 md:p-6">
                <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">
                    Add new journal
                </h3>

                <BaseButtonClose @click="closeModal" />
            </div>
        </template>

        <div class="p-4 md:p-6">
            <div class="space-y-3">
                <BaseMessage color="danger" icon v-if="errorMessage" :message="errorMessage" />
                <form action="" method="POST" @submit.prevent="onSubmit">
                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-12 md:col-span-6">
                            <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="journal.title">
                                <BaseInput label="Title" icon="ph:file" placeholder="" :model-value="field.value"
                                    :error="errorMessage" :disabled="isSubmitting" type="text"
                                    @update:model-value="handleChange" @blur="handleBlur" />
                            </Field>
                        </div>
                        <div class="col-span-12 md:col-span-6">
                            <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="journal.date">
                                <BaseInput label="Date" icon="ph:calendar" placeholder="" :model-value="field.value"
                                    :error="errorMessage" :disabled="isSubmitting" type="date"
                                    @update:model-value="handleChange" @blur="handleBlur" />
                            </Field>
                        </div>
                        <div class="col-span-12">
                            <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="journal.content">
                                <BaseTextarea label="Content" placeholder="" :model-value="field.value"
                                    :error="errorMessage" :disabled="isSubmitting" @update:model-value="handleChange"
                                    @blur="handleBlur" />
                            </Field>
                        </div>
                        <div class="col-span-12 flex justify-end gap-x-2">
                            <BaseButton @click="closeModal" :disabled="isSubmitting" :loading="isSubmitting">
                                Cancel
                            </BaseButton>

                            <BaseButton color="primary" type="submit" variant="solid" :disabled="isSubmitting"
                                :loading="isSubmitting">
                                Save Journal
                            </BaseButton>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </TairoModal>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useFieldError, useForm } from 'vee-validate'
import { z } from 'zod'
import { journalService } from '@/components/api/JournalService'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedJournal: {
        type: Object,
        required: true,
    }
})

const toaster = useToaster()
const emit = defineEmits(['close', 'refreshJournal'])
let errorMessage = ''

const VALIDATION_TEXT = {
    TITLE_REQUIRED: 'This field is required',
    DATE_REQUIRED: 'This field is required',
    CONTENT_REQUIRED: 'This field is required',
}

const zodSchema = z
    .object({
        journal: z.object({
            title: z.string().min(1, VALIDATION_TEXT.TITLE_REQUIRED),
            date: z.string().min(1, VALIDATION_TEXT.DATE_REQUIRED),
            content: z.string().min(1, VALIDATION_TEXT.CONTENT_REQUIRED),
        }),
    })

type FormInput = z.infer<typeof zodSchema>
const validationSchema = toTypedSchema(zodSchema)
const initialValues = {
    journal: {
        title: '',
        date: '',
        content: '',
    },
} satisfies FormInput

const {
    handleSubmit,
    isSubmitting,
    setFieldError,
    meta,
    values,
    errors,
    resetForm,
    setFieldValue,
    setErrors,
} = useForm({
    validationSchema,
    initialValues,
})

watch(() => props.selectedJournal, (newValue: any) => {
    if (newValue != null) {
        setFieldValue('journal.title', newValue?.title)
        setFieldValue('journal.date', newValue?.date)
        setFieldValue('journal.content', newValue?.content)
    }
})

function closeModal() {
    emit('close')
}

function refreshJournal() {
    emit('refreshJournal')
}

const onSubmit = handleSubmit(async (values) => {
    errorMessage = ''
    try {
        isSubmitting.value = true
        const journalUuid = props.selectedJournal.uuid
        const params = {
            title: values.journal.title,
            date: values.journal.date,
            content: values.journal.content,
        }
        const response = await journalService.updateJournal(journalUuid, params)
        if (response.data) {
            toaster.clearAll()
            toaster.show({
                title: 'Success',
                message: 'Journal successfully updated.',
                color: 'success',
                icon: 'ph:check',
                closable: true,
            })
            isSubmitting.value = false
            resetForm()
            refreshJournal()
            closeModal()
        }
    } catch (error: any) {
        errorMessage = error.message
        isSubmitting.value = false
        setFieldError('journal.title', error?.errors?.title)
        setFieldError('journal.date', error?.errors?.date)
        setFieldError('journal.content', error?.errors?.content)
        return
    }
})
</script>