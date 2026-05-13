<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <LoadingSpinner :isActive="state.isPageLoading">
            <div class="space-y-3">
                <div class="space-y-1">
                    <FormLabel for="name" :label="$t('citizens.wallets.form.name')" />
                    <FormTextField id="name" name="name" :placeholder="$t('citizens.wallets.form.name')"
                        v-model="state.formWallet.name" />
                    <FormError :error="v$?.formWallet?.name?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.name?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="note" :label="$t('citizens.wallets.form.note')" />
                    <FormTextArea id="note" name="note" :placeholder="$t('citizens.wallets.form.note')"
                        v-model="state.formWallet.note" />
                    <FormError :error="v$?.formWallet?.note?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.note?.[0]" />
                </div>
                <div class="space-y-1">
                    <div class="w-fit flex items-center cursor-pointer"
                        @click="state.formWallet.deactivate_end_of_month = !state.formWallet.deactivate_end_of_month">
                        <FormCheckbox id="change_password" :value="state.formWallet.deactivate_end_of_month" />
                        {{ $t('citizens.wallets.form.deactivateByTheEndOfTheMonth') }}
                    </div>
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
    selectedWallet: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formWallet: {
        id: '',
        uuid: '',
        name: '',
        note: '',
        deactivate_end_of_month: false,
    },
    isPageLoading: false,
})

onMounted(() => {
    state.formWallet = {
        id: props.selectedWallet?.id,
        uuid: props.selectedWallet?.uuid,
        name: props.selectedWallet?.name,
        note: props.selectedWallet?.note,
        deactivate_end_of_month: props.selectedWallet?.deactivate_end_of_month,
    }
})

watch(() => props.selectedWallet, (newValue: any) => {
    if (newValue != null) {
        state.formWallet = {
            id: props.selectedWallet?.id,
            uuid: props.selectedWallet?.uuid,
            name: props.selectedWallet?.name,
            note: props.selectedWallet?.note,
            deactivate_end_of_month: props.selectedWallet?.deactivate_end_of_month,
        }
    }
})

const rules = computed(() => {
    return {
        formWallet: {
            name: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formWallet)
    }
}
</script>