<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="name" :label="$t('expenses.form.name')" />
                <FormTextField id="name" name="name" :placeholder="$t('expenses.form.name')"
                    v-model="state.formExpense.name" />
                <FormError :error="v$?.formExpense?.name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.name?.[0]" />
            </div>
            <div class="space-y-1">
                <div class="flex justify-between items-center py-0.5">
                    <FormLabel for="dosage" :label="$t('expenses.form.category')" />
                    <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                        @click="state.modal.addNewExpenseCategoryFormOpen = true">
                        {{ $t('expenseCategories.addNewExpenseCategory') }}
                    </span>
                </div>
                <FormSelect id="expense_category_uuid" :options="state.options.expenseCategories"
                    v-model="state.formExpense.expense_category_uuid" />
                <FormError :error="v$?.formExpense?.expense_category_uuid?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.expense_category_uuid?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="citizen_uuid" :label="$t('expenses.form.citizen')" />
                <FormSelect id="citizen_uuid" :options="state.options.citizens"
                    v-model="state.formExpense.citizen_uuid" />
                <FormError :error="v$?.formExpense?.citizen_uuid?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.citizen_uuid?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="expense_date" :label="$t('expenses.form.date')" />
                <FormDateField id="expense_date" name="expense_date" :placeholder="$t('expenses.form.date')"
                    v-model="state.formExpense.expense_date" />
                <FormError :error="v$?.formExpense?.expense_date?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.expense_date?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="amount" :label="$t('expenses.form.amount')" />
                <FormTextField id="amount" name="amount" :placeholder="$t('expenses.form.amount')"
                    v-model="state.formExpense.amount" />
                <FormError :error="v$?.formExpense?.amount?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.amount?.[0]" />
            </div>

            <!-- File Attachment Section -->
            <div class="space-y-1">
                <FormLabel for="receipt" :label="$t('expenses.form.receipt')" />
                <input type="file" id="receipt" ref="attachmentInput" @change="onAttachmentChange" class="hidden"
                    multiple />
                <div class="border-2 border-dashed border-tertiary-25 rounded-md p-4 text-center cursor-pointer hover:border-primary transition-colors"
                    @click="triggerAttachmentInput">
                    <div class="flex flex-col items-center gap-2">
                        <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span class="text-sm text-primary">
                            {{ $t('expenses.form.clickToUpload') }}
                        </span>
                    </div>
                </div>

                <!-- Display existing attachments (for edit mode) -->
                <div v-if="state.existingAttachment?.name" class="mt-3 space-y-2">
                    <p class="text-xs text-tertiary font-medium">{{ $t('expenses.form.receipt') }}</p>
                    <div class="flex items-center justify-between p-3 bg-blue-50 rounded-md border border-blue-200">
                        <div class="flex items-center gap-3 flex-1 min-w-0">
                            <!-- PDF Icon -->
                            <Icon v-if="state.existingAttachment?.mime_type === 'application/pdf'" name="ph:file-pdf"
                                class="w-6 h-6 text-primary flex-shrink-0" />
                            <!-- Generic File Icon -->
                            <Icon v-else name="ph:file" class="w-6 h-6 text-primary flex-shrink-0" />

                            <div class="flex-1 min-w-0">
                                <a :href="state.existingAttachment?.url" target="_blank"
                                    class="text-sm text-tertiary hover:underline font-medium truncate block">
                                    {{ state.existingAttachment?.name }}
                                </a>
                                <div class="flex items-center gap-2 text-xs text-tertiary-500 mt-0.5">
                                    <span>{{ formatFileSize(state.existingAttachment?.size) }}</span>
                                    <span>•</span>
                                    <span>{{ state.existingAttachment?.mime_type }}</span>
                                </div>
                            </div>
                        </div>
                        <button type="button" @click="removeExistingAttachment()"
                            class="ml-3 text-red-500 hover:text-red-700 flex-shrink-0 p-1 rounded hover:bg-red-100 transition-colors"
                            :title="$t('news.form.removeFile')">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div v-if="state.formExpense.receipt?.name" class="mt-3 space-y-2">
                    <p class="text-xs text-tertiary-600 font-medium">{{ $t('news.form.attachments') }}</p>
                    <div class="flex items-center justify-between p-3 bg-green-50 rounded-md border border-green-200">
                        <div class="flex items-center gap-3 flex-1 min-w-0">
                            <svg class="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div class="flex-1 min-w-0">
                                <span class="text-sm text-green-800 font-medium truncate block">{{
                                    state.formExpense.receipt.name
                                }}</span>
                                <span class="text-xs text-tertiary-500 mt-0.5 block">{{
                                    formatFileSize(state.formExpense.receipt.size)
                                }}</span>
                            </div>
                        </div>
                        <button type="button" @click="removeAttachment()"
                            class="ml-3 text-red-500 hover:text-red-700 flex-shrink-0 p-1 rounded hover: bg-red-100 transition-colors"
                            :title="$t('news.form.removeFile')">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <FormError :error="v$?.formExpense?.receipt?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.receipt?.[0]" />
            </div>
            <!-- End File Attachment Section -->

            <div class="space-y-1">
                <FormLabel for="description" :label="$t('expenses.form.description')" />
                <FormTextArea id="description" name="description" :placeholder="$t('expenses.form.description')"
                    v-model="state.formExpense.description" />
                <FormError :error="v$?.formExpense?.description?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.description?.[0]" />
            </div>

        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" @click="emit('closeModal')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="w-full">
                    {{ props.formType === 'create' ? $t('save') :
                        $t('update') }}
                </FormButton>
            </div>
        </div>
    </form>
    <ModulesUserExpenseCategoryModalNew :isModalOpen="state.modal.addNewExpenseCategoryFormOpen"
        @close="state.modal.addNewExpenseCategoryFormOpen = false" @refreshExpenseCategories="fetchExpenseCategories" />
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'
import { expenseCategoryService } from '~/components/api/user/ExpenseCategoryService'
import { citizenService } from '@/components/api/user/CitizenService'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedExpense: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm', 'isPageLoading'])
const attachmentInput = ref<HTMLInputElement | null>(null)

const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formExpense: {
        id: '',
        uuid: '',
        expense_category_uuid: '',
        citizen_uuid: '',
        name: '',
        description: '',
        expense_date: '',
        amount: '',
        receipt: {} as any
    },
    modal: {
        addNewExpenseCategoryFormOpen: false,
    },
    options: {
        expenseCategories: [] as any,
        citizens: [] as any,
    },
    existingAttachment: {} as any,
})

onMounted(() => {
    state.formExpense = {
        id: props.selectedExpense.id,
        uuid: props.selectedExpense.uuid,
        name: props.selectedExpense.name,
        expense_category_uuid: props.selectedExpense.expense_category_uuid,
        citizen_uuid: props.selectedExpense?.citizen_uuid || '',
        description: props.selectedExpense.description,
        expense_date: props.selectedExpense.expense_date,
        amount: props.selectedExpense.amount,
        receipt: props.selectedExpense.receipt,
    }
    fetchAllCitizens()
    fetchExpenseCategories()
})

watch(() => props.selectedExpense, (newValue: any) => {
    if (newValue != null) {
        state.formExpense = {
            id: newValue.id,
            uuid: newValue.uuid,
            name: newValue.name,
            expense_category_uuid: newValue.expense_category_uuid,
            citizen_uuid: newValue?.citizen_uuid || '',
            description: newValue.description,
            expense_date: newValue.expense_date,
            amount: newValue.amount,
            receipt: newValue.receipt,
        }
    }
})

const rules = computed(() => {
    return {
        formExpense: {
            name: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            expense_category_uuid: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            description: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            expense_date: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            amount: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            receipt: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            }
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formExpense)
    }
}

async function fetchAllCitizens() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {}
        const response = await citizenService.getAllCitizens(params)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (citizen: any) => options.push({
                    value: citizen?.uuid,
                    label: citizen?.firstname + " " + (citizen?.lastname ?? ''),
                })
            )
            options.shift()
            state.options.citizens = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchExpenseCategories() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const response = await expenseCategoryService.getAllExpenseCategories()
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.expenseCategories = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}



function triggerAttachmentInput() {
    if (attachmentInput.value) {
        attachmentInput.value.click()
    }
}

function onAttachmentChange(event: any) {
    const files = Array.from(event.target.files) as File[]
    state.formExpense.receipt = files[0]
    // Reset the input so the same file can be selected again if needed
    if (attachmentInput.value) {
        attachmentInput.value.value = ''
    }
}

function removeAttachment() {
    state.formExpense.receipt = null
}

function removeExistingAttachment() {
    state.existingAttachment = {}
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

</script>

<style>
#formDirectory .multiselect-dropdown {
    max-height: 4.8rem !important;
}
</style>