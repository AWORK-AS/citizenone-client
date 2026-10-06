<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('dischargeReasons.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('dischargeReasons.title') }}</template>

            <div class="mt-8 space-y-5">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <div class="flex flex-wrap items-start justify-between gap-3">
                    <p class="max-w-2xl text-sm text-gray-500">{{ $t('dischargeReasons.description') }}</p>
                    <Tooltip :text="$t('dischargeReasons.reportHint')">
                        <FormButton type="button" buttonStyle="action" @click="navigateTo('/reports/discharge-reasons')">
                            <Icon name="ph:chart-bar" class="size-4" />
                            {{ $t('dischargeReasons.report.title') }}
                        </FormButton>
                    </Tooltip>
                </div>

                <div class="rounded-lg border border-gray-200 bg-white">
                    <div v-if="canManage" class="flex flex-wrap items-end gap-3 border-b border-gray-100 px-4 py-3">
                        <div class="w-64">
                            <FormLabel for="new-reason" :label="$t('dischargeReasons.form.name')" />
                            <FormTextField id="new-reason" name="new-reason" v-model="state.draft"
                                :placeholder="$t('dischargeReasons.form.namePlaceholder')" :maxLength="120" />
                        </div>
                        <Tooltip :text="$t('dischargeReasons.addHint')">
                            <FormButton type="button" buttonStyle="action" :disabled="!state.draft.trim()" @click="add">
                                <Icon name="ph:plus" class="size-4" />
                                {{ $t('dischargeReasons.add') }}
                            </FormButton>
                        </Tooltip>
                    </div>

                    <p v-if="!state.reasons.length" class="px-4 py-5 text-sm text-gray-400">{{ $t('dischargeReasons.empty') }}</p>

                    <div v-for="(reason, index) in state.reasons" :key="reason.uuid"
                        class="flex flex-wrap items-center gap-3 border-b border-gray-50 px-4 py-2.5 last:border-b-0">
                        <div class="min-w-0 flex-1">
                            <div v-if="state.editing === reason.uuid" class="w-64">
                                <FormTextField :id="`reason-${reason.uuid}`" :name="`reason-${reason.uuid}`"
                                    v-model="state.editName" :placeholder="reason.name" :maxLength="120" />
                            </div>
                            <p v-else class="text-sm font-medium text-gray-900"
                                :class="!reason.is_active && 'text-gray-400 line-through'">{{ reason.name }}</p>
                        </div>
                        <div v-if="canManage" class="flex items-center gap-2">
                            <template v-if="state.editing === reason.uuid">
                                <FormButton type="button" buttonStyle="cancel" @click="state.editing = ''">{{ $t('cancel') }}</FormButton>
                                <FormButton type="button" buttonStyle="primary" :disabled="!state.editName.trim()"
                                    @click="update(reason, { name: state.editName.trim() })">{{ $t('save') }}</FormButton>
                            </template>
                            <template v-else>
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
                                <Tooltip :text="reason.is_active ? $t('dischargeReasons.actions.switchOff') : $t('dischargeReasons.actions.switchOn')">
                                    <FormButton type="button" buttonStyle="action"
                                        :aria-label="reason.is_active ? $t('dischargeReasons.actions.switchOff') : $t('dischargeReasons.actions.switchOn')"
                                        @click="update(reason, { is_active: !reason.is_active })">
                                        <Icon :name="reason.is_active ? 'ph:eye' : 'ph:eye-slash'" class="size-4" />
                                    </FormButton>
                                </Tooltip>
                                <Tooltip :text="$t('dischargeReasons.actions.rename')">
                                    <FormButton type="button" buttonStyle="action" :aria-label="$t('dischargeReasons.actions.rename')"
                                        @click="state.editing = reason.uuid; state.editName = reason.name">
                                        <Icon name="ph:pencil-simple" class="size-4" />
                                    </FormButton>
                                </Tooltip>
                                <Tooltip :text="$t('dischargeReasons.actions.delete')">
                                    <FormButton type="button" buttonStyle="danger" :aria-label="$t('dischargeReasons.actions.delete')"
                                        @click="remove(reason)">
                                        <Icon name="ph:trash" class="size-4" />
                                    </FormButton>
                                </Tooltip>
                            </template>
                        </div>
                    </div>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'require-page', requiredPage: 'Citizens' })

import { dischargeReasonService } from '@/components/api/user/DischargeReasonService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert, errorAlert } = useAlert()
const { t } = useI18n()
const { isAtLeast, can } = usePermissions()

const breadcrumbLinks = [{ name: 'dischargeReasons.title', translate: true, href: '/settings/discharge-reasons' }]

const canManage = computed(() => isAtLeast('Admin') || can('update'))

const state = reactive({
    error: {} as Error,
    reasons: [] as any[],
    draft: '',
    editing: '',
    editName: '',
})

onMounted(fetchReasons)

async function fetchReasons() {
    state.error = {}
    try {
        const response = await dischargeReasonService.getReasons()
        state.reasons = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
}

async function add() {
    try {
        await dischargeReasonService.saveReason({ name: state.draft.trim() })
        state.draft = ''
        await fetchReasons()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.errors?.name?.[0] ?? error?.message ?? t('dischargeReasons.alert.saveFailed'))
    }
}

async function update(reason: any, params: object) {
    try {
        await dischargeReasonService.updateReason(reason.uuid, params)
        state.editing = ''
        await fetchReasons()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('dischargeReasons.alert.saveFailed'))
    }
}

async function remove(reason: any) {
    try {
        await dischargeReasonService.deleteReason(reason.uuid)
        await fetchReasons()
        successAlert(`${t('alert.success')}!`, `${t('dischargeReasons.alert.deleted')}.`)
    } catch (error: any) {
        // In use: the refusal says to switch it off instead.
        errorAlert(t('alert.warning'), error?.message ?? t('dischargeReasons.alert.deleteFailed'))
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
        const response = await dischargeReasonService.reorderReasons(reordered.map((reason: any) => reason.uuid))
        state.reasons = response?.data ?? reordered
    } catch (error: any) {
        state.error = error
        fetchReasons()
    }
}
</script>
