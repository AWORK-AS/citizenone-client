<template>
    <section v-if="drafts.length" data-testid="signup-drafts-card" aria-labelledby="signup-drafts-heading"
        class="rounded-xl bg-white ring-1 ring-gray-200 p-5">
        <div class="mb-3 flex items-center gap-2">
            <Icon name="ph:bookmark-simple" class="size-5 text-tertiary" aria-hidden="true" />
            <h3 id="signup-drafts-heading" class="font-semibold text-gray-900">{{ $t('signup.drafts.title') }}</h3>
        </div>
        <ul class="space-y-3">
            <li v-for="draft in drafts" :key="draft.uuid" class="rounded-lg bg-gray-50 px-3 py-3">
                <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p class="text-sm font-medium text-gray-900">{{ toolName(draft.tool) }}</p>
                        <p class="text-xxs text-gray-500">{{ formatDate(draft.created_at) }}</p>
                    </div>
                    <button type="button" :disabled="deleting === draft.uuid"
                        class="min-h-9 shrink-0 rounded-lg px-2.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                        :aria-label="$t('signup.drafts.deleteAria', { tool: toolName(draft.tool) })"
                        @click="remove(draft.uuid)">
                        {{ $t('signup.drafts.delete') }}
                    </button>
                </div>
                <dl v-if="rows(draft).length" class="mt-2 space-y-1 text-xs">
                    <div v-for="(row, i) in rows(draft)" :key="i" class="flex gap-2">
                        <dt class="shrink-0 text-gray-500">{{ row.label }}:</dt>
                        <dd class="min-w-0 break-words text-gray-800">{{ row.value }}</dd>
                    </div>
                </dl>
            </li>
        </ul>
    </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import moment from 'moment'
import { signupDraftService, type SignupDraft } from '@/components/api/user/SignupDraftService'
import { draftRows, humanize } from '@/composables/signupQuery'

const { t, te } = useI18n()
const drafts = ref<SignupDraft[]>([])
const deleting = ref('')

function toolName(tool: string) {
    return te(`signup.drafts.tools.${tool}`) ? t(`signup.drafts.tools.${tool}`) : humanize(tool)
}

function formatDate(value: string) {
    return moment(value).format('LL')
}

// Text interpolation only: the data is arbitrary JSON from a public tool.
function rows(draft: SignupDraft) {
    return draftRows(draft.data)
}

async function remove(uuid: string) {
    deleting.value = uuid
    try {
        await signupDraftService.deleteDraft(uuid)
        drafts.value = drafts.value.filter((draft) => draft.uuid !== uuid)
    } catch {
        // The failed-write notice is shown by the API layer.
    }
    deleting.value = ''
}

onMounted(async () => {
    try {
        const response = await signupDraftService.getDrafts()
        drafts.value = Array.isArray(response?.data) ? response.data : []
    } catch {
        drafts.value = []
    }
})
</script>
