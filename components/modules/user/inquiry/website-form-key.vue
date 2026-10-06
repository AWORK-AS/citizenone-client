<template>
    <!-- Inquiries from the company's own website form: the key the form posts
         with, and how to wire it. Admin only, like the API. -->
    <section class="rounded-lg border border-gray-200 bg-white px-4 py-4">
        <h3 class="text-sm font-semibold text-gray-900">{{ $t('inquiryIntake.title') }}</h3>
        <p class="mt-0.5 max-w-2xl text-xs text-gray-500">{{ $t('inquiryIntake.description') }}</p>

        <div class="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <span v-if="state.status.enabled" class="rounded-full bg-[#e6f6ee] px-2 py-px text-[11px] font-bold text-[#177a53]">
                {{ $t('inquiryIntake.active', { last4: state.status.last4 }) }}
            </span>
            <span v-else class="rounded-full bg-surface-100 px-2 py-px text-[11px] font-semibold text-slate-500">
                {{ $t('inquiryIntake.inactive') }}
            </span>
            <Tooltip :text="state.status.enabled ? $t('inquiryIntake.rotateHint') : $t('inquiryIntake.generateHint')">
                <FormButton type="button" buttonStyle="action" @click="generate">
                    <Icon name="ph:key" class="size-4" />
                    {{ state.status.enabled ? $t('inquiryIntake.rotate') : $t('inquiryIntake.generate') }}
                </FormButton>
            </Tooltip>
            <Tooltip v-if="state.status.enabled" :text="$t('inquiryIntake.revokeHint')">
                <FormButton type="button" buttonStyle="danger" :aria-label="$t('inquiryIntake.revoke')" @click="revoke">
                    <Icon name="ph:trash" class="size-4" />
                </FormButton>
            </Tooltip>
        </div>

        <!-- Shown once, straight after it is made. -->
        <div v-if="state.newKey" class="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
            <p class="text-xs font-semibold text-amber-800">{{ $t('inquiryIntake.copyNow') }}</p>
            <div class="mt-1 flex items-center gap-2">
                <code class="break-all text-xs text-gray-900">{{ state.newKey }}</code>
                <Tooltip :text="$t('inquiryIntake.copy')">
                    <FormButton type="button" buttonStyle="action" :aria-label="$t('inquiryIntake.copy')" @click="copy(state.newKey)">
                        <Icon name="ph:copy" class="size-4" />
                    </FormButton>
                </Tooltip>
            </div>
        </div>

        <details v-if="state.status.enabled || state.newKey" class="mt-3">
            <summary class="cursor-pointer text-xs font-semibold text-primary">{{ $t('inquiryIntake.howTo') }}</summary>
            <p class="mt-2 text-xs text-gray-500">{{ $t('inquiryIntake.howToText') }}</p>
            <pre class="mt-2 overflow-x-auto rounded bg-gray-900 p-3 text-[11px] leading-relaxed text-gray-100">{{ example }}</pre>
        </details>
    </section>
</template>

<script setup lang="ts">
import { inquiryIntakeService } from '@/components/api/user/InquiryIntakeService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { successAlert, errorAlert } = useAlert()

const state = reactive({
    status: { enabled: false, last4: null as string | null, endpoint: '' },
    newKey: '' as string,
})

const example = computed(() => `POST ${state.status.endpoint}
X-Inquiry-Key: ${state.newKey || 'ciq_…'}
Content-Type: application/json

{
  "first_name": "…",            (required)
  "last_name": "…",
  "email": "…",                 (email or phone required)
  "phone": "…",
  "cpr": "010190-1234",
  "municipality": "…",
  "message": "…",
  "inquirer_name": "…",
  "inquirer_email": "…",
  "inquirer_phone": "…",
  "website": ""                 (leave empty: a hidden field that catches bots)
}`)

async function load() {
    try {
        const response = await inquiryIntakeService.getStatus()
        if (response?.data) state.status = response.data
    } catch (_) {
        // Without access the card shows the key as not set.
    }
}

async function generate() {
    try {
        const response = await inquiryIntakeService.generateKey()
        state.status = response.data
        state.newKey = response.data.key
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('inquiryIntake.failed'))
    }
}

async function revoke() {
    try {
        const response = await inquiryIntakeService.revokeKey()
        state.status = response.data
        state.newKey = ''
        successAlert(`${t('alert.success')}!`, `${t('inquiryIntake.revoked')}.`)
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('inquiryIntake.failed'))
    }
}

async function copy(text: string) {
    try {
        await navigator.clipboard.writeText(text)
        successAlert(`${t('alert.success')}!`, `${t('inquiryIntake.copied')}.`)
    } catch (_) {
        // The key stays on screen to copy by hand.
    }
}

onMounted(load)
</script>
