<template>
    <div>
        <Modal size="lg" :title="$t('handover.title')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="space-y-4">
                    <p class="text-sm text-gray-500">
                        {{ $t('handover.subtitle') }}
                    </p>

                    <LoadingSpinner :isActive="state.isLoading">
                        <Alert type="danger" :text="state.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />

                        <div v-if="state.summary" class="space-y-4">
                            <!-- Count chips -->
                            <div class="flex flex-wrap gap-2">
                                <span v-for="c in countChips" :key="c.label"
                                    class="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1 text-xxs font-medium text-gray-600">
                                    <Icon :name="c.icon" class="size-3.5 text-gray-400" aria-hidden="true" />
                                    {{ c.label }}: {{ c.value }}
                                </span>
                            </div>

                            <!-- AI summary -->
                            <div class="rounded-xl border border-gray-200 bg-white p-4">
                                <div class="content prose-sm max-w-none text-sm text-gray-800" v-html="state.summary" />
                            </div>

                            <p class="flex items-center gap-1.5 text-xxs text-gray-400">
                                <Icon name="ph:sparkle-fill" class="size-3 text-violet-500" />
                                {{ $t('handover.aiNote') }}
                            </p>
                        </div>

                        <div v-else-if="!state.isLoading && !state.error?.message"
                            class="py-10 text-center text-sm text-gray-400">
                            {{ $t('handover.empty') }}
                        </div>
                    </LoadingSpinner>

                    <div class="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormButton type="button" buttonStyle="action" class="w-full" :disabled="state.isLoading"
                            @click="fetchSummary">
                            <Icon name="ph:arrows-clockwise" class="size-4" />
                            {{ $t('handover.regenerate') }}
                        </FormButton>
                        <FormButton type="button" buttonStyle="cancel" class="w-full" @click="closeModal">
                            {{ $t('close') }}
                        </FormButton>
                    </div>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { aIAssistantService } from '@/components/api/user/AIAssistantService'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const { t } = useI18n()

const props = defineProps({
    isModalOpen: { type: Boolean, default: false },
    department: { type: String, default: '' },
    date: { type: String, default: '' },
})

const emit = defineEmits(['close'])

const state = reactive({
    isLoading: false,
    summary: '' as string,
    counts: {} as any,
    error: {} as Error,
})

const countChips = computed(() => {
    const c = state.counts || {}
    return [
        { label: t('handover.counts.journals'), value: c.journals ?? 0, icon: 'ph:note' },
        { label: t('handover.counts.medsGiven'), value: c.medicine_given ?? 0, icon: 'solar:jar-of-pills-2-linear' },
        { label: t('handover.counts.medsMissed'), value: c.medicine_missed ?? 0, icon: 'ph:warning-circle' },
        { label: t('handover.counts.incidents'), value: c.incidents ?? 0, icon: 'ph:first-aid' },
        { label: t('handover.counts.useOfForce'), value: c.use_of_force ?? 0, icon: 'ph:shield-warning' },
    ]
})

watch(() => props.isModalOpen, (open) => {
    if (open) fetchSummary()
})

async function fetchSummary() {
    state.error = {}
    state.isLoading = true
    state.summary = ''
    try {
        const response = await aIAssistantService.generateHandover({
            date: props.date || undefined,
            department: props.department || undefined,
        })
        state.summary = response?.data?.summary ?? ''
        state.counts = response?.data?.counts ?? {}
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function closeModal() {
    emit('close')
}
</script>
