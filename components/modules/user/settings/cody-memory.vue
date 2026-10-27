<template>
    <div>
        <p class="text-sm text-gray-600">{{ $t('settings.profile.codyMemory.description') }}</p>
        <p class="mt-1 text-xs text-gray-500">
            {{ $t('settings.profile.codyMemory.limit', { count: state.limit }) }}
        </p>
        <p class="mt-0.5 text-xs text-gray-500">{{ $t('settings.profile.codyMemory.reset') }}</p>
        <p class="mt-0.5 text-xs text-gray-500">{{ $t('settings.profile.codyMemory.freshConversations') }}</p>

        <div v-if="state.isLoading" class="mt-4 space-y-2" aria-hidden="true">
            <div v-for="n in 3" :key="n" class="h-10 animate-pulse rounded-md bg-gray-100" />
        </div>

        <p v-else-if="state.loadFailed" class="mt-4 text-sm text-gray-600">
            {{ $t('settings.profile.codyMemory.loadFailed') }}
        </p>

        <div v-else-if="state.memories.length === 0"
            class="mt-4 flex items-start gap-2 rounded-md bg-ai-bg px-3 py-2.5 text-sm text-ai-ink">
            <Icon name="ph:brain" class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{{ $t('settings.profile.codyMemory.empty') }}</span>
        </div>

        <template v-else>
            <ul class="mt-4 divide-y divide-gray-100 rounded-md ring-1 ring-gray-200">
                <li v-for="memory in state.memories" :key="memory.uuid"
                    class="flex items-start justify-between gap-3 px-3 py-2.5">
                    <div class="min-w-0">
                        <p class="text-sm text-gray-800 break-words">{{ memory.content }}</p>
                        <p v-if="memory.learned_at" class="mt-0.5 text-xs text-gray-500">
                            {{ $t('settings.profile.codyMemory.learnedAt', { date: formatDate(memory.learned_at) }) }}
                        </p>
                    </div>
                    <button type="button" :disabled="state.busy === memory.uuid"
                        :aria-label="$t('settings.profile.codyMemory.forgetOneLabel', { content: memory.content })"
                        class="shrink-0 rounded px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-40"
                        @click="forget(memory.uuid)">
                        {{ $t('settings.profile.codyMemory.forgetOne') }}
                    </button>
                </li>
            </ul>

            <FormButton buttonStyle="danger" class="mt-4" :disabled="state.busy !== null"
                @click="state.isConfirmOpen = true">
                <Icon name="ph:trash" class="mr-1.5 h-4 w-4" aria-hidden="true" />
                {{ $t('settings.profile.codyMemory.forgetAll') }}
            </FormButton>
        </template>

        <DialogConfirmation :isModalOpen="state.isConfirmOpen"
            :title="$t('settings.profile.codyMemory.forgetAllTitle')"
            :message="$t('settings.profile.codyMemory.forgetAllMessage')"
            :confirmLabel="$t('settings.profile.codyMemory.forgetAll')"
            @close="state.isConfirmOpen = false" @confirm="forgetAll" />
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { codyMemoryService } from '@/components/api/user/CodyMemoryService'
import { sortMemories, withoutMemory } from '@/composables/codyMemory'
import type { CodyMemory } from '@/composables/codyMemory'
import { storageLocale } from '@/composables/storageFormat'
import { useAlert } from '@/composables/alert'

/**
 * "Det husker Cody AI": what Cody AI has noted about how this person works.
 * Theirs alone to read and delete; nobody else has a way to this list.
 */
const { t, locale } = useI18n()
const { errorAlert } = useAlert()

const state = reactive({
    isLoading: true,
    loadFailed: false,
    memories: [] as CodyMemory[],
    limit: 30,
    busy: null as string | null,
    isConfirmOpen: false,
})

function formatDate(value: string): string {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''

    return date.toLocaleDateString(storageLocale(locale.value), { day: 'numeric', month: 'long', year: 'numeric' })
}

async function load() {
    state.isLoading = true
    state.loadFailed = false
    try {
        const response = await codyMemoryService.list()
        state.memories = sortMemories(response?.data ?? [])
        state.limit = response?.meta?.limit ?? state.limit
    } catch {
        state.loadFailed = true
    }
    state.isLoading = false
}

async function forget(uuid: string) {
    state.busy = uuid
    try {
        await codyMemoryService.forget(uuid)
        state.memories = withoutMemory(state.memories, uuid)
    } catch {
        errorAlert(t('alert.somethingWentWrong'), t('settings.profile.codyMemory.forgetFailed'))
    }
    state.busy = null
}

async function forgetAll() {
    state.busy = 'all'
    try {
        await codyMemoryService.forgetAll()
        state.memories = []
    } catch {
        errorAlert(t('alert.somethingWentWrong'), t('settings.profile.codyMemory.forgetFailed'))
    }
    state.busy = null
}

onMounted(load)
</script>
