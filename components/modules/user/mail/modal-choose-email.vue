<template>
    <div>
        <Modal size="sm" :title="$t('mail.chooseYourEmailConfiguration.chooseYourEmailConfiguration')"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="flex items-center gap-x-2">
                    <FormButton buttonStyle="primary" @click="loginViaMicrosoft" class="w-full rounded-md">
                        {{ $t('mail.chooseYourEmailConfiguration.loginViaMicrosoft') }}
                    </FormButton>
                    <FormButton buttonStyle="primary" @click="state.modal.isConnectYourSmtpOpen = true"
                        class="w-full rounded-md">
                        {{ $t('mail.chooseYourEmailConfiguration.loginViaSmtp') }}
                    </FormButton>
                </div>
                <ModulesUserMailModalConfigureSmtp :isModalOpen="state.modal.isConnectYourSmtpOpen" formType="create"
                    @close="state.modal.isConnectYourSmtpOpen = false" />
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

const emit = defineEmits(['close'])

const state = reactive({
    modal: {
        isConnectYourSmtpOpen: false,
    },
})

function closeModal() {
    emit('close')
}

function loginViaMicrosoft() {
    const params = {

    }
    navigateToExternalLink(`https://login.microsoftonline.com/${runtimeConfig.public.azureTenantId}/oauth2/v2.0/authorize?${params}`)
}

async function navigateToExternalLink(link: string) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    await navigateTo(link, {
        external: true,
        open: {
            target: '_blank',
        }
    })
}
</script>