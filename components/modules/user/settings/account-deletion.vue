<template>
    <div>
        <p class="text-sm text-gray-600">{{ $t('settings.profile.accountDeletion.description') }}</p>
        <p class="mt-1 text-xs text-gray-500">{{ $t('settings.profile.accountDeletion.records') }}</p>

        <div v-if="state.isLoading" class="mt-4 h-10 animate-pulse rounded-md bg-gray-100" aria-hidden="true" />

        <div v-else-if="state.status?.pending" role="status" data-testid="account-deletion-pending"
            class="mt-4 flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
            <Icon name="ph:hourglass-medium" class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{{ $t('settings.profile.accountDeletion.pending', { date: requestedOn }) }}</span>
        </div>

        <template v-else>
            <div class="mt-4">
                <FormLabel for="account-deletion-reason" :label="$t('settings.profile.accountDeletion.reasonLabel')" />
                <FormTextArea name="account-deletion-reason" id="account-deletion-reason" v-model="state.reason" :rows="3"
                    :placeholder="$t('settings.profile.accountDeletion.reasonPlaceholder')" />
            </div>
            <FormButton type="button" buttonStyle="danger" class="mt-4" data-testid="account-deletion-request"
                :disabled="state.isSending" @click="state.isConfirmOpen = true">
                <Icon name="ph:user-minus" class="h-4 w-4 mr-1.5" aria-hidden="true" />
                {{ $t('settings.profile.accountDeletion.button') }}
            </FormButton>
        </template>

        <DialogConfirmation :isModalOpen="state.isConfirmOpen"
            :title="$t('settings.profile.accountDeletion.confirmTitle')"
            :message="$t('settings.profile.accountDeletion.confirmMessage')"
            :confirmLabel="$t('settings.profile.accountDeletion.confirmButton')"
            @close="state.isConfirmOpen = false" @confirm="send" />
    </div>
</template>

<script setup lang="ts">
import { accountDeletionService } from '@/components/api/user/AccountDeletionService'
import type { AccountDeletionStatus } from '@/components/api/user/AccountDeletionService'
import { storageLocale } from '@/composables/storageFormat'
import { useAlert } from '@/composables/alert'

/**
 * "Slet min konto" (App Store guideline 5.1.1(v)): anyone who can create an account in the
 * app can also ask for it to be deleted there. It is a request: support confirms with the
 * person and the company before anything is deleted, because journals and other records
 * can belong to the company and fall under a retention duty.
 */
const { t, locale } = useI18n()
const { errorAlert, successAlert } = useAlert()

const state = reactive({
    isLoading: true,
    isSending: false,
    isConfirmOpen: false,
    reason: '',
    status: null as AccountDeletionStatus | null,
})

const requestedOn = computed(() => {
    const value = state.status?.requested_at
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''

    return date.toLocaleDateString(storageLocale(locale.value), { day: 'numeric', month: 'long', year: 'numeric' })
})

async function load() {
    state.isLoading = true
    try {
        const response = await accountDeletionService.status()
        state.status = response?.data ?? null
    } catch {
        // Shown as not requested: sending again is harmless, the backend keeps one open request.
        state.status = null
    }
    state.isLoading = false
}

async function send() {
    state.isConfirmOpen = false
    state.isSending = true
    try {
        const reason = state.reason.trim()
        const response = await accountDeletionService.send(reason ? { reason } : {})
        state.status = response?.data ?? { pending: true, requested_at: new Date().toISOString() }
        successAlert(t('alert.success'), t('settings.profile.accountDeletion.sent'))
    } catch (error: any) {
        errorAlert(t('alert.somethingWentWrong'), error?.message ?? t('settings.profile.accountDeletion.failed'))
    }
    state.isSending = false
}

onMounted(load)
</script>
