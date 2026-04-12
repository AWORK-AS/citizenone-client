<template>
    <div>
        <Modal size="sm" :title="$t('2fa.2fa')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div v-if="language.locale.value === 'en'">
                    <div class="space-y-3">
                        <Alert type="default"
                            text="Action Required: For added security, you must enable Two-Factor Authentication (2FA) for your account." />
                        <p class="text-sm">
                            Two-Factor Authentication (2FA) adds an extra layer of protection to your account. It
                            requires not only your password but also a second method of verification.
                        </p>
                        <p class="text-sm">
                            Click the button below to activate 2FA and secure your account.
                        </p>
                    </div>
                </div>
                <div v-if="language.locale.value === 'dk'">
                    <div class="space-y-3">
                        <Alert type="default"
                            text="Handling krævet: For ekstra sikkerhed skal du aktivere To-faktor Autentifikation (2FA) for din konto." />
                        <p class="text-sm">
                            To-faktor Autentifikation (2FA) tilføjer et ekstra beskyttelseslag til din konto. Det kræver
                            ikke kun dit password, men også en anden metode til verifikation.
                        </p>
                        <p class="text-sm">
                            Klik på knappen nedenfor for at aktivere 2FA og sikre din konto.
                        </p>
                    </div>
                </div>
                <div class="mt-5 flex gap-x-3">
                    <FormButton @click="closeModal" class="w-full">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton buttonStyle="primary" @click="state.modal.isVerify2faOpen = true" class="w-full">
                        {{ $t('2fa.enable') }}
                    </FormButton>
                </div>
                <ModulesUserSettings2faGoogleModalVerify :isModalOpen="state.modal.isVerify2faOpen"
                    :google2fa="state.form2fa" @close="state.modal.isVerify2faOpen = false"
                    @setGoogle2faStatus="setGoogle2faStatus" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"

const userStore = useUserStore() as any
const language = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close'])

const state = reactive({
    form2fa: {
        is_google_2fa_enabled: userStore.getUser?.is_google_2fa_enabled,
    },
    modal: {
        isVerify2faOpen: false
    },
})

function closeModal() {
    emit('close')
}

function setGoogle2faStatus(status: boolean) {
    state.form2fa.is_google_2fa_enabled = status
}
</script>