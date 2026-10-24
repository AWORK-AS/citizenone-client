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
                        <FormButton type="button" buttonStyle="primary" class="w-full justify-center" @click="go(appPath)">
                            {{ trialAvailable ? $t('cody.preview.startTrial') : $t('cody.adoption.buy') }}
                        </FormButton>
                        <p v-if="trialAvailable && priceLine" class="text-center text-xs text-gray-500">{{ priceLine }}</p>
                    </template>
                    <template v-else-if="audience === 'staff'">
                        <ModulesUserAppsSuggestToManager v-if="appUuid" :appUuid="appUuid" :appName="$t('cody.preview.name')"
                            :isBuyer="false" :appActivated="false" buttonStyle="primary" :showStates="true"
                            :buttonLabel="$t('cody.preview.askManager')" />
                    </template>
                    <p class="text-xs text-gray-500">{{ $t('cody.preview.whyAdmin') }}</p>
                </div>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { companyHasModule as hasCompanyModule } from '@/composables/pageAccess'
import { formatPrice } from '@/composables/customerSpecialPrice'
import { isCodyShortcut, previewAudience } from '@/composables/codyPreview'
import { useUserStore } from '@/store/user'

// The one Cody screen for everyone who has no seat. Every entry point (top bar, Cmd/Ctrl+J,
// My day, the journal's "prepare with Cody") opens it by setting promptOpen. Whoever can buy
// starts the trial; everyone else asks their manager through the same flow the app page uses.
// None of this is access control: the backend decides who may do what.
const { t } = useI18n()
const userStore = useUserStore() as any
const canBuy = useCanPurchase()
const { status, trialAvailable, promptOpen, appPath, load } = useCodyAdoption()

const bullets = ['bulletShift', 'bulletMissing', 'bulletNotes']
const examples = ['example1', 'example2', 'example3']

const audience = computed(() => previewAudience({
    moduleEnabled: hasCompanyModule(userStore.getUser?.company?.module_pages, 'AI assistant'),
    hasAccess: !!userStore.getUser?.has_ai_access,
    canBuy: canBuy.value,
}))
// A seat arriving while the screen is open (a trial just started) closes it.
const open = computed(() => promptOpen.value && (audience.value === 'buyer' || audience.value === 'staff'))
const appUuid = computed(() => status.value?.app_uuid ?? '')

const priceLine = computed(() => {
    const amount = formatPrice(status.value?.trial?.amount_gross)
    return amount ? t('cody.adoption.thenAmount', { amount }) : ''
})

function go(path: string) {
    promptOpen.value = false
    navigateTo(path)
}

// The top bar advertises Cmd/Ctrl+J. With a seat the panel handles it; without one it
// opens this screen instead of doing nothing.
function onKeydown(event: KeyboardEvent) {
    if (!isCodyShortcut(event)) return
    if (audience.value !== 'buyer' && audience.value !== 'staff') return
    event.preventDefault()
    promptOpen.value = !promptOpen.value
}

// Opening is the moment the answer is needed; usually the banner has already loaded it.
watch(promptOpen, (isOpen) => { if (isOpen) load() })
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>
