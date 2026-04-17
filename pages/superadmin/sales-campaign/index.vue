<template>
    <div>
        <NuxtLayout name="superadmin">
            <Head><Title>Salgskampagner - {{ runtimeConfig?.public?.appName }}</Title></Head>
            <template #header>Salgskampagner</template>

            <div class="p-1">
                <!-- Header -->
                <div class="flex items-center justify-between mb-5">
                    <div>
                        <h1 class="text-[22px] font-semibold text-[#1F2533]">Salgskampagner</h1>
                        <p class="text-sm text-[#5C6478] mt-0.5">Kampagner, rabatkoder og marketingværktøjer</p>
                    </div>
                    <button @click="openSlider(null)"
                        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm"
                        style="background:#205E77">
                        <Icon name="ph:plus" class="w-4 h-4" />
                        Ny kampagne
                    </button>
                </div>

                <!-- Stat cards -->
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div v-for="card in statCards" :key="card.label"
                        class="bg-white border border-[#EAECF0] rounded-xl px-5 py-4 shadow-sm">
                        <div class="h-0.5 rounded-full mb-4 -mx-5 -mt-4 rounded-t-xl" :style="`background:${card.color}`"></div>
                        <p class="text-[10px] font-bold text-[#8891A4] uppercase tracking-[0.08em]">{{ card.label }}</p>
                        <p class="text-[28px] font-bold text-[#1F2533] mt-1 leading-none">{{ card.value }}</p>
                        <p class="text-[11px] text-[#8891A4] mt-1">{{ card.sub }}</p>
                    </div>
                </div>

                <!-- Tabs -->
                <div class="flex items-center gap-0 border-b border-[#EAECF0] mb-5">
                    <button v-for="tab in mainTabs" :key="tab.key"
                        class="px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-px"
                        :style="activeTab === tab.key
                            ? 'border-color:#205E77;color:#205E77'
                            : 'border-color:transparent;color:#8891A4'"
                        @click="activeTab = tab.key">
                        {{ tab.label }}
                        <span v-if="tab.count !== undefined" class="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                            :style="activeTab === tab.key ? 'background:#E4F1F6;color:#205E77' : 'background:#F5F6F8;color:#8891A4'">
                            {{ tab.count }}
                        </span>
                    </button>
                </div>

                <Alert type="danger" :text="state.error?.message" v-if="state.error?.message?.length > 0" />

                <!-- ── TAB: KAMPAGNER ── -->
                <div v-if="activeTab === 'campaigns'">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="relative flex-1 max-w-[360px]">
                            <Icon name="ph:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8891A4]" />
                            <input v-model="searchQuery" type="text" placeholder="Søg kampagner..."
                                class="co-input pl-9" @input="debouncedSearch" />
                        </div>
                        <div class="flex items-center bg-white border border-[#EAECF0] rounded-lg p-0.5">
                            <button v-for="f in campaignFilters" :key="f.key"
                                class="px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors"
                                :style="campaignFilter === f.key ? 'background:#205E77;color:#fff' : 'color:#5C6478'"
                                @click="campaignFilter = f.key">
                                {{ f.label }}
                            </button>
                        </div>
                    </div>

                    <div v-if="state.isLoading" class="flex justify-center py-16">
                        <Icon name="ph:spinner" class="w-7 h-7 text-[#42AED9] animate-spin" />
                    </div>
                    <div v-else-if="!filteredCampaigns.length" class="flex flex-col items-center gap-3 py-16 text-[#8891A4]">
                        <Icon name="ph:trend-up" class="w-12 h-12 opacity-30" />
                        <p class="text-sm font-medium">Ingen kampagner</p>
                        <p class="text-[12px]">Opret din første salgskampagne</p>
                        <button @click="openSlider(null)"
                            class="mt-1 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                            style="background:#205E77">Opret kampagne</button>
                    </div>
                    <div v-else class="bg-white border border-[#EAECF0] rounded-xl overflow-hidden shadow-sm">
                        <table class="w-full">
                            <thead>
                                <tr class="border-b border-[#EAECF0] bg-[#F9FAFB]">
                                    <th class="co-th">Kampagne</th>
                                    <th class="co-th">Type</th>
                                    <th class="co-th">Rabat</th>
                                    <th class="co-th">Målplan</th>
                                    <th class="co-th">Periode</th>
                                    <th class="co-th">Status</th>
                                    <th class="co-th"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="c in filteredCampaigns" :key="c.uuid ?? c.id"
                                    class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors group">
                                    <td class="co-td">
                                        <p class="text-[13px] font-semibold text-[#1F2533]">{{ c.name }}</p>
                                        <p v-if="c.description" class="text-[11px] text-[#8891A4] truncate max-w-[200px]">{{ c.description }}</p>
                                    </td>
                                    <td class="co-td">
                                        <span class="co-badge co-badge-navy text-[11px]">
                                            <Icon :name="campaignTypeIcon(c.type)" class="w-3 h-3" />
                                            {{ campaignTypeLabel(c.type) }}
                                        </span>
                                    </td>
                                    <td class="co-td">
                                        <span class="text-[14px] font-bold text-[#1F2533]">
                                            {{ c.discount_type === 'percent' ? `${c.discount_value}%` :
                                               c.discount_type === 'fixed' ? `kr. ${c.discount_value}` :
                                               `${c.discount_value} mdr. gratis` }}
                                        </span>
                                    </td>
                                    <td class="co-td text-[12px] text-[#5C6478]">{{ c.target_plan ?? 'Alle planer' }}</td>
                                    <td class="co-td text-[12px] text-[#5C6478]">
                                        <span v-if="c.start_date">{{ formatDate(c.start_date) }}</span>
                                        <span v-if="c.start_date && c.end_date"> – </span>
                                        <span v-if="c.end_date">{{ formatDate(c.end_date) }}</span>
                                        <span v-if="!c.start_date && !c.end_date" class="text-[#8891A4]">Ingen udløb</span>
                                    </td>
                                    <td class="co-td">
                                        <span class="co-badge text-[11px]" :style="campaignStatusStyle(c)">
                                            <span class="w-1.5 h-1.5 rounded-full" :style="`background:${campaignStatusDot(c)}`"></span>
                                            {{ campaignStatusLabel(c) }}
                                        </span>
                                    </td>
                                    <td class="co-td">
                                        <div class="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button class="co-action-btn" @click="openSlider(c)">
                                                <Icon name="ph:pencil-simple" class="w-3.5 h-3.5" /> Rediger
                                            </button>
                                            <button class="co-action-btn !text-[#CC3B2D] hover:!bg-red-50 !border-red-200"
                                                @click="confirmDelete('campaign', c)">
                                                <Icon name="ph:trash" class="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- ── TAB: KUPONER ── -->
                <div v-if="activeTab === 'coupons'">
                    <div class="flex items-center justify-between gap-3 mb-4">
                        <div class="relative flex-1 max-w-[360px]">
                            <Icon name="ph:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8891A4]" />
                            <input v-model="couponSearch" type="text" placeholder="Søg på kode eller beskrivelse..."
                                class="co-input pl-9" />
                        </div>
                        <button @click="openCouponSlider(null)"
                            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-white"
                            style="background:#205E77">
                            <Icon name="ph:plus" class="w-4 h-4" /> Ny kupon
                        </button>
                    </div>

                    <div v-if="!filteredCoupons.length" class="flex flex-col items-center gap-3 py-16 text-[#8891A4]">
                        <Icon name="ph:ticket" class="w-12 h-12 opacity-30" />
                        <p class="text-sm font-medium">Ingen kuponer endnu</p>
                        <button @click="openCouponSlider(null)"
                            class="mt-1 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                            style="background:#205E77">Opret kupon</button>
                    </div>
                    <div v-else class="bg-white border border-[#EAECF0] rounded-xl overflow-hidden shadow-sm">
                        <table class="w-full">
                            <thead>
                                <tr class="border-b border-[#EAECF0] bg-[#F9FAFB]">
                                    <th class="co-th">Kode</th>
                                    <th class="co-th">Rabat</th>
                                    <th class="co-th">Indløsninger</th>
                                    <th class="co-th">Maks. brug</th>
                                    <th class="co-th">Udløber</th>
                                    <th class="co-th">Status</th>
                                    <th class="co-th"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="coupon in filteredCoupons" :key="coupon.uuid ?? coupon.id"
                                    class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors group">
                                    <td class="co-td">
                                        <span class="font-mono text-[13px] font-bold text-[#205E77] bg-[#E4F1F6] px-2 py-0.5 rounded-md">
                                            {{ coupon.code }}
                                        </span>
                                        <p v-if="coupon.description" class="text-[11px] text-[#8891A4] mt-1">{{ coupon.description }}</p>
                                    </td>
                                    <td class="co-td font-bold text-[14px] text-[#1F2533]">
                                        {{ coupon.discount_type === 'percent' ? `${coupon.discount_value}%` : `kr. ${coupon.discount_value}` }}
                                    </td>
                                    <td class="co-td text-[13px] text-[#5C6478]">{{ coupon.redemptions ?? 0 }}</td>
                                    <td class="co-td text-[13px] text-[#5C6478]">{{ coupon.max_uses ?? '∞' }}</td>
                                    <td class="co-td text-[12px] text-[#5C6478]">{{ coupon.expires_at ? formatDate(coupon.expires_at) : 'Aldrig' }}</td>
                                    <td class="co-td">
                                        <span v-if="coupon.is_active !== false" class="co-badge co-badge-green text-[11px]">
                                            <span class="w-1.5 h-1.5 rounded-full bg-[#2E9E33]"></span> Aktiv
                                        </span>
                                        <span v-else class="co-badge co-badge-gray text-[11px]">Inaktiv</span>
                                    </td>
                                    <td class="co-td">
                                        <div class="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button class="co-action-btn" @click="openCouponSlider(coupon)">
                                                <Icon name="ph:pencil-simple" class="w-3.5 h-3.5" /> Rediger
                                            </button>
                                            <button class="co-action-btn !text-[#CC3B2D] hover:!bg-red-50 !border-red-200"
                                                @click="confirmDelete('coupon', coupon)">
                                                <Icon name="ph:trash" class="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- ── TAB: MARKETINGVÆRKTØJER ── -->
                <div v-if="activeTab === 'tools'" class="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <!-- Forlæng prøveperiode -->
                    <div class="bg-white border border-[#EAECF0] rounded-xl p-5 shadow-sm">
                        <div class="flex items-start gap-3 mb-4">
                            <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                style="background:#E4F1F6">
                                <Icon name="ph:clock-countdown" class="w-5 h-5" style="color:#205E77" />
                            </div>
                            <div>
                                <p class="text-[14px] font-semibold text-[#1F2533]">Forlæng prøveperiode</p>
                                <p class="text-[12px] text-[#8891A4]">Giv en klient ekstra dage på prøveperioden</p>
                            </div>
                        </div>
                        <div class="space-y-3">
                            <div>
                                <label class="co-label text-[11px]">KLIENT</label>
                                <div class="relative">
                                    <input v-model="tools.trial.companySearch" type="text" placeholder="Søg klient..."
                                        class="co-input" @input="searchTrialCompany" />
                                    <div v-if="tools.trial.results.length" class="absolute top-full left-0 right-0 mt-1 border border-[#EAECF0] rounded-lg bg-white shadow z-10 max-h-36 overflow-y-auto">
                                        <button v-for="c in tools.trial.results" :key="c.uuid"
                                            class="w-full text-left px-3 py-2 hover:bg-[#F5F6F8] text-[13px] flex items-center gap-2"
                                            @click="tools.trial.company = c; tools.trial.companySearch = c.name; tools.trial.results = []">
                                            <div class="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-white"
                                                :style="`background:${avatarColor(c.name)}`">{{ (c.name||'?').charAt(0).toUpperCase() }}</div>
                                            {{ c.name }}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label class="co-label text-[11px]">EKSTRA DAGE</label>
                                <div class="flex gap-2">
                                    <button v-for="d in [7, 14, 30]" :key="d"
                                        class="px-4 py-2 rounded-lg border-2 text-[13px] font-medium transition-colors"
                                        :style="tools.trial.days === d ? 'border-color:#42AED9;background:#F0FAFD;color:#205E77' : 'border-color:#EAECF0;color:#5C6478'"
                                        @click="tools.trial.days = d">
                                        {{ d }} dage
                                    </button>
                                </div>
                            </div>
                            <button @click="extendTrial"
                                class="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity"
                                style="background:#205E77"
                                :disabled="!tools.trial.company">
                                Forlæng prøveperiode
                            </button>
                        </div>
                    </div>

                    <!-- Massekampagne -->
                    <div class="bg-white border border-[#EAECF0] rounded-xl p-5 shadow-sm">
                        <div class="flex items-start gap-3 mb-4">
                            <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                style="background:#E4F1F6">
                                <Icon name="ph:broadcast" class="w-5 h-5" style="color:#205E77" />
                            </div>
                            <div>
                                <p class="text-[14px] font-semibold text-[#1F2533]">Massekampagne</p>
                                <p class="text-[12px] text-[#8891A4]">Send en kampagne til alle klienter på en plan</p>
                            </div>
                        </div>
                        <div class="space-y-3">
                            <div>
                                <label class="co-label text-[11px]">MÅLGRUPPE</label>
                                <select v-model="tools.mass.targetGroup" class="co-input">
                                    <option value="all">Alle klienter</option>
                                    <option value="gratis">Gratis plan</option>
                                    <option value="basis">Basis plan</option>
                                    <option value="pro">Pro plan</option>
                                </select>
                            </div>
                            <div>
                                <label class="co-label text-[11px]">RABAT %</label>
                                <input v-model.number="tools.mass.discount" type="number" min="0" max="100" placeholder="20" class="co-input" />
                            </div>
                            <button @click="sendMassCampaign"
                                class="w-full py-2.5 rounded-lg text-sm font-semibold border border-[#EAECF0] text-[#5C6478] hover:bg-[#F5F6F8] transition-colors">
                                Send kampagne
                            </button>
                        </div>
                    </div>

                    <!-- Referral-program -->
                    <div class="bg-white border border-[#EAECF0] rounded-xl p-5 shadow-sm">
                        <div class="flex items-start gap-3 mb-4">
                            <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                style="background:#EDF7EE">
                                <Icon name="ph:share-network" class="w-5 h-5" style="color:#2E9E33" />
                            </div>
                            <div>
                                <p class="text-[14px] font-semibold text-[#1F2533]">Referral-program</p>
                                <p class="text-[12px] text-[#8891A4]">Beløn klienter der henviser nye kunder</p>
                            </div>
                        </div>
                        <div class="space-y-3">
                            <div class="flex items-center justify-between py-2.5 px-3 bg-[#F5F6F8] rounded-xl">
                                <span class="text-[13px] font-medium text-[#1F2533]">Referral aktiv</span>
                                <button type="button" @click="tools.referral.active = !tools.referral.active"
                                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                                    :style="tools.referral.active ? 'background:#42AED9' : 'background:#D5D9E2'">
                                    <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                                        :class="tools.referral.active ? 'translate-x-6' : 'translate-x-1'"></span>
                                </button>
                            </div>
                            <div>
                                <label class="co-label text-[11px]">BELØNNING (KR) PR. NY KLIENT</label>
                                <input v-model.number="tools.referral.reward" type="number" min="0" placeholder="500" class="co-input" />
                            </div>
                            <button @click="saveReferral"
                                class="w-full py-2.5 rounded-lg text-sm font-semibold border border-[#EAECF0] text-[#5C6478] hover:bg-[#F5F6F8] transition-colors">
                                Gem indstillinger
                            </button>
                        </div>
                    </div>

                    <!-- Annoncebanner -->
                    <div class="bg-white border border-[#EAECF0] rounded-xl p-5 shadow-sm">
                        <div class="flex items-start gap-3 mb-4">
                            <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                style="background:#FFF9EC">
                                <Icon name="ph:megaphone-simple" class="w-5 h-5" style="color:#D4900A" />
                            </div>
                            <div>
                                <p class="text-[14px] font-semibold text-[#1F2533]">Annoncebanner</p>
                                <p class="text-[12px] text-[#8891A4]">Vis en meddelelse til alle klienter ved login</p>
                            </div>
                        </div>
                        <div class="space-y-3">
                            <div class="flex items-center justify-between py-2.5 px-3 bg-[#F5F6F8] rounded-xl">
                                <span class="text-[13px] font-medium text-[#1F2533]">Banner aktiv</span>
                                <button type="button" @click="tools.banner.active = !tools.banner.active"
                                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                                    :style="tools.banner.active ? 'background:#42AED9' : 'background:#D5D9E2'">
                                    <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                                        :class="tools.banner.active ? 'translate-x-6' : 'translate-x-1'"></span>
                                </button>
                            </div>
                            <div>
                                <label class="co-label text-[11px]">BESKED</label>
                                <textarea v-model="tools.banner.message" rows="2" placeholder="f.eks. Sommer-tilbud: 20% på alle planer i juli..."
                                    class="co-input resize-none"></textarea>
                            </div>
                            <div>
                                <label class="co-label text-[11px]">TYPE</label>
                                <div class="flex gap-2">
                                    <button v-for="t in bannerTypes" :key="t.value"
                                        class="flex-1 py-2 rounded-lg border-2 text-[12px] font-semibold transition-colors"
                                        :style="tools.banner.type === t.value ? `border-color:${t.color};background:${t.bg};color:${t.color}` : 'border-color:#EAECF0;color:#5C6478'"
                                        @click="tools.banner.type = t.value">
                                        {{ t.label }}
                                    </button>
                                </div>
                            </div>
                            <button @click="saveBanner"
                                class="w-full py-2.5 rounded-lg text-sm font-semibold border border-[#EAECF0] text-[#5C6478] hover:bg-[#F5F6F8] transition-colors">
                                Gem banner
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ═══ SLIDE-OVER: NY / REDIGER KAMPAGNE ═══ -->
            <Teleport to="body">
                <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0" enter-to-class="opacity-100"
                    leave-active-class="transition-opacity duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
                    <div v-if="slider.open" class="fixed inset-0 bg-black/30 z-40" @click="closeSlider" />
                </Transition>
                <Transition enter-active-class="transition-transform duration-300 ease-out" enter-from-class="translate-x-full" enter-to-class="translate-x-0"
                    leave-active-class="transition-transform duration-200 ease-in" leave-from-class="translate-x-0" leave-to-class="translate-x-full">
                    <div v-if="slider.open" class="fixed inset-y-0 right-0 z-50 w-full max-w-[460px] bg-white shadow-2xl flex flex-col">
                        <div class="flex items-start justify-between px-6 py-5 border-b border-[#EAECF0]">
                            <div>
                                <h2 class="text-[16px] font-semibold text-[#1F2533]">{{ slider.editMode ? 'Rediger kampagne' : 'Ny kampagne' }}</h2>
                                <p class="text-[12px] text-[#8891A4] mt-0.5">Salgskampagne og rabat</p>
                            </div>
                            <button @click="closeSlider" class="w-8 h-8 rounded-lg flex items-center justify-center text-[#8891A4] hover:bg-[#F5F6F8]">
                                <Icon name="ph:x" class="w-4 h-4" />
                            </button>
                        </div>
                        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                            <Alert type="danger" :text="slider.error?.message" v-if="slider.error?.message?.length > 0" />

                            <div>
                                <label class="co-label">Kampagnenavn <span class="text-red-500">*</span></label>
                                <input v-model="slider.form.name" type="text" placeholder="f.eks. Forårskampagne 2026" class="co-input"
                                    :class="slider.errors.name ? 'border-red-300' : ''" />
                                <p v-if="slider.errors.name" class="co-error">{{ slider.errors.name }}</p>
                            </div>

                            <div>
                                <label class="co-label">Beskrivelse</label>
                                <textarea v-model="slider.form.description" rows="2" placeholder="Hvad er formålet med kampagnen?" class="co-input resize-none"></textarea>
                            </div>

                            <!-- Kampagnetype -->
                            <div>
                                <label class="co-label">Kampagnetype</label>
                                <div class="grid grid-cols-3 gap-2">
                                    <button v-for="t in campaignTypes" :key="t.value"
                                        class="py-2.5 px-2 rounded-xl border-2 text-[12px] font-semibold transition-colors flex items-center justify-center gap-1.5"
                                        :style="slider.form.type === t.value ? 'border-color:#42AED9;background:#F0FAFD;color:#205E77' : 'border-color:#EAECF0;color:#5C6478'"
                                        @click="slider.form.type = t.value">
                                        <Icon :name="t.icon" class="w-3.5 h-3.5" />
                                        {{ t.label }}
                                    </button>
                                </div>
                            </div>

                            <!-- Rabattype + Rabatværdi -->
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="co-label">Rabattype</label>
                                    <select v-model="slider.form.discount_type" class="co-input">
                                        <option value="percent">Procent (%)</option>
                                        <option value="fixed">Fast beløb (kr)</option>
                                        <option value="free_months">Gratis måneder</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="co-label">Rabatværdi</label>
                                    <div class="relative">
                                        <input v-model.number="slider.form.discount_value" type="number" min="0" placeholder="0" class="co-input pr-8" />
                                        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[#8891A4] text-[12px]">
                                            {{ slider.form.discount_type === 'percent' ? '%' : slider.form.discount_type === 'fixed' ? 'kr' : 'mdr' }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- Målplan -->
                            <div>
                                <label class="co-label">Målplan</label>
                                <select v-model="slider.form.target_plan" class="co-input">
                                    <option value="">Alle planer</option>
                                    <option value="gratis">Gratis</option>
                                    <option value="basis">Basis</option>
                                    <option value="pro">Pro</option>
                                </select>
                            </div>

                            <!-- Datoer -->
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="co-label">Startdato</label>
                                    <input v-model="slider.form.start_date" type="date" class="co-input" />
                                </div>
                                <div>
                                    <label class="co-label">Slutdato</label>
                                    <input v-model="slider.form.end_date" type="date" class="co-input" />
                                </div>
                            </div>

                            <!-- Aktiv -->
                            <div class="flex items-center justify-between py-3 px-4 border border-[#EAECF0] rounded-xl">
                                <div>
                                    <p class="text-[13px] font-medium text-[#1F2533]">Aktiv</p>
                                    <p class="text-[11px] text-[#8891A4] mt-0.5">Kampagnen er synlig og kan bruges</p>
                                </div>
                                <button type="button" @click="slider.form.is_active = !slider.form.is_active"
                                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
                                    :style="slider.form.is_active ? 'background:#42AED9' : 'background:#D5D9E2'">
                                    <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                                        :class="slider.form.is_active ? 'translate-x-6' : 'translate-x-1'"></span>
                                </button>
                            </div>
                        </div>
                        <div class="flex items-center gap-3 px-6 py-4 border-t border-[#EAECF0]">
                            <button @click="closeSlider"
                                class="flex-1 py-2.5 rounded-lg text-sm font-medium text-[#5C6478] bg-white border border-[#EAECF0] hover:bg-[#F5F6F8]">
                                Annuller
                            </button>
                            <button @click="saveCampaign"
                                class="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm"
                                style="background:#205E77" :disabled="slider.isSaving">
                                <span v-if="slider.isSaving" class="flex items-center justify-center gap-2">
                                    <Icon name="ph:spinner" class="w-4 h-4 animate-spin" /> Gemmer...
                                </span>
                                <span v-else>{{ slider.editMode ? 'Gem ændringer' : 'Opret kampagne' }}</span>
                            </button>
                        </div>
                    </div>
                </Transition>

                <!-- ═══ SLIDE-OVER: NY / REDIGER KUPON ═══ -->
                <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0" enter-to-class="opacity-100"
                    leave-active-class="transition-opacity duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
                    <div v-if="couponSlider.open" class="fixed inset-0 bg-black/30 z-40" @click="closeCouponSlider" />
                </Transition>
                <Transition enter-active-class="transition-transform duration-300 ease-out" enter-from-class="translate-x-full" enter-to-class="translate-x-0"
                    leave-active-class="transition-transform duration-200 ease-in" leave-from-class="translate-x-0" leave-to-class="translate-x-full">
                    <div v-if="couponSlider.open" class="fixed inset-y-0 right-0 z-50 w-full max-w-[460px] bg-white shadow-2xl flex flex-col">
                        <div class="flex items-start justify-between px-6 py-5 border-b border-[#EAECF0]">
                            <div>
                                <h2 class="text-[16px] font-semibold text-[#1F2533]">{{ couponSlider.editMode ? 'Rediger kupon' : 'Ny kupon' }}</h2>
                                <p class="text-[12px] text-[#8891A4] mt-0.5">Rabatkode til kunder</p>
                            </div>
                            <button @click="closeCouponSlider" class="w-8 h-8 rounded-lg flex items-center justify-center text-[#8891A4] hover:bg-[#F5F6F8]">
                                <Icon name="ph:x" class="w-4 h-4" />
                            </button>
                        </div>
                        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                            <div>
                                <label class="co-label">Kupunkode <span class="text-red-500">*</span></label>
                                <div class="flex gap-2">
                                    <input v-model="couponSlider.form.code" type="text" placeholder="fx SOMMER25" class="co-input uppercase font-mono" />
                                    <button class="px-3 py-2 rounded-lg border border-[#EAECF0] bg-[#F5F6F8] text-[#5C6478] text-[12px] font-medium hover:bg-[#EEF4FB] hover:text-[#205E77] transition-colors whitespace-nowrap"
                                        @click="generateCode">Generer</button>
                                </div>
                            </div>
                            <div>
                                <label class="co-label">Beskrivelse</label>
                                <input v-model="couponSlider.form.description" type="text" placeholder="Intern beskrivelse" class="co-input" />
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="co-label">Rabattype</label>
                                    <select v-model="couponSlider.form.discount_type" class="co-input">
                                        <option value="percent">Procent (%)</option>
                                        <option value="fixed">Fast beløb (kr)</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="co-label">Rabatværdi</label>
                                    <input v-model.number="couponSlider.form.discount_value" type="number" min="0" placeholder="0" class="co-input" />
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="co-label">Maks. brug</label>
                                    <input v-model.number="couponSlider.form.max_uses" type="number" min="0" placeholder="Ubegrænset" class="co-input" />
                                    <p class="text-[11px] text-[#8891A4] mt-1">0 = ubegrænset</p>
                                </div>
                                <div>
                                    <label class="co-label">Udløber</label>
                                    <input v-model="couponSlider.form.expires_at" type="date" class="co-input" />
                                </div>
                            </div>
                            <div class="flex items-center justify-between py-3 px-4 border border-[#EAECF0] rounded-xl">
                                <p class="text-[13px] font-medium text-[#1F2533]">Aktiv</p>
                                <button type="button" @click="couponSlider.form.is_active = !couponSlider.form.is_active"
                                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                                    :style="couponSlider.form.is_active ? 'background:#42AED9' : 'background:#D5D9E2'">
                                    <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                                        :class="couponSlider.form.is_active ? 'translate-x-6' : 'translate-x-1'"></span>
                                </button>
                            </div>
                        </div>
                        <div class="flex items-center gap-3 px-6 py-4 border-t border-[#EAECF0]">
                            <button @click="closeCouponSlider"
                                class="flex-1 py-2.5 rounded-lg text-sm font-medium text-[#5C6478] bg-white border border-[#EAECF0] hover:bg-[#F5F6F8]">
                                Annuller
                            </button>
                            <button @click="saveCoupon"
                                class="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm"
                                style="background:#205E77" :disabled="couponSlider.isSaving">
                                <span v-if="couponSlider.isSaving" class="flex items-center justify-center gap-2">
                                    <Icon name="ph:spinner" class="w-4 h-4 animate-spin" /> Gemmer...
                                </span>
                                <span v-else>{{ couponSlider.editMode ? 'Gem ændringer' : 'Opret kupon' }}</span>
                            </button>
                        </div>
                    </div>
                </Transition>
            </Teleport>

            <DialogConfirmation :isModalOpen="state.modal.isDeleteOpen"
                :message="`Slet '${state.deleteTarget?.name ?? state.deleteTarget?.code}'?`"
                @close="state.modal.isDeleteOpen = false"
                @confirm="deleteItem" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { campaignService } from '@/components/api/superadmin/CampaignService'
import { companyService } from '@/components/api/superadmin/CompanyService'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()

const activeTab = ref('campaigns')
const searchQuery = ref('')
const couponSearch = ref('')
const campaignFilter = ref('all')

let searchTimeout: any = null
let trialSearchTimeout: any = null

const COLORS = ['#205E77','#2E9E33','#368F8B','#1A4D99','#D4900A','#9B4D9B']
const avatarColor = (name: string) => COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length]
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('da-DK', { day:'numeric', month:'short', year:'numeric' }) : '—'

const campaignTypes = [
    { value:'discount',     label:'Rabat',        icon:'ph:tag' },
    { value:'trial',        label:'Prøveperiode', icon:'ph:clock' },
    { value:'bundle',       label:'Pakke',        icon:'ph:package' },
    { value:'flash',        label:'Flash-salg',   icon:'ph:lightning' },
    { value:'loyalty',      label:'Loyalitet',    icon:'ph:heart' },
    { value:'winback',      label:'Win-back',     icon:'ph:arrow-counter-clockwise' },
]
const campaignTypeLabel = (v: string) => campaignTypes.find(t => t.value === v)?.label ?? v ?? 'Rabat'
const campaignTypeIcon  = (v: string) => campaignTypes.find(t => t.value === v)?.icon ?? 'ph:tag'

const campaignFilters = [
    { key:'all',     label:'Alle' },
    { key:'active',  label:'Aktive' },
    { key:'draft',   label:'Kladder' },
    { key:'expired', label:'Udløbet' },
]

const bannerTypes = [
    { value:'info',    label:'Info',    color:'#205E77', bg:'#E4F1F6' },
    { value:'success', label:'Succes',  color:'#2E9E33', bg:'#EDF7EE' },
    { value:'warning', label:'Advarsel',color:'#D4900A', bg:'#FFF9EC' },
]

const campaignStatusLabel = (c: any) => {
    if (!c.is_active) return 'Kladde'
    if (c.end_date && new Date(c.end_date) < new Date()) return 'Udløbet'
    return 'Aktiv'
}
const campaignStatusStyle = (c: any) => {
    const l = campaignStatusLabel(c)
    if (l === 'Aktiv')   return 'background:#EDF7EE;color:#2E9E33'
    if (l === 'Udløbet') return 'background:#FFF0F0;color:#CC3B2D'
    return 'background:#F5F6F8;color:#5C6478'
}
const campaignStatusDot = (c: any) => {
    const l = campaignStatusLabel(c)
    if (l === 'Aktiv')   return '#2E9E33'
    if (l === 'Udløbet') return '#CC3B2D'
    return '#8891A4'
}

const state = reactive({
    campaigns: [] as any[],
    coupons: [] as any[],
    error: {} as Error,
    isLoading: false,
    modal: { isDeleteOpen: false },
    deleteTarget: null as any,
    deleteType: '' as string,
})

const statCards = computed(() => [
    { label:'Aktive kampagner', value: state.campaigns.filter(c => campaignStatusLabel(c) === 'Aktiv').length, sub:'Kørende nu', color:'#205E77' },
    { label:'Aktive kuponer',   value: state.coupons.filter(c => c.is_active !== false).length, sub:'Kan indløses', color:'#42AED9' },
    { label:'Indløsninger',     value: state.coupons.reduce((s, c) => s + (c.redemptions ?? 0), 0), sub:'Alle tider', color:'#2E9E33' },
    { label:'Udløber snart',    value: state.campaigns.filter(c => {
        if (!c.end_date) return false
        const days = (new Date(c.end_date).getTime() - Date.now()) / 86400000
        return days >= 0 && days <= 7
    }).length, sub:'Inden for 7 dage', color:'#D4900A' },
])

const mainTabs = computed(() => [
    { key:'campaigns', label:'Kampagner', count: state.campaigns.length },
    { key:'coupons',   label:'Kuponer',   count: state.coupons.length },
    { key:'tools',     label:'Marketingværktøjer', count: 4 },
])

const filteredCampaigns = computed(() => {
    let list = state.campaigns
    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        list = list.filter(c => (c.name||'').toLowerCase().includes(q))
    }
    if (campaignFilter.value !== 'all') {
        list = list.filter(c => {
            const l = campaignStatusLabel(c).toLowerCase()
            if (campaignFilter.value === 'active')  return l === 'aktiv'
            if (campaignFilter.value === 'draft')   return l === 'kladde'
            if (campaignFilter.value === 'expired') return l === 'udløbet'
            return true
        })
    }
    return list
})

const filteredCoupons = computed(() => {
    if (!couponSearch.value) return state.coupons
    const q = couponSearch.value.toLowerCase()
    return state.coupons.filter(c => (c.code||'').toLowerCase().includes(q) || (c.description||'').toLowerCase().includes(q))
})

const slider = reactive({
    open: false, editMode: false, isSaving: false,
    error: {} as any, editingId: null as any,
    form: { name:'', description:'', type:'discount', discount_type:'percent', discount_value:0, target_plan:'', start_date:'', end_date:'', is_active:true },
    errors: { name:'' },
})

const couponSlider = reactive({
    open: false, editMode: false, isSaving: false,
    error: {} as any, editingId: null as any,
    form: { code:'', description:'', discount_type:'percent', discount_value:0, max_uses:0, expires_at:'', is_active:true },
})

const tools = reactive({
    trial: { companySearch:'', results:[] as any[], company:null as any, days:14 },
    mass: { targetGroup:'all', discount:20 },
    referral: { active:false, reward:500 },
    banner: { active:false, message:'', type:'info' },
})

onMounted(() => { fetchCampaigns(); fetchCoupons() })

async function fetchCampaigns() {
    state.isLoading = true
    try {
        const r = await campaignService.getCampaigns()
        state.campaigns = Array.isArray(r) ? r : (r?.data ?? [])
    } catch (e: any) { state.error = e }
    state.isLoading = false
}

async function fetchCoupons() {
    try {
        const r = await campaignService.getCoupons()
        state.coupons = Array.isArray(r) ? r : (r?.data ?? [])
    } catch (_) {}
}

function openSlider(c: any) {
    slider.editMode = !!c; slider.editingId = c?.uuid ?? c?.id ?? null
    slider.error = {}; slider.errors = { name:'' }
    slider.form = c ? { name:c.name??'', description:c.description??'', type:c.type??'discount', discount_type:c.discount_type??'percent', discount_value:c.discount_value??0, target_plan:c.target_plan??'', start_date:c.start_date?.split('T')[0]??'', end_date:c.end_date?.split('T')[0]??'', is_active:c.is_active!==false } :
        { name:'', description:'', type:'discount', discount_type:'percent', discount_value:0, target_plan:'', start_date:'', end_date:'', is_active:true }
    slider.open = true; document.body.style.overflow = 'hidden'
}
function closeSlider() { slider.open = false; document.body.style.overflow = '' }

async function saveCampaign() {
    if (!slider.form.name) { slider.errors.name = 'Kampagnenavn er påkrævet'; return }
    slider.isSaving = true; slider.error = {}
    try {
        if (slider.editMode && slider.editingId) {
            await campaignService.updateCampaign(slider.editingId, slider.form)
            successAlert('Gemt!', `${slider.form.name} er opdateret.`)
        } else {
            await campaignService.createCampaign(slider.form)
            successAlert('Oprettet!', `${slider.form.name} er oprettet.`)
        }
        closeSlider(); fetchCampaigns()
    } catch (e: any) { slider.error = e }
    slider.isSaving = false
}

function openCouponSlider(c: any) {
    couponSlider.editMode = !!c; couponSlider.editingId = c?.uuid ?? c?.id ?? null
    couponSlider.error = {}
    couponSlider.form = c ? { code:c.code??'', description:c.description??'', discount_type:c.discount_type??'percent', discount_value:c.discount_value??0, max_uses:c.max_uses??0, expires_at:c.expires_at?.split('T')[0]??'', is_active:c.is_active!==false } :
        { code:'', description:'', discount_type:'percent', discount_value:0, max_uses:0, expires_at:'', is_active:true }
    couponSlider.open = true; document.body.style.overflow = 'hidden'
}
function closeCouponSlider() { couponSlider.open = false; document.body.style.overflow = '' }

function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    couponSlider.form.code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

async function saveCoupon() {
    couponSlider.isSaving = true; couponSlider.error = {}
    try {
        if (couponSlider.editMode && couponSlider.editingId) {
            await campaignService.updateCoupon(couponSlider.editingId, couponSlider.form)
            successAlert('Gemt!', 'Kupon er opdateret.')
        } else {
            await campaignService.createCoupon(couponSlider.form)
            successAlert('Oprettet!', `Kupon ${couponSlider.form.code} er oprettet.`)
        }
        closeCouponSlider(); fetchCoupons()
    } catch (e: any) { couponSlider.error = e }
    couponSlider.isSaving = false
}

function confirmDelete(type: string, item: any) { state.deleteType = type; state.deleteTarget = item; state.modal.isDeleteOpen = true }

async function deleteItem() {
    try {
        if (state.deleteType === 'campaign') { await campaignService.deleteCampaign(state.deleteTarget.uuid ?? state.deleteTarget.id); fetchCampaigns() }
        else { await campaignService.deleteCoupon(state.deleteTarget.uuid ?? state.deleteTarget.id); fetchCoupons() }
        successAlert('Slettet!', `${state.deleteTarget.name ?? state.deleteTarget.code} er slettet.`)
    } catch (e: any) { state.error = e }
}

function searchTrialCompany() {
    clearTimeout(trialSearchTimeout)
    if (!tools.trial.companySearch.trim()) { tools.trial.results = []; return }
    trialSearchTimeout = setTimeout(async () => {
        try {
            const r = await companyService.getCompanies({ search: tools.trial.companySearch, page: 1 })
            tools.trial.results = r?.data?.slice(0, 6) ?? []
        } catch (_) {}
    }, 300)
}

async function extendTrial() {
    if (!tools.trial.company) return
    try {
        await campaignService.extendTrial(tools.trial.company.uuid, tools.trial.days)
        successAlert('Forlænget!', `${tools.trial.company.name} har fået ${tools.trial.days} ekstra dage.`)
        tools.trial.company = null; tools.trial.companySearch = ''
    } catch (e: any) { state.error = e }
}

async function sendMassCampaign() {
    try {
        await campaignService.sendMassCampaign({ target_group: tools.mass.targetGroup, discount: tools.mass.discount })
        successAlert('Sendt!', 'Massekampagne er sendt.')
    } catch (e: any) { state.error = e }
}

async function saveReferral() {
    try {
        await campaignService.saveReferralSettings({ active: tools.referral.active, reward: tools.referral.reward })
        successAlert('Gemt!', 'Referral-indstillinger er gemt.')
    } catch (e: any) { state.error = e }
}

async function saveBanner() {
    try {
        await campaignService.saveBanner({ active: tools.banner.active, message: tools.banner.message, type: tools.banner.type })
        successAlert('Gemt!', 'Annoncebanner er gemt.')
    } catch (e: any) { state.error = e }
}

function debouncedSearch() {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {}, 300)
}

onMounted(() => { window.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (slider.open) closeSlider(); if (couponSlider.open) closeCouponSlider() } }) })
</script>

<style scoped>
.co-th { text-align:left; padding:10px 16px; font-size:11px; font-weight:600; color:#8891A4; text-transform:uppercase; letter-spacing:0.06em }
.co-td { padding:12px 16px; vertical-align:middle }
.co-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 8px; border-radius:999px; font-size:11px; font-weight:600; white-space:nowrap }
.co-badge-green { background:#EDF7EE; color:#2E9E33 }
.co-badge-navy  { background:#E4F1F6; color:#205E77 }
.co-badge-gray  { background:#F5F6F8; color:#5C6478 }
.co-action-btn  { display:inline-flex; align-items:center; gap:4px; padding:5px 10px; border-radius:8px; font-size:12px; font-weight:500; background:#F5F6F8; color:#5C6478; border:1px solid #EAECF0; transition:all 0.15s; cursor:pointer }
.co-action-btn:hover { background:#EEF4FB; color:#205E77 }
.co-label { display:block; font-size:13px; font-weight:600; color:#1F2533; margin-bottom:5px }
.co-input { width:100%; padding:9px 13px; font-size:14px; color:#1F2533; background:white; border:1px solid #D5D9E2; border-radius:10px; outline:none; transition:border-color 0.15s, box-shadow 0.15s }
.co-input:focus { border-color:#42AED9; box-shadow:0 0 0 3px rgba(66,174,217,0.12) }
.co-input::placeholder { color:#B0B8C4 }
.co-error { font-size:11px; color:#CC3B2D; margin-top:4px }
</style>
