<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>Apps - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>Apps</template>

            <div class="p-1">
                <!-- Header -->
                <div class="flex items-center justify-between mb-5">
                    <div>
                        <h1 class="text-[22px] font-semibold text-[#1F2533]">
                            {{ $t('superadmin.apps.pageTitle') }}
                        </h1>
                        <p class="text-sm text-[#5C6478] mt-0.5">
                            {{ $t('superadmin.apps.pageSubtitle') }}
                        </p>
                    </div>
                    <button @click="openSlider(null)"
                        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm"
                        style="background:#205E77">
                        <Icon name="ph:plus" class="w-4 h-4" />
                        {{ $t('superadmin.apps.newApp') }}
                    </button>
                </div>

                <!-- View toggle + search + filters -->
                <div class="flex flex-wrap items-center gap-3 mb-5">
                    <!-- Search -->
                    <div class="relative flex-1 min-w-[200px] max-w-[340px]">
                        <Icon name="ph:magnifying-glass"
                            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8891A4]" />
                        <input v-model="searchQuery" type="text" :placeholder="$t('superadmin.apps.searchPlaceholder')"
                            class="w-full pl-9 pr-3 py-2 text-sm border border-[#EAECF0] rounded-lg bg-white text-[#1F2533] placeholder-[#8891A4] outline-none focus:border-[#42AED9] focus:ring-2 focus:ring-[#42AED9]/10 transition-colors"
                            @input="debouncedSearch" />
                    </div>

                    <!-- Type filter -->
                    <div class="flex items-center bg-white border border-[#EAECF0] rounded-lg p-0.5">
                        <button v-for="cat in categories" :key="cat.key"
                            class="px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors"
                            :style="activeCategory === cat.key ? 'background:#205E77;color:#fff' : 'color:#5C6478'"
                            @click="activeCategory = cat.key">
                            {{ cat.label }}
                        </button>
                    </div>

                    <!-- View mode -->
                    <div class="flex items-center bg-white border border-[#EAECF0] rounded-lg p-0.5 ml-auto">
                        <button class="w-8 h-8 rounded-md flex items-center justify-center transition-colors"
                            :style="viewMode === 'grid' ? 'background:#205E77;color:#fff' : 'color:#8891A4'"
                            @click="viewMode = 'grid'">
                            <Icon name="ph:squares-four" class="w-4 h-4" />
                        </button>
                        <button class="w-8 h-8 rounded-md flex items-center justify-center transition-colors"
                            :style="viewMode === 'list' ? 'background:#205E77;color:#fff' : 'color:#8891A4'"
                            @click="viewMode = 'list'">
                            <Icon name="ph:list" class="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error?.message?.length > 0" />

                <div v-if="state.isLoading" class="flex justify-center py-16">
                    <Icon name="ph:spinner" class="w-7 h-7 text-[#42AED9] animate-spin" />
                </div>

                <!-- GRID VIEW -->
                <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div v-for="app in filteredApps" :key="app.uuid ?? app.id"
                        class="bg-white border border-[#EAECF0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group relative">

                        <!-- Active badge -->
                        <div class="absolute top-4 right-4">
                            <span v-if="app.is_active !== false" class="co-badge co-badge-green text-[10px]">
                                <span class="w-1.5 h-1.5 rounded-full bg-[#2E9E33]"></span>
                                {{ $t('superadmin.apps.active') }}
                            </span>
                            <span v-else class="co-badge co-badge-gray text-[10px]">
                                {{ $t('superadmin.apps.inactive') }}
                            </span>
                        </div>

                        <!-- App icon -->
                        <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-3 overflow-hidden"
                            :style="`background:${appColor(app.name)}20`">
                            <img v-if="app.image" :src="app.image" class="w-10 h-10 object-contain rounded-lg" />
                            <Icon v-else :name="appIcon(app.name)" class="w-6 h-6"
                                :style="`color:${appColor(app.name)}`" />
                        </div>

                        <h3 class="text-[14px] font-semibold text-[#1F2533] pr-16">{{ app.name }}</h3>
                        <p v-if="app.description" class="text-[12px] text-[#8891A4] mt-1 line-clamp-2">{{
                            app.description }}</p>

                        <!-- Pricing -->
                        <div class="mt-3 space-y-1">
                            <div v-if="app.one_time_price > 0" class="flex items-center gap-2 text-[12px]">
                                <span class="co-badge co-badge-navy text-[10px]">
                                    {{ $t('superadmin.apps.oneTime') }}
                                </span>
                                <span class="font-semibold text-[#1F2533]">kr. {{ app.one_time_price }}</span>
                            </div>
                            <div v-if="app.monthly_price > 0" class="flex items-center gap-2 text-[12px]">
                                <span class="text-[#5C6478]">{{ $t('superadmin.apps.monthly') }}</span>
                                <span class="font-semibold text-[#1F2533]">kr. {{ app.monthly_price }}{{
                                    $t('superadmin.apps.perMonth') }}</span>
                            </div>
                            <div v-if="app.yearly_price > 0" class="flex items-center gap-2 text-[12px]">
                                <span class="text-[#5C6478]">{{ $t('superadmin.apps.yearly') }}</span>
                                <span class="font-semibold text-[#1F2533]">kr. {{ app.yearly_price }}{{
                                    $t('superadmin.apps.perYear') }}</span>
                            </div>
                            <div v-if="!app.monthly_price && !app.yearly_price && !app.one_time_price"
                                class="text-[12px] text-[#8891A4]">
                                {{ $t('superadmin.apps.free') }}
                            </div>
                        </div>

                        <!-- Type badge -->
                        <div class="mt-3">
                            <span class="co-badge co-badge-gray text-[10px]">{{ app.type ?? 'Other' }}</span>
                        </div>

                        <!-- Actions -->
                        <div class="flex items-center gap-2 mt-4 pt-3 border-t border-[#F5F6F8]">
                            <button
                                class="flex-1 py-1.5 rounded-lg text-[12px] font-medium bg-[#F5F6F8] text-[#5C6478] hover:bg-[#EEF4FB] hover:text-[#205E77] transition-colors flex items-center justify-center gap-1"
                                @click="openSlider(app)">
                                <Icon name="ph:pencil-simple" class="w-3.5 h-3.5" />
                                {{ $t('superadmin.apps.edit') }}
                            </button>
                            <button
                                class="w-8 h-8 rounded-lg flex items-center justify-center text-[#CC3B2D] bg-red-50 hover:bg-red-100 transition-colors"
                                @click="confirmDelete(app)">
                                <Icon name="ph:trash" class="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    <!-- Empty -->
                    <div v-if="!filteredApps.length"
                        class="col-span-3 flex flex-col items-center gap-3 py-16 text-[#8891A4]">
                        <Icon name="ph:squares-four" class="w-12 h-12 opacity-30" />
                        <p class="text-sm">{{ $t('superadmin.apps.noAppsFound') }}</p>
                    </div>
                </div>

                <!-- LIST VIEW -->
                <div v-else class="bg-white border border-[#EAECF0] rounded-xl overflow-hidden shadow-sm">
                    <div v-if="!filteredApps.length" class="flex flex-col items-center gap-3 py-16 text-[#8891A4]">
                        <Icon name="ph:squares-four" class="w-12 h-12 opacity-30" />
                        <p class="text-sm">{{ $t('superadmin.apps.noAppsFound') }}</p>
                    </div>
                    <table v-else class="w-full">
                        <thead>
                            <tr class="border-b border-[#EAECF0] bg-[#F9FAFB]">
                                <th class="co-th">{{ $t('superadmin.apps.colApp') }}</th>
                                <th class="co-th">{{ $t('superadmin.apps.colPrice') }}</th>
                                <th class="co-th">{{ $t('superadmin.apps.colType') }}</th>
                                <th class="co-th">{{ $t('superadmin.apps.colStatus') }}</th>
                                <th class="co-th">{{ $t('superadmin.apps.colCompanies') }}</th>
                                <th class="co-th"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="app in filteredApps" :key="app.uuid ?? app.id"
                                class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors group">
                                <td class="co-td">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0"
                                            :style="`background:${appColor(app.name)}20`">
                                            <img v-if="app.image" :src="app.image"
                                                class="w-7 h-7 object-contain rounded" />
                                            <Icon v-else :name="appIcon(app.name)" class="w-4 h-4"
                                                :style="`color:${appColor(app.name)}`" />
                                        </div>
                                        <div>
                                            <p class="text-[13px] font-semibold text-[#1F2533]">{{ app.name }}</p>
                                            <p v-if="app.description"
                                                class="text-[11px] text-[#8891A4] truncate max-w-[200px]">{{
                                                    app.description }}</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="co-td">
                                    <div class="space-y-0.5 text-[12px]">
                                        <div v-if="app.one_time_price > 0">
                                            <span class="co-badge co-badge-navy text-[10px] mr-1">
                                                {{ $t('superadmin.apps.oneTime') }}
                                            </span>
                                            <span class="font-medium">
                                                kr. {{ app.one_time_price }}
                                            </span>
                                        </div>
                                        <div v-if="app.monthly_price > 0" class="text-[#5C6478]">
                                            <span class="font-medium text-[#1F2533]">
                                                kr. {{ app.monthly_price }}
                                            </span>
                                            {{ $t('superadmin.apps.perMonth') }}
                                        </div>
                                        <div v-if="app.yearly_price > 0" class="text-[#5C6478]">
                                            <span class="font-medium text-[#1F2533]">
                                                kr. {{ app.yearly_price }}</span>
                                            {{ $t('superadmin.apps.perYear') }}
                                        </div>
                                        <div v-if="!app.monthly_price && !app.yearly_price && !app.one_time_price"
                                            class="text-[#8891A4]">
                                            {{ $t('superadmin.apps.free') }}
                                        </div>
                                    </div>
                                </td>
                                <td class="co-td">
                                    <span class="co-badge co-badge-gray text-[11px]">
                                        {{ app.type ?? 'Other' }}
                                    </span>
                                </td>
                                <td class="co-td">
                                    <span v-if="app.is_active !== false" class="co-badge co-badge-green text-[11px]">
                                        <span class="w-1.5 h-1.5 rounded-full bg-[#2E9E33]"></span>
                                        {{ $t('superadmin.apps.active') }}
                                    </span>
                                    <span v-else class="co-badge co-badge-gray text-[11px]">
                                        {{ $t('superadmin.apps.inactive') }}
                                    </span>
                                </td>
                                <td class="co-td text-[13px] text-[#5C6478]">
                                    {{ app.active_companies ?? 0 }}
                                </td>
                                <td class="co-td">
                                    <div
                                        class="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button class="co-action-btn" @click="openSlider(app)">
                                            <Icon name="ph:pencil-simple" class="w-3.5 h-3.5" />
                                            {{ $t('superadmin.apps.edit') }}
                                        </button>
                                        <button class="co-action-btn !text-[#CC3B2D] hover:!bg-red-50 !border-red-200"
                                            @click="confirmDelete(app)">
                                            <Icon name="ph:trash" class="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <Pagination :data="state.apps" @previous="previous" @next="next" />
            </div>

            <!-- ═══ SLIDE-OVER: NY / REDIGER APP ═══ -->
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
                        class="fixed inset-y-0 right-0 z-50 w-full max-w-[480px] bg-white shadow-2xl flex flex-col">

                        <div class="flex items-start justify-between px-6 py-5 border-b border-[#EAECF0]">
                            <div>
                                <h2 class="text-[16px] font-semibold text-[#1F2533]">
                                    {{
                                        slider.editMode ?
                                            $t('superadmin.apps.sliderEditTitle') :
                                            $t('superadmin.apps.sliderNewTitle')
                                    }}
                                </h2>
                                <p class="text-[12px] text-[#8891A4] mt-0.5">
                                    {{
                                        slider.editMode ?
                                            $t('superadmin.apps.sliderEditSubtitle') :
                                            $t('superadmin.apps.sliderNewSubtitle')
                                    }}
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

                            <!-- Name -->
                            <div>
                                <label class="co-label">
                                    {{ $t('superadmin.apps.labelName') }} <span class="text-red-500">*</span>
                                </label>
                                <input v-model="slider.form.name" type="text"
                                    :placeholder="$t('superadmin.apps.phAppName')" class="co-input"
                                    :class="slider.errors.name ? 'border-red-300' : ''" />
                                <p v-if="slider.errors.name" class="co-error">{{ slider.errors.name }}</p>
                            </div>

                            <!-- Description -->
                            <div>
                                <label class="co-label">
                                    {{ $t('superadmin.apps.labelDescription') }}
                                </label>
                                <textarea v-model="slider.form.description" rows="3"
                                    :placeholder="$t('superadmin.apps.phDescription')"
                                    class="co-input resize-none"></textarea>
                            </div>

                            <!-- Type -->
                            <div>
                                <label class="co-label">
                                    {{ $t('superadmin.apps.labelType') }}
                                </label>
                                <div class="grid grid-cols-2 gap-2">
                                    <button v-for="appType in appTypes" :key="appType.value"
                                        class="py-2.5 px-3 rounded-xl border-2 text-[12px] font-medium transition-colors flex items-center gap-2"
                                        :style="slider.form.type === appType.value ? 'border-color:#42AED9;background:#F0FAFD;color:#205E77' : 'border-color:#EAECF0;background:white;color:#5C6478'"
                                        @click="slider.form.type = appType.value">
                                        <Icon :name="appType.icon" class="w-4 h-4" />
                                        {{ appType.label }}
                                    </button>
                                </div>
                            </div>

                            <!-- Prices -->
                            <div>
                                <p class="text-[10px] font-bold text-[#8891A4] uppercase tracking-[0.08em] mb-3">
                                    {{ $t('superadmin.apps.labelPrices') }}
                                </p>
                                <div class="space-y-3">
                                    <div>
                                        <label class="co-label">
                                            {{ $t('superadmin.apps.labelMonthlyPrice') }}
                                        </label>
                                        <div class="relative">
                                            <input v-model.number="slider.form.monthly_price" type="number" min="0"
                                                placeholder="0" class="co-input pr-8" />
                                            <span
                                                class="absolute right-3 top-1/2 -translate-y-1/2 text-[#8891A4] text-sm">kr</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="co-label">
                                            {{ $t('superadmin.apps.labelYearlyPrice') }}
                                        </label>
                                        <div class="relative">
                                            <input v-model.number="slider.form.yearly_price" type="number" min="0"
                                                placeholder="0" class="co-input pr-8" />
                                            <span
                                                class="absolute right-3 top-1/2 -translate-y-1/2 text-[#8891A4] text-sm">kr</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="co-label">
                                            {{ $t('superadmin.apps.labelOneTimeFee') }}
                                        </label>
                                        <div class="relative">
                                            <input v-model.number="slider.form.one_time_price" type="number" min="0"
                                                placeholder="0" class="co-input pr-8" />
                                            <span
                                                class="absolute right-3 top-1/2 -translate-y-1/2 text-[#8891A4] text-sm">kr</span>
                                        </div>
                                        <p class="text-[11px] text-[#8891A4] mt-1">{{
                                            $t('superadmin.apps.oneTimeFeeHint') }}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Image URL -->
                            <div>
                                <label class="co-label">
                                    {{ $t('superadmin.apps.labelImageUrl') }}
                                    <span class="text-[#8891A4] font-normal">
                                        ({{ $t('superadmin.apps.optional') }})
                                    </span>
                                </label>
                                <input v-model="slider.form.image" type="url" placeholder="https://..."
                                    class="co-input" />
                            </div>

                            <!-- Visible in App Store -->
                            <div class="flex items-center justify-between py-3 px-4 border border-[#EAECF0] rounded-xl">
                                <div>
                                    <p class="text-[13px] font-medium text-[#1F2533]">
                                        {{ $t('superadmin.apps.visibleInAppStore') }}
                                    </p>
                                    <p class="text-[11px] text-[#8891A4] mt-0.5">
                                        {{ $t('superadmin.apps.visibleInAppStoreHint') }}
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

                            <!-- Attach to company -->
                            <div v-if="slider.editMode" class="border border-[#EAECF0] rounded-xl p-4">
                                <p class="text-[13px] font-semibold text-[#1F2533] mb-1">
                                    {{ $t('superadmin.apps.attachToCompany') }}
                                </p>
                                <p class="text-[11px] text-[#8891A4] mb-3">
                                    {{ $t('superadmin.apps.attachToCompanyDesc') }}
                                </p>
                                <div class="relative">
                                    <Icon name="ph:magnifying-glass"
                                        class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8891A4]" />
                                    <input v-model="slider.companySearch" type="text"
                                        :placeholder="$t('superadmin.apps.searchCompany')" class="co-input pl-9"
                                        @input="searchCompanies" />
                                </div>
                                <div v-if="slider.companyResults.length"
                                    class="mt-1 border border-[#EAECF0] rounded-lg bg-white shadow max-h-36 overflow-y-auto">
                                    <button v-for="c in slider.companyResults" :key="c.uuid"
                                        class="w-full text-left px-3 py-2 hover:bg-[#F5F6F8] flex items-center gap-2 text-[13px] transition-colors"
                                        @click="assignToCompany(c)">
                                        <div class="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-white"
                                            :style="`background:${avatarColor(c.name)}`">{{
                                                (c.name || '?').charAt(0).toUpperCase() }}
                                        </div>
                                        {{ c.name }}
                                    </button>
                                </div>
                                <div v-if="slider.assignedCompanies.length" class="mt-2 space-y-1">
                                    <div v-for="c in slider.assignedCompanies" :key="c.uuid"
                                        class="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200 text-[12px]">
                                        <Icon name="ph:check-circle" class="w-3.5 h-3.5 text-green-600" />
                                        <span class="text-green-700 flex-1">
                                            {{ c.name }} — {{ $t('superadmin.apps.assigned') }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="flex items-center gap-3 px-6 py-4 border-t border-[#EAECF0]">
                            <button @click="closeSlider"
                                class="flex-1 py-2.5 rounded-lg text-sm font-medium text-[#5C6478] bg-white border border-[#EAECF0] hover:bg-[#F5F6F8] transition-colors">
                                {{ $t('superadmin.apps.cancel') }}
                            </button>
                            <button @click="saveApp"
                                class="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm"
                                style="background:#205E77" :disabled="slider.isSaving">
                                <span v-if="slider.isSaving" class="flex items-center justify-center gap-2">
                                    <Icon name="ph:spinner" class="w-4 h-4 animate-spin" />
                                    {{ $t('superadmin.apps.saving') }}
                                </span>
                                <span v-else>
                                    {{
                                        slider.editMode ?
                                            $t('superadmin.apps.saveChanges') :
                                            $t('superadmin.apps.createApp')
                                    }}
                                </span>
                            </button>
                        </div>
                    </div>
                </Transition>
            </Teleport>

            <DialogConfirmation :isModalOpen="state.modal.isDeleteOpen"
                :message="$t('superadmin.apps.deleteConfirm', { name: state.selectedApp?.name })"
                @close="state.modal.isDeleteOpen = false" @confirm="deleteApp" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { appService } from '@/components/api/superadmin/AppService'
import { companyService } from '@/components/api/superadmin/CompanyService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

let searchTimeout: any = null
let companySearchTimeout: any = null
let currentTablePage = 1
const searchQuery = ref('')
const activeCategory = ref('all')
const viewMode = ref('grid')

const categories = computed(() => [
    { key: 'all', label: t('superadmin.apps.catAll') },
    { key: 'module', label: t('superadmin.apps.catModules') },
    { key: 'course', label: t('superadmin.apps.catCourses') },
    { key: 'integration', label: t('superadmin.apps.catIntegrations') },
])

const appTypes = computed(() => [
    { value: 'Module', label: t('superadmin.apps.typeModule'), icon: 'ph:squares-four' },
    { value: 'Course', label: t('superadmin.apps.typeCourse'), icon: 'ph:graduation-cap' },
    { value: 'Integration', label: t('superadmin.apps.typeIntegration'), icon: 'ph:plugs-connected' },
    { value: 'Other', label: t('superadmin.apps.typeOther'), icon: 'ph:package' },
])

// App icon + colour mapping
const APP_ICONS: Record<string, string> = {
    'mail': 'ph:envelope', 'booking': 'ph:calendar', 'kursus': 'ph:graduation-cap',
    'leads': 'ph:funnel', 'ai': 'ph:robot', 'chat': 'ph:chat', 'fakturering': 'ph:invoice',
}
const APP_COLORS = ['#205E77', '#2E9E33', '#368F8B', '#1A4D99', '#D4900A', '#9B4D9B', '#CC3B2D']
const appIcon = (name: string) => {
    const key = (name || '').toLowerCase()
    return Object.keys(APP_ICONS).find(k => key.includes(k)) ? APP_ICONS[Object.keys(APP_ICONS).find(k => key.includes(k))!] : 'ph:squares-four'
}
const appColor = (name: string) => APP_COLORS[(name?.charCodeAt(0) ?? 0) % APP_COLORS.length]
const avatarColor = (name: string) => APP_COLORS[(name?.charCodeAt(0) ?? 0) % APP_COLORS.length]

const state = reactive({
    apps: [] as any,
    allApps: [] as any,
    dataFilter: {
        search: '',
    } as any,
    error: {} as Error,
    isLoading: false,
    modal: { isDeleteOpen: false },
    selectedApp: null as any,
})

const slider = reactive({
    open: false,
    editMode: false,
    isSaving: false,
    error: {} as any,
    editingApp: null as any,
    companySearch: '',
    companyResults: [] as any[],
    assignedCompanies: [] as any[],
    form: {
        name: '', description: '', type: 'Module',
        monthly_price: 0, yearly_price: 0, one_time_price: 0,
        image: '', is_active: true,
    },
    errors: { name: '' },
})

const filteredApps = computed(() => {
    let apps = state.allApps?.data ?? []
    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        apps = apps.filter((a: any) => (a.name || '').toLowerCase().includes(q) || (a.description || '').toLowerCase().includes(q))
    }
    if (activeCategory.value !== 'all') {
        const map: Record<string, string[]> = {
            module: ['Module', 'Other'],
            course: ['Course'],
            integration: ['Integration'],
        }
        apps = apps.filter((a: any) => (map[activeCategory.value] ?? []).includes(a.type ?? 'Other'))
    }
    return apps
})

onMounted(() => {
    fetchApps()
})

async function fetchApps() {
    state.isLoading = true
    try {
        const params: any = {
            page: currentTablePage,
        }
        if (state.dataFilter.search) params.search = state.dataFilter.search
        const response = await appService.getApplications(params)
        if (response) {
            state.allApps = response
            state.apps = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function debouncedSearch() {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        const trimmed = searchQuery.value.trim()
        state.dataFilter.search = trimmed.length ? Array(trimmed.split(/\s+/)) : null
        currentTablePage = 1
        fetchApps()
    }, 350)
}

function openSlider(app: any) {
    slider.editMode = !!app
    slider.editingApp = app
    slider.error = {}; slider.errors = { name: '' }
    slider.companySearch = ''; slider.companyResults = []; slider.assignedCompanies = []
    slider.form = app ? {
        name: app.name ?? '', description: app.description ?? '',
        type: app.type ?? 'Module',
        monthly_price: app.monthly_price ?? 0, yearly_price: app.yearly_price ?? 0,
        one_time_price: app.one_time_price ?? app.one_time_fee ?? 0,
        image: app.image ?? '', is_active: app.is_active !== false,
    } : { name: '', description: '', type: 'Module', monthly_price: 0, yearly_price: 0, one_time_price: 0, image: '', is_active: true }
    slider.open = true
    document.body.style.overflow = 'hidden'
}

function closeSlider() {
    slider.open = false
    document.body.style.overflow = ''
}

function searchCompanies() {
    clearTimeout(companySearchTimeout)
    if (!slider.companySearch.trim()) { slider.companyResults = []; return }
    companySearchTimeout = setTimeout(async () => {
        try {
            const r = await companyService.getCompanies({ search: slider.companySearch, page: 1 })
            slider.companyResults = r?.data?.slice(0, 8) ?? []
        } catch (_) { }
    }, 300)
}

async function assignToCompany(company: any) {
    try {
        await appService.assignAppToCompany(slider.editingApp?.uuid ?? slider.editingApp?.id, company.uuid)
        slider.assignedCompanies.push(company)
        slider.companySearch = ''; slider.companyResults = []
        successAlert(
            t('superadmin.apps.successAssigned'),
            t('superadmin.apps.successAssignedBody', { appName: slider.editingApp?.name, companyName: company.name })
        )
    } catch (e: any) { slider.error = e }
}

async function saveApp() {
    if (!slider.form.name) {
        slider.errors.name = t('superadmin.apps.errorNameRequired')
        return
    }
    slider.isSaving = true; slider.error = {}
    try {
        const params = {
            name: slider.form.name,
            description: slider.form.description,
            type: slider.form.type,
            monthly_price: slider.form.monthly_price,
            yearly_price: slider.form.yearly_price,
            one_time_fee: slider.form.one_time_price,
            image: slider.form.image,
            is_active: slider.form.is_active,
        }
        if (slider.editMode && slider.editingApp) {
            await appService.updateApp(slider.editingApp.uuid ?? slider.editingApp.id, params)
            successAlert(
                t('superadmin.apps.successSaved'),
                t('superadmin.apps.successUpdatedBody', { name: slider.form.name })
            )
        } else {
            await appService.saveApp(params)
            successAlert(
                t('superadmin.apps.successCreated'),
                t('superadmin.apps.successCreatedBody', { name: slider.form.name })
            )
        }
        closeSlider()
        fetchApps()
    } catch (error: any) { slider.error = error }
    slider.isSaving = false
}

function confirmDelete(app: any) {
    state.selectedApp = app
    state.modal.isDeleteOpen = true
}

async function deleteApp() {
    try {
        await appService.deleteApp(state.selectedApp?.uuid ?? state.selectedApp?.id)
        successAlert(
            t('superadmin.apps.successDeleted'),
            t('superadmin.apps.successDeletedBody', { name: state.selectedApp?.name })
        )
        fetchApps()
    } catch (error: any) { state.error = error }
}

function previous() {
    currentTablePage--
    fetchApps()
}

function next() {
    currentTablePage++
    fetchApps()
}

onMounted(() => {
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && slider.open) {
            closeSlider()
        }
    })
})
</script>

<style scoped>
.co-th {
    text-align: left;
    padding: 10px 16px;
    font-size: 11px;
    font-weight: 600;
    color: #8891A4;
    text-transform: uppercase;
    letter-spacing: 0.06em
}

.co-td {
    padding: 12px 16px;
    vertical-align: middle
}

.co-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 7px;
    border-radius: 999px;
    font-weight: 600;
    white-space: nowrap
}

.co-badge-green {
    background: #EDF7EE;
    color: #2E9E33
}

.co-badge-navy {
    background: #E4F1F6;
    color: #205E77
}

.co-badge-gray {
    background: #F5F6F8;
    color: #5C6478
}

.co-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    background: #F5F6F8;
    color: #5C6478;
    border: 1px solid #EAECF0;
    transition: all 0.15s;
    cursor: pointer
}

.co-action-btn:hover {
    background: #EEF4FB;
    color: #205E77
}

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
    transition: border-color 0.15s, box-shadow 0.15s
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

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden
}
</style>
