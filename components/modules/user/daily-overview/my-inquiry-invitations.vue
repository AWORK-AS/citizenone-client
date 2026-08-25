<template>
    <!-- Hidden entirely when nobody has been asked anything: an empty card every
         day for most employees is noise. -->
    <div v-if="state.invitations.length" class="rounded-lg border border-gray-200 bg-white p-4">
        <p class="mb-3 text-sm font-semibold text-gray-900">
            {{ $t('inquiryInvitations.mine.title') }}
        </p>

        <div v-for="invitation in state.invitations" :key="invitation.uuid"
            class="border-t border-surface-100 py-3 first:border-t-0 first:pt-0">
            <div class="flex flex-wrap items-center gap-2">
                <p class="text-[13px] font-semibold text-slate-800">
                    {{ (invitation.inquiry || {}).purpose || $t('inquiries.inquiries') }}
                </p>
                <span v-if="(invitation.inquiry || {}).service_type"
                    class="rounded-full bg-surface-100 px-2 py-px text-[11px] font-semibold text-slate-500">
                    {{ invitation.inquiry.service_type }}
                </span>
                <span v-if="invitation.is_selected"
                    class="rounded-full bg-[#e6f6ee] px-2 py-px text-[11px] font-bold text-[#177a53]">
                    {{ $t('inquiryInvitations.selected') }}
                </span>
            </div>

            <div class="mt-2 flex flex-wrap items-center gap-2">
                <template v-if="invitation.status === 'invited'">
                    <FormButton type="button" buttonStyle="primary" @click="respond(invitation, 'interested')">
                        {{ $t('inquiryInvitations.mine.yes') }}
                    </FormButton>
                    <FormButton type="button" buttonStyle="cancel" @click="respond(invitation, 'declined')">
                        {{ $t('inquiryInvitations.mine.no') }}
                    </FormButton>
                </template>
                <span v-else class="text-[12px] text-slate-500">
                    {{ $t('inquiryInvitations.mine.answered') }}:
                    {{ $t('inquiryInvitations.statuses.' + invitation.status) }}
                </span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { inquiryConsultantInvitationService } from '@/components/api/user/InquiryConsultantInvitationService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

const { errorAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    invitations: [] as any[],
})

onMounted(() => {
    fetchInvitations()
})

async function fetchInvitations() {
    try {
        const response = await inquiryConsultantInvitationService.getMine()
        state.invitations = response?.data ?? []
    } catch (_) {
        // A user whose company does not have the pipeline app gets a refusal
        // here, which is not worth an alert on the daily overview.
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
</script>
