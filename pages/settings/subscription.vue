<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('subscription.subscription') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('subscription.subscription') }}</template>

            <ModulesUserSettingsBillingSubTab class="mt-5" />

            <Alert type="danger" :text="error" v-if="error && error.length > 0" />
            <div v-if="userStore.getUser?.user_subscription === null">
                <div class="isolate mx-auto mt-8 grid max-w-lg">
                    <div class="bg-white ring-1 ring-gray-200 rounded-md p-8 xl:p-10">
                        <h3 class="text-xl font-semibold leading-7">
                            {{ $t('subscription.noSubscription.noActiveSubscription') }}
                        </h3>
                        <p class="mt-4 text-sm text-gray-600 leading-6">
                            {{
                                $t('subscription.noSubscription.itLooksLikeYouDontHaveAnActiveSubscriptionAtTheMoment')
                            }}.
                        </p>
                        <p class="mt-2 text-sm text-gray-600 leading-6">
                            {{ $t('subscription.noSubscription.toEnjoyOurFullRangeOfServicesAndBenefits') }}.
                        </p>
                        <div class="mt-6">
                            <FormButton type="button" buttonStyle="primary" class="w-full"
                                @click="navigateTo('/subscription/subscribe')">
                                {{ $t('subscription.noSubscription.subscribeNow') }}
                            </FormButton>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else>
                <div class="2xl:flex gap-8">
                    <div class="isolate mt-10 w-full max-w-md">
                        <h3 class="py-3 text-sm font-semibold">
                            {{ $t('subscription.currentSubscription') }}
                        </h3>
                        <ModulesUserSubscriptionEnterpriseCard v-if="isUnderAgreement(userStore.getUser?.user_subscription)" />
                        <div v-else class="bg-white ring-1 ring-gray-200 rounded-md p-8 xl:p-10">
                            <div class="flex items-center justify-between gap-x-4">
                                <h3 class="text-base font-semibold leading-7 text-tertiary">
                                    {{ userStore.getUser?.user_subscription?.deal?.name }}
                                </h3>
                            </div>
                            <ModulesUserSubscriptionPlanDetails :deal="userStore.getUser?.user_subscription?.deal ?? {}"
                                :frequency="['monthly', 'custom_monthly'].includes(userStore.getUser?.user_subscription?.type) ? 'monthly' : 'annually'" />
                            <div class="mt-8">
                                <FormButton type="button" buttonStyle="primary" class="w-full"
                                    @click="navigateTo('/subscription/subscribe')"
                                    v-if="!userStore.getUser?.user_subscription?.is_max">
                                    {{ $t('subscription.upgrade') }}
                                </FormButton>
                            </div>
                        </div>
                    </div>
                    <div class="mt-10 w-full">
                        <!-- Invoice customers: how they pay and the security card. Renders
                             nothing for card customers, and never for Elite. -->
                        <div v-if="isInvoice && !isUnderAgreement(userStore.getUser?.user_subscription)" class="mb-5">
                            <ModulesUserBillingPaymentMethodCard />
                        </div>
                        <div v-if="isEmployeeServicesCompany" class="mb-5 bg-white ring-1 ring-gray-200 rounded-md p-6">
                            <div class="flex items-center justify-between gap-3">
                                <div>
                                    <h3 class="text-sm font-semibold text-tertiary">
                                        {{ $t('settings.licenseOverview.caseworkerLicenses', { term: caseworkerTerm }) }}
                                    </h3>
                                    <p class="mt-1 text-sm text-gray-600">
                                        {{ $t('subscription.addOnDeals.purchaseExtraLicenses') }}
                                    </p>
                                </div>
                                <FormButton type="button" buttonStyle="primary"
                                    @click="navigateTo('/apps?type=other&generic_name=caseworker-access')">
                                    {{ $t('subscription.addOnDeals.purchaseExtraLicenses') }}
                                </FormButton>
                            </div>
                        </div>
                        <ModulesUserAddOnDeals />
                    </div>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { isUnderAgreement } from '@/composables/agreements'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
import { useTerminology } from '@/composables/useTerminology'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const { t } = useI18n()
const { term } = useTerminology()
const caseworkerTerm = computed(() => term('caseworker', t('settings.company.form.termCaseworker')))
const { isInvoice, load: loadPaymentMethod } = usePaymentMethod()
onMounted(() => loadPaymentMethod())
const router = useRouter()
let error: string | undefined = router?.currentRoute?.value?.query?.error as string | undefined
const isEmployeeServicesCompany = computed(() => {
    return userStore.getUser?.company?.industry?.system_name === 'employment_services'
        || userStore.getUser?.company?.industry?.en_name === 'Employment Services'
})
const breadcrumbLinks = [
    {
        name: 'subscription.subscription',
        translate: true,
        href: '/settings/subscription',
    },
]
</script>