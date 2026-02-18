<template>
    <div>
        <Modal size="xs" :title="$t('citizens.citizenJournals.shareJournal.shareJournal')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <form @submit.prevent="submitForm()">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="space-y-1">
                        <FormLabel for="password" :label="$t('citizens.citizenJournals.shareJournal.form.password')" />
                        <FormPasswordField id="password" name="password"
                            :placeholder="$t('citizens.citizenJournals.shareJournal.form.password')"
                            v-model="state.formShare.password" />
                        <FormError :error="v$?.formShare?.password?.$errors[0]?.$message.toString()" />
                        <FormError :error="state?.error?.errors?.name?.[0]" />
                    </div>
                    <div class="mt-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="emit('close')">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                                {{ $t('citizens.citizenJournals.actions.share') }}
                            </FormButton>
                        </div>
                    </div>
                </form>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { journalService } from '@/components/api/user/JournalService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
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

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formShare: {
        password: '',
    },
    selectedJournal: {} as any,
})

const rules = computed(() => {
    return {
        formShare: {
            password: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

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
                password: state.formShare.password,
            }
            const response = await journalService.shareJournal(journalUuid, params)
            if (response) {
                state.selectedJournal = response
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    }
}
</script>