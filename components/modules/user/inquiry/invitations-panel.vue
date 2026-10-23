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
                    <!-- Marked or left since they were asked. Without contact_status (an
                         older backend) only the archived badge shows, as before. -->
                    <span v-if="isDoNotContact(invitation)" :title="$t('inquiryInvitations.cannotBeChosen')"
                        class="rounded-full bg-[#fbe9e5] px-2 py-px text-[11px] font-bold text-[#c0442c]">
                        {{ $t('consultantProfile.contact.statuses.do_not_contact') }}
                    </span>
                    <span v-else-if="invitation.consultant?.contact_status === 'terminated'"
                        class="rounded-full bg-slate-200 px-2 py-px text-[11px] font-bold text-slate-700">
                        {{ $t('consultantProfile.contact.statuses.terminated') }}
                    </span>
                    <span v-else-if="invitation.consultant?.is_archived" :title="$t('consultantMatch.archivedHint')"
                        class="rounded-full bg-surface-100 px-2 py-px text-[11px] font-bold text-slate-600">
                        {{ $t('consultantMatch.archived') }}
                    </span>
                    <!-- Asked, but an inactive consultant gets no mail or app notice. Not
                         once chosen: the choice is made, even if they were archived again. -->
                    <span v-if="invitation.consultant?.contact_status === 'inactive' && !invitation.is_selected"
                        :title="$t('inquiryInvitations.contactDirectlyHint')"
                        class="rounded-full bg-[#fdf3df] px-2 py-px text-[11px] font-bold text-[#8a6208]">
                        {{ $t('inquiryInvitations.contactDirectly') }}
                    </span>
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
                <Tooltip v-if="canManage && !invitation.is_selected && invitation.status !== 'declined' && canBeChosen(invitation)"
                    :text="$t('inquiryInvitations.select')">
                    <FormButton type="button" buttonStyle="primary" @click="openSelect(invitation)">
                        {{ $t('inquiryInvitations.select') }}
                    </FormButton>
                </Tooltip>
            </div>
        </div>

        <!-- Choosing the consultant, with what they may register on the case
             (optional; carried to the indsats when the inquiry is won). -->
        <Modal size="md" :title="$t('inquiryInvitations.selectTitle', { name: state.selecting ? consultantName(state.selecting) : '' })"
            :show="state.selecting !== null" @close="state.selecting = null">
            <template #modal-body>
                <div class="space-y-3">
                    <p class="text-[13px] text-slate-600">{{ $t('registrationRules.consultants.forSelectedHint') }}</p>
                    <ModulesUserRegistrationRulesUserRuleFields v-model="state.ruleDraft" idPrefix="select-rule" />
                    <div class="flex justify-end gap-2 pt-2">
                        <FormButton type="button" buttonStyle="cancel" @click="state.selecting = null">{{ $t('cancel') }}</FormButton>
                        <FormButton type="button" buttonStyle="primary" :disabled="state.isSaving" @click="confirmSelect">
                            {{ $t('inquiryInvitations.select') }}
                        </FormButton>
                    </div>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { inquiryConsultantInvitationService } from '@/components/api/user/InquiryConsultantInvitationService'
import {
    registrationRuleService,
    fromUserRuleDraft,
    toUserRuleDraft,
    userRuleIsSet,
    type UserRuleDraft,
} from '@/components/api/user/RegistrationRuleService'
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
    selecting: null as any,
    ruleDraft: toUserRuleDraft(null) as UserRuleDraft,
    isSaving: false,
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

// The backend refuses to put them on the case, so the button is not offered.
function isDoNotContact(invitation: any) {
    return invitation.consultant?.contact_status === 'do_not_contact'
}

// Marked since they were asked, or left: the backend refuses either (409).
function canBeChosen(invitation: any) {
    return !isDoNotContact(invitation) && invitation.consultant?.contact_status !== 'terminated'
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
        // the same as the consultant answering themselves.
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

function openSelect(invitation: any) {
    state.ruleDraft = toUserRuleDraft(null)
    state.selecting = invitation
}

// The choice first; then the consultant's own rule, when one was given. A
// refused rule leaves the choice made and says so.
async function confirmSelect() {
    const invitation = state.selecting
    if (!invitation) return
    state.isSaving = true
    try {
        await inquiryConsultantInvitationService.select(invitation.uuid)
        const rule = fromUserRuleDraft(state.ruleDraft)
        if (userRuleIsSet(rule) && invitation.consultant?.uuid) {
            try {
                await registrationRuleService.saveUserRule('inquiry', props.inquiryUuid, invitation.consultant.uuid, rule)
            } catch (error: any) {
                errorAlert(t('alert.warning'), error?.message ?? t('registrationRules.saveFailed'))
            }
        }
        state.selecting = null
        await fetchInvitations()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('inquiryInvitations.failed'))
    }
    state.isSaving = false
}
</script>
