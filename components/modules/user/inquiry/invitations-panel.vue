<template>
    <div>
        <div class="mb-3 flex items-center justify-between gap-3">
            <p class="text-sm font-semibold text-gray-900">
                {{ $t('inquiryInvitations.title') }}
            </p>
            <NuxtLink :to="`/inquiries/${inquiryUuid}/match`"
                class="text-[13px] font-semibold text-secondary hover:underline">
                {{ $t('consultantMatch.start') }}
            </NuxtLink>
        </div>

        <p v-if="!state.invitations.length" class="text-[13px] text-slate-400">
            {{ $t('inquiryInvitations.empty') }}
        </p>

        <div v-for="invitation in state.invitations" :key="invitation.uuid"
            class="flex flex-wrap items-center gap-3 border-t border-surface-100 py-2.5 first:border-t-0">
            <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                    <p class="text-[13px] font-semibold text-slate-800">{{ consultantName(invitation) }}</p>
                    <span class="rounded-full px-2 py-px text-[11px] font-bold" :class="statusClass(invitation.status)">
                        {{ $t('inquiryInvitations.statuses.' + invitation.status) }}
                    </span>
                    <span v-if="invitation.is_selected"
                        class="rounded-full bg-[#e6f6ee] px-2 py-px text-[11px] font-bold text-[#177a53]">
                        {{ $t('inquiryInvitations.selected') }}
                    </span>
                </div>
                <p class="mt-0.5 text-[11px] text-slate-400">{{ trail(invitation) }}</p>
                <p v-if="invitation.note" class="mt-0.5 text-[12px] text-slate-500">{{ invitation.note }}</p>
            </div>

            <div class="flex items-center gap-2">
                <!-- A coordinator can record an answer given over the phone, which
                     is why these are here and not only on the consultant's own
                     screen. -->
                <template v-if="canManage && invitation.status === 'invited'">
                    <FormButton type="button" buttonStyle="action" @click="respond(invitation, 'interested')">
                        {{ $t('inquiryInvitations.markInterested') }}
                    </FormButton>
                    <FormButton type="button" buttonStyle="cancel" @click="respond(invitation, 'declined')">
                        {{ $t('inquiryInvitations.markDeclined') }}
                    </FormButton>
                </template>
                <Tooltip v-if="canManage && !invitation.is_selected && invitation.status !== 'declined'"
                    :text="$t('inquiryInvitations.select')">
                    <FormButton type="button" buttonStyle="primary" @click="select(invitation)">
                        {{ $t('inquiryInvitations.select') }}
                    </FormButton>
                </Tooltip>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { inquiryConsultantInvitationService } from '@/components/api/user/InquiryConsultantInvitationService'
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'

const { errorAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore() as any
const { formatDateToReadable } = useDatetimeFormatter()

const props = defineProps({
    inquiryUuid: {
        type: String,
        required: true,
    },
})

const state = reactive({
    invitations: [] as any[],
})

const canManage = computed(() => (userStore.getUser?.roles?.[0]?.level ?? 0) >= 60)

onMounted(() => {
    fetchInvitations()
})

watch(() => props.inquiryUuid, () => fetchInvitations())

function consultantName(invitation: any) {
    const c = invitation.consultant ?? {}

    return `${c.firstname ?? ''} ${c.lastname ?? ''}`.trim() || t('inquiryInvitations.unknownConsultant')
}

function statusClass(status: string) {
    if (status === 'interested') return 'bg-[#e6f6ee] text-[#177a53]'
    if (status === 'declined') return 'bg-[#fbe9e5] text-[#c0442c]'

    return 'bg-surface-100 text-slate-500'
}

function trail(invitation: any) {
    const askedBy = invitation.invited_by
        ? `${invitation.invited_by.firstname ?? ''} ${invitation.invited_by.lastname ?? ''}`.trim()
        : ''
    const answeredBy = invitation.responded_by
        ? `${invitation.responded_by.firstname ?? ''} ${invitation.responded_by.lastname ?? ''}`.trim()
        : ''

    return [
        askedBy ? t('inquiryInvitations.askedBy', { name: askedBy }) : '',
        invitation.created_at ? formatDateToReadable(invitation.created_at) : '',
        // Who recorded the answer matters: an answer taken over the phone is not
        // the same as the consultant answering herself.
        answeredBy ? t('inquiryInvitations.answeredBy', { name: answeredBy }) : '',
    ].filter(Boolean).join(' · ')
}

async function fetchInvitations() {
    try {
        const response = await inquiryConsultantInvitationService.getForInquiry(props.inquiryUuid)
        state.invitations = response?.data ?? []
    } catch (_) {
        state.invitations = []
    }
}

async function respond(invitation: any, status: 'interested' | 'declined') {
    try {
        await inquiryConsultantInvitationService.respond(invitation.uuid, status)
        await fetchInvitations()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('inquiryInvitations.failed'))
    }
}

async function select(invitation: any) {
    try {
        await inquiryConsultantInvitationService.select(invitation.uuid)
        await fetchInvitations()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('inquiryInvitations.failed'))
    }
}
</script>
