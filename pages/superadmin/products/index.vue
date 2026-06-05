<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>
                    {{ $t('superadmin.products.title') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>
            <template #header>
                {{ $t('superadmin.products.title') }}
            </template>

            <div class="p-1">
                <!-- Header -->
                <div class="flex items-center justify-between mb-5">
                    <div>
                        <h1 class="text-[22px] font-semibold text-[#1F2533]">
                            {{ $t('superadmin.products.productCatalog') }}
                        </h1>
                        <p class="text-sm text-[#5C6478] mt-0.5">
                            {{ $t('superadmin.products.subtitle') }}
                        </p>
                    </div>
                    <!-- Contextual create button -->
                    <button v-if="activeTab === 'plans'" @click="openPlanSlider(null)"
                        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm"
                        style="background:#205E77">
                        <Icon name="ph:plus" class="w-4 h-4" />
                        {{ $t('superadmin.products.newPackage') }}
                    </button>
                    <button v-if="activeTab === 'apps'" @click="openAppSlider(null)"
                        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm"
                        style="background:#205E77">
                        <Icon name="ph:plus" class="w-4 h-4" />
                        {{ $t('superadmin.products.newApp') }}
                    </button>
                </div>

                <!-- Tabs -->
                <div class="flex items-center gap-0 border-b border-[#EAECF0] mb-6">
                    <button v-for="tab in tabs" :key="tab.key"
                        class="px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-px flex items-center gap-1.5"
                        :style="activeTab === tab.key
                            ? 'border-color:#205E77;color:#205E77'
                            : 'border-color:transparent;color:#8891A4'" @click="activeTab = tab.key">
                        <Icon :name="tab.icon" class="w-3.5 h-3.5" />
                        {{ tab.label }}
                    </button>
                </div>

                <!-- ══════════════════════════════════
                     TAB: PLANS & ADD-ONS
                ══════════════════════════════════ -->
                <div v-if="activeTab === 'plans'">

                    <!-- Plan cards -->
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
                        <div v-for="plan in plans" :key="plan.key"
                            class="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#EAECF0] flex flex-col">

                            <!-- Coloured top stripe -->
                            <div class="h-1.5" :style="`background:${plan.color}`"></div>

                            <!-- Plan header -->
                            <div class="px-5 pt-4 pb-4 border-b border-[#F5F6F8]">
                                <div class="flex items-center justify-between mb-3">
                                    <div class="flex items-center gap-3">
                                        <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                            :style="`background:${plan.color}20;color:${plan.color}`">
                                            <Icon :name="plan.icon" class="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p class="text-[15px] font-bold text-[#1F2533]">{{ plan.name }}</p>
                                            <p class="text-[11px] text-[#8891A4]">{{ plan.tagline }}</p>
                                        </div>
                                    </div>
                                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                        :style="`background:${plan.color}15;color:${plan.color}`">
                                        {{ plan.key.toUpperCase() }}
                                    </span>
                                </div>

                                <!-- Price -->
                                <div class="flex items-end gap-1 mt-2">
                                    <span class="text-[28px] font-extrabold leading-none text-[#1F2533]">
                                        {{ plan.price === 0 ? $t('superadmin.products.free') : `kr. ${plan.price}` }}
                                    </span>
                                    <span v-if="plan.price > 0" class="text-[12px] text-[#8891A4] mb-0.5">
                                        {{ $t('superadmin.products.perMonth') }}
                                    </span>
                                </div>
                                <p v-if="plan.yearly_price > 0" class="text-[11px] text-[#8891A4] mt-0.5">
                                    {{ $t('superadmin.products.orYearly', { price: plan.yearly_price }) }}
                                    <span class="text-[#2E9E33] font-semibold ml-1">
                                        {{ $t('superadmin.products.saveAmount', {
                                            amount: plan.price * 12 -
                                                plan.yearly_price
                                        }) }}
                                    </span>
                                </p>
                            </div>

                            <!-- Included -->
                            <div class="px-5 py-3 flex-1">
                                <p class="text-[9px] font-bold text-[#8891A4] uppercase tracking-[0.1em] mb-2">
                                    {{ $t('superadmin.products.included') }}
                                </p>
                                <ul class="space-y-1.5">
                                    <li v-for="feat in plan.features" :key="feat.key"
                                        class="flex items-center justify-between text-[12px]">
                                        <span class="flex items-center gap-1.5 text-[#5C6478]">
                                            <Icon name="ph:check" class="w-3 h-3 flex-shrink-0"
                                                :style="`color:${plan.color}`" />
                                            {{ feat.label }}
                                        </span>
                                        <span class="font-semibold text-[#1F2533]">{{ feat.value }}</span>
                                    </li>
                                </ul>
                            </div>

                            <!-- Add-ons -->
                            <div v-if="plan.addons.length" class="px-5 py-3 bg-[#F9FAFB] border-t border-[#F5F6F8]">
                                <p class="text-[9px] font-bold text-[#8891A4] uppercase tracking-[0.1em] mb-2">
                                    {{ $t('superadmin.products.addons') }}
                                </p>
                                <div class="space-y-1.5">
                                    <div v-for="addon in plan.addons" :key="addon.key"
                                        class="flex items-center justify-between text-[11px]">
                                        <span class="flex items-center gap-1.5 text-[#5C6478]">
                                            <Icon :name="addon.icon" class="w-3 h-3" />
                                            {{ addon.label }}
                                        </span>
                                        <span class="font-semibold text-[#1F2533]">
                                            +kr. {{ addon.price }}{{ $t('superadmin.products.perMonth') }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- Actions -->
                            <div class="px-5 py-3 border-t border-[#F5F6F8] flex gap-2">
                                <button @click="openPlanSlider(plan)"
                                    class="flex-1 py-2 rounded-xl text-[12px] font-semibold transition-colors flex items-center justify-center gap-1.5 text-white"
                                    :style="`background:${plan.color};opacity:0.9`"
                                    @mouseover="e => e.currentTarget.style.opacity = '1'"
                                    @mouseleave="e => e.currentTarget.style.opacity = '0.9'">
                                    <Icon name="ph:pencil-simple" class="w-3.5 h-3.5" />
                                    {{ $t('superadmin.products.edit') }}
                                </button>
                                <button v-if="!['gratis', 'basis', 'pro'].includes(plan.key)"
                                    @click="confirmDeletePlan(plan)"
                                    class="w-9 h-9 rounded-xl flex items-center justify-center border border-[#EAECF0] text-[#CC3B2D] hover:bg-red-50 transition-colors">
                                    <Icon name="ph:trash" class="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Add-on prices panel -->
                    <div class="bg-white border border-[#EAECF0] rounded-2xl shadow-sm overflow-hidden">
                        <div class="px-6 py-4 border-b border-[#EAECF0] flex items-center justify-between">
                            <div>
                                <h3 class="text-[14px] font-semibold text-[#1F2533]">
                                    {{ $t('superadmin.products.addonPricesTitle') }}
                                </h3>
                                <p class="text-[12px] text-[#8891A4] mt-0.5">
                                    {{ $t('superadmin.products.addonPricesSubtitle') }}
                                </p>
                            </div>
                            <button @click="openAddonSlider"
                                class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold transition-colors"
                                style="color:#205E77;background:#F0FAFD;border:1px solid rgba(66,174,217,0.3)">
                                <Icon name="ph:pencil-simple" class="w-3.5 h-3.5" />
                                {{ $t('superadmin.products.editPrices') }}
                            </button>
                        </div>
                        <div class="grid grid-cols-2 divide-x divide-[#F5F6F8]">
                            <div class="px-6 py-4 flex items-center gap-4">
                                <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style="background:#E4F1F6">
                                    <Icon name="ph:user-plus" class="w-5 h-5" style="color:#205E77" />
                                </div>
                                <div class="flex-1">
                                    <p class="text-[13px] font-semibold text-[#1F2533]">
                                        {{ $t('superadmin.products.extraUser') }}
                                    </p>
                                    <p class="text-[11px] text-[#8891A4]">
                                        {{ $t('superadmin.products.perEmployeePerMonth') }}
                                    </p>
                                </div>
                                <div class="text-right">
                                    <p class="text-[22px] font-extrabold text-[#205E77]">
                                        kr. {{ addonPrices.extra_user }}
                                    </p>
                                    <p class="text-[10px] text-[#8891A4]">
                                        {{ $t('superadmin.products.perMonth') }}
                                    </p>
                                </div>
                            </div>
                            <div class="px-6 py-4 flex items-center gap-4">
                                <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style="background:#EDF7EE">
                                    <Icon name="ph:buildings" class="w-5 h-5" style="color:#2E9E33" />
                                </div>
                                <div class="flex-1">
                                    <p class="text-[13px] font-semibold text-[#1F2533]">
                                        {{ $t('superadmin.products.extraDepartment') }}
                                    </p>
                                    <p class="text-[11px] text-[#8891A4]">
                                        {{ $t('superadmin.products.perDepartmentPerMonth') }}
                                    </p>
                                </div>
                                <div class="text-right">
                                    <p class="text-[22px] font-extrabold text-[#2E9E33]">
                                        kr. {{ addonPrices.extra_department }}
                                    </p>
                                    <p class="text-[10px] text-[#8891A4]">
                                        {{ $t('superadmin.products.perMonth') }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ══════════════════════════════════
                     TAB: APPS
                ══════════════════════════════════ -->
                <div v-if="activeTab === 'apps'">
                    <div v-if="state.isLoading" class="flex justify-center py-16">
                        <Icon name="ph:spinner" class="w-7 h-7 text-[#42AED9] animate-spin" />
                    </div>
                    <div v-else-if="!state.apps.length" class="flex flex-col items-center gap-3 py-20 text-[#8891A4]">
                        <div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-2"
                            style="background:#E4F1F6">
                            <Icon name="ph:squares-four" class="w-8 h-8" style="color:#205E77" />
                        </div>
                        <p class="text-[15px] font-semibold text-[#1F2533]">
                            {{ $t('superadmin.products.noAppsYet') }}
                        </p>
                        <p class="text-[12px]">
                            {{ $t('superadmin.products.addAppsToStore') }}
                        </p>
                        <button @click="openAppSlider(null)"
                            class="mt-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm"
                            style="background:#205E77">
                            <Icon name="ph:plus" class="w-4 h-4 inline mr-1.5" />
                            {{ $t('superadmin.products.addFirstApp') }}
                        </button>
                    </div>
                    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        <div v-for="app in state.apps" :key="app.uuid ?? app.id"
                            class="bg-white border border-[#EAECF0] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                            <div class="h-1" :style="`background:${appColor(app.name)}`"></div>
                            <div class="p-5">
                                <div class="flex items-start justify-between mb-3">
                                    <div class="w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
                                        :style="`background:${appColor(app.name)}18`">
                                        <img v-if="app.image" :src="app.image" class="w-9 h-9 object-contain" />
                                        <Icon v-else :name="appIcon(app.name)" class="w-5 h-5"
                                            :style="`color:${appColor(app.name)}`" />
                                    </div>
                                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full" :class="app.is_active !== false
                                        ? 'bg-[#EDF7EE] text-[#2E9E33]'
                                        : 'bg-[#F5F6F8] text-[#8891A4]'">
                                        {{ app.is_active !== false ? $t('superadmin.products.active') :
                                            $t('superadmin.products.inactive') }}
                                    </span>
                                </div>
                                <h3 class="text-[14px] font-bold text-[#1F2533]">{{ app.name }}</h3>
                                <p v-if="app.description" class="text-[12px] text-[#8891A4] mt-1 leading-relaxed"
                                    style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">
                                    {{ app.description }}
                                </p>
                                <div class="mt-3 pt-3 border-t border-[#F5F6F8] space-y-1">
                                    <div v-if="app.monthly_price > 0" class="flex justify-between text-[12px]">
                                        <span class="text-[#8891A4]">
                                            {{ $t('superadmin.products.monthly') }}
                                        </span>
                                        <span class="font-bold text-[#1F2533]">
                                            kr. {{ app.monthly_price }}{{ $t('superadmin.products.perMonth') }}
                                        </span>
                                    </div>
                                    <div v-if="app.yearly_price > 0" class="flex justify-between text-[12px]">
                                        <span class="text-[#8891A4]">
                                            {{ $t('superadmin.products.yearly') }}
                                        </span>
                                        <span class="font-bold text-[#1F2533]">
                                            kr. {{ app.yearly_price }}/{{ $t('superadmin.products.yearly').toLowerCase()
                                            }}
                                        </span>
                                    </div>
                                    <div v-if="(app.one_time_price ?? app.one_time_fee) > 0"
                                        class="flex justify-between text-[12px]">
                                        <span class="text-[#8891A4]">
                                            {{ $t('superadmin.products.oneTime') }}
                                        </span>
                                        <span class="font-bold text-[#D4900A]">
                                            kr. {{ app.one_time_price ?? app.one_time_fee }}
                                        </span>
                                    </div>
                                    <div v-if="!app.monthly_price && !app.yearly_price && !(app.one_time_price ?? app.one_time_fee)"
                                        class="text-[12px] text-[#8891A4]">
                                        {{ $t('superadmin.products.free') }}
                                    </div>
                                </div>
                                <div class="flex items-center justify-between mt-3">
                                    <span
                                        class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F5F6F8] text-[#5C6478]">
                                        {{ app.type ?? 'Other' }}
                                    </span>
                                </div>
                                <div class="flex gap-2 mt-4">
                                    <button
                                        class="flex-1 py-2 rounded-xl text-[12px] font-semibold border border-[#EAECF0] text-[#5C6478] hover:bg-[#EEF4FB] hover:text-[#205E77] hover:border-[#42AED9]/30 transition-colors flex items-center justify-center gap-1.5"
                                        @click="openAppSlider(app)">
                                        <Icon name="ph:pencil-simple" class="w-3.5 h-3.5" />
                                        {{ $t('superadmin.products.edit') }}
                                    </button>
                                    <button
                                        class="w-9 h-9 rounded-xl flex items-center justify-center border border-[#EAECF0] text-[#CC3B2D] hover:bg-red-50 hover:border-red-200 transition-colors flex-shrink-0"
                                        @click="confirmDeleteApp(app)">
                                        <Icon name="ph:trash" class="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ═══ SLIDE-OVER: NEW / EDIT PLAN ═══ -->
            <Teleport to="body">
                <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0"
                    enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200"
                    leave-from-class="opacity-100" leave-to-class="opacity-0">
                    <div v-if="planSlider.open" class="fixed inset-0 bg-black/30 z-40" @click="closePlanSlider" />
                </Transition>
                <Transition enter-active-class="transition-transform duration-300 ease-out"
                    enter-from-class="translate-x-full" enter-to-class="translate-x-0"
                    leave-active-class="transition-transform duration-200 ease-in" leave-from-class="translate-x-0"
                    leave-to-class="translate-x-full">
                    <div v-if="planSlider.open"
                        class="fixed inset-y-0 right-0 z-50 w-full max-w-[480px] bg-white shadow-2xl flex flex-col">
                        <div class="flex items-start justify-between px-6 py-5 border-b border-[#EAECF0]">
                            <div>
                                <h2 class="text-[16px] font-semibold text-[#1F2533]">
                                    {{ planSlider.editMode
                                        ? $t('superadmin.products.planSliderEditTitle', { name: planSlider.form.name })
                                        : $t('superadmin.products.planSliderNewTitle') }}
                                </h2>
                                <p class="text-[12px] text-[#8891A4] mt-0.5">
                                    {{ planSlider.editMode
                                        ? $t('superadmin.products.planSliderEditSubtitle')
                                        : $t('superadmin.products.planSliderNewSubtitle') }}
                                </p>
                            </div>
                            <button @click="closePlanSlider"
                                class="w-8 h-8 rounded-lg flex items-center justify-center text-[#8891A4] hover:bg-[#F5F6F8]">
                                <Icon name="ph:x" class="w-4 h-4" />
                            </button>
                        </div>
                        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                            <!-- Basic info -->
                            <div class="space-y-3">
                                <div v-if="!planSlider.editMode">
                                    <label class="co-label">
                                        {{ $t('superadmin.products.packageName') }}
                                        <span class="text-red-500">*</span>
                                    </label>
                                    <input v-model="planSlider.form.name" type="text" placeholder="fx Enterprise"
                                        class="co-input" />
                                </div>
                                <div>
                                    <label class="co-label">{{ $t('superadmin.products.tagline') }}</label>
                                    <input v-model="planSlider.form.tagline" type="text"
                                        :placeholder="$t('superadmin.products.phTagline')" class="co-input" />
                                </div>
                                <div>
                                    <label class="co-label">{{ $t('superadmin.products.description') }}</label>
                                    <textarea v-model="planSlider.form.description" rows="3"
                                        :placeholder="$t('superadmin.products.phPlanDescription')"
                                        class="co-input resize-none"></textarea>
                                </div>
                            </div>

                            <!-- Prices -->
                            <div>
                                <p class="text-[10px] font-bold text-[#8891A4] uppercase tracking-[0.08em] mb-3">
                                    {{ $t('superadmin.products.prices') }}
                                </p>
                                <div class="grid grid-cols-2 gap-3">
                                    <div>
                                        <label class="co-label">{{ $t('superadmin.products.monthlyPrice') }}</label>
                                        <div class="relative">
                                            <input v-model.number="planSlider.form.price" type="number" min="0"
                                                class="co-input pr-8" />
                                            <span
                                                class="absolute right-3 top-1/2 -translate-y-1/2 text-[#8891A4] text-[12px]">kr</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="co-label">{{ $t('superadmin.products.yearlyPrice') }}</label>
                                        <div class="relative">
                                            <input v-model.number="planSlider.form.yearly_price" type="number" min="0"
                                                class="co-input pr-8" />
                                            <span
                                                class="absolute right-3 top-1/2 -translate-y-1/2 text-[#8891A4] text-[12px]">kr</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Included -->
                            <div>
                                <p class="text-[10px] font-bold text-[#8891A4] uppercase tracking-[0.08em] mb-3">
                                    {{ $t('superadmin.products.includedInPackage') }}
                                </p>
                                <div class="space-y-3">
                                    <div class="grid grid-cols-2 gap-3">
                                        <div>
                                            <label class="co-label">{{ $t('superadmin.products.includedUsers')
                                                }}</label>
                                            <input v-model.number="planSlider.form.included_users" type="number" min="0"
                                                class="co-input" />
                                        </div>
                                        <div>
                                            <label class="co-label">{{ $t('superadmin.products.includedDepartments')
                                                }}</label>
                                            <input v-model.number="planSlider.form.included_departments" type="number"
                                                min="0" class="co-input" />
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-2 gap-3">
                                        <div>
                                            <label class="co-label">{{ $t('superadmin.products.citizens') }}</label>
                                            <select v-model="planSlider.form.included_citizens" class="co-input">
                                                <option value="1">{{ $t('superadmin.products.oneCitizen') }}</option>
                                                <option value="unlimited">{{ $t('superadmin.products.unlimited') }}
                                                </option>
                                            </select>
                                        </div>
                                        <div>
                                            <label class="co-label">{{ $t('superadmin.products.storageGb') }}</label>
                                            <input v-model.number="planSlider.form.storage_gb" type="number" min="0"
                                                class="co-input" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Features — dynamic list -->
                            <div>
                                <div class="flex items-center justify-between mb-3">
                                    <p class="text-[10px] font-bold text-[#8891A4] uppercase tracking-[0.08em]">
                                        {{ $t('superadmin.products.featuresAndBenefits') }}
                                    </p>
                                    <button type="button" @click="addFeature"
                                        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[#205E77] bg-[#E4F1F6] hover:bg-[#D4EAF4] transition-colors">
                                        <Icon name="ph:plus" class="w-3 h-3" />
                                        {{ $t('superadmin.products.add') }}
                                    </button>
                                </div>
                                <div class="space-y-2">
                                    <div v-for="(feat, i) in planSlider.form.featureList" :key="i"
                                        class="flex items-center gap-2">
                                        <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                            style="background:#E4F1F6">
                                            <Icon name="ph:check" class="w-3.5 h-3.5" style="color:#205E77" />
                                        </div>
                                        <input v-model="planSlider.form.featureList[i]" type="text"
                                            :placeholder="$t('superadmin.products.phFeatureN', { n: i + 1 })"
                                            class="flex-1 px-3 py-2 text-[13px] border border-[#EAECF0] rounded-xl outline-none focus:border-[#42AED9] focus:ring-2 focus:ring-[#42AED9]/10 text-[#1F2533] bg-white transition-colors" />
                                        <button type="button" @click="removeFeature(i)"
                                            class="w-7 h-7 rounded-lg flex items-center justify-center text-[#CC3B2D] hover:bg-red-50 transition-colors flex-shrink-0">
                                            <Icon name="ph:x" class="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div v-if="!planSlider.form.featureList.length"
                                        class="text-[12px] text-[#8891A4] text-center py-3 border border-dashed border-[#EAECF0] rounded-xl">
                                        {{ $t('superadmin.products.noFeaturesYet') }}
                                    </div>
                                </div>
                            </div>

                            <!-- Feature toggles -->
                            <div>
                                <p class="text-[10px] font-bold text-[#8891A4] uppercase tracking-[0.08em] mb-3">
                                    {{ $t('superadmin.products.specialFeatures') }}
                                </p>
                                <div class="space-y-2">
                                    <div v-for="feat in planFeatureToggles" :key="feat.key"
                                        class="flex items-center justify-between py-2.5 px-4 border border-[#EAECF0] rounded-xl">
                                        <div class="flex items-center gap-2.5">
                                            <Icon :name="feat.icon" class="w-4 h-4 text-[#8891A4]" />
                                            <p class="text-[13px] font-medium text-[#1F2533]">{{ feat.label }}</p>
                                        </div>
                                        <button type="button"
                                            @click="planSlider.form.features[feat.key] = !planSlider.form.features[feat.key]"
                                            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
                                            :style="planSlider.form.features[feat.key] ? 'background:#42AED9' : 'background:#D5D9E2'">
                                            <span
                                                class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                                                :class="planSlider.form.features[feat.key] ? 'translate-x-6' : 'translate-x-1'"></span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-3 px-6 py-4 border-t border-[#EAECF0]">
                            <button @click="closePlanSlider"
                                class="flex-1 py-2.5 rounded-lg text-sm font-medium text-[#5C6478] border border-[#EAECF0] hover:bg-[#F5F6F8]">
                                {{ $t('superadmin.products.cancel') }}
                            </button>
                            <button @click="savePlan"
                                class="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm"
                                style="background:#205E77" :disabled="planSlider.isSaving">
                                <span v-if="planSlider.isSaving" class="flex items-center justify-center gap-2">
                                    <Icon name="ph:spinner" class="w-4 h-4 animate-spin" />
                                    {{ $t('superadmin.products.saving') }}
                                </span>
                                <span v-else>
                                    {{ planSlider.editMode
                                        ? $t('superadmin.products.savePlan')
                                        : $t('superadmin.products.createPlan') }}
                                </span>
                            </button>
                        </div>
                    </div>
                </Transition>

                <!-- SLIDE-OVER: EDIT ADD-ON PRICES -->
                <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0"
                    enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200"
                    leave-from-class="opacity-100" leave-to-class="opacity-0">
                    <div v-if="addonSlider.open" class="fixed inset-0 bg-black/30 z-40" @click="closeAddonSlider" />
                </Transition>
                <Transition enter-active-class="transition-transform duration-300 ease-out"
                    enter-from-class="translate-x-full" enter-to-class="translate-x-0"
                    leave-active-class="transition-transform duration-200 ease-in" leave-from-class="translate-x-0"
                    leave-to-class="translate-x-full">
                    <div v-if="addonSlider.open"
                        class="fixed inset-y-0 right-0 z-50 w-full max-w-[420px] bg-white shadow-2xl flex flex-col">
                        <div class="flex items-start justify-between px-6 py-5 border-b border-[#EAECF0]">
                            <div>
                                <h2 class="text-[16px] font-semibold text-[#1F2533]">
                                    {{ $t('superadmin.products.addonSliderTitle') }}
                                </h2>
                                <p class="text-[12px] text-[#8891A4] mt-0.5">
                                    {{ $t('superadmin.products.addonSliderSubtitle') }}
                                </p>
                            </div>
                            <button @click="closeAddonSlider"
                                class="w-8 h-8 rounded-lg flex items-center justify-center text-[#8891A4] hover:bg-[#F5F6F8]">
                                <Icon name="ph:x" class="w-4 h-4" />
                            </button>
                        </div>
                        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                            <div class="p-4 border border-[#EAECF0] rounded-xl">
                                <div class="flex items-center gap-3 mb-3">
                                    <div class="w-9 h-9 rounded-lg flex items-center justify-center"
                                        style="background:#E4F1F6">
                                        <Icon name="ph:user-plus" class="w-4 h-4" style="color:#205E77" />
                                    </div>
                                    <div>
                                        <p class="text-[13px] font-semibold text-[#1F2533]">
                                            {{ $t('superadmin.products.extraUser') }}
                                        </p>
                                        <p class="text-[11px] text-[#8891A4]">
                                            {{ $t('superadmin.products.perEmployeePerMonth') }}
                                        </p>
                                    </div>
                                </div>
                                <div class="relative">
                                    <input v-model.number="addonSlider.form.extra_user" type="number" min="0"
                                        class="co-input pr-14" />
                                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[#8891A4] text-[12px]">
                                        kr{{ $t('superadmin.products.perMonth') }}
                                    </span>
                                </div>
                            </div>
                            <div class="p-4 border border-[#EAECF0] rounded-xl">
                                <div class="flex items-center gap-3 mb-3">
                                    <div class="w-9 h-9 rounded-lg flex items-center justify-center"
                                        style="background:#EDF7EE">
                                        <Icon name="ph:buildings" class="w-4 h-4" style="color:#2E9E33" />
                                    </div>
                                    <div>
                                        <p class="text-[13px] font-semibold text-[#1F2533]">
                                            {{ $t('superadmin.products.extraDepartment') }}
                                        </p>
                                        <p class="text-[11px] text-[#8891A4]">
                                            {{ $t('superadmin.products.perDepartmentPerMonth') }}
                                        </p>
                                    </div>
                                </div>
                                <div class="relative">
                                    <input v-model.number="addonSlider.form.extra_department" type="number" min="0"
                                        class="co-input pr-14" />
                                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[#8891A4] text-[12px]">
                                        kr{{ $t('superadmin.products.perMonth') }}
                                    </span>
                                </div>
                            </div>
                            <div
                                class="px-4 py-3 bg-[#FFF9EC] rounded-xl border border-[#D4900A]/20 text-[12px] text-[#D4900A] flex items-start gap-2">
                                <Icon name="ph:warning" class="w-4 h-4 flex-shrink-0 mt-0.5" />
                                {{ $t('superadmin.products.priceChangeWarning') }}
                            </div>
                        </div>
                        <div class="flex items-center gap-3 px-6 py-4 border-t border-[#EAECF0]">
                            <button @click="closeAddonSlider"
                                class="flex-1 py-2.5 rounded-lg text-sm font-medium text-[#5C6478] border border-[#EAECF0] hover:bg-[#F5F6F8]">
                                {{ $t('superadmin.products.cancel') }}
                            </button>
                            <button @click="saveAddonPrices"
                                class="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm"
                                style="background:#205E77" :disabled="addonSlider.isSaving">
                                <span v-if="addonSlider.isSaving" class="flex items-center justify-center gap-2">
                                    <Icon name="ph:spinner" class="w-4 h-4 animate-spin" />
                                    {{ $t('superadmin.products.saving') }}
                                </span>
                                <span v-else>{{ $t('superadmin.products.savePrices') }}</span>
                            </button>
                        </div>
                    </div>
                </Transition>

                <!-- SLIDE-OVER: NEW / EDIT APP -->
                <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0"
                    enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200"
                    leave-from-class="opacity-100" leave-to-class="opacity-0">
                    <div v-if="appSlider.open" class="fixed inset-0 bg-black/30 z-40" @click="closeAppSlider" />
                </Transition>
                <Transition enter-active-class="transition-transform duration-300 ease-out"
                    enter-from-class="translate-x-full" enter-to-class="translate-x-0"
                    leave-active-class="transition-transform duration-200 ease-in" leave-from-class="translate-x-0"
                    leave-to-class="translate-x-full">
                    <div v-if="appSlider.open"
                        class="fixed inset-y-0 right-0 z-50 w-full max-w-[460px] bg-white shadow-2xl flex flex-col">
                        <div class="flex items-start justify-between px-6 py-5 border-b border-[#EAECF0]">
                            <div>
                                <h2 class="text-[16px] font-semibold text-[#1F2533]">
                                    {{ appSlider.editMode
                                        ? $t('superadmin.products.editApp')
                                        : $t('superadmin.products.newAppTitle') }}
                                </h2>
                                <p class="text-[12px] text-[#8891A4] mt-0.5">
                                    {{ appSlider.editMode
                                        ? $t('superadmin.products.editAppSubtitle')
                                        : $t('superadmin.products.newAppSubtitle') }}
                                </p>
                            </div>
                            <button @click="closeAppSlider"
                                class="w-8 h-8 rounded-lg flex items-center justify-center text-[#8891A4] hover:bg-[#F5F6F8]">
                                <Icon name="ph:x" class="w-4 h-4" />
                            </button>
                        </div>
                        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                            <Alert type="danger" :text="appSlider.error?.message"
                                v-if="appSlider.error?.message?.length > 0" />

                            <div>
                                <label class="co-label">
                                    {{ $t('superadmin.products.name') }}
                                    <span class="text-red-500">*</span>
                                </label>
                                <input v-model="appSlider.form.name" type="text"
                                    :placeholder="$t('superadmin.products.phAppName')" class="co-input"
                                    :class="appSlider.errors.name ? 'border-red-300' : ''" />
                                <p v-if="appSlider.errors.name" class="co-error">{{ appSlider.errors.name }}</p>
                            </div>

                            <div>
                                <label class="co-label">{{ $t('superadmin.products.description') }}</label>
                                <textarea v-model="appSlider.form.description" rows="3"
                                    :placeholder="$t('superadmin.products.phAppDescription')"
                                    class="co-input resize-none"></textarea>
                            </div>

                            <div>
                                <label class="co-label">{{ $t('superadmin.products.type') }}</label>
                                <div class="grid grid-cols-2 gap-2">
                                    <button v-for="appType in appTypes" :key="appType.value"
                                        class="py-2.5 px-3 rounded-xl border-2 text-[12px] font-medium transition-colors flex items-center gap-2"
                                        :style="appSlider.form.type === appType.value
                                            ? 'border-color:#42AED9;background:#F0FAFD;color:#205E77'
                                            : 'border-color:#EAECF0;color:#5C6478'"
                                        @click="appSlider.form.type = appType.value">
                                        <Icon :name="appType.icon" class="w-4 h-4" />
                                        {{ appType.label }}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <p class="text-[10px] font-bold text-[#8891A4] uppercase tracking-[0.08em] mb-3">
                                    {{ $t('superadmin.products.prices') }}
                                </p>
                                <div class="space-y-3">
                                    <div>
                                        <label class="co-label">{{ $t('superadmin.products.monthlyPrice') }}</label>
                                        <div class="relative">
                                            <input v-model.number="appSlider.form.monthly_price" type="number" min="0"
                                                placeholder="0" class="co-input pr-8" />
                                            <span
                                                class="absolute right-3 top-1/2 -translate-y-1/2 text-[#8891A4] text-[12px]">kr</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="co-label">{{ $t('superadmin.products.yearlyPrice') }}</label>
                                        <div class="relative">
                                            <input v-model.number="appSlider.form.yearly_price" type="number" min="0"
                                                placeholder="0" class="co-input pr-8" />
                                            <span
                                                class="absolute right-3 top-1/2 -translate-y-1/2 text-[#8891A4] text-[12px]">kr</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="co-label">{{ $t('superadmin.products.oneTimeFee') }}</label>
                                        <div class="relative">
                                            <input v-model.number="appSlider.form.one_time_price" type="number" min="0"
                                                placeholder="0" class="co-input pr-8" />
                                            <span
                                                class="absolute right-3 top-1/2 -translate-y-1/2 text-[#8891A4] text-[12px]">kr</span>
                                        </div>
                                        <p class="text-[11px] text-[#8891A4] mt-1">
                                            {{ $t('superadmin.products.oneTimeFeeHint') }}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label class="co-label">
                                    {{ $t('superadmin.products.imageUrl') }}
                                    <span class="text-[#8891A4] font-normal">
                                        {{ $t('superadmin.products.optional') }}
                                    </span>
                                </label>
                                <input v-model="appSlider.form.image" type="url" placeholder="https://..."
                                    class="co-input" />
                            </div>

                            <div class="flex items-center justify-between py-3 px-4 border border-[#EAECF0] rounded-xl">
                                <div>
                                    <p class="text-[13px] font-medium text-[#1F2533]">
                                        {{ $t('superadmin.products.visibleInAppStore') }}
                                    </p>
                                    <p class="text-[11px] text-[#8891A4] mt-0.5">
                                        {{ $t('superadmin.products.visibleInAppStoreHint') }}
                                    </p>
                                </div>
                                <button type="button" @click="appSlider.form.is_active = !appSlider.form.is_active"
                                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
                                    :style="appSlider.form.is_active ? 'background:#42AED9' : 'background:#D5D9E2'">
                                    <span
                                        class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                                        :class="appSlider.form.is_active ? 'translate-x-6' : 'translate-x-1'"></span>
                                </button>
                            </div>
                        </div>
                        <div class="flex items-center gap-3 px-6 py-4 border-t border-[#EAECF0]">
                            <button @click="closeAppSlider"
                                class="flex-1 py-2.5 rounded-lg text-sm font-medium text-[#5C6478] border border-[#EAECF0] hover:bg-[#F5F6F8]">
                                {{ $t('superadmin.products.cancel') }}
                            </button>
                            <button @click="saveApp"
                                class="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm"
                                style="background:#205E77" :disabled="appSlider.isSaving">
                                <span v-if="appSlider.isSaving" class="flex items-center justify-center gap-2">
                                    <Icon name="ph:spinner" class="w-4 h-4 animate-spin" />
                                    {{ $t('superadmin.products.saving') }}
                                </span>
                                <span v-else>
                                    {{ appSlider.editMode
                                        ? $t('superadmin.products.saveChanges')
                                        : $t('superadmin.products.createApp') }}
                                </span>
                            </button>
                        </div>
                    </div>
                </Transition>
            </Teleport>

            <DialogConfirmation :isModalOpen="state.modal.isDeleteAppOpen"
                :message="$t('superadmin.products.deleteAppConfirm', { name: state.selectedApp?.name })"
                @close="state.modal.isDeleteAppOpen = false" @confirm="deleteApp" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { appService } from '@/components/api/superadmin/AppService'
import { productService } from '@/components/api/superadmin/ProductService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

const activeTab = ref('plans')

// ── Static arrays as computed for locale reactivity ──

const tabs = computed(() => [
    { key: 'plans', label: t('superadmin.products.tabPlans'), icon: 'ph:package' },
    { key: 'apps', label: t('superadmin.products.tabApps'), icon: 'ph:squares-four' },
])

const appTypes = computed(() => [
    { value: 'Module', label: t('superadmin.products.appTypeModule'), icon: 'ph:squares-four' },
    { value: 'Course', label: t('superadmin.products.appTypeCourse'), icon: 'ph:graduation-cap' },
    { value: 'Integration', label: t('superadmin.products.appTypeIntegration'), icon: 'ph:plugs-connected' },
    { value: 'Other', label: t('superadmin.products.appTypeOther'), icon: 'ph:package' },
])

const planFeatureToggles = computed(() => [
    { key: 'phone_support', label: t('superadmin.products.featurePhoneSupport'), icon: 'ph:phone' },
    { key: 'fmk', label: t('superadmin.products.featureFmk'), icon: 'ph:pills' },
    { key: 'app_store', label: t('superadmin.products.featureAppStore'), icon: 'ph:squares-four' },
    { key: 'api_access', label: t('superadmin.products.featureApiAccess'), icon: 'ph:code' },
])

// ── Addon prices (mutable, updated from server and slider) ──
const addonPrices = reactive({ extra_user: 39, extra_department: 79 })

// ── Per-plan price overrides from server ──
const planPriceOverrides = reactive({} as Record<string, { price?: number; yearly_price?: number; tagline?: string }>)

// ── Plans as computed — derives labels from t(), prices from planPriceOverrides + addonPrices ──
const plans = computed(() => [
    {
        key: 'gratis', name: 'Gratis',
        tagline: planPriceOverrides['gratis']?.tagline ?? t('superadmin.products.planTaglineFree'),
        price: planPriceOverrides['gratis']?.price ?? 0,
        yearly_price: planPriceOverrides['gratis']?.yearly_price ?? 0,
        color: '#8891A4', icon: 'ph:gift',
        features: [
            { key: 'admin', label: t('superadmin.products.featureAdmin'), value: '1', rawValue: 1 },
            { key: 'users', label: t('superadmin.products.featureUsers'), value: '1', rawValue: 1 },
            { key: 'departments', label: t('superadmin.products.featureDepartments'), value: '1', rawValue: 1 },
            { key: 'citizens', label: t('superadmin.products.featureCitizens'), value: '1', rawValue: '1' },
            { key: 'storage', label: t('superadmin.products.featureStorage'), value: '1 GB', rawValue: 1 },
            { key: 'support', label: t('superadmin.products.featureSupport'), value: t('superadmin.products.featureValueSupportBase') },
        ],
        addons: [] as any[],
    },
    {
        key: 'basis', name: 'Basis',
        tagline: planPriceOverrides['basis']?.tagline ?? t('superadmin.products.planTaglineBasis'),
        price: planPriceOverrides['basis']?.price ?? 249,
        yearly_price: planPriceOverrides['basis']?.yearly_price ?? 0,
        color: '#42AED9', icon: 'ph:star',
        features: [
            { key: 'admin', label: t('superadmin.products.featureAdmin'), value: '1', rawValue: 1 },
            { key: 'users', label: t('superadmin.products.featureUsers'), value: `1 ${t('superadmin.products.incl')}`, rawValue: 1 },
            { key: 'departments', label: t('superadmin.products.featureDepartments'), value: `1 ${t('superadmin.products.incl')}`, rawValue: 1 },
            { key: 'citizens', label: t('superadmin.products.featureCitizens'), value: t('superadmin.products.unlimited'), rawValue: 'unlimited' },
            { key: 'storage', label: t('superadmin.products.featureStorage'), value: '1 GB', rawValue: 1 },
            { key: 'support', label: t('superadmin.products.featureSupport'), value: t('superadmin.products.featureValueSupportBase') },
        ],
        addons: [
            { key: 'extra_user', label: t('superadmin.products.extraUser'), icon: 'ph:user-plus', price: addonPrices.extra_user },
            { key: 'extra_department', label: t('superadmin.products.extraDepartment'), icon: 'ph:buildings', price: addonPrices.extra_department },
        ],
    },
    {
        key: 'pro', name: 'Pro',
        tagline: planPriceOverrides['pro']?.tagline ?? t('superadmin.products.planTaglinePro'),
        price: planPriceOverrides['pro']?.price ?? 449,
        yearly_price: planPriceOverrides['pro']?.yearly_price ?? 0,
        color: '#205E77', icon: 'ph:crown-simple',
        features: [
            { key: 'admin', label: t('superadmin.products.featureAdmin'), value: '1', rawValue: 1 },
            { key: 'users', label: t('superadmin.products.featureUsers'), value: `3 ${t('superadmin.products.incl')}`, rawValue: 3 },
            { key: 'departments', label: t('superadmin.products.featureDepartments'), value: `3 ${t('superadmin.products.incl')}`, rawValue: 3 },
            { key: 'citizens', label: t('superadmin.products.featureCitizens'), value: t('superadmin.products.unlimited'), rawValue: 'unlimited' },
            { key: 'storage', label: t('superadmin.products.featureStorage'), value: '3 GB', rawValue: 3 },
            { key: 'support', label: t('superadmin.products.featureSupport'), value: t('superadmin.products.featureValueSupportPro') },
            { key: 'fmk', label: t('superadmin.products.featureFMKLabel'), value: '✓' },
        ],
        addons: [
            { key: 'extra_user', label: t('superadmin.products.extraUser'), icon: 'ph:user-plus', price: addonPrices.extra_user },
            { key: 'extra_department', label: t('superadmin.products.extraDepartment'), icon: 'ph:buildings', price: addonPrices.extra_department },
        ],
    },
])

const COLORS = ['#205E77', '#2E9E33', '#368F8B', '#1A4D99', '#D4900A', '#9B4D9B']
const APP_ICONS: Record<string, string> = {
    mail: 'ph:envelope', booking: 'ph:calendar', kursus: 'ph:graduation-cap',
    leads: 'ph:funnel', ai: 'ph:robot',
}
const appIcon = (name: string) => {
    const k = (name || '').toLowerCase()
    const found = Object.keys(APP_ICONS).find(key => k.includes(key))
    return found ? APP_ICONS[found] : 'ph:squares-four'
}
const appColor = (name: string) => COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length]

const state = reactive({
    apps: [] as any[],
    error: {} as Error,
    isLoading: false,
    modal: { isDeleteAppOpen: false },
    selectedApp: null as any,
})

// ── Plan slider ──
const planSlider = reactive({
    open: false, editMode: false, isSaving: false, plan: null as any,
    form: {
        name: '', tagline: '', description: '', price: 0, yearly_price: 0,
        included_users: 1, included_departments: 1,
        included_citizens: 'unlimited', storage_gb: 1,
        featureList: [] as string[],
        features: { phone_support: false, fmk: false, app_store: true, api_access: false } as Record<string, boolean>,
    },
})

function addFeature() { planSlider.form.featureList.push('') }
function removeFeature(i: number) { planSlider.form.featureList.splice(i, 1) }

// ── Addon slider ──
const addonSlider = reactive({
    open: false, isSaving: false,
    form: { extra_user: 39, extra_department: 79 },
})

// ── App slider ──
const appSlider = reactive({
    open: false, editMode: false, isSaving: false,
    error: {} as any, editingId: null as any,
    form: { name: '', description: '', type: 'Module', monthly_price: 0, yearly_price: 0, one_time_price: 0, image: '', is_active: true },
    errors: { name: '' },
})

onMounted(() => {
    fetchApps()
    fetchPlanSettings()
})

watch(activeTab, (tab) => { if (tab === 'apps') fetchApps() })

async function fetchPlanSettings() {
    try {
        const r = await productService.getPlanSettings()
        if (r?.addon_prices) {
            addonPrices.extra_user = r.addon_prices.extra_user ?? 39
            addonPrices.extra_department = r.addon_prices.extra_department ?? 79
        }
        if (r?.plans) {
            r.plans.forEach((p: any) => {
                planPriceOverrides[p.key] = {
                    price: p.price,
                    yearly_price: p.yearly_price ?? 0,
                    tagline: p.tagline,
                }
            })
        }
    } catch (_) { }
}

async function fetchApps() {
    state.isLoading = true
    try {
        const r = await appService.getApplications()
        state.apps = Array.isArray(r) ? r : (r?.data ?? [])
    } catch (e: any) { state.apps = [] }
    state.isLoading = false
}

// ── Plan ──
function openPlanSlider(plan: any) {
    planSlider.editMode = !!plan
    planSlider.plan = plan
    planSlider.form = plan ? {
        name: plan.name,
        tagline: plan.tagline,
        description: plan.description ?? '',
        price: plan.price,
        yearly_price: plan.yearly_price ?? 0,
        included_users: plan.features.find((f: any) => f.key === 'users')?.rawValue ?? 1,
        included_departments: plan.features.find((f: any) => f.key === 'departments')?.rawValue ?? 1,
        included_citizens: plan.features.find((f: any) => f.key === 'citizens')?.rawValue ?? 'unlimited',
        storage_gb: plan.features.find((f: any) => f.key === 'storage')?.rawValue ?? 1,
        featureList: plan.featureList ? [...plan.featureList] : [],
        features: { phone_support: plan.key === 'pro', fmk: plan.key === 'pro', app_store: plan.key !== 'gratis', api_access: false },
    } : {
        name: '', tagline: '', description: '', price: 0, yearly_price: 0,
        included_users: 1, included_departments: 1, included_citizens: 'unlimited', storage_gb: 1,
        featureList: [],
        features: { phone_support: false, fmk: false, app_store: true, api_access: false },
    }
    planSlider.open = true
    document.body.style.overflow = 'hidden'
}
function closePlanSlider() {
    planSlider.open = false
    document.body.style.overflow = ''
}

async function savePlan() {
    planSlider.isSaving = true
    try {
        if (planSlider.editMode) {
            await productService.updatePlan(planSlider.plan.key, planSlider.form)
            planPriceOverrides[planSlider.plan.key] = {
                price: planSlider.form.price,
                yearly_price: planSlider.form.yearly_price,
                tagline: planSlider.form.tagline,
            }
            successAlert(t('superadmin.products.successSaved'), t('superadmin.products.successUpdated', { name: planSlider.form.name }))
        } else {
            await productService.createPlan(planSlider.form)
            successAlert(t('superadmin.products.successCreated'), t('superadmin.products.successPlanCreated', { name: planSlider.form.name }))
            await fetchPlanSettings()
        }
        closePlanSlider()
    } catch (e: any) { console.error(e) }
    planSlider.isSaving = false
}

function confirmDeletePlan(_plan: any) {
    // Only allowed for custom plans
}

// ── Addon ──
function openAddonSlider() {
    addonSlider.form = { extra_user: addonPrices.extra_user, extra_department: addonPrices.extra_department }
    addonSlider.open = true
    document.body.style.overflow = 'hidden'
}
function closeAddonSlider() {
    addonSlider.open = false
    document.body.style.overflow = ''
}

async function saveAddonPrices() {
    addonSlider.isSaving = true
    try {
        await productService.updateAddonPrices(addonSlider.form)
        addonPrices.extra_user = addonSlider.form.extra_user
        addonPrices.extra_department = addonSlider.form.extra_department
        // plans is computed — it derives addon prices directly from addonPrices above
        successAlert(t('superadmin.products.successSaved'), t('superadmin.products.successAddonPrices'))
        closeAddonSlider()
    } catch (e: any) { console.error(e) }
    addonSlider.isSaving = false
}

// ── App ──
function openAppSlider(app: any) {
    appSlider.editMode = !!app
    appSlider.editingId = app?.uuid ?? app?.id ?? null
    appSlider.error = {}
    appSlider.errors = { name: '' }
    appSlider.form = app ? {
        name: app.name ?? '', description: app.description ?? '', type: app.type ?? 'Module',
        monthly_price: app.monthly_price ?? 0, yearly_price: app.yearly_price ?? 0,
        one_time_price: app.one_time_price ?? app.one_time_fee ?? 0,
        image: app.image ?? '', is_active: app.is_active !== false,
    } : { name: '', description: '', type: 'Module', monthly_price: 0, yearly_price: 0, one_time_price: 0, image: '', is_active: true }
    appSlider.open = true
    document.body.style.overflow = 'hidden'
}

function closeAppSlider() {
    appSlider.open = false
    document.body.style.overflow = ''
}

async function saveApp() {
    if (!appSlider.form.name) {
        appSlider.errors.name = t('superadmin.products.errorNameRequired')
        return
    }
    appSlider.isSaving = true
    appSlider.error = {}
    try {
        const params = {
            name: appSlider.form.name,
            description: appSlider.form.description,
            type: appSlider.form.type,
            monthly_price: appSlider.form.monthly_price,
            yearly_price: appSlider.form.yearly_price,
            one_time_fee: appSlider.form.one_time_price,
            image: appSlider.form.image,
            is_active: appSlider.form.is_active,
        }
        if (appSlider.editMode && appSlider.editingId) {
            await appService.updateApp(appSlider.editingId, params)
            successAlert(t('superadmin.products.successSaved'), t('superadmin.products.successUpdated', { name: appSlider.form.name }))
        } else {
            await appService.saveApp(params)
            successAlert(t('superadmin.products.successCreated'), t('superadmin.products.successAppAdded', { name: appSlider.form.name }))
        }
        closeAppSlider()
        fetchApps()
    } catch (e: any) { appSlider.error = e }
    appSlider.isSaving = false
}

function confirmDeleteApp(app: any) {
    state.selectedApp = app
    state.modal.isDeleteAppOpen = true
}

async function deleteApp() {
    try {
        await appService.deleteApp(state.selectedApp?.uuid ?? state.selectedApp?.id)
        successAlert(t('superadmin.products.successDeleted'), t('superadmin.products.successAppRemoved', { name: state.selectedApp?.name }))
        fetchApps()
    } catch (e: any) { state.error = e }
}

onMounted(() => {
    window.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            if (planSlider.open) closePlanSlider()
            if (addonSlider.open) closeAddonSlider()
            if (appSlider.open) closeAppSlider()
        }
    })
})
</script>

<style scoped>
.co-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #1F2533;
    margin-bottom: 5px
}

.co-input {
    width: 100%;
    padding: 9px 13px;
    font-size: 14px;
    color: #1F2533;
    background: white;
    border: 1px solid #D5D9E2;
    border-radius: 10px;
    outline: none;
    transition: border-color 0.15s
}

.co-input:focus {
    border-color: #42AED9;
    box-shadow: 0 0 0 3px rgba(66, 174, 217, 0.12)
}

.co-input::placeholder {
    color: #B0B8C4
}

.co-error {
    font-size: 11px;
    color: #CC3B2D;
    margin-top: 4px
}
</style>
