<template>
    <div>
        <Modal size="sm" :title="props.selectedApp?.name" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="mt-6">
                        <div class="space-y-3">
                            <img :src="props.selectedApp?.image" :alt="props.selectedApp?.name"
                                class="w-full rounded-md max-h-96">
                            <!-- <div class="text-muted-400 flex items-center gap-1">
                                <Icon name="material-symbols:receipt" class="size-4" />
                                <div class="font-sans text-sm" v-if="props.selectedApp?.is_one_time_fee">
                                    {{ formatAmount(props.selectedApp?.price) }}
                                    {{ $t('excludeVat') }}
                                </div>
                                <div class="font-sans text-sm" v-else>
                                    {{ formatAmount(props.selectedApp?.monthly_price) }}
                                    <span class="lowercase">/{{ $t('apps.month') }}</span>
                                    <span>
                                        ({{ formatAmount(props.selectedApp?.yearly_price) }}
                                        <span class="lowercase">/{{ $t('apps.year') }}</span>)
                                    </span>
                                    {{ $t('excludeVat') }}
                                </div>
                            </div> -->
                            <div class="flex flex-wrap items-center gap-1.5" v-if="appHasDiscount">
                                <span
                                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xxs font-semibold bg-red-600 text-white">
                                    {{ $t('apps.save', { percent: discountPercent }) }}
                                </span>
                                <span v-if="daysLeft !== null" class="text-xs font-medium text-red-600">
                                    <template v-if="daysLeft < 1">{{ $t('apps.offerEndsToday') }}</template>
                                    <template v-else>{{ $t('apps.offerEndsInDays', { count: daysLeft }) }}</template>
                                </span>
                            </div>
                            <p class="text-muted-800 text-sm">
                                <template v-if="appHasDiscount">
                                    <span class="line-through text-muted-400 mr-1">{{ formatAmount(basePrice) }}</span>
                                    <span class="font-semibold text-primary">{{ formatAmount(discountedPrice) }}</span>
                                </template>
                                <template v-else>
                                    <span>{{ formatAmount(basePrice) }}</span>
                                </template>
                                <span v-if="!props.selectedApp?.is_one_time_fee" class="lowercase">/{{ $t('apps.month') }}</span>
                                <span v-if="props.selectedApp?.setup_fee > 0" class="text-muted-500">
                                    + {{ formatAmount(props.selectedApp?.setup_fee) }} {{ $t('apps.setupFeeSuffix') }}
                                </span>
                                {{ $t('excludeVat') }}
                            </p>
                            <p v-if="props.selectedApp?.install_count > 0"
                                class="flex items-center gap-1 text-xs text-gray-500">
                                <Icon name="ph:buildings" class="w-3.5 h-3.5" />
                                {{ $t('apps.usedBy', { count: props.selectedApp.install_count }) }}
                            </p>
                            <p class="text-muted-800 dark:text-muted-100 font-sans text-sm">
                                {{ props.selectedApp?.description }}
                            </p>
                        </div>

                    </div>
                    <div class="mt-5 flex gap-x-3">
                        <FormButton buttonStyle="primary" @click="state.modal.isContactUsOpen = true" class="w-full">
                            {{ $t('apps.contactUs') }}
                        </FormButton>
                        <FormButton type="button" buttonStyle="action" class="w-full"
                            @click="navigateToExternalLink(props.selectedApp?.url_field)"
                            v-if="props.selectedApp?.url_field">
                            {{ $t('apps.goToPartner') }}
                        </FormButton>
                        <!-- Configurable apps (e.g. e-conomic, Power BI): once activated, send the
                             user to the app's own settings page instead of an inert "Activated" button. -->
                        <FormButton type="button" buttonStyle="primary" class="w-full"
                            v-else-if="setupLink && props.selectedApp?.user_activated" @click="goToSetup">
                            <Icon name="ph:gear-six" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('apps.goToSetup') }}
                        </FormButton>
                        <FormButton type="button"
                            :buttonStyle="props.selectedApp?.user_activated ? 'app-activated' : 'action'" :class="[
                                props.selectedApp?.user_activated && 'cursor-not-allowed',
                                'w-full'
                            ]" color="primary" @click="!props.selectedApp?.user_activated && confirmTACAcceptance()"
                            v-else>
                            {{ props.selectedApp?.user_activated ? $t('apps.activated') : $t('apps.activate') }}
                        </FormButton>
                    </div>
                </LoadingSpinner>
                <ModulesUserAppModalContactUs :isModalOpen="state.modal.isContactUsOpen"
                    :selectedApp="props.selectedApp" @close="state.modal.isContactUsOpen = false" />
                <ModulesUserAppModalTACConfirmation :isModalOpen="state.modal.isAcceptTACOpen"
                    :selectedApp="props.selectedApp" @close="state.modal.isAcceptTACOpen = false"
                    @confirmAppActivation="confirmAppActivation" />
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'
import { useAmountFormatter } from '@/composables/amountFormatter'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedApp: {
        type: Object,
        required: true,
    },
    apps: {
        type: Array as () => any[],
        default: () => [],
    },
})
const userStore = useUserStore() as any
const { t } = useI18n()
const { formatAmount } = useAmountFormatter()
const emit = defineEmits(['close', 'confirmAppActivation', 'selectApp'])

const appHasDiscount = computed(() =>
    !!(props.selectedApp?.has_active_discount && Number(props.selectedApp?.discount_percent) > 0)
)

const discountPercent = computed(() => Math.round(Number(props.selectedApp?.discount_percent) || 0))

const basePrice = computed(() => {
    if (props.selectedApp?.is_one_time_fee) return Number(props.selectedApp?.price) || 0
    return Number(props.selectedApp?.monthly_price) || 0
})

const discountedPrice = computed(() => {
    if (!appHasDiscount.value) return basePrice.value
    return Math.round(basePrice.value * (1 - discountPercent.value / 100))
})

const daysLeft = computed(() => {
    if (!props.selectedApp?.discount_ends_at) return null
    const end = new Date(props.selectedApp.discount_ends_at)
    if (isNaN(end.getTime())) return null
    const diff = end.getTime() - Date.now()
    if (diff <= 0) return 0
    return Math.floor(diff / 86400000)
})

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    modal: {
        isAcceptTACOpen: false,
        isContactUsOpen: false,
    }
})

// Apps that have their own in-app settings page to configure after activation.
const setupLinks: Record<string, string> = {
    'economic': '/settings/economic',
    'power-bi': '/settings/power-bi',
}
const setupLink = computed(() => setupLinks[props.selectedApp?.generic_name] ?? null)

function goToSetup() {
    if (!setupLink.value) return
    closeModal()
    navigateTo(setupLink.value)
}

function closeModal() {
    emit('close')
}

async function navigateToTAC() {
    await navigateTo('https://citizenone.dk/vilkaarogbetingelser/', {
        external: true,
        open: {
            target: '_blank',
        }
    })
}

async function navigateToSupport() {
    await navigateTo('https://citizenone.dk/support', {
        external: true,
        open: {
            target: '_blank',
        }
    })
}

async function navigateToExternalLink(link: any) {
    if (link) {
        await navigateTo(link, {
            external: true,
            open: {
                target: '_blank',
            }
        })
    }
}

function confirmTACAcceptance() {
    if (!userStore.getUser?.user_subscription) {
        navigateTo(`/subscription/subscribe?error=${t('apps.subscriptionRequired')}.`)
    } else {
        state.modal.isAcceptTACOpen = true
    }
}

async function confirmAppActivation(formApp: any) {
    closeModal()
    emit('confirmAppActivation', formApp)
}
</script>