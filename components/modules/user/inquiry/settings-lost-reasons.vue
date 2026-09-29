<template>
    <!-- The company's own list of why cases are lost. A reason that has been
         used is deactivated rather than deleted, so the report keeps it. -->
    <div class="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
        <div>
            <p class="text-sm font-semibold text-gray-900">{{ $t('inquiryLost.settings.title') }}</p>
            <p class="mt-1 max-w-2xl text-xs text-gray-500">{{ $t('inquiryLost.settings.description') }}</p>
        </div>

        <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />

        <div class="divide-y divide-gray-100 rounded-lg border border-gray-100">
            <div v-for="(reason, index) in state.reasons" :key="reason.uuid" class="flex flex-wrap items-center gap-3 p-3">
                <div class="w-full sm:w-72">
                    <FormTextField :id="`lost-reason-${reason.uuid}`" :name="`lost-reason-${reason.uuid}`"
                        v-model="reason.name" :placeholder="$t('inquiryLost.settings.namePlaceholder')" :maxLength="120"
                        @blur="saveReason(reason)" />
                </div>
                <label class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input type="checkbox" class="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                        :checked="reason.is_active"
                        @change="reason.is_active = ($event.target as HTMLInputElement).checked; saveReason(reason)" />
                    {{ $t('inquiryLost.settings.active') }}
                </label>
                <div class="ml-auto flex items-center gap-2">
                    <Tooltip :text="$t('inquiryPipelineStages.actions.moveUp')">
                        <FormButton type="button" buttonStyle="action" :disabled="index === 0"
                            :aria-label="$t('inquiryPipelineStages.actions.moveUp')" @click="move(index, -1)">
                            <Icon name="ph:arrow-up" class="size-4" />
                        </FormButton>
                    </Tooltip>
                    <Tooltip :text="$t('inquiryPipelineStages.actions.moveDown')">
                        <FormButton type="button" buttonStyle="action" :disabled="index === state.reasons.length - 1"
                            :aria-label="$t('inquiryPipelineStages.actions.moveDown')" @click="move(index, 1)">
                            <Icon name="ph:arrow-down" class="size-4" />
                        </FormButton>
                    </Tooltip>
                    <Tooltip :text="$t('inquiryLost.settings.delete')">
                        <FormButton type="button" buttonStyle="danger" :aria-label="$t('inquiryLost.settings.delete')"
                            @click="deleteReason(reason)">
                            <Icon name="ph:trash" class="size-4" />
                        </FormButton>
                    </Tooltip>
                </div>
            </div>
            <p v-if="!state.isLoading && state.reasons.length === 0" class="p-4 text-sm text-gray-400">
                {{ $t('inquiryLost.settings.empty') }}
            </p>
        </div>

        <div class="flex flex-wrap items-end gap-3">
            <div class="w-full sm:w-72">
                <FormLabel for="new-lost-reason" :label="$t('inquiryLost.settings.newReason')" />
                <FormTextField id="new-lost-reason" name="new-lost-reason" v-model="state.newName"
                    :placeholder="$t('inquiryLost.settings.namePlaceholder')" :maxLength="120" />
            </div>
            <FormButton type="button" buttonStyle="action" :disabled="!state.newName.trim()" @click="addReason">
                <Icon name="ph:plus" class="size-4" />
                {{ $t('inquiryLost.settings.add') }}
            </FormButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { inquiryLostReasonService } from '@/components/api/user/InquiryLostReasonService'
import type { Error } from '@/types'

const state = reactive({
    error: {} as Error,
    isLoading: false,
    newName: '',
    reasons: [] as any[],
})

onMounted(() => {
    fetchReasons()
})

async function fetchReasons() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await inquiryLostReasonService.getReasons()
        state.reasons = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function addReason() {
    state.error = {}
    try {
        await inquiryLostReasonService.saveReason({ name: state.newName.trim() })
        state.newName = ''
        await fetchReasons()
    } catch (error: any) {
        state.error = error
    }
}

async function saveReason(reason: any) {
    if (!reason?.name?.trim()) return
    state.error = {}
    try {
        await inquiryLostReasonService.updateReason(reason.uuid, { name: reason.name.trim(), is_active: !!reason.is_active })
    } catch (error: any) {
        state.error = error
        fetchReasons()
    }
}

async function deleteReason(reason: any) {
    state.error = {}
    try {
        await inquiryLostReasonService.deleteReason(reason.uuid)
        await fetchReasons()
    } catch (error: any) {
        // In use: the message says to deactivate it instead.
        state.error = error
    }
}

async function move(index: number, direction: number) {
    const target = index + direction
    if (target < 0 || target >= state.reasons.length) return

    const reordered = [...state.reasons]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(target, 0, moved)
    state.reasons = reordered

    try {
        const response = await inquiryLostReasonService.reorderReasons(reordered.map((reason: any) => reason.uuid))
        state.reasons = response?.data ?? reordered
    } catch (error: any) {
        state.error = error
        fetchReasons()
    }
}
</script>
