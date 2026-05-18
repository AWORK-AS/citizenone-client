<template>
    <div>
        <Modal size="md" :title="$t('ownChatGpt.settings')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="space-y-4">
                    <Alert type="danger" :text="state.settingsError" v-if="state.settingsError" />
                    <Alert type="success" :text="$t('ownChatGpt.savedSuccess')" v-if="state.settingsSuccess" />
                    <div class="space-y-1">
                        <label class="text-sm font-medium text-gray-700">{{ $t('ownChatGpt.apiKey') }}</label>
                        <input v-model="state.apiKey" type="password"
                            :placeholder="$t('ownChatGpt.apiKeyPlaceholder')"
                            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <div class="flex items-start gap-2 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2.5">
                        <Icon name="ph:key" class="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <p class="text-xs text-gray-500">
                            {{ $t('ownChatGpt.apiKeyInstructions') }}
                            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer"
                                class="font-medium text-primary hover:underline">
                                {{ $t('ownChatGpt.apiKeyInstructionsLink') }}
                            </a>
                        </p>
                    </div>
                    <div class="flex justify-end gap-x-2 pt-2">
                        <FormButton buttonStyle="cancel" @click="closeModal">
                            {{ $t('close') }}
                        </FormButton>
                        <FormButton buttonStyle="primary" :isLoading="state.isSavingKey" @click="saveApiKey">
                            {{ $t('ownChatGpt.save') }}
                        </FormButton>
                    </div>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { ownChatGptService } from '@/components/api/user/OwnChatGptService'

const props = defineProps<{ isModalOpen: boolean }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

const state = reactive({
    apiKey: '',
    isSavingKey: false,
    settingsError: '',
    settingsSuccess: false,
})

function closeModal() {
    state.apiKey = ''
    state.settingsError = ''
    state.settingsSuccess = false
    emit('close')
}

async function saveApiKey() {
    state.settingsError = ''
    state.settingsSuccess = false
    state.isSavingKey = true
    try {
        await ownChatGptService.saveApiKey({ api_key: state.apiKey })
        state.settingsSuccess = true
        state.apiKey = ''
        setTimeout(() => {
            state.settingsSuccess = false
            emit('saved')
            emit('close')
        }, 1500)
    } catch (e: any) {
        state.settingsError = e?.message ?? 'Something went wrong'
    } finally {
        state.isSavingKey = false
    }
}
</script>
