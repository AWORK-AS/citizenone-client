<template>
    <!-- Who has got in after an invitation. A whole staff is invited at once, so
         the admin needs to see who is still missing and nudge them, not guess. -->
    <section v-if="status && status.total > 0" data-testid="employee-onboarding-status"
        class="mb-5 rounded-xl bg-white ring-1 ring-gray-200 p-5">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="min-w-0 flex-1">
                <p class="font-semibold text-gray-900">
                    {{ $t('employees.onboarding.signedIn', { signedIn: status.signed_in, total: status.total }) }}
                </p>
                <div class="mt-2 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-gray-100">
                    <div class="h-full rounded-full bg-emerald-500 transition-all" :style="{ width: `${percent}%` }" />
                </div>
                <p v-if="status.pending_count" class="mt-2 text-sm text-gray-600">
                    {{ $t('employees.onboarding.pendingHint', { count: status.pending_count }) }}
                </p>
                <p v-else class="mt-2 text-sm text-emerald-700">{{ $t('employees.onboarding.allIn') }}</p>
            </div>
            <div v-if="status.pending_count" class="flex shrink-0 flex-wrap items-center gap-3">
                <button type="button" @click="open = !open" class="text-sm font-medium text-primary hover:underline">
                    {{ open ? $t('employees.onboarding.hide') : $t('employees.onboarding.show') }}
                </button>
                <FormButton buttonStyle="primary" :disabled="sending" @click="resend()">
                    <Icon name="ph:paper-plane-tilt" class="h-4 w-4" aria-hidden="true" />
                    {{ $t('employees.onboarding.resendAll', { count: status.pending_count }) }}
                </FormButton>
            </div>
        </div>

        <ul v-if="open && status.pending.length" class="mt-4 divide-y divide-gray-100 border-t border-gray-100">
            <li v-for="person in status.pending" :key="person.uuid" class="flex items-center justify-between gap-3 py-2.5">
                <div class="min-w-0">
                    <p class="truncate text-sm font-medium text-gray-900">{{ person.name }}</p>
                    <p class="truncate text-xs text-gray-500">
                        {{ person.email }}
                        <template v-if="person.invited_at"> · {{ $t('employees.onboarding.invitedAt', { date: formatDate(person.invited_at) }) }}</template>
                    </p>
                </div>
                <button type="button" :disabled="sending" @click="resend([person.uuid])"
                    class="shrink-0 text-sm font-medium text-primary hover:underline disabled:opacity-50">
                    {{ $t('employees.onboarding.resendOne') }}
                </button>
            </li>
        </ul>
    </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { employeeService } from '@/components/api/user/EmployeeService'
import { useAlert } from '@/composables/alert'

interface OnboardingStatus {
    total: number
    signed_in: number
    pending_count: number
    pending: { uuid: string, name: string, email: string, invited_at: string | null }[]
}

const { t, locale } = useI18n()
const { successAlert, errorAlert } = useAlert()

const status = ref<OnboardingStatus | null>(null)
const open = ref(false)
const sending = ref(false)

const percent = computed(() => status.value?.total ? Math.round((status.value.signed_in / status.value.total) * 100) : 0)

function formatDate(value: string) {
    // App locale codes are dk/en/no/sv; the browser wants da/en/nb/sv.
    const tag = ({ dk: 'da-DK', no: 'nb-NO', sv: 'sv-SE' } as Record<string, string>)[locale.value] ?? 'en-GB'
    return new Date(value).toLocaleDateString(tag, { day: 'numeric', month: 'short' })
}

async function fetchStatus() {
    try {
        const response: any = await employeeService.getOnboardingStatus()
        status.value = response?.data ?? null
    } catch (e) { status.value = null /* an older backend: show nothing */ }
}

async function resend(uuids?: string[]) {
    const count = uuids?.length ?? status.value?.pending_count ?? 0
    if (!count || !window.confirm(t('employees.onboarding.confirm', { count }))) return
    sending.value = true
    try {
        const response: any = await employeeService.resendInvites(uuids ? { uuids } : {})
        successAlert(t('alert.success'), response?.message ?? '')
        await fetchStatus()
    } catch (e: any) {
        errorAlert(t('alert.warning'), e?.message ?? '')
    }
    sending.value = false
}

onMounted(fetchStatus)
defineExpose({ refresh: fetchStatus })
</script>
