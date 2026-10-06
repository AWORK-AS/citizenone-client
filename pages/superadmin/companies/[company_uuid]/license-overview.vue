<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.accounts.accounts') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.accounts.accounts') }}</template>

            <div class="p-1">
                <!-- Back -->
                <NuxtLink to="/superadmin/companies"
                    class="inline-flex items-center gap-1.5 text-sm text-[#5C6478] hover:text-[#1F2533] mb-5 transition-colors">
                    <Icon name="ph:arrow-left" class="w-4 h-4" />
                    {{ $t('superadmin.companies.accounts.allCompanies') }}
                </NuxtLink>

                <!-- Sub-nav tabs -->
                <div class="flex items-center gap-1 mb-6 border-b border-[#EAECF0]">
                    <button v-for="tab in detailTabs" :key="tab.href"
                        class="px-4 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px" :class="$route.path === tab.href
                            ? 'border-[#42AED9] text-[#205E77]'
                            : 'border-transparent text-[#5C6478] hover:text-[#1F2533]'" @click="navigateTo(tab.href)">
                        <div class="flex items-center gap-1.5">
                            <Icon :name="tab.icon" class="w-4 h-4" />
                            {{ tab.label }}
                        </div>
                    </button>
                </div>

                <div v-if="canManageLicenses" class="flex justify-end mb-4">
                    <FormButton buttonStyle="action" @click="openGrantModal">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('superadmin.companies.licenseOverview.grant.addLicenses') }}
                    </FormButton>
                </div>

                <div class="w-full">
                    <LoadingSpinner :isActive="state.isPageLoading">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div v-if="!state.isPageLoading">
                            <div class="lg:flex gap-8">
                                <div class="isolate w-full max-w-md">
                                    <h3 class="py-3 text-sm font-semibold">
                                        {{ $t('subscription.currentSubscription') }}
                                    </h3>
                                    <div v-if="state?.subscriptions?.data?.length === 0"
                                        class="bg-white ring-1 ring-gray-200 rounded-md p-8 xl:p-10">
                                        <h3 class="text-xl font-semibold leading-7">
                                            {{
                                                $t('superadmin.companies.subscriptions.noSubscription.noActiveSubscription')
                                            }}
                                        </h3>
                                        <p class="mt-4 text-sm text-gray-600 leading-6">
                                            {{
                                                $t('superadmin.companies.subscriptions.noSubscription.itLooksLikeThisCompanyDontHaveAnActiveSubscriptionAtTheMoment')
                                            }}.
                                        </p>
                                        <div v-if="canManageLicenses" class="mt-6">
                                            <FormButton buttonStyle="primary" class="w-full" @click="openAddSubscriptionModal">
                                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                                {{ $t('superadmin.companies.licenseOverview.addSubscription.addSubscription') }}
                                            </FormButton>
                                        </div>
                                    </div>
                                    <div v-else class="bg-white ring-1 ring-gray-200 rounded-md p-8 xl:p-10">
                                        <div class="flex items-center justify-between gap-x-4">
                                            <h3 class="text-base font-semibold leading-7 text-tertiary">
                                                {{ state?.subscriptions?.data?.deal?.name }}
                                            </h3>
                                            <div v-if="canManageLicenses" class="flex items-center gap-x-2">
                                                <button v-if="state?.subscriptions?.data?.type === 'custom_yearly'"
                                                    class="co-action-btn" @click="openEditTermModal(state.subscriptions.data)">
                                                    {{ $t('superadmin.companies.licenseOverview.editTerm.editTerm') }}
                                                </button>
                                                <button class="co-action-btn" @click="openEditSubscriptionModal">
                                                    {{ $t('superadmin.companies.licenseOverview.editSubscription.editSubscription') }}
                                                </button>
                                            </div>
                                        </div>
                                        <p class="text-gray-600 mt-6 text-base leading-7">
                                            <span v-if="state?.subscriptions?.data?.deal?.name === 'Basis'">
                                                {{
                                                    $t('superadmin.companies.subscriptions.deal.perfectForLargerCompanies')
                                                }} 🚀
                                            </span>
                                            <span v-else>
                                                {{
                                                    $t('superadmin.companies.subscriptions.deal.goodForASmallTeam')
                                                }} 🤝
                                            </span>
                                        </p>
                                        <p class="mt-4 flex items-baseline gap-x-2" v-if="canViewFinancials">
                                            <span class="text-3xl font-bold tracking-tight text-gray-900">
                                                {{ ['monthly', 'custom_monthly'].includes(state?.subscriptions?.data?.type) ?
                                                    formatAmount(state?.subscriptions?.data?.deal?.monthly_price ?? 0, 'DKK')
                                                    :
                                                    formatAmount(state?.subscriptions?.data?.deal?.yearly_price ?? 0, 'DKK')
                                                }}
                                            </span>
                                            <span class="text-base text-gray-500 lowercase">
                                                /{{ ['monthly', 'custom_monthly'].includes(state?.subscriptions?.data?.type) ?
                                                    $t('superadmin.companies.subscriptions.deal.month') :
                                                    $t('superadmin.companies.subscriptions.deal.year')
                                                }}
                                                {{ $t('excludeVat') }}
                                            </span>
                                        </p>
                                        <ul role="list" class="mt-8 space-y-3 text-sm leading-6 text-gray-600 sm:mt-10">
                                            <li class="flex gap-x-2">
                                                <Icon name="ph:check" class="h-6 w-5 flex-none text-primary"
                                                    aria-hidden="true" />
                                                {{ state?.subscriptions?.data?.deal?.users }}
                                                <span v-if="state?.subscriptions?.data?.deal?.users > 1">
                                                    {{ $t('superadmin.companies.subscriptions.deal.users') }}
                                                </span>
                                                <span v-else>
                                                    {{ $t('superadmin.companies.subscriptions.deal.user') }}
                                                </span>
                                            </li>
                                            <li class="flex gap-x-2">
                                                <Icon name="ph:check" class="h-6 w-5 flex-none text-primary"
                                                    aria-hidden="true" />
                                                {{ state?.subscriptions?.data?.deal?.departments }}
                                                <span v-if="state?.subscriptions?.data?.deal?.departments > 1">
                                                    {{ $t('superadmin.companies.subscriptions.deal.departments') }}
                                                </span>
                                                <span v-else>
                                                    {{ $t('superadmin.companies.subscriptions.deal.department') }}
                                                </span>
                                            </li>
                                            <li class="flex gap-x-2">
                                                <Icon name="ph:check" class="h-6 w-5 flex-none text-primary"
                                                    aria-hidden="true" />
                                                {{
                                                    $t('superadmin.companies.subscriptions.deal.unlimitedNumberOfCitizens')
                                                }}
                                            </li>
                                            <li class="flex gap-x-2">
                                                <Icon name="ph:check" class="h-6 w-5 flex-none text-primary"
                                                    aria-hidden="true" />
                                                {{ state?.subscriptions?.data?.deal?.storage_size }}
                                                {{ $t('superadmin.companies.subscriptions.deal.storageSpace') }}
                                            </li>
                                            <li class="flex gap-x-2">
                                                <Icon name="ph:check" class="h-6 w-5 flex-none text-primary"
                                                    aria-hidden="true" />
                                                <span v-if="state?.subscriptions?.data?.deal?.name === 'Pro'">
                                                    {{ $t('superadmin.companies.subscriptions.deal.telephoneSupport') }}
                                                </span>
                                                <span v-else>
                                                    {{ $t('superadmin.companies.subscriptions.deal.chatSupport') }}
                                                </span>
                                            </li>
                                            <li class="flex gap-x-2"
                                                v-if="state?.subscriptions?.data?.deal?.name === 'Pro'">
                                                <Icon name="ph:check" class="h-6 w-5 flex-none text-primary"
                                                    aria-hidden="true" />
                                                {{
                                                    $t('superadmin.companies.subscriptions.deal.automaticSynchronizationWithFMK')
                                                }}
                                            </li>
                                        </ul>

                                        <!-- Aftalen: hvornår den begyndte, hvor længe den
                                             løber, hvornår den fornyes, og hvad den er værd.
                                             Fornyelse er adskilt fra "Næste betaling" med
                                             vilje - de to datoer er ikke det samme. -->
                                        <dl v-if="contract"
                                            class="mt-8 border-t border-gray-200 pt-6 space-y-3 text-sm">
                                            <div class="flex items-baseline justify-between gap-x-4">
                                                <dt class="text-gray-500">
                                                    {{ $t('superadmin.companies.contract.startedAt') }}
                                                </dt>
                                                <dd class="font-medium text-gray-900">
                                                    {{ formatDate(contract.started_at) }}
                                                </dd>
                                            </div>
                                            <div class="flex items-baseline justify-between gap-x-4">
                                                <dt class="text-gray-500">
                                                    {{ $t('superadmin.companies.contract.term') }}
                                                </dt>
                                                <dd class="font-medium text-gray-900">
                                                    {{ $t('superadmin.companies.contract.months', { count: contract.term_months }) }}
                                                </dd>
                                            </div>
                                            <div class="flex items-baseline justify-between gap-x-4">
                                                <dt class="text-gray-500">
                                                    {{ $t('superadmin.companies.contract.renewsAt') }}
                                                </dt>
                                                <dd class="font-medium text-gray-900">
                                                    {{ formatDate(contract.renews_at) }}
                                                </dd>
                                            </div>
                                            <div v-if="canViewFinancials"
                                                class="flex items-baseline justify-between gap-x-4 border-t border-gray-100 pt-3">
                                                <dt class="text-gray-500">
                                                    {{ $t('superadmin.companies.contract.tcv') }}
                                                </dt>
                                                <dd class="font-semibold text-gray-900">
                                                    {{ formatAmount(contract.total_contract_value, contract.currency) }}
                                                </dd>
                                            </div>
                                            <p v-if="canViewFinancials" class="text-xs text-gray-400">
                                                {{ $t('superadmin.companies.contract.tcvHint') }}
                                            </p>

                                            <!-- Opsigelsen. Kun når der er en: et tomt
                                                 "Opsagt: —" på hver kunde ville gøre
                                                 den tilstand der betyder noget usynlig. -->
                                            <template v-if="contract.is_cancelled">
                                                <div class="flex items-baseline justify-between gap-x-4 border-t border-gray-100 pt-3">
                                                    <dt class="text-amber-700">
                                                        {{ $t('superadmin.companies.contract.cancelledAt') }}
                                                    </dt>
                                                    <dd class="font-medium text-amber-700">
                                                        {{ formatDate(contract.cancelled_at) }}
                                                    </dd>
                                                </div>
                                                <div class="flex items-baseline justify-between gap-x-4">
                                                    <dt class="text-amber-700">
                                                        {{ $t('superadmin.companies.contract.endsAt') }}
                                                    </dt>
                                                    <dd class="font-medium text-amber-700">
                                                        {{ formatDate(contract.ends_at) }}
                                                    </dd>
                                                </div>
                                                <p class="text-xs text-gray-400">
                                                    {{ $t('superadmin.companies.contract.cancelledHint') }}
                                                </p>
                                            </template>

                                            <button v-if="canManageCompanies" type="button" @click="openCancellation"
                                                class="text-xs text-primary hover:underline pt-1">
                                                {{ contract.is_cancelled
                                                    ? $t('superadmin.companies.contract.editCancellation')
                                                    : $t('superadmin.companies.contract.recordCancellation') }}
                                            </button>
                                        </dl>
                                    </div>
                                </div>
                                <div class="w-full">
                                    <div>
                                        <h3 class="py-3 text-sm font-semibold">
                                            {{ $t('settings.licenseOverview.licenses') }}
                                        </h3>
                                        <TabsLocal v-model="state.activeLicenseType" :tabs="[
                                            { key: 'user', label: $t('superadmin.companies.licenseOverview.userLicenses') },
                                            { key: 'department', label: $t('superadmin.companies.licenseOverview.departmentLicenses') },
                                        ]" class="mb-4" />
                                        <div class="bg-white ring-1 ring-gray-200 rounded-md p-8 xl:p-10 space-y-5">
                                            <div class="mb-5 flex items-center gap-x-5 justify-end">
                                                <div>
                                                    <span class="text-sm font-semibold">
                                                        {{ $t('settings.licenseOverview.usedLicense') }}:
                                                    </span>
                                                    {{ state.licensesCount?.data?.used ?? 0 }}
                                                </div>
                                                |
                                                <div>
                                                    <span class="text-sm font-semibold">
                                                        {{ $t('settings.licenseOverview.unusedLicense') }}:
                                                    </span>
                                                    {{ state.licensesCount?.data?.unused ?? 0 }}
                                                </div>
                                            </div>
                                            <TableSearch @search="handleSearch" />
                                            <div class="table-responsive">
                                                <Table :columnHeaders="state.columnHeaders" :data="state.licenses"
                                                    :isLoading="state.isTableLoading" :sortData="state.sortData"
                                                    @sort="sort">
                                                    <template #body
                                                        v-if="!(state.isTableLoading || (state.licenses?.data?.length === 0))">
                                                        <tr v-for="(license, index) in state.licenses?.data"
                                                            :key="index">
                                                            <td width="40%">
                                                                <span>{{ license?.license }}</span>
                                                            </td>
                                                            <td width="40%">
                                                                <span>
                                                                    {{ license?.licensed_user?.firstname }}
                                                                    {{ license?.licensed_user?.lastname }}
                                                                </span>
                                                            </td>
                                                            <td width="20%" class="text-right space-x-2">
                                                                <button v-if="canManageLicenses && license?.type === 'custom_yearly'"
                                                                    class="co-action-btn"
                                                                    @click="openEditTermModal(license)">
                                                                    {{ $t('superadmin.companies.licenseOverview.editTerm.editTerm') }}
                                                                </button>
                                                                <button v-if="canManageLicenses && license?.type !== 'free'"
                                                                    class="co-action-btn-danger"
                                                                    @click="confirmRemoveLicense(license)">
                                                                    {{ $t('superadmin.companies.licenseOverview.removeLicense.remove') }}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    </template>
                                                </Table>
                                            </div>
                                            <Pagination :data="state.licenses" @previous="previous" @next="next" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Storage -->
                            <div class="mt-8">
                                <div class="flex items-center justify-between mb-3">
                                    <h3 class="text-sm font-semibold">
                                        {{ $t('superadmin.companies.licenseOverview.storage.storage') }}
                                    </h3>
                                    <FormButton v-if="canManageLicenses" buttonStyle="action" @click="openGrantStorageModal">
                                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                        {{ $t('superadmin.companies.licenseOverview.storage.grantStorage') }}
                                    </FormButton>
                                </div>
                                <div class="bg-white ring-1 ring-gray-200 rounded-md p-8 xl:p-10">
                                    <div v-if="state.storage.subscription" class="flex items-center justify-between">
                                        <div>
                                            <p class="text-base font-semibold text-tertiary">
                                                {{ state.storage.subscription.deal.name }}
                                            </p>
                                            <p class="text-sm text-gray-600 mt-1">
                                                {{ $t('superadmin.companies.licenseOverview.storage.used', {
                                                    used: state.storage.storage_used_gb,
                                                    quota: state.storage.storage_quota_gb
                                                }) }}
                                            </p>
                                        </div>
                                        <button v-if="canManageLicenses" class="co-action-btn-danger"
                                            @click="state.removeStorage.isConfirmOpen = true">
                                            {{ $t('superadmin.companies.licenseOverview.storage.remove') }}
                                        </button>
                                    </div>
                                    <p v-else class="text-sm text-gray-600">
                                        {{ $t('superadmin.companies.licenseOverview.storage.none', {
                                            quota: state.storage.storage_quota_gb
                                        }) }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </LoadingSpinner>
                </div>
            </div>

            <Modal size="sm" :title="$t('superadmin.companies.licenseOverview.grant.addLicenses')"
                :show="state.grant.isOpen" @close="state.grant.isOpen = false">
                <template #modal-body>
                    <div class="space-y-4">
                        <p class="text-sm text-gray-600">
                            {{ $t('superadmin.companies.licenseOverview.grant.description') }}
                        </p>
                        <p class="text-sm font-semibold text-gray-900">
                            {{ state.activeLicenseType === 'department'
                                ? $t('superadmin.companies.licenseOverview.departmentLicenses')
                                : $t('superadmin.companies.licenseOverview.userLicenses') }}
                        </p>
                        <div class="space-y-1">
                            <FormLabel for="grant_quantity"
                                :label="$t('superadmin.companies.licenseOverview.grant.quantity')" />
                            <input id="grant_quantity" type="number" min="1" max="1000" v-model.number="state.grant.quantity"
                                class="appearance-none block w-full px-4 h-11 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-primary-700 focus:border-primary-700 sm:text-sm" />
                        </div>
                        <div v-if="needsFrequencyPicker" class="space-y-1">
                            <FormLabel :label="$t('superadmin.companies.licenseOverview.grant.billingFrequency')" />
                            <fieldset :aria-label="$t('superadmin.companies.licenseOverview.grant.billingFrequency')">
                                <RadioGroup v-model="state.grant.frequency"
                                    class="grid grid-cols-2 gap-x-1 rounded-full p-2 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-gray-200">
                                    <RadioGroupOption as="template" v-for="option in ['monthly', 'yearly']" :key="option"
                                        :value="option" v-slot="{ checked }">
                                        <div
                                            :class="[checked ? 'bg-tertiary text-white' : 'text-gray-500', 'cursor-pointer rounded-full px-2.5 py-1']">
                                            {{ option === 'monthly'
                                                ? $t('superadmin.companies.licenseOverview.grant.monthly')
                                                : $t('superadmin.companies.licenseOverview.grant.yearly') }}
                                        </div>
                                    </RadioGroupOption>
                                </RadioGroup>
                            </fieldset>
                        </div>
                        <p v-else class="text-sm text-gray-600">
                            {{ $t('superadmin.companies.licenseOverview.grant.billingFixed', { frequency: fixedFrequencyLabel }) }}
                        </p>
                        <div v-if="grantIsYearly" class="space-y-1">
                            <FormLabel for="grant_term_years"
                                :label="$t('superadmin.companies.licenseOverview.addSubscription.termYears')" />
                            <input id="grant_term_years" type="number" min="1" max="10" v-model.number="state.grant.termYears"
                                class="appearance-none block w-full px-4 h-11 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-primary-700 focus:border-primary-700 sm:text-sm" />
                            <p class="text-xs text-gray-500">
                                {{ $t('superadmin.companies.licenseOverview.addSubscription.termYearsHint') }}
                            </p>
                        </div>
                        <div class="space-y-1">
                            <div class="w-fit flex items-center cursor-pointer"
                                @click="state.grant.paysViaLeverandorservice = !state.grant.paysViaLeverandorservice">
                                <FormCheckbox :value="state.grant.paysViaLeverandorservice" />
                                {{ $t('superadmin.companies.licenseOverview.addSubscription.paysViaLeverandorservice') }}
                            </div>
                        </div>
                        <div class="flex justify-end gap-3 pt-2">
                            <FormButton buttonStyle="secondary" @click="state.grant.isOpen = false">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton buttonStyle="primary"
                                :disabled="state.grant.isSaving || !state.grant.quantity || state.grant.quantity < 1 || (needsFrequencyPicker && !state.grant.frequency) || (grantIsYearly && (!state.grant.termYears || state.grant.termYears < 1))"
                                @click="submitGrant">
                                {{ $t('save') }}
                            </FormButton>
                        </div>
                    </div>
                </template>
            </Modal>

            <Modal size="sm" :title="$t('superadmin.companies.licenseOverview.addSubscription.title')"
                :show="state.addSubscription.isOpen" @close="state.addSubscription.isOpen = false">
                <template #modal-body>
                    <div class="space-y-4">
                        <div class="space-y-1">
                            <FormLabel :label="$t('superadmin.companies.licenseOverview.addSubscription.plan')" />
                            <fieldset :aria-label="$t('superadmin.companies.licenseOverview.addSubscription.plan')">
                                <RadioGroup v-model="state.addSubscription.package"
                                    class="grid grid-cols-2 gap-x-1 rounded-full p-2 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-gray-200">
                                    <RadioGroupOption as="template" v-for="deal in state.addSubscription.deals"
                                        :key="deal.name" :value="deal.name" v-slot="{ checked }">
                                        <div
                                            :class="[checked ? 'bg-tertiary text-white' : 'text-gray-500', 'cursor-pointer rounded-full px-2.5 py-1']">
                                            {{ deal.name }}
                                        </div>
                                    </RadioGroupOption>
                                </RadioGroup>
                            </fieldset>
                        </div>
                        <div class="space-y-1">
                            <FormLabel :label="$t('superadmin.companies.licenseOverview.addSubscription.frequency')" />
                            <fieldset :aria-label="$t('superadmin.companies.licenseOverview.addSubscription.frequency')">
                                <RadioGroup v-model="state.addSubscription.frequency"
                                    class="grid grid-cols-2 gap-x-1 rounded-full p-2 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-gray-200">
                                    <RadioGroupOption as="template" v-for="option in ['monthly', 'yearly']" :key="option"
                                        :value="option" v-slot="{ checked }">
                                        <div
                                            :class="[checked ? 'bg-tertiary text-white' : 'text-gray-500', 'cursor-pointer rounded-full px-2.5 py-1']">
                                            {{ option === 'monthly'
                                                ? $t('superadmin.companies.licenseOverview.addSubscription.monthly')
                                                : $t('superadmin.companies.licenseOverview.addSubscription.yearly') }}
                                        </div>
                                    </RadioGroupOption>
                                </RadioGroup>
                            </fieldset>
                        </div>
                        <div class="space-y-1">
                            <FormLabel :label="$t('superadmin.companies.licenseOverview.addSubscription.billingMethod')" />
                            <fieldset :aria-label="$t('superadmin.companies.licenseOverview.addSubscription.billingMethod')">
                                <RadioGroup v-model="state.addSubscription.billingMethod" class="space-y-2">
                                    <RadioGroupOption as="template" v-for="option in [
                                        { value: 'manual_invoice', label: $t('superadmin.companies.licenseOverview.addSubscription.manualInvoice'), description: $t('superadmin.companies.licenseOverview.addSubscription.manualInvoiceDescription') },
                                        { value: 'payment_card', label: $t('superadmin.companies.licenseOverview.addSubscription.paymentCard'), description: $t('superadmin.companies.licenseOverview.addSubscription.paymentCardDescription') },
                                        { value: 'assigned_payment_card', label: $t('superadmin.companies.licenseOverview.addSubscription.assignedPaymentCard'), description: $t('superadmin.companies.licenseOverview.addSubscription.assignedPaymentCardDescription') },
                                    ]" :key="option.value" :value="option.value" v-slot="{ checked }">
                                        <div
                                            :class="[checked ? 'ring-2 ring-tertiary' : 'ring-1 ring-gray-200', 'cursor-pointer rounded-lg p-3']">
                                            <p class="text-sm font-semibold text-gray-900">{{ option.label }}</p>
                                            <p class="text-xs text-gray-500 mt-0.5">{{ option.description }}</p>
                                        </div>
                                    </RadioGroupOption>
                                </RadioGroup>
                            </fieldset>
                        </div>
                        <div v-if="state.addSubscription.billingMethod === 'manual_invoice'" class="space-y-1">
                            <div class="w-fit flex items-center cursor-pointer"
                                @click="state.addSubscription.paysViaLeverandorservice = !state.addSubscription.paysViaLeverandorservice">
                                <FormCheckbox :value="state.addSubscription.paysViaLeverandorservice" />
                                {{ $t('superadmin.companies.licenseOverview.addSubscription.paysViaLeverandorservice') }}
                            </div>
                        </div>
                        <div v-if="addSubscriptionNeedsTermYears" class="space-y-1">
                            <FormLabel for="add_subscription_term_years"
                                :label="$t('superadmin.companies.licenseOverview.addSubscription.termYears')" />
                            <input id="add_subscription_term_years" type="number" min="1" max="10"
                                v-model.number="state.addSubscription.termYears"
                                class="appearance-none block w-full px-4 h-11 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-primary-700 focus:border-primary-700 sm:text-sm" />
                            <p class="text-xs text-gray-500">
                                {{ $t('superadmin.companies.licenseOverview.addSubscription.termYearsHint') }}
                            </p>
                        </div>
                        <div class="rounded-lg bg-gray-50 p-3 space-y-1 text-sm">
                            <div class="flex justify-between text-gray-600">
                                <span>{{ $t('superadmin.companies.licenseOverview.addSubscription.unitPrice') }}</span>
                                <span>{{ formatAmount(addSubscriptionUnitPrice, 'DKK') }}</span>
                            </div>
                            <div class="flex justify-between text-gray-600">
                                <span>{{ $t('superadmin.companies.licenseOverview.addSubscription.tax') }}</span>
                                <span>{{ formatAmount(addSubscriptionTax, 'DKK') }}</span>
                            </div>
                            <div class="flex justify-between text-gray-600">
                                <span>{{ $t('superadmin.companies.licenseOverview.addSubscription.serviceFee') }}</span>
                                <span>{{ formatAmount(addSubscriptionServiceFee, 'DKK') }}</span>
                            </div>
                            <div class="flex justify-between font-semibold text-gray-900 pt-1 border-t border-gray-200">
                                <span>{{ $t('superadmin.companies.licenseOverview.addSubscription.total') }}</span>
                                <span>{{ formatAmount(addSubscriptionTotal, 'DKK') }}</span>
                            </div>
                        </div>
                        <div class="flex justify-end gap-3 pt-2">
                            <FormButton buttonStyle="secondary" @click="state.addSubscription.isOpen = false">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton buttonStyle="primary"
                                :disabled="state.addSubscription.isSaving || !state.addSubscription.package || (addSubscriptionNeedsTermYears && (!state.addSubscription.termYears || state.addSubscription.termYears < 1))"
                                @click="submitAddSubscription">
                                {{ $t('save') }}
                            </FormButton>
                        </div>
                    </div>
                </template>
            </Modal>

            <Modal size="sm" :title="$t('superadmin.companies.licenseOverview.editSubscription.title')"
                :show="state.editSubscription.isOpen" @close="state.editSubscription.isOpen = false">
                <template #modal-body>
                    <div class="space-y-4">
                        <div class="space-y-1">
                            <FormLabel :label="$t('superadmin.companies.licenseOverview.addSubscription.plan')" />
                            <fieldset :aria-label="$t('superadmin.companies.licenseOverview.addSubscription.plan')">
                                <RadioGroup v-model="state.editSubscription.package"
                                    class="grid grid-cols-2 gap-x-1 rounded-full p-2 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-gray-200">
                                    <RadioGroupOption as="template" v-for="deal in state.addSubscription.deals"
                                        :key="deal.name" :value="deal.name" v-slot="{ checked }">
                                        <div
                                            :class="[checked ? 'bg-tertiary text-white' : 'text-gray-500', 'cursor-pointer rounded-full px-2.5 py-1']">
                                            {{ deal.name }}
                                        </div>
                                    </RadioGroupOption>
                                </RadioGroup>
                            </fieldset>
                        </div>
                        <div class="space-y-1">
                            <FormLabel :label="$t('superadmin.companies.licenseOverview.addSubscription.frequency')" />
                            <fieldset :aria-label="$t('superadmin.companies.licenseOverview.addSubscription.frequency')">
                                <RadioGroup v-model="state.editSubscription.frequency"
                                    class="grid grid-cols-2 gap-x-1 rounded-full p-2 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-gray-200">
                                    <RadioGroupOption as="template" v-for="option in ['monthly', 'yearly']" :key="option"
                                        :value="option" v-slot="{ checked }">
                                        <div
                                            :class="[checked ? 'bg-tertiary text-white' : 'text-gray-500', 'cursor-pointer rounded-full px-2.5 py-1']">
                                            {{ option === 'monthly'
                                                ? $t('superadmin.companies.licenseOverview.addSubscription.monthly')
                                                : $t('superadmin.companies.licenseOverview.addSubscription.yearly') }}
                                        </div>
                                    </RadioGroupOption>
                                </RadioGroup>
                            </fieldset>
                        </div>
                        <div class="space-y-1">
                            <FormLabel :label="$t('superadmin.companies.licenseOverview.addSubscription.billingMethod')" />
                            <fieldset :aria-label="$t('superadmin.companies.licenseOverview.addSubscription.billingMethod')">
                                <RadioGroup v-model="state.editSubscription.billingMethod" class="space-y-2">
                                    <RadioGroupOption as="template" v-for="option in [
                                        { value: 'manual_invoice', label: $t('superadmin.companies.licenseOverview.addSubscription.manualInvoice'), description: $t('superadmin.companies.licenseOverview.addSubscription.manualInvoiceDescription') },
                                        { value: 'payment_card', label: $t('superadmin.companies.licenseOverview.addSubscription.paymentCard'), description: $t('superadmin.companies.licenseOverview.addSubscription.paymentCardDescription') },
                                    ]" :key="option.value" :value="option.value" v-slot="{ checked }">
                                        <div
                                            :class="[checked ? 'ring-2 ring-tertiary' : 'ring-1 ring-gray-200', 'cursor-pointer rounded-lg p-3']">
                                            <p class="text-sm font-semibold text-gray-900">{{ option.label }}</p>
                                            <p class="text-xs text-gray-500 mt-0.5">{{ option.description }}</p>
                                        </div>
                                    </RadioGroupOption>
                                </RadioGroup>
                            </fieldset>
                        </div>
                        <div v-if="state.editSubscription.billingMethod === 'manual_invoice'" class="space-y-1">
                            <div class="w-fit flex items-center cursor-pointer"
                                @click="state.editSubscription.paysViaLeverandorservice = !state.editSubscription.paysViaLeverandorservice">
                                <FormCheckbox :value="state.editSubscription.paysViaLeverandorservice" />
                                {{ $t('superadmin.companies.licenseOverview.addSubscription.paysViaLeverandorservice') }}
                            </div>
                        </div>
                        <div class="rounded-lg bg-gray-50 p-3 space-y-1 text-sm">
                            <div class="flex justify-between text-gray-600">
                                <span>{{ $t('superadmin.companies.licenseOverview.addSubscription.unitPrice') }}</span>
                                <span>{{ formatAmount(editSubscriptionUnitPrice, 'DKK') }}</span>
                            </div>
                            <div class="flex justify-between text-gray-600">
                                <span>{{ $t('superadmin.companies.licenseOverview.addSubscription.tax') }}</span>
                                <span>{{ formatAmount(editSubscriptionTax, 'DKK') }}</span>
                            </div>
                            <div class="flex justify-between text-gray-600">
                                <span>{{ $t('superadmin.companies.licenseOverview.addSubscription.serviceFee') }}</span>
                                <span>{{ formatAmount(editSubscriptionServiceFee, 'DKK') }}</span>
                            </div>
                            <div v-if="editSubscriptionEstimatedCredit > 0" class="flex justify-between text-gray-600">
                                <span>{{ $t('superadmin.companies.licenseOverview.editSubscription.estimatedCredit') }}</span>
                                <span>-{{ formatAmount(editSubscriptionEstimatedCredit, 'DKK') }}</span>
                            </div>
                            <div class="flex justify-between font-semibold text-gray-900 pt-1 border-t border-gray-200">
                                <span>{{ $t('superadmin.companies.licenseOverview.addSubscription.total') }}</span>
                                <span>{{ formatAmount(editSubscriptionTotal, 'DKK') }}</span>
                            </div>
                        </div>
                        <div class="flex justify-end gap-3 pt-2">
                            <FormButton buttonStyle="secondary" @click="state.editSubscription.isOpen = false">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton buttonStyle="primary"
                                :disabled="state.editSubscription.isSaving || !state.editSubscription.package"
                                @click="submitEditSubscription">
                                {{ $t('save') }}
                            </FormButton>
                        </div>
                    </div>
                </template>
            </Modal>

            <Modal size="sm" :title="$t('superadmin.companies.licenseOverview.editTerm.title')"
                :show="state.editTerm.isOpen" @close="state.editTerm.isOpen = false">
                <template #modal-body>
                    <div class="space-y-4">
                        <div class="space-y-1">
                            <FormLabel for="edit_term_years"
                                :label="$t('superadmin.companies.licenseOverview.addSubscription.termYears')" />
                            <input id="edit_term_years" type="number" min="1" max="10"
                                v-model.number="state.editTerm.termYears"
                                class="appearance-none block w-full px-4 h-11 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-primary-700 focus:border-primary-700 sm:text-sm" />
                            <p class="text-xs text-gray-500">
                                {{ $t('superadmin.companies.licenseOverview.editTerm.currentTermHint', { years: state.editTerm.target?.term_years ?? 1 }) }}
                            </p>
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="edit_term_created_at"
                                :label="$t('superadmin.companies.licenseOverview.editTerm.startDate')" />
                            <input id="edit_term_created_at" type="date" v-model="state.editTerm.createdAt"
                                class="appearance-none block w-full px-4 h-11 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-primary-700 focus:border-primary-700 sm:text-sm" />
                        </div>
                        <div v-if="editTermDeltaYears > 0" class="space-y-1">
                            <div class="w-fit flex items-center cursor-pointer"
                                @click="state.editTerm.paysViaLeverandorservice = !state.editTerm.paysViaLeverandorservice">
                                <FormCheckbox :value="state.editTerm.paysViaLeverandorservice" />
                                {{ $t('superadmin.companies.licenseOverview.addSubscription.paysViaLeverandorservice') }}
                            </div>
                        </div>
                        <div v-if="editTermDeltaYears !== 0" class="rounded-lg bg-gray-50 p-3 space-y-1 text-sm">
                            <div v-if="editTermDeltaYears > 0" class="flex justify-between text-gray-600">
                                <span>{{ $t('superadmin.companies.licenseOverview.editTerm.additionalYears', { years: editTermDeltaYears }) }}</span>
                                <span>{{ formatAmount(editTermUnitAmount, 'DKK') }}</span>
                            </div>
                            <div v-if="editTermDeltaYears > 0" class="flex justify-between text-gray-600">
                                <span>{{ $t('superadmin.companies.licenseOverview.addSubscription.tax') }}</span>
                                <span>{{ formatAmount(editTermUnitAmount * 0.25, 'DKK') }}</span>
                            </div>
                            <div v-if="editTermDeltaYears > 0" class="flex justify-between text-gray-600">
                                <span>{{ $t('superadmin.companies.licenseOverview.addSubscription.serviceFee') }}</span>
                                <span>{{ formatAmount(editTermServiceFee, 'DKK') }}</span>
                            </div>
                            <div v-if="editTermDeltaYears < 0" class="flex justify-between text-gray-600">
                                <span>{{ $t('superadmin.companies.licenseOverview.editTerm.fewerYears', { years: -editTermDeltaYears }) }}</span>
                            </div>
                            <div class="flex justify-between font-semibold text-gray-900 pt-1 border-t border-gray-200">
                                <span>{{ editTermDeltaYears > 0 ? $t('superadmin.companies.licenseOverview.addSubscription.total') : $t('superadmin.companies.licenseOverview.editTerm.credit') }}</span>
                                <span>{{ formatAmount(editTermTotal, 'DKK') }}</span>
                            </div>
                        </div>
                        <div class="flex justify-end gap-3 pt-2">
                            <FormButton buttonStyle="secondary" @click="state.editTerm.isOpen = false">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton buttonStyle="primary"
                                :disabled="state.editTerm.isSaving || !state.editTerm.termYears || state.editTerm.termYears < 1 || state.editTerm.termYears > 10"
                                @click="submitEditTerm">
                                {{ $t('save') }}
                            </FormButton>
                        </div>
                    </div>
                </template>
            </Modal>

            <Modal size="sm" :title="$t('superadmin.companies.contract.cancellationTitle')"
                :show="state.cancellation.isOpen" @close="state.cancellation.isOpen = false">
                <template #modal-body>
                    <div class="space-y-4">
                        <p class="text-xs text-gray-500">
                            {{ $t('superadmin.companies.contract.cancellationHelp') }}
                        </p>
                        <div class="space-y-1">
                            <FormLabel for="cancelled_at"
                                :label="$t('superadmin.companies.contract.cancelledAt')" />
                            <input id="cancelled_at" type="date" v-model="state.cancellation.cancelledAt"
                                class="appearance-none block w-full px-4 h-11 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-primary-700 focus:border-primary-700 sm:text-sm" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="ends_at" :label="$t('superadmin.companies.contract.endsAt')" />
                            <input id="ends_at" type="date" v-model="state.cancellation.endsAt"
                                :min="state.cancellation.cancelledAt || undefined"
                                class="appearance-none block w-full px-4 h-11 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-primary-700 focus:border-primary-700 sm:text-sm" />
                            <p class="text-xs text-gray-500">
                                {{ $t('superadmin.companies.contract.endsAtHint') }}
                            </p>
                        </div>
                        <div class="flex justify-between items-center gap-3 pt-2">
                            <button v-if="contract?.is_cancelled" type="button" @click="submitCancellation(true)"
                                :disabled="state.cancellation.isSaving"
                                class="text-xs text-red-600 hover:underline disabled:opacity-50">
                                {{ $t('superadmin.companies.contract.clearCancellation') }}
                            </button>
                            <span v-else></span>
                            <div class="flex gap-3">
                                <FormButton buttonStyle="secondary" @click="state.cancellation.isOpen = false">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton buttonStyle="primary"
                                    :disabled="state.cancellation.isSaving || !state.cancellation.endsAt"
                                    @click="submitCancellation(false)">
                                    {{ $t('save') }}
                                </FormButton>
                            </div>
                        </div>
                    </div>
                </template>
            </Modal>

            <DialogConfirmation :isModalOpen="state.removeLicense.isConfirmOpen"
                :message="$t('superadmin.companies.licenseOverview.removeLicense.confirm', { license: state.removeLicense.target?.license, user: removeLicenseTargetUserName })"
                @close="state.removeLicense.isConfirmOpen = false" @confirm="submitRemoveLicense" />

            <Modal size="sm" :title="$t('superadmin.companies.licenseOverview.storage.grantStorage')"
                :show="state.grantStorage.isOpen" @close="state.grantStorage.isOpen = false">
                <template #modal-body>
                    <div class="space-y-4">
                        <p class="text-sm text-gray-600">
                            {{ $t('superadmin.companies.licenseOverview.storage.description') }}
                        </p>
                        <div class="space-y-1">
                            <FormLabel :label="$t('superadmin.companies.licenseOverview.storage.packageLabel')" />
                            <FormSelect :options="grantStoragePackageOptions" v-model="state.grantStorage.addOnDealUuid" />
                        </div>
                        <div v-if="needsFrequencyPicker" class="space-y-1">
                            <FormLabel :label="$t('superadmin.companies.licenseOverview.grant.billingFrequency')" />
                            <fieldset :aria-label="$t('superadmin.companies.licenseOverview.grant.billingFrequency')">
                                <RadioGroup v-model="state.grantStorage.frequency"
                                    class="grid grid-cols-2 gap-x-1 rounded-full p-2 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-gray-200">
                                    <RadioGroupOption as="template" v-for="option in ['monthly', 'yearly']" :key="option"
                                        :value="option" v-slot="{ checked }">
                                        <div
                                            :class="[checked ? 'bg-tertiary text-white' : 'text-gray-500', 'cursor-pointer rounded-full px-2.5 py-1']">
                                            {{ option === 'monthly'
                                                ? $t('superadmin.companies.licenseOverview.grant.monthly')
                                                : $t('superadmin.companies.licenseOverview.grant.yearly') }}
                                        </div>
                                    </RadioGroupOption>
                                </RadioGroup>
                            </fieldset>
                        </div>
                        <p v-else class="text-sm text-gray-600">
                            {{ $t('superadmin.companies.licenseOverview.grant.billingFixed', { frequency: fixedFrequencyLabel }) }}
                        </p>
                        <div class="space-y-1">
                            <div class="w-fit flex items-center cursor-pointer"
                                @click="state.grantStorage.paysViaLeverandorservice = !state.grantStorage.paysViaLeverandorservice">
                                <FormCheckbox :value="state.grantStorage.paysViaLeverandorservice" />
                                {{ $t('superadmin.companies.licenseOverview.addSubscription.paysViaLeverandorservice') }}
                            </div>
                        </div>
                        <div class="flex justify-end gap-3 pt-2">
                            <FormButton buttonStyle="secondary" @click="state.grantStorage.isOpen = false">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton buttonStyle="primary"
                                :disabled="state.grantStorage.isSaving || !state.grantStorage.addOnDealUuid || (needsFrequencyPicker && !state.grantStorage.frequency)"
                                @click="submitGrantStorage">
                                {{ $t('save') }}
                            </FormButton>
                        </div>
                    </div>
                </template>
            </Modal>

            <DialogConfirmation :isModalOpen="state.removeStorage.isConfirmOpen"
                :message="$t('superadmin.companies.licenseOverview.storage.confirmRemove', { package: state.storage.subscription?.deal?.name })"
                @close="state.removeStorage.isConfirmOpen = false" @confirm="submitRemoveStorage" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { licenseService } from '@/components/api/superadmin/LicenseService'
import { storagePackageService } from '@/components/api/superadmin/StoragePackageService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { usePermissions } from '@/composables/usePermissions'
import { useI18n } from 'vue-i18n'
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()
const { can } = usePermissions()
const { successAlert, errorAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const companyUuid = router?.currentRoute?.value?.params?.company_uuid

const { formatDateToReadable } = useDatetimeFormatter()

const canManageLicenses = computed(() => can('manage_licenses'))
const canViewFinancials = computed(() => can('view_financials'))

function formatDate(value?: string | null): string {
    return value ? formatDateToReadable(value) : '—'
}

const detailTabs = computed(() => [
    { label: t('superadmin.companies.accounts.tabs.overview'), href: `/superadmin/companies/${companyUuid}/accounts`, icon: 'ph:house' },
    { label: t('superadmin.sidebar.licenses'), href: `/superadmin/companies/${companyUuid}/license-overview`, icon: 'ph:key' },
    { label: t('superadmin.sidebar.apps'), href: `/superadmin/companies/${companyUuid}/apps`, icon: 'ph:squares-four' },
    { label: t('superadmin.sidebar.invoices'), href: `/superadmin/companies/${companyUuid}/invoices`, icon: 'ph:invoice' },
    { label: t('superadmin.companies.tabs.agreements'), href: `/superadmin/companies/${companyUuid}/agreements`, icon: 'ph:handshake' },
    { label: t('superadmin.companies.tabs.migration'), href: `/superadmin/companies/${companyUuid}/migration`, icon: 'ph:arrows-merge' },
    { label: t('superadmin.companies.table.actions.edit'), href: `/superadmin/companies/${companyUuid}/edit`, icon: 'ph:pencil-simple' },
])
let currentTablePage = 1

const state = reactive({
    activeLicenseType: 'user' as 'user' | 'department',
    columnHeaders: [
        { name: 'superadmin.companies.licenseOverview.table.license', isTranslateName: true, sorter: true, key: 'license' },
        { name: 'superadmin.companies.licenseOverview.table.user', isTranslateName: true, },
        { name: '', isTranslateName: false, },
    ],
    cancellation: {
        isOpen: false,
        cancelledAt: '',
        endsAt: '',
        isSaving: false,
    },
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isPageLoading: false,
    isTableLoading: false,
    licenses: [] as any,
    licensesCount: [] as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
    subscriptions: [] as any,
    grant: {
        isOpen: false,
        isSaving: false,
        quantity: 1 as number,
        frequency: 'monthly' as 'monthly' | 'yearly',
        paysViaLeverandorservice: false,
        termYears: 1 as number,
    },
    addSubscription: {
        isOpen: false,
        isSaving: false,
        isLoadingDeals: false,
        deals: [] as any[],
        package: '' as string,
        frequency: 'monthly' as 'monthly' | 'yearly',
        billingMethod: 'manual_invoice' as 'manual_invoice' | 'payment_card' | 'assigned_payment_card',
        paysViaLeverandorservice: false,
        termYears: 1 as number,
    },
    editSubscription: {
        isOpen: false,
        isSaving: false,
        package: '' as string,
        frequency: 'monthly' as 'monthly' | 'yearly',
        billingMethod: 'manual_invoice' as 'manual_invoice' | 'payment_card',
        paysViaLeverandorservice: false,
    },
    // Extend/reduce the contract length of an already-granted manual yearly
    // license seat or Deal subscription. `target` is whichever row's "Edit
    // term" button was clicked - it just needs uuid/term_years/created_at/deal.
    editTerm: {
        isOpen: false,
        isSaving: false,
        target: null as any,
        termYears: 1 as number,
        createdAt: '' as string,
        paysViaLeverandorservice: false,
    },
    removeLicense: {
        isConfirmOpen: false,
        isSaving: false,
        target: null as any,
    },
    storage: {
        subscription: null as any,
        storage_used_gb: 0,
        storage_quota_gb: 0,
    },
    grantStorage: {
        isOpen: false,
        isSaving: false,
        isLoadingPackages: false,
        packages: [] as any[],
        addOnDealUuid: '' as string,
        frequency: 'monthly' as 'monthly' | 'yearly',
        paysViaLeverandorservice: false,
    },
    removeStorage: {
        isConfirmOpen: false,
        isSaving: false,
    },
})

// Aftalen bag abonnementet. API'et regner den, så tallet på skærmen er det
// samme tal som alle andre steder - og TCV er ikke noget klienten selv gætter
// sig til ud fra en pris den kan se.
const contract = computed(() => state.subscriptions?.data?.contract ?? null)

const canManageCompanies = computed(() => can('manage_companies'))

const grantStoragePackageOptions = computed(() =>
    state.grantStorage.packages.map((pkg: any) => ({
        value: pkg.uuid,
        label: `${pkg.name} (${formatAmount(pkg.monthly_price, 'DKK')}/${t('superadmin.companies.licenseOverview.grant.monthly')})`,
    }))
)

const addSubscriptionSelectedDeal = computed(() =>
    state.addSubscription.deals.find((deal: any) => deal.name === state.addSubscription.package)
)
// A multi-year contract term only makes sense for a one-off manual invoice
// billed yearly - a card-recurring subscription is charged per cycle by
// Nexi, so "3 years upfront via card" isn't supported (mirrors the backend's
// addDealSubscription()/grantLicenses()/grantApplicationLicense() guard).
const addSubscriptionNeedsTermYears = computed(() =>
    state.addSubscription.frequency === 'yearly' && state.addSubscription.billingMethod === 'manual_invoice'
)
const addSubscriptionEffectiveTermYears = computed(() =>
    addSubscriptionNeedsTermYears.value ? Math.max(1, Number(state.addSubscription.termYears) || 1) : 1
)
const addSubscriptionUnitPrice = computed(() => {
    const deal = addSubscriptionSelectedDeal.value
    if (!deal) return 0
    const yearlyPrice = state.addSubscription.frequency === 'yearly' ? Number(deal.yearly_price ?? 0) : Number(deal.monthly_price ?? 0)
    return yearlyPrice * addSubscriptionEffectiveTermYears.value
})
const addSubscriptionTax = computed(() => addSubscriptionUnitPrice.value * 0.25)
const addSubscriptionServiceFee = computed(() =>
    state.addSubscription.billingMethod !== 'manual_invoice' ? 4.75
    : state.addSubscription.paysViaLeverandorservice ? 0 : 295
)
const addSubscriptionTotal = computed(() => addSubscriptionUnitPrice.value * 1.25 + addSubscriptionServiceFee.value)

// What fraction of the current billing period is still unused, rolling
// forward from the subscription's start date in monthly/yearly steps until
// it brackets "now" - mirrors ProrationCalculator on the backend. This is
// only ever a preview: the manual-invoice path recomputes it authoritatively
// server-side, and the card-billed path (payment_card) is the one value this
// estimate actually gets sent for, matching changePlan's existing contract.
function remainingFraction(subscriptionStart: Date, frequency: string, now: Date): number {
    const isYearly = frequency.includes('year')
    const step = (date: Date) => {
        const next = new Date(date)
        if (isYearly) next.setFullYear(next.getFullYear() + 1)
        else next.setMonth(next.getMonth() + 1)
        return next
    }
    let periodStart = new Date(subscriptionStart)
    while (step(periodStart).getTime() <= now.getTime()) {
        periodStart = step(periodStart)
    }
    const periodEnd = step(periodStart)
    return (periodEnd.getTime() - now.getTime()) / (periodEnd.getTime() - periodStart.getTime())
}

const editSubscriptionSelectedDeal = computed(() =>
    state.addSubscription.deals.find((deal: any) => deal.name === state.editSubscription.package)
)
const editSubscriptionUnitPrice = computed(() => {
    const deal = editSubscriptionSelectedDeal.value
    if (!deal) return 0
    return state.editSubscription.frequency === 'yearly' ? Number(deal.yearly_price ?? 0) : Number(deal.monthly_price ?? 0)
})
const editSubscriptionTax = computed(() => editSubscriptionUnitPrice.value * 0.25)
const editSubscriptionServiceFee = computed(() =>
    state.editSubscription.billingMethod !== 'manual_invoice' ? 4.75
    : state.editSubscription.paysViaLeverandorservice ? 0 : 295
)
const editSubscriptionEstimatedCredit = computed(() => {
    const current = state.subscriptions?.data
    if (!current?.created_at || !current?.type || !current?.deal) return 0
    const oldUnitPrice = current.type.includes('year') ? Number(current.deal.yearly_price ?? 0) : Number(current.deal.monthly_price ?? 0)
    if (!oldUnitPrice) return 0
    const fraction = remainingFraction(new Date(current.created_at), current.type, new Date())
    return Math.round(Math.max(0, fraction) * oldUnitPrice * 100) / 100
})
const editSubscriptionTotal = computed(() =>
    Math.max(0, editSubscriptionUnitPrice.value * 1.25 + editSubscriptionServiceFee.value - editSubscriptionEstimatedCredit.value)
)

// Positive = extending the term (invoice the difference), negative =
// reducing it (credit note), zero = no price/date-only change.
const editTermDeltaYears = computed(() =>
    Number(state.editTerm.termYears || 0) - Number(state.editTerm.target?.term_years ?? 1)
)
// Same lookup as the backend: AddOnDeal's new_yearly_price supersedes
// yearly_price when set; Application/Deal only ever have yearly_price.
const editTermPerYearPrice = computed(() => {
    const deal = state.editTerm.target?.deal
    if (!deal) return 0
    return Number(deal.new_yearly_price ?? deal.yearly_price ?? 0)
})
const editTermUnitAmount = computed(() => editTermPerYearPrice.value * Math.abs(editTermDeltaYears.value))
const editTermServiceFee = computed(() => (state.editTerm.paysViaLeverandorservice ? 0 : 295))
const editTermTotal = computed(() => {
    if (editTermDeltaYears.value > 0) {
        return (editTermUnitAmount.value * 1.25) + editTermServiceFee.value
    }
    if (editTermDeltaYears.value < 0) {
        return editTermUnitAmount.value
    }
    return 0
})

// The company's active Deal subscription (monthly/yearly/custom_monthly/custom_yearly)
// determines the license's billing frequency automatically; only a missing or
// free subscription leaves it ambiguous enough to need the picker.
const needsFrequencyPicker = computed(() =>
    !['monthly', 'yearly', 'custom_monthly', 'custom_yearly'].includes(state.subscriptions?.data?.type)
)

const fixedFrequencyLabel = computed(() => {
    const dealType = state.subscriptions?.data?.type
    return dealType?.includes('yearly')
        ? t('superadmin.companies.licenseOverview.grant.yearly')
        : t('superadmin.companies.licenseOverview.grant.monthly')
})

// grantLicenses() always persists a manual-invoice frequency (custom_monthly/
// custom_yearly), regardless of whether the frequency came from the picker
// above or from the company's existing deal - so a term-years field only
// needs to check "yearly", not billing method (there is none to pick here).
const grantIsYearly = computed(() =>
    needsFrequencyPicker.value ? state.grant.frequency === 'yearly' : !!state.subscriptions?.data?.type?.includes('yearly')
)

watch(() => state.activeLicenseType, () => {
    currentTablePage = 1
    fetchLicenses()
    fetchLicensesCount()
})

function openGrantModal() {
    state.grant.quantity = 1
    state.grant.frequency = 'monthly'
    state.grant.paysViaLeverandorservice = false
    state.grant.termYears = 1
    state.grant.isOpen = true
}

async function submitGrant() {
    if (!state.grant.quantity || state.grant.quantity < 1) return
    if (needsFrequencyPicker.value && !state.grant.frequency) return
    if (grantIsYearly.value && (!state.grant.termYears || state.grant.termYears < 1)) return
    state.grant.isSaving = true
    try {
        const params: { quantity: number, type: 'user' | 'department', frequency?: 'monthly' | 'yearly', pays_via_leverandorservice: boolean, term_years?: number } = {
            quantity: state.grant.quantity,
            type: state.activeLicenseType,
            pays_via_leverandorservice: state.grant.paysViaLeverandorservice,
        }
        if (needsFrequencyPicker.value) {
            params.frequency = state.grant.frequency
        }
        if (grantIsYearly.value) {
            params.term_years = state.grant.termYears
        }
        await licenseService.grantLicenses(companyUuid as string, params)
        state.grant.isOpen = false
        successAlert(`${t('alert.success')}!`, `${t('superadmin.companies.licenseOverview.grant.granted')}.`)
        fetchLicenses()
        fetchLicensesCount()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('superadmin.companies.licenseOverview.grant.failed'))
    }
    state.grant.isSaving = false
}

async function openAddSubscriptionModal() {
    state.addSubscription.frequency = 'monthly'
    state.addSubscription.billingMethod = 'manual_invoice'
    state.addSubscription.paysViaLeverandorservice = false
    state.addSubscription.termYears = 1
    state.addSubscription.isOpen = true

    if (state.addSubscription.deals.length === 0) {
        state.addSubscription.isLoadingDeals = true
        try {
            const response = await licenseService.getDeals()
            state.addSubscription.deals = response?.data ?? []
            state.addSubscription.package = state.addSubscription.deals[0]?.name ?? ''
        } catch (error: any) {
            errorAlert(t('alert.warning'), error?.message ?? t('superadmin.companies.licenseOverview.addSubscription.failed'))
        }
        state.addSubscription.isLoadingDeals = false
    } else {
        state.addSubscription.package = state.addSubscription.deals[0]?.name ?? ''
    }
}

async function submitAddSubscription() {
    if (!state.addSubscription.package) return
    if (addSubscriptionNeedsTermYears.value && (!state.addSubscription.termYears || state.addSubscription.termYears < 1)) return
    state.addSubscription.isSaving = true
    try {
        await licenseService.addDealSubscription(companyUuid as string, {
            package: state.addSubscription.package,
            frequency: state.addSubscription.frequency,
            billing_method: state.addSubscription.billingMethod,
            pays_via_leverandorservice: state.addSubscription.paysViaLeverandorservice,
            ...(addSubscriptionNeedsTermYears.value ? { term_years: state.addSubscription.termYears } : {}),
        })
        state.addSubscription.isOpen = false
        successAlert(`${t('alert.success')}!`, `${t('superadmin.companies.licenseOverview.addSubscription.added')}.`)
        fetchSubscription()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('superadmin.companies.licenseOverview.addSubscription.failed'))
    }
    state.addSubscription.isSaving = false
}

async function openEditSubscriptionModal() {
    const current = state.subscriptions?.data
    state.editSubscription.package = current?.deal?.name ?? ''
    state.editSubscription.frequency = current?.type?.includes('year') ? 'yearly' : 'monthly'
    state.editSubscription.billingMethod = current?.type?.startsWith('custom') ? 'manual_invoice' : 'payment_card'
    state.editSubscription.paysViaLeverandorservice = false
    state.editSubscription.isOpen = true

    if (state.addSubscription.deals.length === 0) {
        state.addSubscription.isLoadingDeals = true
        try {
            const response = await licenseService.getDeals()
            state.addSubscription.deals = response?.data ?? []
        } catch (error: any) {
            errorAlert(t('alert.warning'), error?.message ?? t('superadmin.companies.licenseOverview.addSubscription.failed'))
        }
        state.addSubscription.isLoadingDeals = false
    }
}

async function submitEditSubscription() {
    if (!state.editSubscription.package) return
    state.editSubscription.isSaving = true
    try {
        const params: any = {
            package: state.editSubscription.package,
            frequency: state.editSubscription.frequency,
            billing_method: state.editSubscription.billingMethod,
        }
        if (state.editSubscription.billingMethod === 'payment_card') {
            params.credit_amount = editSubscriptionEstimatedCredit.value
        } else {
            params.pays_via_leverandorservice = state.editSubscription.paysViaLeverandorservice
        }
        await licenseService.updateDealSubscription(companyUuid as string, params)
        state.editSubscription.isOpen = false
        successAlert(`${t('alert.success')}!`, `${t('superadmin.companies.licenseOverview.editSubscription.updated')}.`)
        fetchSubscription()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('superadmin.companies.licenseOverview.editSubscription.failed'))
    }
    state.editSubscription.isSaving = false
}

function openEditTermModal(license: any) {
    state.editTerm.target = license
    state.editTerm.termYears = license?.term_years ?? 1
    // Slice rather than round-trip through Date() - a timezone shift there
    // could silently move the date a day off from what's actually stored.
    state.editTerm.createdAt = license?.created_at ? String(license.created_at).slice(0, 10) : ''
    state.editTerm.paysViaLeverandorservice = false
    state.editTerm.isOpen = true
}

/**
 * Åbner opsigelsen med de datoer der allerede står, så en rettelse er en
 * rettelse og ikke en genindtastning.
 */
function openCancellation() {
    state.cancellation.cancelledAt = contract.value?.cancelled_at ?? ''
    state.cancellation.endsAt = contract.value?.ends_at ?? ''
    state.cancellation.isOpen = true
}

async function submitCancellation(clear: boolean) {
    state.cancellation.isSaving = true
    try {
        await licenseService.updateContractCancellation(companyUuid as string, {
            contract_cancelled_at: clear ? null : (state.cancellation.cancelledAt || null),
            contract_ends_at: clear ? null : (state.cancellation.endsAt || null),
        })
        state.cancellation.isOpen = false
        successAlert(`${t('alert.success')}!`, `${t('superadmin.companies.contract.cancellationSaved')}.`)
        fetchSubscription()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('superadmin.companies.contract.cancellationFailed'))
    }
    state.cancellation.isSaving = false
}

async function submitEditTerm() {
    const target = state.editTerm.target
    if (!target?.uuid || !state.editTerm.termYears || state.editTerm.termYears < 1 || state.editTerm.termYears > 10) return
    state.editTerm.isSaving = true
    try {
        const params: { term_years: number; created_at?: string; pays_via_leverandorservice?: boolean } = {
            term_years: state.editTerm.termYears,
            pays_via_leverandorservice: state.editTerm.paysViaLeverandorservice,
        }
        const originalDate = target.created_at ? String(target.created_at).slice(0, 10) : ''
        if (state.editTerm.createdAt && state.editTerm.createdAt !== originalDate) {
            params.created_at = state.editTerm.createdAt
        }
        await licenseService.updateSubscriptionTerm(companyUuid as string, target.uuid, params)
        state.editTerm.isOpen = false
        successAlert(`${t('alert.success')}!`, `${t('superadmin.companies.licenseOverview.editTerm.updated')}.`)
        fetchLicenses()
        fetchLicensesCount()
        fetchSubscription()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('superadmin.companies.licenseOverview.editTerm.failed'))
    }
    state.editTerm.isSaving = false
}

function confirmRemoveLicense(license: any) {
    state.removeLicense.target = license
    state.removeLicense.isConfirmOpen = true
}

const removeLicenseTargetUserName = computed(() => {
    const user = state.removeLicense.target?.licensed_user
    return user?.firstname
        ? t('superadmin.companies.licenseOverview.removeLicense.assignedTo', { name: `${user.firstname} ${user.lastname}` })
        : t('superadmin.companies.licenseOverview.removeLicense.noOne')
})

async function submitRemoveLicense() {
    if (!state.removeLicense.target?.uuid) return
    state.removeLicense.isSaving = true
    try {
        await licenseService.removeLicense(companyUuid as string, state.removeLicense.target.uuid)
        state.removeLicense.isConfirmOpen = false
        successAlert(`${t('alert.success')}!`, `${t('superadmin.companies.licenseOverview.removeLicense.removed')}.`)
        fetchLicenses()
        fetchLicensesCount()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('superadmin.companies.licenseOverview.removeLicense.failed'))
    }
    state.removeLicense.isSaving = false
}

onMounted(() => {
    fetchSubscription()
    fetchLicenses()
    fetchLicensesCount()
    fetchCompanyStorage()
})

async function fetchCompanyStorage() {
    try {
        const response = await licenseService.getCompanyStorage(companyUuid as string)
        if (response) {
            state.storage.subscription = response.subscription ?? null
            state.storage.storage_used_gb = response.storage_used_gb ?? 0
            state.storage.storage_quota_gb = response.storage_quota_gb ?? 0
        }
    } catch (error: any) {
        state.error = error
    }
}

async function openGrantStorageModal() {
    state.grantStorage.addOnDealUuid = ''
    state.grantStorage.frequency = 'monthly'
    state.grantStorage.paysViaLeverandorservice = false
    state.grantStorage.isOpen = true

    if (state.grantStorage.packages.length === 0) {
        state.grantStorage.isLoadingPackages = true
        try {
            const response = await storagePackageService.getStoragePackages()
            state.grantStorage.packages = response?.data ?? []
        } catch (error: any) {
            errorAlert(t('alert.warning'), error?.message ?? t('superadmin.companies.licenseOverview.storage.grantFailed'))
        }
        state.grantStorage.isLoadingPackages = false
    }
}

async function submitGrantStorage() {
    if (!state.grantStorage.addOnDealUuid) return
    if (needsFrequencyPicker.value && !state.grantStorage.frequency) return
    state.grantStorage.isSaving = true
    try {
        const params: { add_on_deal_uuid: string, frequency?: 'monthly' | 'yearly', pays_via_leverandorservice: boolean } = {
            add_on_deal_uuid: state.grantStorage.addOnDealUuid,
            pays_via_leverandorservice: state.grantStorage.paysViaLeverandorservice,
        }
        if (needsFrequencyPicker.value) {
            params.frequency = state.grantStorage.frequency
        }
        await licenseService.grantStorage(companyUuid as string, params)
        state.grantStorage.isOpen = false
        successAlert(`${t('alert.success')}!`, `${t('superadmin.companies.licenseOverview.storage.granted')}.`)
        fetchCompanyStorage()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('superadmin.companies.licenseOverview.storage.grantFailed'))
    }
    state.grantStorage.isSaving = false
}

async function submitRemoveStorage() {
    state.removeStorage.isSaving = true
    try {
        await licenseService.removeStorage(companyUuid as string)
        state.removeStorage.isConfirmOpen = false
        successAlert(`${t('alert.success')}!`, `${t('superadmin.companies.licenseOverview.storage.removed')}.`)
        fetchCompanyStorage()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('superadmin.companies.licenseOverview.storage.removeFailed'))
    }
    state.removeStorage.isSaving = false
}

async function fetchSubscription() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await licenseService.getSubscription(companyUuid)
        if (response) {
            state.subscriptions = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchLicensesCount() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await licenseService.getLicensesCount(companyUuid, state.activeLicenseType)
        if (response) {
            state.licensesCount = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function fetchLicenses() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            type: state.activeLicenseType,
            ...state.dataFilter
        }
        const response = await licenseService.getLicenses(companyUuid, params)
        if (response) {
            state.licenses = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchLicenses()
}

function next() {
    currentTablePage++
    fetchLicenses()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchLicenses()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchLicenses()
}
</script>