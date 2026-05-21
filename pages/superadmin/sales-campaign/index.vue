<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>
                    {{ $t('superadmin.salesCampaign.pageTitle') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>
            <template #header>
                {{ $t('superadmin.salesCampaign.pageTitle') }}
            </template>

            <div class="p-1">
                <div class="flex items-center justify-between mb-5">
                    <div>
                        <h1 class="text-[22px] font-semibold text-[#1F2533]">
                            {{ $t('superadmin.salesCampaign.pageTitle') }}
                        </h1>
                        <p class="text-sm text-[#5C6478] mt-0.5">
                            {{ $t('superadmin.salesCampaign.pageSubtitle') }}
                        </p>
                    </div>
                    <button @click="openSlider(null)"
                        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm"
                        style="background:#205E77">
                        <Icon name="ph:plus" class="w-4 h-4" />
                        {{ $t('superadmin.salesCampaign.newCampaign') }}
                    </button>
                </div>

                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div v-for="card in statCards" :key="card.label"
                        class="bg-white border border-[#EAECF0] rounded-xl px-5 py-4 shadow-sm">
                        <div class="h-0.5 rounded-full mb-4 -mx-5 -mt-4 rounded-t-xl"
                            :style="`background:${card.color}`"></div>
                        <p class="text-[10px] font-bold text-[#8891A4] uppercase tracking-[0.08em]">
                            {{ card.label }}
                        </p>
                        <p class="text-[28px] font-bold text-[#1F2533] mt-1 leading-none">
                            {{ card.value }}
                        </p>
                        <p class="text-[11px] text-[#8891A4] mt-1">
                            {{ card.sub }}
                        </p>
                    </div>
                </div>

                <div class="flex items-center gap-0 border-b border-[#EAECF0] mb-5">
                    <button v-for="tab in mainTabs" :key="tab.key"
                        class="px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-px" :style="activeTab === tab.key
                            ? 'border-color:#205E77;color:#205E77'
                            : 'border-color:transparent;color:#8891A4'" @click="activeTab = tab.key">
                        {{ tab.label }}
                        <span v-if="tab.count !== undefined"
                            class="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                            :style="activeTab === tab.key ? 'background:#E4F1F6;color:#205E77' : 'background:#F5F6F8;color:#8891A4'">
                            {{ tab.count }}
                        </span>
                    </button>
                </div>

                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error?.message?.length > 0" />
                <div v-if="activeTab === 'campaigns'">
                    <div class="flex items-center gap-3 mb-4">
                        <SuperadminTableSearch v-model="searchQuery"
                            :placeholder="$t('superadmin.salesCampaign.searchCampaigns')" @input="debouncedSearch" />
                        <div class="flex items-center bg-white border border-[#EAECF0] rounded-lg p-0.5">
                            <button v-for="filter in campaignFilters" :key="filter.key"
                                class="px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors"
                                :style="campaignFilter === filter.key ? 'background:#205E77;color:#fff' : 'color:#5C6478'"
                                @click="campaignFilter = filter.key">
                                {{ filter.label }}
                            </button>
                        </div>
                    </div>

                    <SuperadminTable :columnHeaders="state.campaignColumnHeaders" :data="campaignsTableData"
                        :isLoading="state.isLoading" :emptyMessage="$t('superadmin.salesCampaign.noCampaigns')"
                        :emptySubMessage="$t('superadmin.salesCampaign.createFirstCampaign')" emptyIcon="ph:trend-up"
                        rowKey="uuid">
                        <template #body>
                            <tr v-for="campaign in filteredCampaigns" :key="campaign.uuid ?? campaign.id"
                                class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors group">
                                <td class="co-td">
                                    <img :src="campaign.image" :alt="$t('imageFailedToLoad')"
                                        class="w-20 h-20 object-cover" />
                                    <p class="text-[13px] font-semibold text-[#1F2533]">
                                        {{ campaign.title }}
                                    </p>
                                    <p v-if="campaign.content"
                                        class="text-[11px] text-[#8891A4] truncate max-w-[200px]">
                                        {{ campaign.content }}
                                    </p>
                                </td>
                                <td class="co-td">
                                    <span class="co-badge co-badge-navy text-[11px]">
                                        <Icon :name="campaignTypeIcon(campaign.type)" class="w-3 h-3" />
                                        {{ campaignTypeLabel(campaign.type) }}
                                    </span>
                                </td>
                                <td class="co-td">
                                    <span class="text-[14px] font-bold text-[#1F2533]">
                                        {{
                                            campaign.discount_type === 'percent' ? `${campaign.discount_value ?? 0}%` :
                                                campaign.discount_type === 'fixed' ? `kr. ${campaign.discount_value ?? 0}` :
                                                    campaign.discount_type === 'free_months' ? `${campaign.discount_value ?? 0}
                                        ${$t('superadmin.salesCampaign.monthsFree')}` : '—'
                                        }}
                                    </span>
                                </td>
                                <td class="co-td text-[12px] text-[#5C6478]">
                                    {{
                                        campaign.target_plan ?
                                            campaign.target_plan :
                                            $t('superadmin.salesCampaign.allPlans')
                                    }}
                                </td>
                                <td class="co-td text-[12px] text-[#5C6478]">
                                    <span v-if="campaign.start_date">{{ formatDate(campaign.start_date) }}</span>
                                    <span v-if="campaign.start_date && campaign.end_date"> – </span>
                                    <span v-if="campaign.end_date">{{ formatDate(campaign.end_date) }}</span>
                                    <span v-if="!campaign.start_date && !campaign.end_date" class="text-[#8891A4]">
                                        {{ $t('superadmin.salesCampaign.noExpiry') }}
                                    </span>
                                </td>
                                <td class="co-td">
                                    <span class="co-badge text-[11px]" :style="campaignStatusStyle(campaign)">
                                        <span class="w-1.5 h-1.5 rounded-full"
                                            :style="`background:${campaignStatusDot(campaign)}`"></span>
                                        {{ campaignStatusLabel(campaign) }}
                                    </span>
                                </td>
                                <td class="co-td" @click.stop>
                                    <div
                                        class="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                        <SuperadminTableButton @click="openSlider(campaign)">
                                            <Icon name="ph:pencil-simple" class="w-3.5 h-3.5" />
                                            {{ $t('superadmin.salesCampaign.edit') }}
                                        </SuperadminTableButton>
                                        <SuperadminTableButton buttonStyle="danger"
                                            @click="confirmDelete('campaign', campaign)">
                                            <Icon name="ph:trash" class="w-3.5 h-3.5" />
                                        </SuperadminTableButton>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </SuperadminTable>
                </div>

                <div v-if="activeTab === 'coupons'">
                    <div class="flex items-center justify-between gap-3 mb-4">
                        <SuperadminTableSearch v-model="couponSearch"
                            :placeholder="$t('superadmin.salesCampaign.searchCoupons')" />
                        <button @click="openCouponSlider(null)"
                            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-white"
                            style="background:#205E77">
                            <Icon name="ph:plus" class="w-4 h-4" />
                            {{ $t('superadmin.salesCampaign.newCoupon') }}
                        </button>
                    </div>

                    <SuperadminTable :columnHeaders="state.couponColumnHeaders" :data="couponsTableData"
                        :isLoading="false" :emptyMessage="$t('superadmin.salesCampaign.noCoupons')"
                        emptyIcon="ph:ticket" rowKey="uuid">
                        <template #body>
                            <tr v-for="coupon in filteredCoupons" :key="coupon.uuid ?? coupon.id"
                                class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors group">
                                <td class="co-td">
                                    <span
                                        class="font-mono text-[13px] font-bold text-[#205E77] bg-[#E4F1F6] px-2 py-0.5 rounded-md">
                                        {{ coupon.code }}
                                    </span>
                                    <p v-if="coupon.description" class="text-[11px] text-[#8891A4] mt-1">
                                        {{ coupon.description }}
                                    </p>
                                </td>
                                <td class="co-td font-bold text-[14px] text-[#1F2533]">
                                    {{
                                        coupon.discount_type === 'percent' ?
                                            `${coupon.discount_value}%` : `kr. ${coupon.discount_value}`
                                    }}
                                </td>
                                <td class="co-td text-[13px] text-[#5C6478]">
                                    {{ coupon.redemptions ?? 0 }}
                                </td>
                                <td class="co-td text-[13px] text-[#5C6478]">
                                    {{ coupon.max_uses ?? '∞' }}
                                </td>
                                <td class="co-td text-[12px] text-[#5C6478]">
                                    {{
                                        coupon.expires_at ?
                                            formatDate(coupon.expires_at) :
                                            $t('superadmin.salesCampaign.never')
                                    }}
                                </td>
                                <td class="co-td">
                                    <span v-if="coupon.is_active !== false" class="co-badge co-badge-green text-[11px]">
                                        <span class="w-1.5 h-1.5 rounded-full bg-[#2E9E33]"></span>
                                        {{ $t('superadmin.salesCampaign.statusActive') }}
                                    </span>
                                    <span v-else class="co-badge co-badge-gray text-[11px]">
                                        {{ $t('superadmin.salesCampaign.statusInactive') }}
                                    </span>
                                </td>
                                <td class="co-td" @click.stop>
                                    <div
                                        class="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                        <SuperadminTableButton @click="openCouponSlider(coupon)">
                                            <Icon name="ph:pencil-simple" class="w-3.5 h-3.5" />
                                            {{ $t('superadmin.salesCampaign.edit') }}
                                        </SuperadminTableButton>
                                        <SuperadminTableButton buttonStyle="danger"
                                            @click="confirmDelete('coupon', coupon)">
                                            <Icon name="ph:trash" class="w-3.5 h-3.5" />
                                        </SuperadminTableButton>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </SuperadminTable>
                </div>

                <div v-if="activeTab === 'tools'" class="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <!-- Extend trial -->
                    <div class="bg-white border border-[#EAECF0] rounded-xl p-5 shadow-sm">
                        <div class="flex items-start gap-3 mb-4">
                            <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                style="background:#E4F1F6">
                                <Icon name="ph:clock-countdown" class="w-5 h-5" style="color:#205E77" />
                            </div>
                            <div>
                                <p class="text-[14px] font-semibold text-[#1F2533]">
                                    {{ $t('superadmin.salesCampaign.toolTrialTitle') }}
                                </p>
                                <p class="text-[12px] text-[#8891A4]">
                                    {{ $t('superadmin.salesCampaign.toolTrialDesc') }}
                                </p>
                            </div>
                        </div>
                        <div class="space-y-3">
                            <div>
                                <label class="co-label text-[11px]">
                                    {{ $t('superadmin.salesCampaign.labelClient').toUpperCase() }}
                                </label>
                                <div class="relative">
                                    <input v-model="tools.trial.companySearch" type="text"
                                        :placeholder="$t('superadmin.salesCampaign.phSearchClient')" class="co-input"
                                        @input="searchTrialCompany" />
                                    <div v-if="tools.trial.results.length"
                                        class="absolute top-full left-0 right-0 mt-1 border border-[#EAECF0] rounded-lg bg-white shadow z-10 max-h-36 overflow-y-auto">
                                        <button v-for="c in tools.trial.results" :key="c.uuid"
                                            class="w-full text-left px-3 py-2 hover:bg-[#F5F6F8] text-[13px] flex items-center gap-2"
                                            @click="tools.trial.company = c; tools.trial.companySearch = c.name; tools.trial.results = []">
                                            <div class="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-white"
                                                :style="`background:${avatarColor(c.name)}`">{{
                                                    (c.name || '?').charAt(0).toUpperCase() }}</div>
                                            {{ c.name }}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label class="co-label text-[11px]">
                                    {{ $t('superadmin.salesCampaign.labelExtraDays').toUpperCase() }}
                                </label>
                                <div class="flex gap-2">
                                    <button v-for="d in [7, 14, 30]" :key="d"
                                        class="px-4 py-2 rounded-lg border-2 text-[13px] font-medium transition-colors"
                                        :style="tools.trial.days === d ? 'border-color:#42AED9;background:#F0FAFD;color:#205E77' : 'border-color:#EAECF0;color:#5C6478'"
                                        @click="tools.trial.days = d">
                                        {{ d }} {{ $t('superadmin.salesCampaign.days') }}
                                    </button>
                                </div>
                            </div>
                            <button @click="extendTrial"
                                class="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity"
                                style="background:#205E77" :disabled="!tools.trial.company">
                                {{ $t('superadmin.salesCampaign.btnExtendTrial') }}
                            </button>
                        </div>
                    </div>

                    <!-- Mass campaign -->
                    <div class="bg-white border border-[#EAECF0] rounded-xl p-5 shadow-sm">
                        <div class="flex items-start gap-3 mb-4">
                            <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                style="background:#E4F1F6">
                                <Icon name="ph:broadcast" class="w-5 h-5" style="color:#205E77" />
                            </div>
                            <div>
                                <p class="text-[14px] font-semibold text-[#1F2533]">
                                    {{ $t('superadmin.salesCampaign.toolMassTitle') }}
                                </p>
                                <p class="text-[12px] text-[#8891A4]">
                                    {{ $t('superadmin.salesCampaign.toolMassDesc') }}
                                </p>
                            </div>
                        </div>
                        <div class="space-y-3">
                            <div>
                                <label class="co-label text-[11px]">
                                    {{ $t('superadmin.salesCampaign.labelTargetGroup').toUpperCase() }}
                                </label>
                                <select v-model="tools.mass.targetGroup" class="co-input">
                                    <option value="all">{{ $t('superadmin.salesCampaign.allClients') }}</option>
                                    <option value="gratis">{{ $t('superadmin.salesCampaign.freePlan') }}</option>
                                    <option value="basis">{{ $t('superadmin.salesCampaign.basisPlan') }}</option>
                                    <option value="pro">{{ $t('superadmin.salesCampaign.proPlan') }}</option>
                                </select>
                            </div>
                            <div>
                                <label class="co-label text-[11px]">
                                    {{ $t('superadmin.salesCampaign.labelDiscountPct').toUpperCase() }}
                                </label>
                                <input v-model.number="tools.mass.discount" type="number" min="0" max="100"
                                    placeholder="20" class="co-input" />
                            </div>
                            <button @click="sendMassCampaign"
                                class="w-full py-2.5 rounded-lg text-sm font-semibold border border-[#EAECF0] text-[#5C6478] hover:bg-[#F5F6F8] transition-colors">
                                {{ $t('superadmin.salesCampaign.btnSendCampaign') }}
                            </button>
                        </div>
                    </div>

                    <!-- Referral programme -->
                    <div class="bg-white border border-[#EAECF0] rounded-xl p-5 shadow-sm">
                        <div class="flex items-start gap-3 mb-4">
                            <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                style="background:#EDF7EE">
                                <Icon name="ph:share-network" class="w-5 h-5" style="color:#2E9E33" />
                            </div>
                            <div>
                                <p class="text-[14px] font-semibold text-[#1F2533]">
                                    {{ $t('superadmin.salesCampaign.toolReferralTitle') }}
                                </p>
                                <p class="text-[12px] text-[#8891A4]">
                                    {{ $t('superadmin.salesCampaign.toolReferralDesc') }}
                                </p>
                            </div>
                        </div>
                        <div class="space-y-3">
                            <div class="flex items-center justify-between py-2.5 px-3 bg-[#F5F6F8] rounded-xl">
                                <span class="text-[13px] font-medium text-[#1F2533]">
                                    {{ $t('superadmin.salesCampaign.referralActive') }}
                                </span>
                                <button type="button" @click="tools.referral.active = !tools.referral.active"
                                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                                    :style="tools.referral.active ? 'background:#42AED9' : 'background:#D5D9E2'">
                                    <span
                                        class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                                        :class="tools.referral.active ? 'translate-x-6' : 'translate-x-1'"></span>
                                </button>
                            </div>
                            <div>
                                <label class="co-label text-[11px]">
                                    {{ $t('superadmin.salesCampaign.labelRewardPerClient').toUpperCase() }}
                                </label>
                                <input v-model.number="tools.referral.reward" type="number" min="0" placeholder="500"
                                    class="co-input" />
                            </div>
                            <button @click="saveReferral"
                                class="w-full py-2.5 rounded-lg text-sm font-semibold border border-[#EAECF0] text-[#5C6478] hover:bg-[#F5F6F8] transition-colors">
                                {{ $t('superadmin.salesCampaign.saveSettings') }}
                            </button>
                        </div>
                    </div>

                    <!-- Ad banner -->
                    <div class="bg-white border border-[#EAECF0] rounded-xl p-5 shadow-sm">
                        <div class="flex items-start gap-3 mb-4">
                            <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                style="background:#FFF9EC">
                                <Icon name="ph:megaphone-simple" class="w-5 h-5" style="color:#D4900A" />
                            </div>
                            <div>
                                <p class="text-[14px] font-semibold text-[#1F2533]">
                                    {{ $t('superadmin.salesCampaign.toolBannerTitle') }}
                                </p>
                                <p class="text-[12px] text-[#8891A4]">
                                    {{ $t('superadmin.salesCampaign.toolBannerDesc') }}
                                </p>
                            </div>
                        </div>
                        <div class="space-y-3">
                            <div class="flex items-center justify-between py-2.5 px-3 bg-[#F5F6F8] rounded-xl">
                                <span class="text-[13px] font-medium text-[#1F2533]">
                                    {{ $t('superadmin.salesCampaign.bannerActive') }}
                                </span>
                                <button type="button" @click="tools.banner.active = !tools.banner.active"
                                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                                    :style="tools.banner.active ? 'background:#42AED9' : 'background:#D5D9E2'">
                                    <span
                                        class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                                        :class="tools.banner.active ? 'translate-x-6' : 'translate-x-1'"></span>
                                </button>
                            </div>
                            <div>
                                <label class="co-label text-[11px]">
                                    {{ $t('superadmin.salesCampaign.labelMessage').toUpperCase() }}
                                </label>
                                <textarea v-model="tools.banner.message" rows="2"
                                    :placeholder="$t('superadmin.salesCampaign.phBannerMessage')"
                                    class="co-input resize-none"></textarea>
                            </div>
                            <div>
                                <label class="co-label text-[11px]">
                                    {{ $t('superadmin.salesCampaign.labelType').toUpperCase() }}
                                </label>
                                <div class="flex gap-2">
                                    <button v-for="bt in bannerTypes" :key="bt.value"
                                        class="flex-1 py-2 rounded-lg border-2 text-[12px] font-semibold transition-colors"
                                        :style="tools.banner.type === bt.value ? `border-color:${bt.color};background:${bt.bg};color:${bt.color}` : 'border-color:#EAECF0;color:#5C6478'"
                                        @click="tools.banner.type = bt.value">
                                        {{ bt.label }}
                                    </button>
                                </div>
                            </div>
                            <button @click="saveBanner"
                                class="w-full py-2.5 rounded-lg text-sm font-semibold border border-[#EAECF0] text-[#5C6478] hover:bg-[#F5F6F8] transition-colors">
                                {{ $t('superadmin.salesCampaign.saveBanner') }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ═══ SLIDE-OVER: NEW / EDIT CAMPAIGN ═══ -->
            <Teleport to="body">
                <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0"
                    enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200"
                    leave-from-class="opacity-100" leave-to-class="opacity-0">
                    <div v-if="slider.open" class="fixed inset-0 bg-black/30 z-40" @click="closeSlider" />
                </Transition>
                <Transition enter-active-class="transition-transform duration-300 ease-out"
                    enter-from-class="translate-x-full" enter-to-class="translate-x-0"
                    leave-active-class="transition-transform duration-200 ease-in" leave-from-class="translate-x-0"
                    leave-to-class="translate-x-full">
                    <div v-if="slider.open"
                        class="fixed inset-y-0 right-0 z-50 w-full max-w-[460px] bg-white shadow-2xl flex flex-col">
                        <div class="flex items-start justify-between px-6 py-5 border-b border-[#EAECF0]">
                            <div>
                                <h2 class="text-[16px] font-semibold text-[#1F2533]">
                                    {{
                                        slider.editMode ?
                                            $t('superadmin.salesCampaign.sliderEditCampaignTitle') :
                                            $t('superadmin.salesCampaign.sliderNewCampaignTitle')
                                    }}
                                </h2>
                                <p class="text-[12px] text-[#8891A4] mt-0.5">
                                    {{ $t('superadmin.salesCampaign.sliderCampaignSubtitle') }}
                                </p>
                            </div>
                            <button @click="closeSlider"
                                class="w-8 h-8 rounded-lg flex items-center justify-center text-[#8891A4] hover:bg-[#F5F6F8]">
                                <Icon name="ph:x" class="w-4 h-4" />
                            </button>
                        </div>
                        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                            <Alert type="danger" :text="slider.error?.message"
                                v-if="slider.error?.message?.length > 0" />

                            <div>
                                <label class="co-label">
                                    {{ $t('superadmin.salesCampaign.labelCampaignName') }}
                                    <span class="text-red-500">*</span>
                                </label>
                                <input v-model="slider.form.name" type="text"
                                    :placeholder="$t('superadmin.salesCampaign.phCampaignName')" class="co-input"
                                    :class="slider.errors.name ? 'border-red-300' : ''" />
                                <p v-if="slider.errors.name" class="co-error">{{ slider.errors.name }}</p>
                            </div>

                            <div>
                                <label class="co-label">
                                    {{ $t('superadmin.salesCampaign.labelDescription') }}
                                </label>
                                <textarea v-model="slider.form.description" rows="2"
                                    :placeholder="$t('superadmin.salesCampaign.phDescription')"
                                    class="co-input resize-none"></textarea>
                            </div>

                            <!-- Campaign type -->
                            <div>
                                <label class="co-label">
                                    {{ $t('superadmin.salesCampaign.labelCampaignType') }}
                                </label>
                                <div class="grid grid-cols-3 gap-2">
                                    <button v-for="ct in campaignTypes" :key="ct.value"
                                        class="py-2.5 px-2 rounded-xl border-2 text-[12px] font-semibold transition-colors flex items-center justify-center gap-1.5"
                                        :style="slider.form.type === ct.value ? 'border-color:#42AED9;background:#F0FAFD;color:#205E77' : 'border-color:#EAECF0;color:#5C6478'"
                                        @click="slider.form.type = ct.value">
                                        <Icon :name="ct.icon" class="w-3.5 h-3.5" />
                                        {{ ct.label }}
                                    </button>
                                </div>
                            </div>

                            <!-- Discount type + value -->
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="co-label">
                                        {{ $t('superadmin.salesCampaign.labelDiscountType') }}
                                    </label>
                                    <select v-model="slider.form.discount_type" class="co-input">
                                        <option value="percent">
                                            {{ $t('superadmin.salesCampaign.discountPercent') }}
                                        </option>
                                        <option value="fixed">
                                            {{ $t('superadmin.salesCampaign.discountFixed') }}
                                        </option>
                                        <option value="free_months">
                                            {{ $t('superadmin.salesCampaign.discountFreeMonths') }}
                                        </option>
                                    </select>
                                </div>
                                <div>
                                    <label class="co-label">
                                        {{ $t('superadmin.salesCampaign.labelDiscountValue') }}
                                    </label>
                                    <div class="relative">
                                        <input v-model.number="slider.form.discount_value" type="number" min="0"
                                            placeholder="0" class="co-input pr-8" />
                                        <span
                                            class="absolute right-3 top-1/2 -translate-y-1/2 text-[#8891A4] text-[12px]">
                                            {{
                                                slider.form.discount_type === 'percent' ? '%' :
                                                    slider.form.discount_type === 'fixed' ? 'kr' : 'mdr' }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- Target plan -->
                            <div>
                                <label class="co-label">
                                    {{ $t('superadmin.salesCampaign.labelTargetPlan') }}
                                </label>
                                <select v-model="slider.form.target_plan" class="co-input">
                                    <option value="">{{ $t('superadmin.salesCampaign.allPlans') }}</option>
                                    <option value="gratis">{{ $t('superadmin.salesCampaign.planFree') }}</option>
                                    <option value="basis">{{ $t('superadmin.salesCampaign.planBasis') }}</option>
                                    <option value="pro">{{ $t('superadmin.salesCampaign.planPro') }}</option>
                                </select>
                            </div>

                            <!-- Dates -->
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="co-label">
                                        {{ $t('superadmin.salesCampaign.labelStartDate') }}
                                    </label>
                                    <input v-model="slider.form.start_date" type="date" class="co-input" />
                                </div>
                                <div>
                                    <label class="co-label">
                                        {{ $t('superadmin.salesCampaign.labelEndDate') }}
                                    </label>
                                    <input v-model="slider.form.end_date" type="date" class="co-input" />
                                </div>
                            </div>

                            <!-- Active toggle -->
                            <div class="flex items-center justify-between py-3 px-4 border border-[#EAECF0] rounded-xl">
                                <div>
                                    <p class="text-[13px] font-medium text-[#1F2533]">
                                        {{ $t('superadmin.salesCampaign.labelActive') }}
                                    </p>
                                    <p class="text-[11px] text-[#8891A4] mt-0.5">
                                        {{ $t('superadmin.salesCampaign.activeHint') }}
                                    </p>
                                </div>
                                <button type="button" @click="slider.form.is_active = !slider.form.is_active"
                                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
                                    :style="slider.form.is_active ? 'background:#42AED9' : 'background:#D5D9E2'">
                                    <span
                                        class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                                        :class="slider.form.is_active ? 'translate-x-6' : 'translate-x-1'"></span>
                                </button>
                            </div>
                        </div>
                        <div class="flex items-center gap-3 px-6 py-4 border-t border-[#EAECF0]">
                            <button @click="closeSlider"
                                class="flex-1 py-2.5 rounded-lg text-sm font-medium text-[#5C6478] bg-white border border-[#EAECF0] hover:bg-[#F5F6F8]">
                                {{ $t('superadmin.salesCampaign.cancel') }}
                            </button>
                            <button @click="saveCampaign"
                                class="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm"
                                style="background:#205E77" :disabled="slider.isSaving">
                                <span v-if="slider.isSaving" class="flex items-center justify-center gap-2">
                                    <Icon name="ph:spinner" class="w-4 h-4 animate-spin" />
                                    {{ $t('superadmin.salesCampaign.saving') }}
                                </span>
                                <span v-else>
                                    {{
                                        slider.editMode ?
                                            $t('superadmin.salesCampaign.saveChanges') :
                                            $t('superadmin.salesCampaign.createCampaign')
                                    }}
                                </span>
                            </button>
                        </div>
                    </div>
                </Transition>

                <!-- ═══ SLIDE-OVER: NEW / EDIT COUPON ═══ -->
                <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0"
                    enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200"
                    leave-from-class="opacity-100" leave-to-class="opacity-0">
                    <div v-if="couponSlider.open" class="fixed inset-0 bg-black/30 z-40" @click="closeCouponSlider" />
                </Transition>
                <Transition enter-active-class="transition-transform duration-300 ease-out"
                    enter-from-class="translate-x-full" enter-to-class="translate-x-0"
                    leave-active-class="transition-transform duration-200 ease-in" leave-from-class="translate-x-0"
                    leave-to-class="translate-x-full">
                    <div v-if="couponSlider.open"
                        class="fixed inset-y-0 right-0 z-50 w-full max-w-[460px] bg-white shadow-2xl flex flex-col">
                        <div class="flex items-start justify-between px-6 py-5 border-b border-[#EAECF0]">
                            <div>
                                <h2 class="text-[16px] font-semibold text-[#1F2533]">
                                    {{
                                        couponSlider.editMode ?
                                            $t('superadmin.salesCampaign.sliderEditCouponTitle') :
                                            $t('superadmin.salesCampaign.sliderNewCouponTitle')
                                    }}
                                </h2>
                                <p class="text-[12px] text-[#8891A4] mt-0.5">
                                    {{ $t('superadmin.salesCampaign.sliderCouponSubtitle') }}
                                </p>
                            </div>
                            <button @click="closeCouponSlider"
                                class="w-8 h-8 rounded-lg flex items-center justify-center text-[#8891A4] hover:bg-[#F5F6F8]">
                                <Icon name="ph:x" class="w-4 h-4" />
                            </button>
                        </div>
                        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                            <div>
                                <label class="co-label">
                                    {{ $t('superadmin.salesCampaign.labelCouponCode') }}
                                    <span class="text-red-500">*</span>
                                </label>
                                <div class="flex gap-2">
                                    <input v-model="couponSlider.form.code" type="text"
                                        :placeholder="$t('superadmin.salesCampaign.phCouponCode')"
                                        class="co-input uppercase font-mono" />
                                    <button
                                        class="px-3 py-2 rounded-lg border border-[#EAECF0] bg-[#F5F6F8] text-[#5C6478] text-[12px] font-medium hover:bg-[#EEF4FB] hover:text-[#205E77] transition-colors whitespace-nowrap"
                                        @click="generateCode">
                                        {{ $t('superadmin.salesCampaign.generate') }}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label class="co-label">
                                    {{ $t('superadmin.salesCampaign.labelDescription') }}
                                </label>
                                <input v-model="couponSlider.form.description" type="text"
                                    :placeholder="$t('superadmin.salesCampaign.phInternalDesc')" class="co-input" />
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="co-label">
                                        {{ $t('superadmin.salesCampaign.labelDiscountType') }}
                                    </label>
                                    <select v-model="couponSlider.form.discount_type" class="co-input">
                                        <option value="percent">
                                            {{ $t('superadmin.salesCampaign.discountPercent') }}
                                        </option>
                                        <option value="fixed">
                                            {{ $t('superadmin.salesCampaign.discountFixed') }}
                                        </option>
                                    </select>
                                </div>
                                <div>
                                    <label class="co-label">
                                        {{ $t('superadmin.salesCampaign.labelDiscountValue') }}
                                    </label>
                                    <input v-model.number="couponSlider.form.discount_value" type="number" min="0"
                                        placeholder="0" class="co-input" />
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="co-label">
                                        {{ $t('superadmin.salesCampaign.labelMaxUses') }}
                                    </label>
                                    <input v-model.number="couponSlider.form.max_uses" type="number" min="0"
                                        :placeholder="$t('superadmin.salesCampaign.phUnlimited')" class="co-input" />
                                    <p class="text-[11px] text-[#8891A4] mt-1">
                                        {{ $t('superadmin.salesCampaign.maxUsesHint') }}
                                    </p>
                                </div>
                                <div>
                                    <label class="co-label">
                                        {{ $t('superadmin.salesCampaign.labelExpires') }}
                                    </label>
                                    <input v-model="couponSlider.form.expires_at" type="date" class="co-input" />
                                </div>
                            </div>
                            <div class="flex items-center justify-between py-3 px-4 border border-[#EAECF0] rounded-xl">
                                <p class="text-[13px] font-medium text-[#1F2533]">
                                    {{ $t('superadmin.salesCampaign.labelActive') }}
                                </p>
                                <button type="button"
                                    @click="couponSlider.form.is_active = !couponSlider.form.is_active"
                                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                                    :style="couponSlider.form.is_active ? 'background:#42AED9' : 'background:#D5D9E2'">
                                    <span
                                        class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                                        :class="couponSlider.form.is_active ? 'translate-x-6' : 'translate-x-1'"></span>
                                </button>
                            </div>
                        </div>
                        <div class="flex items-center gap-3 px-6 py-4 border-t border-[#EAECF0]">
                            <button @click="closeCouponSlider"
                                class="flex-1 py-2.5 rounded-lg text-sm font-medium text-[#5C6478] bg-white border border-[#EAECF0] hover:bg-[#F5F6F8]">
                                {{ $t('superadmin.salesCampaign.cancel') }}
                            </button>
                            <button @click="saveCoupon"
                                class="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm"
                                style="background:#205E77" :disabled="couponSlider.isSaving">
                                <span v-if="couponSlider.isSaving" class="flex items-center justify-center gap-2">
                                    <Icon name="ph:spinner" class="w-4 h-4 animate-spin" />
                                    {{ $t('superadmin.salesCampaign.saving') }}
                                </span>
                                <span v-else>
                                    {{
                                        couponSlider.editMode ?
                                            $t('superadmin.salesCampaign.saveChanges') :
                                            $t('superadmin.salesCampaign.createCoupon')
                                    }}
                                </span>
                            </button>
                        </div>
                    </div>
                </Transition>
            </Teleport>

            <DialogConfirmation :isModalOpen="state.modal.isDeleteOpen"
                :message="$t('superadmin.salesCampaign.deleteConfirm', { name: state.deleteTarget?.name ?? state.deleteTarget?.code })"
                @close="state.modal.isDeleteOpen = false" @confirm="deleteItem" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { campaignService } from '@/components/api/superadmin/CampaignService'
import { companyService } from '@/components/api/superadmin/CompanyService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

const activeTab = ref('campaigns')
const searchQuery = ref('')
const couponSearch = ref('')
const campaignFilter = ref('all')

let searchTimeout: any = null
let trialSearchTimeout: any = null

const COLORS = ['#205E77', '#2E9E33', '#368F8B', '#1A4D99', '#D4900A', '#9B4D9B']
const avatarColor = (name: string) => COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length]
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('da-DK', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

// ── Locale-reactive computed arrays ──
const campaignTypes = computed(() => [
    { value: 'discount', label: t('superadmin.salesCampaign.typeDiscount'), icon: 'ph:tag' },
    { value: 'trial', label: t('superadmin.salesCampaign.typeTrial'), icon: 'ph:clock' },
    { value: 'bundle', label: t('superadmin.salesCampaign.typeBundle'), icon: 'ph:package' },
    { value: 'flash', label: t('superadmin.salesCampaign.typeFlash'), icon: 'ph:lightning' },
    { value: 'loyalty', label: t('superadmin.salesCampaign.typeLoyalty'), icon: 'ph:heart' },
    { value: 'winback', label: t('superadmin.salesCampaign.typeWinback'), icon: 'ph:arrow-counter-clockwise' },
])

const campaignTypeLabel = (v: string) => campaignTypes.value.find(ct => ct.value === v)?.label ?? v ?? t('superadmin.salesCampaign.typeDiscount')
const campaignTypeIcon = (v: string) => campaignTypes.value.find(ct => ct.value === v)?.icon ?? 'ph:tag'

const campaignFilters = computed(() => [
    { key: 'all', label: t('superadmin.salesCampaign.filterAll') },
    { key: 'active', label: t('superadmin.salesCampaign.filterActive') },
    { key: 'draft', label: t('superadmin.salesCampaign.filterDraft') },
    { key: 'expired', label: t('superadmin.salesCampaign.filterExpired') },
])

const bannerTypes = computed(() => [
    { value: 'info', label: t('superadmin.salesCampaign.bannerInfo'), color: '#205E77', bg: '#E4F1F6' },
    { value: 'success', label: t('superadmin.salesCampaign.bannerSuccess'), color: '#2E9E33', bg: '#EDF7EE' },
    { value: 'warning', label: t('superadmin.salesCampaign.bannerWarning'), color: '#D4900A', bg: '#FFF9EC' },
])

// ── Campaign status helpers (locale-safe) ──
const campaignStatus = (c: any): 'active' | 'draft' | 'expired' => {
    if (!c.is_active) return 'draft'
    if (c.end_date && new Date(c.end_date) < new Date()) return 'expired'
    return 'active'
}
const campaignStatusLabel = (c: any) => {
    const s = campaignStatus(c)
    if (s === 'active') return t('superadmin.salesCampaign.statusActive')
    if (s === 'expired') return t('superadmin.salesCampaign.statusExpired')
    return t('superadmin.salesCampaign.statusDraft')
}
const campaignStatusStyle = (c: any) => {
    const s = campaignStatus(c)
    if (s === 'active') return 'background:#EDF7EE;color:#2E9E33'
    if (s === 'expired') return 'background:#FFF0F0;color:#CC3B2D'
    return 'background:#F5F6F8;color:#5C6478'
}
const campaignStatusDot = (c: any) => {
    const s = campaignStatus(c)
    if (s === 'active') return '#2E9E33'
    if (s === 'expired') return '#CC3B2D'
    return '#8891A4'
}

const state = reactive({
    campaignColumnHeaders: computed(() => [
        { key: 'title', name: t('superadmin.salesCampaign.colCampaign') },
        { key: 'type', name: t('superadmin.salesCampaign.colType') },
        { key: 'discount', name: t('superadmin.salesCampaign.colDiscount') },
        { key: 'target_plan', name: t('superadmin.salesCampaign.colTargetPlan') },
        { key: 'period', name: t('superadmin.salesCampaign.colPeriod') },
        { key: 'status', name: t('superadmin.salesCampaign.colStatus') },
        { key: 'actions', name: '' },
    ]),
    campaigns: [] as any[],
    couponColumnHeaders: computed(() => [
        { key: 'code', name: t('superadmin.salesCampaign.colCode') },
        { key: 'discount', name: t('superadmin.salesCampaign.colDiscount') },
        { key: 'redemptions', name: t('superadmin.salesCampaign.colRedemptions') },
        { key: 'max_uses', name: t('superadmin.salesCampaign.colMaxUses') },
        { key: 'expires', name: t('superadmin.salesCampaign.colExpires') },
        { key: 'status', name: t('superadmin.salesCampaign.colStatus') },
        { key: 'actions', name: '' },
    ]),
    coupons: [] as any[],
    deleteTarget: null as any,
    deleteType: '' as string,
    error: {} as Error,
    isLoading: false,
    modal: { isDeleteOpen: false },
})

const statCards = computed(() => [
    { label: t('superadmin.salesCampaign.statActiveCampaigns'), value: state.campaigns.filter(c => campaignStatus(c) === 'active').length, sub: t('superadmin.salesCampaign.statRunningNow'), color: '#205E77' },
    { label: t('superadmin.salesCampaign.statActiveCoupons'), value: state.coupons.filter(c => c.is_active !== false).length, sub: t('superadmin.salesCampaign.statCanRedeem'), color: '#42AED9' },
    { label: t('superadmin.salesCampaign.statRedemptions'), value: state.coupons.reduce((s, c) => s + (c.redemptions ?? 0), 0), sub: t('superadmin.salesCampaign.statAllTime'), color: '#2E9E33' },
    {
        label: t('superadmin.salesCampaign.statExpiringSoon'), value: state.campaigns.filter(c => {
            if (!c.end_date) return false
            const days = (new Date(c.end_date).getTime() - Date.now()) / 86400000
            return days >= 0 && days <= 7
        }).length, sub: t('superadmin.salesCampaign.statWithin7Days'), color: '#D4900A'
    },
])

const mainTabs = computed(() => [
    { key: 'campaigns', label: t('superadmin.salesCampaign.tabCampaigns'), count: state.campaigns.length },
    { key: 'coupons', label: t('superadmin.salesCampaign.tabCoupons'), count: state.coupons.length },
    { key: 'tools', label: t('superadmin.salesCampaign.tabTools'), count: 4 },
])

const filteredCampaigns = computed(() => {
    let list = state.campaigns
    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        list = list.filter(c => (c.name || '').toLowerCase().includes(q))
    }
    if (campaignFilter.value !== 'all') {
        list = list.filter(c => {
            const s = campaignStatus(c)
            if (campaignFilter.value === 'active') return s === 'active'
            if (campaignFilter.value === 'draft') return s === 'draft'
            if (campaignFilter.value === 'expired') return s === 'expired'
            return true
        })
    }
    return list
})

const filteredCoupons = computed(() => {
    if (!couponSearch.value) return state.coupons
    const q = couponSearch.value.toLowerCase()
    return state.coupons.filter(c => (c.code || '').toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q))
})

const campaignsTableData = computed(() => ({
    data: filteredCampaigns.value
}))

const couponsTableData = computed(() => ({
    data: filteredCoupons.value
}))

const slider = reactive({
    open: false,
    editMode: false,
    isSaving: false,
    error: {} as any,
    editingId: null as any,
    form: { name: '', description: '', type: 'discount', discount_type: 'percent', discount_value: 0, target_plan: '', start_date: '', end_date: '', is_active: true },
    errors: { name: '' },
})

const couponSlider = reactive({
    open: false,
    editMode: false,
    isSaving: false,
    error: {} as any,
    editingId: null as any,
    form: { code: '', description: '', discount_type: 'percent', discount_value: 0, max_uses: 0, expires_at: '', is_active: true },
})

const tools = reactive({
    trial: { companySearch: '', results: [] as any[], company: null as any, days: 14 },
    mass: { targetGroup: 'all', discount: 20 },
    referral: { active: false, reward: 500 },
    banner: { active: false, message: '', type: 'info' },
})

onMounted(() => {
    fetchCampaigns()
    fetchCoupons()
})

async function fetchCampaigns() {
    state.isLoading = true
    try {
        const response = await campaignService.getCampaigns()
        state.campaigns = Array.isArray(response) ? response : (response?.data ?? [])
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function fetchCoupons() {
    state.isLoading = true
    try {
        const response = await campaignService.getCoupons()
        state.coupons = Array.isArray(response) ? response : (response?.data ?? [])
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function openSlider(c: any) {
    slider.editMode = !!c
    slider.editingId = c?.uuid ?? c?.id ?? null
    slider.error = {}
    slider.errors = { name: '' }
    slider.form = c ? { name: c.name ?? '', description: c.description ?? '', type: c.type ?? 'discount', discount_type: c.discount_type ?? 'percent', discount_value: c.discount_value ?? 0, target_plan: c.target_plan ?? '', start_date: c.start_date?.split('T')[0] ?? '', end_date: c.end_date?.split('T')[0] ?? '', is_active: c.is_active !== false } :
        { name: '', description: '', type: 'discount', discount_type: 'percent', discount_value: 0, target_plan: '', start_date: '', end_date: '', is_active: true }
    slider.open = true; document.body.style.overflow = 'hidden'
}
function closeSlider() {
    slider.open = false
    document.body.style.overflow = ''
}

async function saveCampaign() {
    if (!slider.form.name) {
        slider.errors.name = t('superadmin.salesCampaign.errorCampaignNameRequired')
        return
    }
    slider.isSaving = true; slider.error = {}
    try {
        if (slider.editMode && slider.editingId) {
            await campaignService.updateCampaign(slider.editingId, slider.form)
            successAlert(t('superadmin.salesCampaign.successSaved'), t('superadmin.salesCampaign.successUpdatedBody', { name: slider.form.name }))
        } else {
            await campaignService.createCampaign(slider.form)
            successAlert(t('superadmin.salesCampaign.successCreated'), t('superadmin.salesCampaign.successCreatedBody', { name: slider.form.name }))
        }
        closeSlider()
        fetchCampaigns()
    } catch (error: any) {
        slider.error = error
    }
    slider.isSaving = false
}

function openCouponSlider(c: any) {
    couponSlider.editMode = !!c
    couponSlider.editingId = c?.uuid ?? c?.id ?? null
    couponSlider.error = {}
    couponSlider.form = c ? { code: c.code ?? '', description: c.description ?? '', discount_type: c.discount_type ?? 'percent', discount_value: c.discount_value ?? 0, max_uses: c.max_uses ?? 0, expires_at: c.expires_at?.split('T')[0] ?? '', is_active: c.is_active !== false } :
        { code: '', description: '', discount_type: 'percent', discount_value: 0, max_uses: 0, expires_at: '', is_active: true }
    couponSlider.open = true
    document.body.style.overflow = 'hidden'
}
function closeCouponSlider() {
    couponSlider.open = false
    document.body.style.overflow = ''
}

function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    couponSlider.form.code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

async function saveCoupon() {
    couponSlider.isSaving = true; couponSlider.error = {}
    try {
        if (couponSlider.editMode && couponSlider.editingId) {
            await campaignService.updateCoupon(couponSlider.editingId, couponSlider.form)
            successAlert(t('superadmin.salesCampaign.successSaved'), t('superadmin.salesCampaign.successCouponUpdated'))
        } else {
            await campaignService.createCoupon(couponSlider.form)
            successAlert(t('superadmin.salesCampaign.successCreated'), t('superadmin.salesCampaign.successCouponCreated', { code: couponSlider.form.code }))
        }
        closeCouponSlider(); fetchCoupons()
    } catch (error: any) {
        couponSlider.error = error
    }
    couponSlider.isSaving = false
}

function confirmDelete(type: string, item: any) {
    state.deleteType = type
    state.deleteTarget = item
    state.modal.isDeleteOpen = true
}

async function deleteItem() {
    try {
        if (state.deleteType === 'campaign') {
            await campaignService.deleteCampaign(state.deleteTarget.uuid ?? state.deleteTarget.id)
            fetchCampaigns()
        }
        else {
            await campaignService.deleteCoupon(state.deleteTarget.uuid ?? state.deleteTarget.id)
            fetchCoupons()
        }
        successAlert(t('superadmin.salesCampaign.successDeleted'), t('superadmin.salesCampaign.successDeletedBody', { name: state.deleteTarget.name ?? state.deleteTarget.code }))
    } catch (error: any) {
        state.error = error
    }
}

function searchTrialCompany() {
    clearTimeout(trialSearchTimeout)
    if (!tools.trial.companySearch.trim()) { tools.trial.results = []; return }
    trialSearchTimeout = setTimeout(async () => {
        try {
            const r = await companyService.getCompanies({ search: tools.trial.companySearch, page: 1 })
            tools.trial.results = r?.data?.slice(0, 6) ?? []
        } catch (error: any) {
            state.error = error
        }
    }, 300)
}

async function extendTrial() {
    if (!tools.trial.company) return
    try {
        await campaignService.extendTrial(tools.trial.company.uuid, tools.trial.days)
        successAlert(t('superadmin.salesCampaign.successExtended'), t('superadmin.salesCampaign.successExtendedBody', { name: tools.trial.company.name, days: tools.trial.days }))
        tools.trial.company = null; tools.trial.companySearch = ''
    } catch (error: any) {
        state.error = error
    }
}

async function sendMassCampaign() {
    try {
        await campaignService.sendMassCampaign({ target_group: tools.mass.targetGroup, discount: tools.mass.discount })
        successAlert(t('superadmin.salesCampaign.successSent'), t('superadmin.salesCampaign.successMassSent'))
    } catch (error: any) {
        state.error = error
    }
}

async function saveReferral() {
    try {
        await campaignService.saveReferralSettings({ active: tools.referral.active, reward: tools.referral.reward })
        successAlert(t('superadmin.salesCampaign.successSaved'), t('superadmin.salesCampaign.successReferralSaved'))
    } catch (error: any) {
        state.error = error
    }
}

async function saveBanner() {
    try {
        await campaignService.saveBanner({ active: tools.banner.active, message: tools.banner.message, type: tools.banner.type })
        successAlert(t('superadmin.salesCampaign.successSaved'), t('superadmin.salesCampaign.successBannerSaved'))
    } catch (error: any) {
        state.error = error
    }
}

function debouncedSearch() {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => { }, 300)
}

onMounted(() => {
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (slider.open) closeSlider(); if (couponSlider.open) closeCouponSlider() } })
})
</script>
