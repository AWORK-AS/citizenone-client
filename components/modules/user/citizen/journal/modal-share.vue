<template>
    <div>
        <Modal size="xs" :title="$t('citizens.citizenJournals.shareJournal.shareJournal')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div v-if="['Success.', 'Succes.'].includes(state.selectedJournal?.message)">
                        <div class="bg-green-700 text-white flex items-center px-4 py-3 mb-4 rounded-lg" role="alert">
                            <svg class="flex-shrink-0 w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                    clip-rule="evenodd"></path>
                            </svg>
                            <div class="ml-3 text-sm font-medium">
                                <p class="hover:text-gray-200 cursor-pointer"
                                    @click="navigateToExternalLink(state.selectedJournal.data?.link)">
                                    {{ state.selectedJournal.data?.link }}
                                </p>
                            </div>
                        </div>
                    </div>
                    <form @submit.prevent="submitForm()">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="space-y-3">
                            <div class="space-y-1">
                                <FormLabel for="password"
                                    :label="$t('citizens.citizenJournals.shareJournal.form.password')" />
                                <FormPasswordField id="password" name="password"
                                    :placeholder="$t('citizens.citizenJournals.shareJournal.form.password')"
                                    v-model="state.formShare.password" />
                                <FormError :error="v$?.formShare?.password?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.name?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="confirm_password"
                                    :label="$t('citizens.citizenJournals.shareJournal.form.confirmPassword')" />
                                <FormPasswordField id="confirm_password" name="confirm_password"
                                    :placeholder="$t('citizens.citizenJournals.shareJournal.form.confirmPassword')"
                                    v-model="state.formShare.confirm_password" />
                                <FormError :error="v$?.formShare?.confirm_password?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.confirm_password?.[0]" />
                            </div>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                                    @click="emit('close')">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                                    {{ $t('citizens.citizenJournals.actions.share') }}
                                </FormButton>
                            </div>
                        </div>
                    </form>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { journalService } from '@/components/api/user/JournalService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers, minLength, sameAs } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedJournal: {
        type: Object,
        required: true
    }
})
const emit = defineEmits(['close'])
const { t } = useI18n()
const { successAlert } = useAlert()

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formShare: {
        password: '',
        confirm_password: '',
    },
    selectedJournal: {} as any,
})

const rules = computed(() => {
    return {
        formShare: {
            password: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                minLength: helpers.withMessage(`${t('citizens.citizenJournals.shareJournal.form.alert.required8Characters')}.`, minLength(8))
            },
            confirm_password: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                sameAsPassword: helpers.withMessage(`${t('citizens.citizenJournals.shareJournal.form.alert.enteredPasswordMismatched')}.`, sameAs(state.formShare.password)),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        state.error = {}
        state.selectedJournal = {}
    }
})

function closeModal() {
    emit('close')
}

async function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        state.isPageLoading = true
        try {
            const journalUuid = props?.selectedJournal?.uuid
            const params = {
                journal_uuids: [journalUuid],
                password: state.formShare.password,
            }
            const response = await journalService.shareJournal(params)
            if (response) {
                state.selectedJournal = response
                if (state.selectedJournal?.message === 'Success.' || state.selectedJournal?.message === 'Succes.') {
                    successAlert(`${t('alert.success')}!`, `${t('citizens.citizenJournals.shareJournal.form.alert.journalSuccessfullyShared')}.`)
                }
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    }
}

async function navigateToExternalLink(link: any) {
    await navigateTo(link, {
        external: true,
        open: {
            target: '_blank',
        }
    })
}
</script>