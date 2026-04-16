<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-lg" id="templateAgreementForm">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />

        <div class="space-y-4">
            <!-- Name sa template -->
            <div class="space-y-1">
                <FormLabel for="name" :label="$t('timeAccounts.templateAgreementsForm.name')" />
                <FormTextField id="name" name="name" placeholder="" v-model="state.form.name" />
                <FormError :error="v$?.form?.name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.name?.[0]" />
            </div>

            <!-- Time Accounts -->
            <div class="space-y-1">
                <FormLabel for="time_account_uuids" :label="$t('timeAccounts.templateAgreementsForm.timeAccounts')" />
                <FormSelectMultiple id="time_account_uuids" name="time_account_uuids"
                    :options="state.timeAccountOptions" v-model="state.form.time_account_uuids" />
                <FormError :error="props?.error?.errors?.time_account_uuids?.[0]" />
            </div>
        </div>

        <div class="mt-6 mb-20">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel"
                    @click="navigateTo('/settings/time-accounts?view=templateAgreements')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary">
                    {{ props.formType === 'create' ? $t('save') : $t('update') }}
                </FormButton>
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'
import { timeAccountService } from '@/components/api/user/TimeAccountService'

const props = defineProps({
    error: { type: Object, required: false },
    formType: { type: String, required: true },
    selectedTemplateAgreement: { type: Object, required: false },
})

const emit = defineEmits(['isPageLoading', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    form: {
        name: '',
        time_account_uuids: [] as string[],
    },
    timeAccountOptions: [] as any[],
})

onMounted(() => {
    fetchTimeAccounts()
})

watch(() => props.selectedTemplateAgreement, (newValue: any) => {
    if (newValue != null) {
        state.form = {
            name: newValue.name ?? '',
            time_account_uuids: newValue.time_account_uuids ?? [],
        }
    }
})

const rules = computed(() => {
    return {
        form: {
            name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

async function fetchTimeAccounts() {
    emit('isPageLoading', true)
    try {
        const response = await timeAccountService.getTimeAccounts({})
        if (response) {
            state.timeAccountOptions = (response.data ?? []).map((item: any) => ({
                value: item.uuid,
                label: item.name,
            }))
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.form)
    }
}
</script>
