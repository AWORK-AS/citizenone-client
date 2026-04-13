<template>
    <div>
        <Modal size="sm" :title="$t('mail.chooseYourEmailConfiguration.chooseYourEmailConfiguration')"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="flex items-center gap-x-2">
                    <FormButton buttonStyle="primary" @click="loginViaMicrosoft" class="w-full">
                        {{ $t('mail.chooseYourEmailConfiguration.loginViaMicrosoft') }}
                    </FormButton>
                    <FormButton buttonStyle="primary" @click="state.modal.isConnectYourSmtpOpen = true" class="w-full">
                        {{ $t('mail.chooseYourEmailConfiguration.loginViaSmtp') }}
                    </FormButton>
                </div>
                <ModulesUserMailModalConfigureSmtp :isModalOpen="state.modal.isConnectYourSmtpOpen" formType="create"
                    @close="state.modal.isConnectYourSmtpOpen = false" @closeChooseEmail="closeChooseEmail" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['close', 'refreshEmailConfig'])

const state = reactive({
    modal: {
        isConnectYourSmtpOpen: false,
    },
})

function closeModal() {
    emit('close')
}

function closeChooseEmail() {
    emit('close')
    emit('refreshEmailConfig')
}

function loginViaMicrosoft() {
    const state = generateState()
    const params = new URLSearchParams()
    params.append('client_id', runtimeConfig.public.azureClientId)
    params.append('response_type', 'code')
    params.append('redirect_uri', runtimeConfig.public.azureRedirectUri)
    params.append('response_mode', 'query')
    params.append('scope', runtimeConfig.public.azureScopes)
    params.append('state', state)
    params.append('prompt', 'consent')
    const url = `https://login.microsoftonline.com/${runtimeConfig.public.azureTenantId}/oauth2/v2.0/authorize?${params.toString()}`
    navigateToExternalLink(url)
}

function generateState(): string {
    // Generate a random 10-byte state and convert it to hexadecimal
    const randomBytes = new Uint8Array(10)
    crypto.getRandomValues(randomBytes)
    return Array.from(randomBytes).map(byte => byte.toString(16).padStart(2, '0')).join('')
}

async function navigateToExternalLink(link: string) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    await navigateTo(link, {
        external: true,
    })
}
</script>