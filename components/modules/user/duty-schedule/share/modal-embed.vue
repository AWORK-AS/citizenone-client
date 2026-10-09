<template>
    <div>
        <Modal size="md":title="$t('dutySchedules.shareDutySchedule.embed.title')" :show="props.isModalOpen"
            @close="emit('close')">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isLoading">
                    <div class="space-y-4">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <p class="text-sm text-gray-600">
                            {{ $t('dutySchedules.shareDutySchedule.embed.description') }}
                        </p>

                        <template v-if="embedToken">
                            <div class="space-y-1">
                                <FormLabel for="duty_schedule_embed_code"
                                    :label="$t('dutySchedules.shareDutySchedule.embed.embedCode')" />
                                <p class="text-xs text-gray-500">
                                    {{ $t('dutySchedules.shareDutySchedule.embed.embedCodeHelp') }}
                                </p>
                                <div class="flex items-center gap-x-2">
                                    <textarea id="duty_schedule_embed_code" readonly rows="4" :value="embedSnippet"
                                        class="flex-1 min-w-0 rounded-md border border-gray-300 p-2 text-xs font-mono text-gray-600 bg-gray-50" />
                                    <button type="button" @click="copyEmbedSnippet"
                                        class="shrink-0 flex items-center gap-x-1 h-11 px-3 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 whitespace-nowrap">
                                        <Icon :name="state.embedCopied ? 'ph:check' : 'ph:copy'" size="16" />
                                        {{ state.embedCopied ? $t('dutySchedules.shareDutySchedule.embed.codeCopied') :
                                            $t('dutySchedules.shareDutySchedule.embed.copyCode') }}
                                    </button>
                                </div>
                                <a :href="embedUrl" target="_blank" rel="noopener"
                                    class="inline-flex items-center gap-x-1 text-sm text-primary hover:text-primary-700">
                                    <Icon name="ph:arrow-square-out" size="16" />
                                    {{ $t('dutySchedules.shareDutySchedule.embed.openPreview') }}
                                </a>
                            </div>
                            <div class="space-y-2 border-t border-gray-100 pt-4">
                                <p class="text-xs text-gray-500">
                                    {{ $t('dutySchedules.shareDutySchedule.embed.disableHelp') }}
                                </p>
                                <FormButton type="button" buttonStyle="danger" @click="disableEmbed">
                                    {{ $t('dutySchedules.shareDutySchedule.embed.disable') }}
                                </FormButton>
                            </div>
                        </template>
                        <FormButton v-else type="button" buttonStyle="primary" @click="enableEmbed">
                            {{ $t('dutySchedules.shareDutySchedule.embed.enable') }}
                        </FormButton>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { dutyScheduleService } from '@/components/api/user/DutyScheduleService'
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    sharedSchedule: {
        type: Object as PropType<any>,
        default: null,
    },
})
const emit = defineEmits(['close', 'refreshSharedDutySchedules'])
const { successAlert } = useAlert()
const { t } = useI18n()
const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore()

const state = reactive({
    embedCopied: false,
    embedToken: null as string | null,
    error: {} as Error,
    isLoading: false,
})

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        state.error = {}
        state.embedCopied = false
        state.embedToken = props.sharedSchedule?.embed_token ?? null
    }
})

const embedToken = computed(() => state.embedToken)

// The embed opens in the language of whoever set it up; the visitors on the
// customer's website are not signed in, so there is no language of theirs to use.
const embedUrl = computed(() =>
    `${runtimeConfig.public.appBaseURL}/embed/duty-schedules/${state.embedToken}?locale=${userStore.getLanguage ?? 'dk'}`
)

const embedSnippet = computed(() =>
    `<iframe src="${embedUrl.value}" title="${t('dutySchedules.shareDutySchedule.dutySchedule')}" width="100%" height="600" style="border:0" loading="lazy"><\/iframe>`
)

function copyEmbedSnippet() {
    navigator.clipboard.writeText(embedSnippet.value)
    state.embedCopied = true
    setTimeout(() => { state.embedCopied = false }, 2000)
}

async function enableEmbed() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await dutyScheduleService.enableSharedDutyScheduleEmbed(props.sharedSchedule.uuid)
        if (response) {
            state.embedToken = response.data?.embed_token ?? null
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.shareDutySchedule.embed.enabled')}.`)
            emit('refreshSharedDutySchedules')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function disableEmbed() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await dutyScheduleService.disableSharedDutyScheduleEmbed(props.sharedSchedule.uuid)
        if (response) {
            state.embedToken = null
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.shareDutySchedule.embed.disabled')}.`)
            emit('refreshSharedDutySchedules')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}
</script>
