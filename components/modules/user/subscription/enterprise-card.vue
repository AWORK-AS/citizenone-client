<template>
    <div class="bg-white ring-1 ring-gray-200 rounded-md p-8 xl:p-10" data-testid="enterprise-card">
        <div class="flex items-center gap-x-2">
            <h3 class="text-base font-semibold leading-7 text-tertiary">
                {{ $t('subscription.enterprise.title') }}
            </h3>
            <Tooltip :text="$t('subscription.enterprise.badgeHelp')" position="top" wrap>
                <span class="co-badge co-badge-navy">{{ $t('subscription.enterprise.badge') }}</span>
            </Tooltip>
        </div>

        <p class="text-gray-600 mt-6 text-base leading-7">
            {{ $t('subscription.enterprise.agreementText') }}
        </p>

        <ul role="list" class="mt-8 space-y-3 text-sm leading-6 text-gray-600 sm:mt-8">
            <!-- Actual licence counts when the page has them; the deal's included numbers are not shown. -->
            <li v-if="usageView" class="flex gap-x-2">
                <Icon name="ph:check" class="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                {{ $t('subscription.enterprise.usage', { used: usageView.used, total: usageView.total, label: usage?.label ?? '' }) }}
            </li>
            <li class="flex gap-x-2">
                <Icon name="ph:check" class="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                {{ $t('subscription.deal.unlimitedNumberOfCitizens') }}
            </li>
            <li v-if="deal?.storage_size" class="flex gap-x-2">
                <Icon name="ph:check" class="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                {{ deal.storage_size }} {{ $t('subscription.deal.storageSpace') }}
            </li>
            <li class="flex gap-x-2">
                <Icon name="ph:check" class="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                <span v-if="deal?.name === 'Pro'">{{ $t('subscription.deal.telephoneSupport') }}</span>
                <span v-else>{{ $t('subscription.deal.chatSupport') }}</span>
            </li>
            <li v-if="deal?.name === 'Pro'" class="flex gap-x-2">
                <Icon name="ph:check" class="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                {{ $t('subscription.deal.automaticSynchronizationWithFMK') }}
            </li>
        </ul>

        <div class="mt-8">
            <Tooltip :text="$t('subscription.enterprise.contactHelp')" position="top" wrap>
                <a href="mailto:support@citizenone.dk" class="text-sm font-medium text-primary underline underline-offset-2">
                    {{ $t('subscription.enterprise.contact') }}
                </a>
            </Tooltip>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
import { licenceUsage } from '@/composables/agreements'

/**
 * The customer's subscription card when the company has an agreement (under_agreement).
 * No price, binding, renewal or plan-change controls: the terms follow the agreement.
 */
const props = defineProps({
    /** The page's own licence counts, e.g. { label: 'brugere', used, unused }. Omitted = no count line. */
    usage: { type: Object as () => { label: string; used?: unknown; unused?: unknown } | null, default: null },
})

const userStore = useUserStore() as any
const deal = computed(() => userStore.getUser?.user_subscription?.deal ?? null)
const usageView = computed(() => licenceUsage(props.usage))
</script>
