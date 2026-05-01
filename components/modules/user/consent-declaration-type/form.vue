<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />

        <div class="space-y-1">
            <FormLabel for="name" :label="$t('consentDeclarationTypes.form.name')" />
            <FormTextField id="name" name="name" :placeholder="$t('consentDeclarationTypes.form.name')"
                v-model="state.form.name" />
            <FormError :error="v$?.form?.name?.$errors[0]?.$message.toString()" />
            <FormError :error="props?.error?.errors?.name?.[0]" />
        </div>

        <div class="mt-6 space-y-4">
            <h3 class="text-sm font-semibold text-gray-700">
                {{ $t('consentDeclarationTypes.form.consentFields') }}
            </h3>

            <div class="rounded-lg border border-gray-200 divide-y divide-gray-100">
                <div
                    class="grid grid-cols-[1fr_80px_80px] px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <span></span>
                    <span class="text-center">
                        {{ $t('yes') }}
                    </span>
                    <span class="text-center">
                        {{ $t('no') }}
                    </span>
                </div>

                <div class="grid grid-cols-[1fr_80px_80px] items-center px-4 py-3">
                    <span class="text-sm text-gray-700">
                        {{ $t('consentDeclarationTypes.form.photo') }}
                    </span>
                    <div class="flex justify-center">
                        <input type="radio" :name="`photo`" value="yes" v-model="state.form.photo"
                            class="w-4 h-4 accent-tertiary cursor-pointer" />
                    </div>
                    <div class="flex justify-center">
                        <input type="radio" :name="`photo`" value="no" v-model="state.form.photo"
                            class="w-4 h-4 accent-tertiary cursor-pointer" />
                    </div>
                </div>

                <div class="grid grid-cols-[1fr_80px_80px] items-center px-4 py-3">
                    <span class="text-sm text-gray-700">
                        {{ $t('consentDeclarationTypes.form.parentCollaboration') }}
                    </span>
                    <div class="flex justify-center">
                        <input type="radio" :name="`parent_collaboration`" value="yes"
                            v-model="state.form.parent_collaboration" class="w-4 h-4 accent-tertiary cursor-pointer" />
                    </div>
                    <div class="flex justify-center">
                        <input type="radio" :name="`parent_collaboration`" value="no"
                            v-model="state.form.parent_collaboration" class="w-4 h-4 accent-tertiary cursor-pointer" />
                    </div>
                </div>

                <div class="grid grid-cols-[1fr_80px_80px] items-center px-4 py-3">
                    <span class="text-sm text-gray-700">
                        {{ $t('consentDeclarationTypes.form.studentCollaboration') }}
                    </span>
                    <div class="flex justify-center">
                        <input type="radio" :name="`student_collaboration`" value="yes"
                            v-model="state.form.student_collaboration" class="w-4 h-4 accent-tertiary cursor-pointer" />
                    </div>
                    <div class="flex justify-center">
                        <input type="radio" :name="`student_collaboration`" value="no"
                            v-model="state.form.student_collaboration" class="w-4 h-4 accent-tertiary cursor-pointer" />
                    </div>
                </div>

                <!-- General consent -->
                <div class="grid grid-cols-[1fr_80px_80px] items-center px-4 py-3">
                    <span class="text-sm text-gray-700">
                        {{ $t('consentDeclarationTypes.form.generalConsent') }}
                    </span>
                    <div class="flex justify-center">
                        <input type="radio" :name="`general_consent`" value="yes" v-model="state.form.general_consent"
                            class="w-4 h-4 accent-tertiary cursor-pointer" />
                    </div>
                    <div class="flex justify-center">
                        <input type="radio" :name="`general_consent`" value="no" v-model="state.form.general_consent"
                            class="w-4 h-4 accent-tertiary cursor-pointer" />
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-6 space-y-4">
            <h3 class="text-sm font-semibold text-gray-700">
                {{ $t('consentDeclarationTypes.form.guardianship') }}
            </h3>

            <div class="rounded-lg border border-gray-200 divide-y divide-gray-100">
                <div
                    class="grid grid-cols-[1fr_80px_80px] px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <span></span>
                    <span class="text-center">
                        {{ $t('yes') }}
                    </span>
                    <span class="text-center">
                        {{ $t('no') }}
                    </span>
                </div>

                <div class="grid grid-cols-[1fr_80px_80px] items-center px-4 py-3">
                    <span class="text-sm text-gray-700">
                        {{ $t('consentDeclarationTypes.form.personalGuardianship') }}
                    </span>
                    <div class="flex justify-center">
                        <input type="radio" :name="`personal_guardianship`" value="yes"
                            v-model="state.form.personal_guardianship" class="w-4 h-4 accent-tertiary cursor-pointer" />
                    </div>
                    <div class="flex justify-center">
                        <input type="radio" :name="`personal_guardianship`" value="no"
                            v-model="state.form.personal_guardianship" class="w-4 h-4 accent-tertiary cursor-pointer" />
                    </div>
                </div>

                <div class="grid grid-cols-[1fr_80px_80px] items-center px-4 py-3">
                    <span class="text-sm text-gray-700">
                        {{ $t('consentDeclarationTypes.form.financialGuardianship') }}
                    </span>
                    <div class="flex justify-center">
                        <input type="radio" :name="`financial_guardianship`" value="yes"
                            v-model="state.form.financial_guardianship"
                            class="w-4 h-4 accent-tertiary cursor-pointer" />
                    </div>
                    <div class="flex justify-center">
                        <input type="radio" :name="`financial_guardianship`" value="no"
                            v-model="state.form.financial_guardianship"
                            class="w-4 h-4 accent-tertiary cursor-pointer" />
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel"
                    @click="navigateTo('/settings/consent-declaration-types')">
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

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedConsentDeclarationType: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    form: {
        name: '',
        photo: null as string | null,
        parent_collaboration: null as string | null,
        student_collaboration: null as string | null,
        general_consent: null as string | null,
        personal_guardianship: null as string | null,
        financial_guardianship: null as string | null,
    },
})

watch(() => props.selectedConsentDeclarationType, (newValue: any) => {
    if (newValue != null) {
        state.form = {
            name: newValue.name ?? '',
            photo: newValue.photo != null ? (newValue.photo ? 'yes' : 'no') : null,
            parent_collaboration: newValue.parent_collaboration != null ? (newValue.parent_collaboration ? 'yes' : 'no') : null,
            student_collaboration: newValue.student_collaboration != null ? (newValue.student_collaboration ? 'yes' : 'no') : null,
            general_consent: newValue.general_consent != null ? (newValue.general_consent ? 'yes' : 'no') : null,
            personal_guardianship: newValue.personal_guardianship != null ? (newValue.personal_guardianship ? 'yes' : 'no') : null,
            financial_guardianship: newValue.financial_guardianship != null ? (newValue.financial_guardianship ? 'yes' : 'no') : null,
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

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', {
            name: state.form.name,
            photo: state.form.photo === 'yes' ? true : state.form.photo === 'no' ? false : null,
            parent_collaboration: state.form.parent_collaboration === 'yes' ? true : state.form.parent_collaboration === 'no' ? false : null,
            student_collaboration: state.form.student_collaboration === 'yes' ? true : state.form.student_collaboration === 'no' ? false : null,
            general_consent: state.form.general_consent === 'yes' ? true : state.form.general_consent === 'no' ? false : null,
            personal_guardianship: state.form.personal_guardianship === 'yes' ? true : state.form.personal_guardianship === 'no' ? false : null,
            financial_guardianship: state.form.financial_guardianship === 'yes' ? true : state.form.financial_guardianship === 'no' ? false : null,
        })
    }
}
</script>
