<template>
    <Modal size="sm" :title="$t('assistants.identity.name')" :show="open" @close="promptOpen = false">
        <template #modal-body>
            <div class="pb-6">
                <!-- What Cody is, shown to someone who does not have it. Nothing here
                     sends a request: the examples are text, not buttons. -->
                <div class="flex items-center gap-3">
                    <ModulesUserAssistantCodyFigure :size="56" />
                    <div class="min-w-0">
                        <div class="flex items-center gap-2">
                            <p class="text-lg font-semibold text-gray-900">{{ $t('cody.preview.name') }}</p>
                            <span class="rounded-full bg-ai-bg px-2 py-0.5 text-xs font-bold text-ai-ink">{{ $t('cody.preview.chip') }}</span>
                        </div>
                        <p class="text-sm text-gray-600">{{ $t('cody.preview.tagline') }}</p>
                    </div>
                </div>

                <ul class="mt-4 space-y-2 text-sm text-gray-700">
                    <li v-for="key in bullets" :key="key" class="flex items-start gap-2">
                        <Icon name="ph:check-circle" class="mt-0.5 h-4 w-4 shrink-0 text-ai-ink" aria-hidden="true" />
                        {{ $t(`cody.preview.${key}`) }}
                    </li>
                </ul>

                <div class="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">{{ $t('cody.preview.examplesTitle') }}</p>
                    <ul class="mt-2 space-y-1.5">
                        <li v-for="key in examples" :key="key"
                            class="rounded-md bg-white px-3 py-1.5 text-sm text-gray-700 ring-1 ring-gray-200">
                            {{ $t(`cody.preview.${key}`) }}
                        </li>
                    </ul>
                    <p class="mt-2 text-xs text-gray-500">{{ $t('cody.preview.examplesNote') }}</p>
                </div>

                <div class="mt-5 space-y-2">
                    <template v-if="audience === 'buyer'">
                        <FormButton type="button" buttonStyle="primary" class="w-full justify-center"
                            @click="buyerAction()">
                            {{ trialAvailable ? $t('cody.preview.startTrial', { days: trialLength }) : $t('cody.adoption.buy') }}
                        </FormButton>
                        <p v-if="priceText" class="text-center text-xs text-gray-500" data-testid="cody-prompt-price">{{ priceText }}</p>
                    </template>
                    <template v-else-if="audience === 'staff'">
                        <div @click.capture="recordNudge('click', 'prompt')">
                            <ModulesUserAppsSuggestToManager v-if="appUuid" :appUuid="appUuid" :appName="$t('cody.preview.name')"
                                :isBuyer="false" :appActivated="false" buttonStyle="primary" :showStates="true"
                                :buttonLabel="$t('cody.preview.askManager')" />
                        </div>
                    </template>
                    <!-- The company has Cody: nobody is asked to buy it. -->
                    <template v-else-if="audience === 'assign'">
                        <p class="text-sm text-gray-700">{{ $t('cody.preview.assignSelf') }}</p>
                        <FormButton type="button" buttonStyle="primary" class="w-full justify-center" @click="go(SEATS_PATH)">
                            {{ $t('cody.preview.goToSeats') }}
                        </FormButton>
                    </template>
                    <template v-else-if="audience === 'askSeat'">
                        <p class="text-sm text-gray-700">{{ $t('cody.preview.companyHasCody') }}</p>
                        <FormButton v-if="requestState !== 'sent' && requestState !== 'recent'" type="button" buttonStyle="primary"
                            class="w-full justify-center" :disabled="requestState === 'sending'" @click="requestFromAdmin()">
                            {{ $t('cody.preview.askAdminAccess') }}
                        </FormButton>
                        <p v-else class="text-sm font-medium text-gray-800">
                            <Icon name="ph:check-circle" class="mr-1 inline h-4 w-4 text-blue-600" aria-hidden="true" />
                            {{ $t('cody.adoption.sent') }}
                        </p>
                        <p v-if="requestState === 'no_admin'" class="text-sm text-gray-600">{{ $t('cody.adoption.noAdmin') }}</p>
                        <p v-if="requestState === 'error'" class="text-sm text-red-600">{{ $t('cody.adoption.requestFailed') }}</p>
                    </template>
                    <p v-if="audience === 'buyer' || audience === 'staff'" class="text-xs text-gray-500">{{ $t('cody.preview.whyAdmin') }}</p>
                </div>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { companyHasModule as hasCompanyModule } from '@/composables/pageAccess'
import { formatPrice } from '@/composables/customerSpecialPrice'
import { trialDays } from '@/composables/managerSuggestion'
import { isCodyShortcut, previewAudience } from '@/composables/codyPreview'
import { priceLine } from '@/composables/codyNudge'
import { useUserStore } from '@/store/user'

// Where licence admins hand out Cody seats (the AI licence toggle per employee).
const SEATS_PATH = '/employees'

// The one Cody screen for everyone who has no seat. Every entry point (top bar, Cmd/Ctrl+J,
// My day, the journal's "prepare with Cody") opens it by setting promptOpen. Whoever can buy
// starts the trial; everyone else asks their manager through the same flow the app page uses.
// None of this is access control: the backend decides who may do what.
const { t } = useI18n()
const userStore = useUserStore() as any
const canBuy = useCanPurchase()
const { status, trialAvailable, promptOpen, appPath, requestState, load, requestFromAdmin, recordNudge } = useCodyAdoption()

const bullets = ['bulletShift', 'bulletMissing', 'bulletNotes']
const examples = ['example1', 'example2', 'example3']

const audience = computed(() => previewAudience({
    moduleEnabled: hasCompanyModule(userStore.getUser?.company?.module_pages, 'AI assistant'),
    hasAccess: !!userStore.getUser?.has_ai_access,
    canBuy: canBuy.value,
    // Until the status says otherwise nobody is offered a purchase: the company may have Cody.
    companyHasCody: status.value ? !!status.value.company_has_cody : null,
}))
// A seat arriving while the screen is open (a trial just started) closes it.
const OPEN_FOR = ['buyer', 'staff', 'assign', 'askSeat', 'pending']
const open = computed(() => promptOpen.value && OPEN_FOR.includes(audience.value))
const trialLength = computed(() => trialDays(status.value?.trial?.days))
const appUuid = computed(() => status.value?.app_uuid ?? '')

// The price, only for someone who can buy (the backend sends none otherwise).
const priceText = computed(() => {
    const line = priceLine(status.value, canBuy.value, formatPrice)
    if (!line) return ''
    return line.count !== undefined ? t(line.key, line.params, line.count) : t(line.key, line.params)
})

function buyerAction() {
    recordNudge(trialAvailable.value ? 'try_free' : 'buy', 'prompt')
    go(appPath.value)
}

// The buy funnel only: a company that has Cody is not in it (recordNudge also checks).
watch(() => [open.value, audience.value] as const, ([isOpen, who]) => {
    if (isOpen && (who === 'buyer' || who === 'staff')) recordNudge('impression', 'prompt')
}, { immediate: true })

function go(path: string) {
    promptOpen.value = false
    navigateTo(path)
}

// The top bar advertises Cmd/Ctrl+J. With a seat the panel handles it; without one it
// opens this screen instead of doing nothing.
function onKeydown(event: KeyboardEvent) {
    if (!isCodyShortcut(event)) return
    if (!OPEN_FOR.includes(audience.value)) return
    event.preventDefault()
    promptOpen.value = !promptOpen.value
}

// Opening is the moment the answer is needed; usually the banner has already loaded it.
watch(promptOpen, (isOpen) => { if (isOpen) load() })
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>
