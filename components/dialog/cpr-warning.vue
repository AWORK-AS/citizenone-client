<template>
    <!-- Mounted once in app.vue; every chat composer asks through
         useChatCprWarning().confirmChatText. Closing the dialog any other way
         means the same as "Edit message": nothing is sent and the text stays. -->
    <Modal size="xs" :title="$t('messages.cprWarning.title')" titleIcon="ph:warning" titleIconColor="F59E0B"
        :show="isOpen" @close="answer(false)">
        <template #modal-body>
            <p>{{ $t('messages.cprWarning.message') }}</p>
            <div class="mt-5 flex gap-x-3">
                <FormButton buttonStyle="cancel" @click="answer(true)" class="w-full">
                    {{ $t('messages.cprWarning.sendAnyway') }}
                </FormButton>
                <FormButton buttonStyle="primary" @click="answer(false)" class="w-full">
                    {{ $t('messages.cprWarning.editMessage') }}
                </FormButton>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { useChatCprWarning } from '@/composables/chatCprWarning'

const { isOpen, answer } = useChatCprWarning()
</script>
