<template>
    <div>
        <Modal size="lg" :title="$t('findsocialetilbuddk.showInterest.getInquiriesViaFindSocialeTilbudDk')"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="space-y-3">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <form @submit.prevent="submitForm()">
                            <div class="space-y-3">
                                <div class="space-y-1">
                                    <FormLabel for="company"
                                        :label="$t('findsocialetilbuddk.showInterest.form.company')" />
                                    <FormTextField id="company" name="company"
                                        :placeholder="$t('findsocialetilbuddk.showInterest.form.company')"
                                        v-model="state.formShowInterest.company" />
                                    <FormError
                                        :error="v$?.formShowInterest?.company?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.company?.[0]" />
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div class="space-y-1">
                                        <FormLabel for="firstname"
                                            :label="$t('findsocialetilbuddk.showInterest.form.firstname')" />
                                        <FormTextField id="firstname" name="firstname"
                                            :placeholder="$t('findsocialetilbuddk.showInterest.form.firstname')"
                                            v-model="state.formShowInterest.firstname" />
                                        <FormError
                                            :error="v$?.formShowInterest?.firstname?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.firstname?.[0]" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel for="lastname"
                                            :label="$t('findsocialetilbuddk.showInterest.form.lastname')" />
                                        <FormTextField id="lastname" name="lastname"
                                            :placeholder="$t('findsocialetilbuddk.showInterest.form.lastname')"
                                            v-model="state.formShowInterest.lastname" />
                                        <FormError
                                            :error="v$?.formShowInterest?.lastname?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.lastname?.[0]" />
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div class="space-y-1">
                                        <FormLabel for="email"
                                            :label="$t('findsocialetilbuddk.showInterest.form.emailAddress')" />
                                        <FormTextField id="email" name="email"
                                            :placeholder="$t('findsocialetilbuddk.showInterest.form.emailAddress')"
                                            v-model="state.formShowInterest.email" />
                                        <FormError
                                            :error="v$?.formShowInterest?.email?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.email?.[0]" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel for="phone"
                                            :label="$t('findsocialetilbuddk.showInterest.form.phone')" />
                                        <FormTextField id="phone" name="phone"
                                            :placeholder="$t('findsocialetilbuddk.showInterest.form.phone')"
                                            v-model="state.formShowInterest.phone" />
                                        <FormError
                                            :error="v$?.formShowInterest?.phone?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.phone?.[0]" />
                                    </div>
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="type_of_placement"
                                        :label="`${$t('findsocialetilbuddk.showInterest.form.whatTypeOfPlacementsAreYouInterestedIn')}?`" />
                                    <FormTextArea id="type_of_placement" name="note"
                                        :placeholder="`${$t('findsocialetilbuddk.showInterest.form.whatTypeOfPlacementsAreYouInterestedIn')}?`"
                                        v-model="state.formShowInterest.type_of_placement" />
                                    <FormError
                                        :error="v$?.formShowInterest?.type_of_placement?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.type_of_placement?.[0]" />
                                </div>
                            </div>
                            <div class="mt-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                                        {{ $t('cancel') }}
                                    </FormButton>
                                    <FormButton type="submit" buttonStyle="primary" class="w-full">
                                        {{ $t('submit') }}
                                    </FormButton>
                                </div>
                            </div>
                        </form>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { findSocialeTilbudDkService } from '@/components/api/user/FindSocialeTilbudDkService'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const { t } = useI18n()
const { successAlert } = useAlert()
const emit = defineEmits(['close'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formShowInterest: {
        company: '',
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        type_of_placement: '',
    },
})

const rules = computed(() => {
    return {
        formShowInterest: {
            company: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            firstname: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            lastname: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            email: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            phone: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})
const v$ = useVuelidate(rules, state)

function closeModal() {
    emit('close')
}

async function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        sendMessage()
    }
}

async function sendMessage() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            company: state.formShowInterest.company,
            firstname: state.formShowInterest.firstname,
            lastname: state.formShowInterest.lastname,
            email: state.formShowInterest.email,
            phone: state.formShowInterest.phone,
            type_of_placement: state.formShowInterest.type_of_placement,
        }
        const response = await findSocialeTilbudDkService.sendShowInterest(params)
        if (response) {
            successAlert(`${t('alert.success')}!`, `${t('findsocialetilbuddk.showInterest.form.alert.messageSuccessfullySent')}.`)
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>