<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <LoadingSpinner :isActive="state.isPageLoading">
            <div class="space-y-3">
                <div class="space-y-1">
                    <FormLabel for="type" :label="$t('citizens.walletTransactions.form.type')" />
                    <FormSelect id="type" :options="state.options.types" v-model="state.formWalletTransaction.type" />
                    <FormError :error="v$?.formWalletTransaction?.type?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.type?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="amount" :label="$t('citizens.walletTransactions.form.amount')" />
                    <FormTextField id="amount" name="amount"
                        :placeholder="$t('citizens.walletTransactions.form.amount')"
                        v-model="state.formWalletTransaction.amount" />
                    <FormError :error="v$?.formWalletTransaction?.amount?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.amount?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="note" :label="$t('citizens.walletTransactions.form.note')" />
                    <FormTextArea id="note" name="note" :placeholder="$t('citizens.walletTransactions.form.note')"
                        v-model="state.formWalletTransaction.note" />
                    <FormError :error="v$?.formWalletTransaction?.note?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.note?.[0]" />
                </div>
                <div class="space-y-1">
                    <div class="flex flex-col items-center">
                        <input type="file" ref="file" @change="onFileChange" class="hidden" />
                        <div class="relative cursor-pointer" @click="triggerFileInput">
                            <Icon name="ic:outline-drive-folder-upload" class="h-36 w-36" aria-hidden="true" />
                            <div
                                class="rounded-full absolute inset-0 bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity">
                                <div class="flex items-center w-full h-full justify-center text-xs">
                                    {{ $t('selectFile') }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="state.formWalletTransaction.file" class="mt-2 text-center text-sm text-gray-700">
                        {{ state.formWalletTransaction?.file?.name }}
                    </div>
                    <FormError :error="props?.error?.errors?.file?.[0]" class="text-center" />
                </div>
            </div>
            <div class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="emit('closeModal')">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full">
                        {{ props.formType === 'create' ? $t('save') :
                            $t('update') }}
                    </FormButton>
                </div>
            </div>
        </LoadingSpinner>
    </form>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedWalletTransaction: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm'])
const file = ref<HTMLInputElement | null>(null)
const { t } = useI18n()
const language = useI18n()

const state = reactive({
    error: {} as Error,
    formWalletTransaction: {
        id: '',
        uuid: '',
        type: '',
        amount: '',
        note: '',
        file: '',
    } as any,
    isPageLoading: false,
    options: {
        types: [
            { value: 'cash_in', label: `${t('citizens.walletTransactions.form.cashIn')}` },
            { value: 'cash_out', label: `${t('citizens.walletTransactions.form.cashOut')}` },
        ]
    },
})

onMounted(() => {
    state.formWalletTransaction = {
        id: props.selectedWalletTransaction?.id,
        uuid: props.selectedWalletTransaction?.uuid,
        type: props.selectedWalletTransaction?.type,
        amount: language.locale.value === 'dk' ? props.selectedWalletTransaction?.amount?.toString().replace('.', ',') : props.selectedWalletTransaction?.amount,
        note: props.selectedWalletTransaction?.note,
        file: '',
    }
})

watch(() => props.selectedWalletTransaction, (newValue: any) => {
    if (newValue != null) {
        state.formWalletTransaction = {
            id: props.selectedWalletTransaction?.id,
            uuid: props.selectedWalletTransaction?.uuid,
            type: props.selectedWalletTransaction?.type,
            amount: props.selectedWalletTransaction?.amount,
            note: props.selectedWalletTransaction?.note,
            file: '',
        }
    }
})

const rules = computed(() => {
    return {
        formWalletTransaction: {
            type: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            amount: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formWalletTransaction)
    }
}

function triggerFileInput() {
    if (file.value) {
        file.value.click()
    }
}

function onFileChange(event: any) {
    state.formWalletTransaction.file = event.target.files[0]
}
</script>