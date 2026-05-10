<template>
    <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-4">
        <div v-if="syncStore.isSyncing || syncStore.isComplete"
            class="fixed bottom-4 right-4 z-50 w-72 bg-white rounded-xl shadow-lg border border-gray-200 p-4 space-y-3">

            <!-- Header -->
            <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                    <Icon name="simple-icons:openai" class="w-3.5 h-3.5 text-white" aria-hidden="true" />
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-900">
                        {{ syncStore.isComplete ? $t('ownChatGpt.syncComplete') : $t('ownChatGpt.syncing') }}
                    </p>
                    <p class="text-xs text-gray-400">{{ $t('ownChatGpt.title') }}</p>
                </div>
                <span class="text-xs font-medium text-gray-500 flex-shrink-0">
                    {{ Math.round(syncStore.progress) }}%
                </span>
                <button v-if="!syncStore.isComplete"
                    type="button"
                    class="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    @click="syncStore.cancelSync()">
                    <Icon name="ph:x" class="w-3 h-3" aria-hidden="true" />
                </button>
            </div>

            <!-- Progress bar -->
            <div class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div class="h-1.5 rounded-full transition-all duration-300"
                    :class="syncStore.isComplete ? 'bg-green-500' : 'bg-gray-900'"
                    :style="{ width: syncStore.progress + '%' }" />
            </div>

            <!-- Status row -->
            <div class="flex items-center gap-1.5">
                <Icon v-if="syncStore.isComplete" name="ph:check-circle" class="w-3.5 h-3.5 text-green-500" aria-hidden="true" />
                <Icon v-else name="ph:spinner" class="w-3.5 h-3.5 text-gray-400 animate-spin" aria-hidden="true" />
                <p class="text-xs text-gray-400">
                    {{ syncStore.isComplete ? $t('ownChatGpt.syncComplete') : $t('ownChatGpt.syncing') }}
                </p>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { useOwnChatGptSyncStore } from '@/store/own-chatgpt-sync'

const syncStore = useOwnChatGptSyncStore()
</script>
