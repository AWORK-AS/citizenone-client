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

                <!-- Microsoft connection guide -->
                <div class="mt-4 border border-[#DEECF9] rounded-xl overflow-hidden">
                    <button type="button"
                        class="w-full flex items-center justify-between px-4 py-3 bg-[#F0F6FD] text-left"
                        @click="state.isMicrosoftGuideOpen = !state.isMicrosoftGuideOpen">
                        <div class="flex items-center gap-2">
                            <Icon name="ph:microsoft-outlook-logo" class="w-4 h-4 text-[#0078D4]" />
                            <span class="text-[13px] font-medium text-[#0078D4]">
                                {{ $t('mail.chooseYourEmailConfiguration.microsoftGuide.title') }}
                            </span>
                        </div>
                        <Icon :name="state.isMicrosoftGuideOpen ? 'ph:caret-up' : 'ph:caret-down'"
                            class="w-4 h-4 text-[#0078D4]" />
                    </button>
                    <div v-show="state.isMicrosoftGuideOpen"
                        class="px-4 py-3 bg-white space-y-3 text-[13px] text-[#374151]">
                        <p>{{ $t('mail.chooseYourEmailConfiguration.microsoftGuide.intro') }}</p>
                        <ol class="space-y-1.5 list-decimal list-inside">
                            <li>{{ $t('mail.chooseYourEmailConfiguration.microsoftGuide.step1') }}</li>
                            <li>{{ $t('mail.chooseYourEmailConfiguration.microsoftGuide.step2') }}</li>
                            <li>{{ $t('mail.chooseYourEmailConfiguration.microsoftGuide.step3') }}</li>
                            <li>
                                {{ $t('mail.chooseYourEmailConfiguration.microsoftGuide.step4') }}
                                <ul class="mt-1 ml-4 space-y-0.5 list-disc list-inside text-[#6B7280]">
                                    <li>{{ $t('mail.chooseYourEmailConfiguration.microsoftGuide.step4Accept') }}</li>
                                    <li>{{ $t('mail.chooseYourEmailConfiguration.microsoftGuide.step4Request') }}</li>
                                </ul>
                                <p class="mt-1 ml-4 text-[#6B7280]">
                                    {{ $t('mail.chooseYourEmailConfiguration.microsoftGuide.step4Hint') }}
                                </p>
                            </li>
                            <li>{{ $t('mail.chooseYourEmailConfiguration.microsoftGuide.step5') }}</li>
                            <li>{{ $t('mail.chooseYourEmailConfiguration.microsoftGuide.step6') }}</li>
                        </ol>
                        <p class="text-[#6B7280]">
                            {{ $t('mail.chooseYourEmailConfiguration.microsoftGuide.stayConnected') }}
                        </p>
                        <div class="border-t border-[#DEECF9] pt-2 space-y-2">
                            <p class="font-medium text-[#374151]">
                                {{ $t('mail.chooseYourEmailConfiguration.microsoftGuide.troubleshootTitle') }}
                            </p>
                            <div>
                                <p class="font-medium text-[#6B7280]">{{
                                    $t('mail.chooseYourEmailConfiguration.microsoftGuide.troubleshoot1Q') }}</p>
                                <p class="text-[#6B7280]">{{
                                    $t('mail.chooseYourEmailConfiguration.microsoftGuide.troubleshoot1A') }}</p>
                            </div>
                            <div>
                                <p class="font-medium text-[#6B7280]">{{
                                    $t('mail.chooseYourEmailConfiguration.microsoftGuide.troubleshoot2Q') }}</p>
                                <p class="text-[#6B7280]">{{
                                    $t('mail.chooseYourEmailConfiguration.microsoftGuide.troubleshoot2A') }}</p>
                            </div>
                            <div>
                                <p class="font-medium text-[#6B7280]">{{
                                    $t('mail.chooseYourEmailConfiguration.microsoftGuide.troubleshoot3Q') }}</p>
                                <p class="text-[#6B7280]">{{
                                    $t('mail.chooseYourEmailConfiguration.microsoftGuide.troubleshoot3A') }}</p>
                            </div>
                        </div>
                    </div>
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
    isMicrosoftGuideOpen: false,
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