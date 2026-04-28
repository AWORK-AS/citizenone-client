<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.tabs.medicineCard') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks">
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/citizens')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ customPagesStore.getCustomPagesName?.citizens }}
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <template #header>{{ $t('citizens.tabs.medicineCard') }}</template>

            <div class="space-y-4">
                <NuxtLink class="flex items-center gap-x-2 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserCitizenDetailsHeader />
                <ModulesUserCitizenJournalTabs />

                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <!-- STATUS STATS -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button type="button" @click="toggleStatsFilter('overdue')"
                        :class="['rounded-xl border px-4 py-3 flex items-center gap-3 w-full text-left transition-all', state.statsFilter === 'overdue' ? 'border-red-400 bg-red-100 ring-2 ring-red-300' : 'border-red-200 bg-red-50 hover:bg-red-100']">
                        <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                            <Icon name="ph:warning-circle" class="size-4 text-red-600" />
                        </div>
                        <div>
                            <p class="text-2xl font-semibold text-red-700 leading-none">
                                {{ stats.overdue }}
                            </p>
                            <p class="text-xs text-red-500 mt-0.5">
                                {{ $t('citizens.medicineJournals.page.overdue') }}
                            </p>
                        </div>
                    </button>
                    <button type="button" @click="toggleStatsFilter('soon')"
                        :class="['rounded-xl border px-4 py-3 flex items-center gap-3 w-full text-left transition-all', state.statsFilter === 'soon' ? 'border-amber-400 bg-amber-100 ring-2 ring-amber-300' : 'border-amber-200 bg-amber-50 hover:bg-amber-100']">
                        <div class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <Icon name="ph:clock" class="size-4 text-amber-600" />
                        </div>
                        <div>
                            <p class="text-2xl font-semibold text-amber-700 leading-none">
                                {{ stats.dueSoon }}
                            </p>
                            <p class="text-xs text-amber-500 mt-0.5">
                                {{ $t('citizens.medicineJournals.page.dueSoon') }}
                            </p>
                        </div>
                    </button>
                    <button type="button" @click="toggleStatsFilter('given')"
                        :class="['rounded-xl border px-4 py-3 flex items-center gap-3 w-full text-left transition-all', state.statsFilter === 'given' ? 'border-green-400 bg-green-100 ring-2 ring-green-300' : 'border-green-200 bg-green-50 hover:bg-green-100']">
                        <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                            <Icon name="ph:check-circle" class="size-4 text-green-600" />
                        </div>
                        <div>
                            <p class="text-2xl font-semibold text-green-700 leading-none">
                                {{ stats.given }}
                            </p>
                            <p class="text-xs text-green-500 mt-0.5">
                                {{ $t('citizens.medicineJournals.page.givenToday') }}
                            </p>
                        </div>
                    </button>
                    <button type="button" @click="toggleStatsFilter('pending')"
                        :class="['rounded-xl border px-4 py-3 flex items-center gap-3 w-full text-left transition-all', state.statsFilter === 'pending' ? 'border-gray-400 bg-gray-100 ring-2 ring-gray-300' : 'border-gray-200 bg-gray-50 hover:bg-gray-100']">
                        <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                            <Icon name="ph:hourglass" class="size-4 text-gray-500" />
                        </div>
                        <div>
                            <p class="text-2xl font-semibold text-gray-700 leading-none">
                                {{ stats.pending }}
                            </p>
                            <p class="text-xs text-gray-500 mt-0.5">
                                {{ $t('citizens.medicineJournals.page.pending') }}
                            </p>
                        </div>
                    </button>
                </div>

                <!-- ALARM BANNERS -->
                <div class="space-y-2" v-if="alarmBanners.length > 0">
                    <div v-for="alarm in alarmBanners" :key="alarm.uuid"
                        :class="['rounded-xl border px-4 py-3 flex items-start gap-3', alarm.type === 'overdue' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200']">
                        <div
                            :class="['w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5', alarm.type === 'overdue' ? 'bg-red-100' : 'bg-amber-100']">
                            <Icon name="ph:warning-circle"
                                :class="alarm.type === 'overdue' ? 'text-red-600' : 'text-amber-600'" class="size-4" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <p
                                :class="['text-sm font-medium', alarm.type === 'overdue' ? 'text-red-800' : 'text-amber-800']">
                                {{
                                    alarm.type === 'overdue' ? $t('citizens.medicineJournals.page.overdueLabel') :
                                        $t('citizens.medicineJournals.page.dueSoonLabel')
                                }}
                                {{ alarm.medicineName }} — {{ $t('citizens.medicineJournals.page.scheduledAt') }}
                                {{ alarm.time }}
                            </p>
                            <p
                                :class="['text-xs mt-0.5', alarm.type === 'overdue' ? 'text-red-600' : 'text-amber-600']">
                                {{ alarm.message }}
                            </p>
                        </div>
                        <button v-if="alarm.type === 'overdue'"
                            class="shrink-0 text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors"
                            @click="quickGive(alarm)">
                            {{ $t('citizens.medicineJournals.page.giveNow') }}
                        </button>
                    </div>
                </div>


                <!-- ACTIVE STATS FILTER BANNER -->
                <div v-if="state.statsFilter"
                    class="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg">
                    <Icon name="ph:funnel" class="size-4 text-primary" />
                    <span class="text-sm text-primary">
                        {{ $t('citizens.medicineJournals.page.filtering') }}
                        <span v-if="state.statsFilter === 'overdue'" class="font-medium">
                            {{ $t('citizens.medicineJournals.page.overdue') }} ({{ stats.overdue }})
                        </span>
                        <span v-if="state.statsFilter === 'soon'" class="font-medium">
                            {{ $t('citizens.medicineJournals.page.dueSoon') }} ({{ stats.dueSoon }})
                        </span>
                        <span v-if="state.statsFilter === 'given'" class="font-medium">
                            {{ $t('citizens.medicineJournals.page.givenToday') }} ({{ stats.given }})
                        </span>
                        <span v-if="state.statsFilter === 'pending'" class="font-medium">
                            {{ $t('citizens.medicineJournals.page.pending') }} ({{ stats.pending }})
                        </span>
                    </span>
                    <button @click="state.statsFilter = null"
                        class="ml-auto text-xs text-primary hover:text-primary/70 flex items-center gap-1">
                        <Icon name="ph:x" class="size-3" /> {{ $t('citizens.medicineJournals.page.clearFilter') }}
                    </button>
                </div>

                <!-- TOOLBAR -->
                <div class="flex flex-col-reverse md:flex-row justify-between gap-3">
                    <div class="flex items-center gap-2 flex-wrap">
                        <div class="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
                            <button v-for="mode in viewModes" :key="mode.key" @click="state.viewMode = mode.key"
                                :class="['flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all', state.viewMode === mode.key ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700']">
                                <Icon :name="mode.icon" class="size-4" />
                                {{ mode.label }}
                            </button>
                        </div>
                        <div v-if="state.viewMode === 'week'" class="flex items-center gap-1">
                            <button @click="navigateDate(-1)" class="p-1.5 rounded-lg hover:bg-gray-100">
                                <Icon name="ph:caret-left" class="size-4 text-gray-500" />
                            </button>
                            <span class="text-sm font-medium text-gray-700 min-w-40 text-center">
                                {{ currentPeriodLabel }}
                            </span>
                            <button @click="navigateDate(1)" class="p-1.5 rounded-lg hover:bg-gray-100">
                                <Icon name="ph:caret-right" class="size-4 text-gray-500" />
                            </button>
                            <button @click="goToToday"
                                class="text-xs text-primary border border-primary/30 px-2 py-1 rounded-md hover:bg-primary/5">
                                {{ $t('citizens.medicineJournals.page.today') }}
                            </button>
                        </div>
                        <button class="flex items-center gap-x-1 text-sm text-primary group"
                            @click="state.modal.isFilterMedicineOpen = true">
                            <Icon name="ic:outline-filter-list" class="w-5 h-5" />
                            <span>{{ $t('filter') }}</span>
                        </button>
                    </div>
                    <div class="flex items-center gap-2 justify-end flex-wrap">
                        <FormButton buttonStyle="action" class="rounded-md"
                            @click="navigateToExternalLink('https://fmk-online.dk/fmk')">
                            <Icon name="mdi:cloud-refresh-outline" class="h-4 w-4" />
                            {{ $t('citizens.medicineJournals.synchronizeWithFMK') }}
                        </FormButton>
                        <!-- <FormButton buttonStyle="action" class="rounded-md" @click="state.modal.isAnbrudOpen = true">
                            <Icon name="ph:drop" class="h-4 w-4" />
                            {{ $t('citizens.medicineJournals.page.newPackageOpening') }}
                        </FormButton> -->
                        <FormButton buttonStyle="action" class="rounded-md"
                            @click="state.modal.isAddMedicineOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" />
                            {{ $t('citizens.medicineJournals.newMedicine') }}
                        </FormButton>
                        <FormButton buttonStyle="action" class="rounded-md"
                            @click="state.modal.isDownloadMedicineOverviewOpen = true">
                            <Icon name="ph:download" class="h-4 w-4" />
                            {{ $t('citizens.medicineJournals.downloadOverview') }}
                        </FormButton>
                    </div>
                </div>
                <div>
                    <div class="flex items-center gap-x-1 text-sm text-gray-600">
                        <span>{{ $t('entriesPerPage') }}:</span>
                        <select class="focus:outline-none bg-transparent" @change="changePageLength">
                            <option v-for="(pageLength, pageLengthIndex) in [10, 20, 30, 40, 50, 100, 500]"
                                :key="pageLengthIndex" :value="pageLength"
                                :selected="state.currentPageLength === pageLength">
                                {{ pageLength }}
                            </option>
                        </select>
                    </div>
                </div>

                <TableSearch @search="handleSearch" />

                <!-- Bulk give -->
                <div v-if="citizenMedicineStore.getSelectedMedicines?.length > 0"
                    class="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                    <Icon name="ph:check-square" class="size-5 text-primary" />
                    <span class="text-sm text-primary font-medium">
                        {{ $t('citizens.medicineJournals.page.medicinesSelected', {
                            n: citizenMedicineStore.getSelectedMedicines.length
                        })
                        }}
                    </span>
                    <FormButton buttonStyle="action" class="rounded-md ml-auto"
                        @click="state.modal.isGiveMedicinesOpen = true">
                        <Icon name="ph:plus" class="h-4 w-4" />
                        {{ $t('citizens.medicineJournals.history.giveAllMedicines') }}
                    </FormButton>
                </div>

                <!-- DAY VIEW -->
                <div v-if="state.viewMode === 'day'" class="space-y-4">
                    <div v-if="state.isTableLoading" class="flex justify-center py-16">
                        <Icon name="ph:spinner" class="size-8 text-primary animate-spin" />
                    </div>
                    <div v-else-if="!allMedicines.length"
                        class="border-2 border-gray-200 border-dashed rounded-xl flex flex-col items-center justify-center min-h-48 gap-3">
                        <Icon name="ph:pill" class="size-10 text-gray-300" />
                        <p class="text-sm text-gray-400">
                            {{ $t('citizens.medicineJournals.page.noActiveMedicines') }}
                        </p>
                        <FormButton buttonStyle="action" class="rounded-md"
                            @click="state.modal.isAddMedicineOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" />
                            {{ $t('citizens.medicineJournals.page.addMedicine') }}
                        </FormButton>
                    </div>

                    <div v-else class="rounded-xl border border-gray-200 overflow-hidden">
                        <div class="flex items-center justify-between px-5 py-3 bg-primary text-white">
                            <div class="flex items-center gap-3">
                                <Icon name="ph:calendar" class="size-4 opacity-80" />
                                <span class="font-semibold text-sm capitalize">
                                    {{ todayLabel }}
                                </span>
                                <span class="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">
                                    {{ $t('citizens.medicineJournals.page.today') }}
                                </span>
                            </div>
                            <div class="flex items-center gap-3 text-xs opacity-80">
                                <span v-if="stats.overdue > 0" class="flex items-center gap-1">
                                    <span class="w-2 h-2 rounded-full bg-red-400 inline-block"></span>
                                    {{ $t('citizens.medicineJournals.page.overdueCountText', { n: stats.overdue }) }}
                                </span>
                                <span v-if="stats.given > 0" class="flex items-center gap-1">
                                    <span class="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
                                    {{ $t('citizens.medicineJournals.page.givenCountText', { n: stats.given }) }}
                                </span>
                                <span v-if="stats.pending > 0" class="flex items-center gap-1">
                                    <span class="w-2 h-2 rounded-full bg-gray-300 inline-block"></span>
                                    {{ $t('citizens.medicineJournals.page.pendingCountText', { n: stats.pending }) }}
                                </span>
                            </div>
                        </div>

                        <div v-if="regularMedicines.length > 0">
                            <div v-if="timeColumns.length > 0" class="bg-gray-50 border-b border-gray-200"
                                :style="gridStyle(timeColumns.length)">
                                <div class="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    {{ $t('citizens.medicineJournals.table.medicine') }}
                                </div>
                                <div v-for="time in timeColumns" :key="time"
                                    class="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide border-l border-gray-200">
                                    {{ time }}
                                </div>
                            </div>

                            <div v-for="(medicine, medicineIndex) in filteredRegularMedicines" :key="medicine.uuid"
                                :class="['border-b border-gray-100 last:border-b-0', (medicineIndex as number) % 2 === 1 ? 'bg-gray-50/50' : 'bg-white', medicine.is_deactivated ? 'opacity-40' : '']"
                                :style="gridStyle(timeColumns.length)">

                                <div class="px-4 py-3 flex items-start gap-3">
                                    <FormCheckbox :id="`m_${medicine.uuid}`"
                                        :value="citizenMedicineStore.getSelectedMedicines?.includes(medicine.uuid)"
                                        @click="addRemoveMedicine(medicine)" class="mt-0.5 shrink-0" />
                                    <div class="min-w-0 flex-1">
                                        <p class="text-sm font-medium text-gray-900 truncate">
                                            {{
                                                language.locale.value === 'en' ?
                                                    medicine?.medicine?.en_name :
                                                    medicine?.medicine?.dk_name
                                            }}
                                        </p>
                                        <p class="text-xs text-gray-500">
                                            {{ medicine?.medicine?.ingredients }}
                                            <span v-if="medicine?.strength"> ·
                                                {{ medicine?.strength }}
                                                ·
                                                {{
                                                    medicine?.mass_unit?.name ? ' ' + medicine.mass_unit.name : ''
                                                }}
                                            </span>
                                        </p>
                                        <p class="text-xs text-gray-500">
                                            {{ $t('citizens.medicineJournals.form.maxDailyDose') }}:
                                            {{ medicine?.max_daily_dose }}
                                        </p>
                                        <p class="text-xs text-gray-500">
                                            {{ medicine?.description }}
                                        </p>
                                        <div class="flex gap-1 flex-wrap mt-1">
                                            <Tooltip v-if="medicine?.is_expired"
                                                :text="$t('citizens.medicineJournals.page.expiredCheckDate')">
                                                <span
                                                    class="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 border border-red-200 px-1.5 py-0.5 rounded font-medium">
                                                    <Icon name="ph:warning-circle" class="size-3" />
                                                    {{ t('citizens.medicineJournals.page.expired') }}
                                                </span>
                                            </Tooltip>
                                            <Tooltip
                                                v-if="medicine?.current_stocks !== null && medicine?.current_stocks <= 5 && medicine?.current_stocks >= 0"
                                                :text="$t('citizens.medicineJournals.page.lowStockOnly', { n: medicine?.current_stocks })">
                                                <span
                                                    class="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-medium">
                                                    <Icon name="ph:warning" class="size-3" />
                                                    {{ $t('citizens.medicineJournals.page.lowStock') }}
                                                </span>
                                            </Tooltip>
                                        </div>
                                        <!-- Dosage per time slot -->
                                        <div v-if="medicine?.dosage_status_by_date?.[todayStr]?.length"
                                            class="flex gap-1 flex-wrap mt-1.5">
                                            <span v-for="d in medicine.dosage_status_by_date[todayStr]" :key="d.time"
                                                class="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-semibold">
                                                <Icon name="ph:pill" class="size-3" />
                                                {{ d.dosage }}
                                                <span class="font-normal opacity-70">@ {{ d.time }}</span>
                                            </span>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-0.5 shrink-0">
                                        <Tooltip :text="$t('citizens.medicineJournals.table.actions.view')">
                                            <button type="button"
                                                class="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                                                @click="viewMedicine(medicine)">
                                                <Icon name="ph:eye" class="size-4" />
                                            </button>
                                        </Tooltip>
                                        <Tooltip :text="$t('citizens.medicineJournals.table.actions.medicineHistory')">
                                            <button type="button"
                                                class="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                                                @click="viewMedicineHistory(medicine)">
                                                <Icon name="ph:files" class="size-4" />
                                            </button>
                                        </Tooltip>
                                        <Tooltip v-if="medicine?.is_editable"
                                            :text="$t('citizens.medicineJournals.table.actions.edit')">
                                            <button type="button"
                                                class="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                                                @click="editMedicine(medicine)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                            </button>
                                        </Tooltip>
                                        <Tooltip v-if="!medicine?.is_deactivated"
                                            :text="$t('citizens.medicineJournals.table.actions.deactivate')">
                                            <button type="button"
                                                class="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                                                @click="confirmMedicineDeactivation(medicine)">
                                                <Icon name="ph:x" class="size-4" />
                                            </button>
                                        </Tooltip>
                                        <Tooltip v-else :text="$t('citizens.medicineJournals.table.actions.activate')">
                                            <button type="button"
                                                class="p-1.5 rounded hover:bg-green-50 text-gray-400 hover:text-green-600"
                                                @click="confirmMedicineActivation(medicine)">
                                                <Icon name="ph:check" class="size-4" />
                                            </button>
                                        </Tooltip>
                                    </div>
                                </div>

                                <div v-for="time in timeColumns" :key="time"
                                    class="border-l border-gray-100 px-2 py-3 flex flex-col items-center justify-center gap-1">
                                    <template v-if="getDosageForTime(medicine, time)">
                                        <Tooltip :text="getSlotTooltip(getDosageForTime(medicine, time), time)"
                                            position="left">
                                            <button type="button"
                                                @click="openGiveMedicine(medicine, getDosageForTime(medicine, time))"
                                                :class="['inline-flex flex-col items-center gap-0.5 text-xs px-2.5 py-2 rounded-lg font-medium border min-w-16', getSlotClass(getDosageForTime(medicine, time), time)]">
                                                <Icon :name="getSlotIcon(getDosageForTime(medicine, time))"
                                                    class="size-3.5" />
                                                <span>
                                                    {{ getDosageForTime(medicine, time)?.dosage ?? '' }}
                                                </span>
                                            </button>
                                        </Tooltip>
                                        <span class="text-xs text-center"
                                            :class="getSlotTimeClass(getDosageForTime(medicine, time), time)">
                                            {{ getSlotTimeLabel(getDosageForTime(medicine, time), time) }}
                                        </span>
                                    </template>
                                    <template v-else>
                                        <span class="text-gray-200 text-xl">—</span>
                                    </template>
                                </div>
                            </div>
                        </div>

                        <!-- PN section -->
                        <div v-if="pnMedicines.length > 0" class="border-t border-dashed border-gray-200">
                            <button type="button"
                                class="w-full flex items-center justify-between px-5 py-2.5 bg-gray-50 hover:bg-gray-100 text-sm"
                                @click="state.pnExpanded = !state.pnExpanded">
                                <div class="flex items-center gap-2 text-gray-500 font-medium">
                                    <Icon name="ph:clock-countdown" class="size-4" />
                                    {{ $t('citizens.medicineJournals.page.pnMedicineAsNeeded') }} —
                                    {{ pnMedicines.length }}
                                    {{ $t('citizens.medicineJournals.table.medicine').toLowerCase() }}
                                </div>
                                <Icon :name="state.pnExpanded ? 'ph:caret-up' : 'ph:caret-down'"
                                    class="size-4 text-gray-400" />
                            </button>
                            <div v-if="state.pnExpanded">
                                <div v-for="medicine in pnMedicines" :key="medicine.uuid"
                                    class="flex items-center gap-4 px-5 py-3 border-t border-gray-100 hover:bg-gray-50/50">
                                    <FormCheckbox :id="`pn_${medicine.uuid}`"
                                        :value="citizenMedicineStore.getSelectedMedicines?.includes(medicine.uuid)"
                                        @click="addRemoveMedicine(medicine)" />
                                    <div class="flex-1 min-w-0">
                                        <p class="text-sm font-medium text-gray-900">
                                            {{
                                                language.locale.value === 'en' ?
                                                    medicine?.medicine?.en_name :
                                                    medicine?.medicine?.dk_name
                                            }}
                                        </p>
                                        <p class="text-xs text-gray-500">
                                            {{ medicine?.medicine?.ingredients }}
                                            <span v-if="medicine?.strength">
                                                · {{ medicine?.strength }}
                                                {{
                                                    medicine?.mass_unit?.name ?
                                                        ' · ' + medicine.mass_unit.name : ''
                                                }}
                                            </span>
                                        </p>
                                        <p class="text-xs text-gray-500">
                                            {{ $t('citizens.medicineJournals.form.maxDailyDose') }}:
                                            {{ medicine?.max_daily_dose }}
                                        </p>
                                        <p class="text-xs text-gray-500">
                                            {{ medicine?.description }}
                                        </p>
                                        <!-- Dosage for PN -->
                                        <div v-if="medicine?.dosage_status_by_date?.[todayStr]?.length"
                                            class="flex gap-1 flex-wrap mt-1">
                                            <span v-for="d in medicine.dosage_status_by_date[todayStr]"
                                                :key="d.time ?? 'pn'"
                                                class="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-semibold">
                                                <Icon name="ph:pill" class="size-3" />
                                                {{ d.dosage }}
                                            </span>
                                        </div>
                                    </div>
                                    <Badge type="primary" class="shrink-0">
                                        <p class="text-xxs">PN</p>
                                    </Badge>
                                    <Tooltip
                                        v-if="medicine?.last_given_minutes_ago !== null && medicine?.last_given_minutes_ago < 240"
                                        :text="$t('citizens.medicineJournals.page.lastGivenHoursAgo', { hours: Math.round(medicine.last_given_minutes_ago / 60 * 10) / 10, remaining: Math.round((240 - medicine.last_given_minutes_ago) / 60 * 10) / 10 })">
                                        <span
                                            class="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-lg font-medium">
                                            <Icon name="ph:warning" class="size-3" />
                                            {{
                                                $t('citizens.medicineJournals.page.hoursLeft',
                                                    {
                                                        hours: Math.round((240 -
                                                            medicine.last_given_minutes_ago) / 60 * 10) / 10
                                                    })
                                            }}
                                        </span>
                                    </Tooltip>
                                    <FormButton buttonStyle="action" class="rounded-md text-xs shrink-0"
                                        @click="givePNMedicine(medicine)">
                                        <Icon name="ph:plus" class="size-3" />
                                        {{ $t('citizens.medicineJournals.page.givePN') }}
                                    </FormButton>
                                    <button type="button"
                                        class="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                                        @click="viewMedicineHistory(medicine)">
                                        <Icon name="ph:files" class="size-4" />
                                    </button>
                                    <button v-if="medicine?.is_editable" type="button"
                                        class="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                                        @click="editMedicine(medicine)">
                                        <Icon name="ph:pencil-simple" class="size-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Pagination :data="state.medicines" @previous="previous" @next="next" />
                </div>

                <!-- WEEK VIEW -->
                <div v-if="state.viewMode === 'week'" class="rounded-xl border border-gray-200 overflow-hidden">
                    <div v-if="state.isTableLoading" class="flex justify-center py-16">
                        <Icon name="ph:spinner" class="size-8 text-primary animate-spin" />
                    </div>
                    <div v-else>
                        <div class="bg-primary text-white px-5 py-3 flex items-center justify-between">
                            <span class="font-semibold text-sm">
                                {{ currentPeriodLabel }}
                            </span>
                            <div class="flex items-center gap-4 text-xs opacity-80">
                                <span class="flex items-center gap-1.5">
                                    <span class="w-2.5 h-2.5 rounded-sm bg-green-400 inline-block"></span>
                                    {{ $t('citizens.medicineJournals.page.givenLegend') }}
                                </span>
                                <span class="flex items-center gap-1.5">
                                    <span class="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block"></span>
                                    {{ $t('citizens.medicineJournals.page.overdueDeviation') }}
                                </span>
                                <span class="flex items-center gap-1.5">
                                    <span class="w-2.5 h-2.5 rounded-sm bg-gray-300 inline-block"></span>
                                    {{ $t('citizens.medicineJournals.page.pendingLegend') }}
                                </span>
                            </div>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full border-collapse" style="min-width: 600px;">
                                <thead>
                                    <tr>
                                        <th
                                            class="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-200 w-40">
                                            {{ $t('citizens.medicineJournals.table.medicine') }}
                                        </th>
                                        <th v-for="day in weekDays" :key="day.dateStr"
                                            :class="['px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wide bg-gray-50 border-b border-l border-gray-200', day.isToday ? 'bg-primary/10 text-primary' : 'text-gray-500']">
                                            <div>
                                                {{ day.dayShort }}
                                            </div>
                                            <div
                                                :class="['text-sm font-medium mt-0.5', day.isToday ? 'text-primary' : 'text-gray-700']">
                                                {{ day.dayNum }}
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="medicine in regularMedicines" :key="medicine.uuid"
                                        class="border-b border-gray-100 last:border-b-0">
                                        <td class="px-4 py-3 text-xs font-medium text-gray-900 border-r border-gray-100"
                                            width="15%">
                                            <p class="truncate max-w-36">
                                                {{
                                                    language.locale.value === 'en' ?
                                                        medicine?.medicine?.en_name :
                                                        medicine?.medicine?.dk_name
                                                }}
                                            </p>
                                            <p class="text-xxs text-gray-400">
                                                {{ medicine?.medicine?.ingredients }}
                                                <span v-if="medicine?.strength"> ·
                                                    {{ medicine?.strength }}
                                                    ·
                                                    {{
                                                        medicine?.mass_unit?.name ? ' ' + medicine.mass_unit.name : ''
                                                    }}
                                                </span>
                                            </p>
                                            <p class="text-xxs text-gray-400">
                                                {{ $t('citizens.medicineJournals.form.maxDailyDose') }}:
                                                {{ medicine?.max_daily_dose }}
                                            </p>
                                            <div v-if="medicine?.dosage_status_by_date?.[todayStr]?.length"
                                                class="flex gap-1 flex-wrap mt-1.5">
                                                <span v-for="d in medicine.dosage_status_by_date[todayStr]"
                                                    :key="d.time"
                                                    class="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-semibold">
                                                    <Icon name="ph:pill" class="size-3" />
                                                    {{ d.dosage }}
                                                    <span class="font-normal opacity-70">@ {{ d.time }}</span>
                                                </span>
                                            </div>
                                        </td>
                                        <td v-for="day in weekDays" :key="day.dateStr"
                                            :class="['px-1 py-2 border-l border-gray-100 align-top', day.isToday ? 'bg-primary/5' : '']">
                                            <div v-for="dosage in getWeekDosagesForDay(medicine, day)"
                                                :key="dosage.time" :class="[
                                                    getWeekSlotClass(dosage, day),
                                                    'text-xs px-1.5 py-1 rounded mb-1 text-center cursor-pointer leading-tight'
                                                ]" @click="openGiveMedicineOnDate(medicine, dosage, day)">
                                                <div v-if="dosage.dosage" class="font-bold">{{ dosage.dosage }}</div>
                                                <div>{{ dosage.time }}</div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr v-if="!regularMedicines.length">
                                        <td :colspan="8" class="py-10 text-center text-sm text-gray-400">
                                            {{ $t('citizens.medicineJournals.page.noScheduledMedicines') }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>


                <!-- MONTH VIEW -->
                <div v-if="state.viewMode === 'month'" class="rounded-xl border border-gray-200 overflow-hidden">
                    <div v-if="state.isTableLoading" class="flex justify-center py-16">
                        <Icon name="ph:spinner" class="size-8 text-primary animate-spin" />
                    </div>
                    <div v-else>
                        <div class="bg-primary text-white px-5 py-3 flex items-center justify-between">
                            <span class="font-semibold text-sm capitalize">
                                {{ currentMonthLabel }}
                            </span>
                            <div class="flex items-center gap-2">
                                <button @click="navigateDate(-1)" class="p-1 rounded hover:bg-white/20">
                                    <Icon name="ph:caret-left" class="size-4" />
                                </button>
                                <button @click="goToToday"
                                    class="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30">
                                    {{ $t('citizens.medicineJournals.page.today') }}
                                </button>
                                <button @click="navigateDate(1)" class="p-1 rounded hover:bg-white/20">
                                    <Icon name="ph:caret-right" class="size-4" />
                                </button>
                            </div>
                        </div>
                        <!-- Day headers -->
                        <div class="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                            <div v-for="(day, dayIndex) in weekDayHeaders" :key="dayIndex"
                                class="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                {{ day }}
                            </div>
                        </div>
                        <!-- Calendar grid -->
                        <div class="grid grid-cols-7">
                            <div v-for="(day, idx) in monthDays" :key="idx" :class="[
                                'min-h-20 p-1 border-r border-b border-gray-100 last:border-r-0',
                                day.isCurrentMonth ? 'bg-white' : 'bg-gray-50',
                                day.isToday ? 'bg-primary/5' : ''
                            ]">
                                <div :class="[
                                    'text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1',
                                    day.isToday ? 'bg-primary text-white' : day.isCurrentMonth ? 'text-gray-700' : 'text-gray-300'
                                ]">
                                    {{ day.dayNum }}
                                </div>
                                <div v-if="day.isCurrentMonth">
                                    <div v-for="medicine in regularMedicines" :key="medicine.uuid">
                                        <div v-for="dosage in getMonthDosagesForDay(medicine, day.dateStr)"
                                            :key="dosage.time"
                                            :class="['mb-0.5 rounded-md overflow-hidden border cursor-pointer', getMonthSlotBorderClass(dosage.status, dosage.time, day.dateStr)]"
                                            @click="openGiveMedicineOnDate(medicine, dosage, day)">
                                            <div :class="['px-2 py-1', getMonthSlotBgClass(dosage.status, dosage.time, day.dateStr)]"
                                                style="font-size:10px;line-height:1.4">
                                                <p class="font-medium">
                                                    {{
                                                        language.locale.value === 'en' ?
                                                            medicine?.medicine?.en_name :
                                                            medicine?.medicine?.dk_name
                                                    }}
                                                </p>
                                                <p class="text-gray-500">
                                                    {{ medicine?.medicine?.ingredients }}
                                                    <span v-if="medicine?.strength"> ·
                                                        {{ medicine?.strength }}
                                                        ·
                                                        {{
                                                            medicine?.mass_unit?.name ? ' ' + medicine.mass_unit.name : ''
                                                        }}
                                                    </span>
                                                </p>
                                                <p>
                                                    <span v-if="dosage.dosage">
                                                        <span class="font-semibold">
                                                            {{ dosage.dosage }}
                                                        </span>
                                                        @ {{ dosage.time }}
                                                    </span>
                                                    <span v-else class="opacity-70">
                                                        {{ dosage.time }}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- LIST VIEW -->
                <div v-if="state.viewMode === 'list'" class="space-y-4">
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.medicines"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || state.medicines?.data?.length === 0)">
                                <tr v-for="(medicine, index) in state.medicines?.data" :key="index">
                                    <td width="30%">
                                        <div class="flex gap-3 items-center">
                                            <FormCheckbox :id="`ml_${medicine.uuid}`"
                                                :value="citizenMedicineStore.getSelectedMedicines?.includes(medicine.uuid)"
                                                @click="addRemoveMedicine(medicine)" class="shrink-0" />
                                            <!-- Medicine image / placeholder -->
                                            <Tooltip
                                                :text="$t('citizens.medicineJournals.page.changeImageViaCatalogue')">
                                                <div class="shrink-0 relative group">
                                                    <img v-if="medicine?.medicine?.image_url"
                                                        :src="medicine.medicine.image_url" alt=""
                                                        class="w-14 h-14 rounded-xl object-cover border border-gray-200">
                                                    <div v-else
                                                        class="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                                        <Icon name="ph:pill-duotone" class="size-7 text-primary/50" />
                                                    </div>
                                                    <div
                                                        class="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                                                        <Icon name="ph:camera"
                                                            class="size-4 text-white opacity-0 group-hover:opacity-100 transition-all" />
                                                    </div>
                                                </div>
                                            </Tooltip>
                                            <!-- Medicine info -->
                                            <div class="min-w-0">
                                                <p class="text-sm font-semibold text-gray-900 truncate">
                                                    {{
                                                        language.locale.value === 'en' ?
                                                            medicine?.medicine?.en_name :
                                                            medicine?.medicine?.dk_name
                                                    }}
                                                </p>
                                                <p class="text-xs text-gray-400 truncate mt-0.5">
                                                    {{ medicine?.medicine?.ingredients }}
                                                    {{
                                                        medicine?.strength ? ' · ' + medicine.strength +
                                                            (medicine?.mass_unit?.name ? ' · ' +
                                                                medicine.mass_unit.name : '') : ''
                                                    }}
                                                </p>
                                                <div class="flex gap-1 flex-wrap mt-1">
                                                    <Badge v-if="medicine.is_pn_medicine" type="primary" class="w-fit">
                                                        <p class="text-xxs">PN</p>
                                                    </Badge>
                                                    <Tooltip v-if="medicine?.is_expired"
                                                        :text="$t('citizens.medicineJournals.page.expired')">
                                                        <span
                                                            class="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                                                            <Icon name="ph:warning-circle" class="size-3" />
                                                            {{ $t('citizens.medicineJournals.page.expired') }}
                                                        </span>
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td width="8%">
                                        {{ medicine?.strength }}
                                        {{ medicine?.mass_unit?.name ? ' ' + medicine.mass_unit.name : '' }}
                                    </td>
                                    <td width="8%">
                                        {{ medicine?.max_daily_dose }}
                                    </td>
                                    <td width="28%">
                                        <p class="text-sm">
                                            {{ medicine?.dosage?.name ?? medicine?.dosage?.dk_name }}
                                        </p>
                                        <p class="text-xs text-gray-500">
                                            {{ formatScheduleFrequency(medicine) }}
                                        </p>
                                        <div class="mt-1 flex flex-wrap gap-1" v-if="!medicine.is_pn_medicine">
                                            <Tooltip
                                                v-for="(dosage, dosageIndex) in medicine?.dosage_status_by_date?.[todayStr]"
                                                :key="dosageIndex" :text="getStatusLabel(dosage?.status)">
                                                <span :class="[
                                                    getStatusBg(dosage?.status),
                                                    'flex items-center gap-1 px-1.5 py-0.5 text-white rounded-full text-xs'
                                                ]">
                                                    <Icon name="ph:pill" class="size-3" />
                                                    {{ dosage?.dosage }} @ {{ dosage?.time }}
                                                </span>
                                            </Tooltip>
                                        </div>
                                    </td>
                                    <td width="8%">
                                        <div class="flex items-center gap-1">
                                            <span>
                                                {{ medicine?.current_stocks }}
                                            </span>
                                            <Tooltip
                                                v-if="medicine?.current_stocks !== null && medicine?.current_stocks <= 5"
                                                :text="$t('citizens.medicineJournals.page.lowStock')">
                                                <Icon name="ph:warning" class="size-4 text-amber-500" />
                                            </Tooltip>
                                        </div>
                                    </td>
                                    <td width="18%">
                                        <div class="flex items-end justify-end gap-1.5 flex-wrap">
                                            <Tooltip :text="$t('citizens.medicineJournals.table.actions.view')"
                                                position="left">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="viewMedicine(medicine)">
                                                    <Icon name="ph:eye" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('citizens.medicineJournals.table.actions.giveMedicine')"
                                                position="left">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="giveMedicine(medicine)">
                                                    <Icon name="ph:plus" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip
                                                :text="$t('citizens.medicineJournals.table.actions.medicineHistory')"
                                                position="left">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="viewMedicineHistory(medicine)">
                                                    <Icon name="ph:files" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip v-if="medicine?.is_editable"
                                                :text="$t('citizens.medicineJournals.table.actions.edit')"
                                                position="left">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="editMedicine(medicine)">
                                                    <Icon name="ph:pencil-simple" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip v-if="medicine?.is_deactivated"
                                                :text="$t('citizens.medicineJournals.table.actions.activate')"
                                                position="left">
                                                <FormButton type="button" buttonStyle="primary" class="rounded-md"
                                                    @click="confirmMedicineActivation(medicine)">
                                                    <Icon name="ph:check" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip v-else
                                                :text="$t('citizens.medicineJournals.table.actions.deactivate')"
                                                position="left">
                                                <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                    @click="confirmMedicineDeactivation(medicine)">
                                                    <Icon name="ph:x" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.medicines" @previous="previous" @next="next" />
                </div>

                <!-- MODALS -->
                <ModulesUserCitizenMedicineModalFilter :isModalOpen="state.modal.isFilterMedicineOpen"
                    @close="state.modal.isFilterMedicineOpen = false" @setFilter="setFilter" />
                <ModulesUserCitizenMedicineModalView :isModalOpen="state.modal.isViewMedicineOpen"
                    :selectedMedicine="state.selectedMedicine" @close="closeViewMedicineModal"
                    @refreshMedicines="fetchCitizenMedicines" />
                <ModulesUserCitizenMedicineModalNew :isModalOpen="state.modal.isAddMedicineOpen"
                    @close="state.modal.isAddMedicineOpen = false" @refreshMedicines="fetchCitizenMedicines" />
                <ModulesUserCitizenMedicineModalEdit :isModalOpen="state.modal.isEditMedicineOpen"
                    :selectedMedicine="state.selectedMedicine" @close="closeEditMedicineModal"
                    @refreshMedicines="fetchCitizenMedicines" />
                <ModulesUserCitizenMedicineHistoryModalNew :isModalOpen="state.modal.isGivePNMedicineOpen"
                    :selectedMedicine="state.selectedMedicine" @close="state.modal.isGivePNMedicineOpen = false"
                    @refreshMedicines="fetchCitizenMedicines" />
                <ModulesUserCitizenMedicineModalGiveMedicine :isModalOpen="state.modal.isGiveMedicineOpen"
                    :selectedMedicine="state.selectedMedicine" :preselectedDate="state.preselectedDate ?? undefined"
                    :preselectedTime="state.preselectedTime ?? undefined" @close="closeGiveMedicineModal"
                    @refreshMedicines="fetchCitizenMedicines()" />
                <ModulesUserCitizenMedicineHistoryModalGiveMultipleMedicine
                    :isModalOpen="state.modal.isGiveMedicinesOpen" @close="state.modal.isGiveMedicinesOpen = false"
                    @refreshMedicines="() => { state.historyCache = {}; fetchCitizenMedicines() }" />
                <ModulesUserCitizenMedicineHistoryModalHistory :isModalOpen="state.modal.isViewMedicineHistoryOpen"
                    :selectedMedicine="state.selectedMedicine" @close="state.modal.isViewMedicineHistoryOpen = false"
                    @refreshMedicines="() => { state.historyCache = {}; fetchCitizenMedicines() }" />
                <ModulesUserCitizenMedicineModalDownload :isModalOpen="state.modal.isDownloadMedicineOverviewOpen"
                    @close="state.modal.isDownloadMedicineOverviewOpen = false" />
                <DialogConfirmation :isModalOpen="state.modal.isDeactivateMedicineOpen"
                    :message="$t('citizens.medicineJournals.confirmation.deactivateConfirmation') + '?'"
                    @close="state.modal.isDeactivateMedicineOpen = false" @confirm="toggleActivateDeactivateMedicine" />

                <!-- Missed medicine toast -->
                <div v-if="state.missedWarning"
                    class="fixed bottom-6 right-6 z-50 max-w-sm bg-white border border-red-200 rounded-xl shadow-lg p-4">
                    <div class="flex items-start gap-3">
                        <div class="shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <Icon name="ph:warning-circle" class="size-5 text-red-600" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-semibold text-gray-900">
                                {{ $t('citizens.medicineJournals.page.missedMedicine') }}
                            </p>
                            <p class="text-xs text-gray-500 mt-0.5">
                                {{ state.missedWarning.name }}
                                {{ $t('citizens.medicineJournals.page.wasScheduledAt') }}
                                {{ state.missedWarning.time }}
                            </p>
                            <div class="flex gap-2 mt-3">
                                <button type="button"
                                    class="flex-1 text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-medium hover:bg-primary/90"
                                    @click="giveFromWarning">
                                    {{ $t('citizens.medicineJournals.page.giveNow') }}
                                </button>
                                <button type="button"
                                    class="text-xs text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100"
                                    @click="state.missedWarning = null">
                                    {{ $t('close') }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { medicineJournalService } from '@/components/api/user/MedicineJournalService'
import { medicineHistoryService } from '@/components/api/user/MedicineHistoryService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useCitizenMedicineStore } from '@/store/citizen-medicines'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const customPagesStore = useCustomPagesStore() as any
const citizenMedicineStore = useCitizenMedicineStore() as any
const language = useI18n()

const intlLocale = computed(() => language.locale.value === 'dk' ? 'da-DK' : 'en-GB')

const weekDayHeaders = computed(() =>
    language.locale.value === 'dk'
        ? ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn']
        : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
)
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
let currentTablePage = 1

const breadcrumbLinks = [
    { name: 'citizens.tabs.medicineCard', translate: true, href: `/citizens/${citizenUuid}/medicine-journals` },
]

const viewModes = computed(() => [
    { key: 'day', label: t('citizens.medicineJournals.page.viewModeDay'), icon: 'ph:calendar-dot' },
    { key: 'week', label: t('citizens.medicineJournals.page.viewModeWeek'), icon: 'ph:calendar-dots' },
    { key: 'month', label: t('citizens.medicineJournals.page.viewModeMonth'), icon: 'ph:calendar-blank' },
    { key: 'list', label: t('citizens.medicineJournals.page.viewModeList'), icon: 'ph:list' },
])

const state = reactive({
    viewMode: 'day',
    statsFilter: null as string | null,
    columnHeaders: [
        { name: 'citizens.medicineJournals.table.medicine', isTranslateName: true, sorter: true, key: language.locale.value === 'en' ? 'en_name' : 'dk_name' },
        { name: 'citizens.medicineJournals.table.strength', isTranslateName: true },
        { name: 'citizens.medicineJournals.table.maxDailyDose', isTranslateName: true },
        { name: 'citizens.medicineJournals.table.dosageForm', isTranslateName: true, sorter: true, key: 'max_daily_dose' },
        { name: 'citizens.medicineJournals.table.currentStocks', isTranslateName: true },
        { name: '' },
    ],
    currentPageLength: 10,
    dataFilter: { search: '' },
    error: {} as Error,
    isTableLoading: false,
    medicines: [] as any,
    modal: {
        isAddMedicineOpen: false,
        isAnbrudOpen: false,
        isActivateMedicineOpen: false,
        isDeactivateMedicineOpen: false,
        isDownloadMedicineOverviewOpen: false,
        isEditMedicineOpen: false,
        isFilterMedicineOpen: false,
        isGiveMedicineOpen: false,
        isGiveMedicinesOpen: false,
        isGivePNMedicineOpen: false,
        isViewMedicineOpen: false,
        isViewMedicineHistoryOpen: false,
    },
    selectedMedicine: {} as any,
    sortData: { sortField: '', sortOrder: '' },
    pnExpanded: true,
    preselectedDate: null as string | null,
    preselectedTime: null as string | null,
    missedWarning: null as any,
    now: new Date(),
    weekOffset: 0,
    historyCache: {} as Record<string, Record<string, string>>, // medicineUuid_date -> time -> status
    monthOffset: 0,
})

let clockInterval: any

onMounted(() => {
    citizenMedicineStore.setFilterMedicationType('all')
    fetchCitizenMedicines()
    clockInterval = setInterval(() => { state.now = new Date() }, 60_000)
})

onUnmounted(() => {
    citizenMedicineStore.resetSelectedMedicine()
    clearInterval(clockInterval)
})

watch(() => state.modal.isViewMedicineHistoryOpen, (val: any) => { if (!val) fetchCitizenMedicines() })
watch(() => state.viewMode, (newMode) => fetchCitizenMedicines(newMode))
watch(() => state.weekOffset, () => fetchCitizenMedicines(state.viewMode))
watch(() => state.monthOffset, () => fetchCitizenMedicines(state.viewMode))
watch(() => language.locale.value, () => fetchCitizenMedicines())

// ─── Medicine schedule helpers ────────────────────────────────

function isMedicineActiveOnDate(medicine: any, dateStr: string): boolean {
    // 1. Check recurring_until — if set, it is the true end of the schedule
    if (medicine?.recurring_until && dateStr > medicine.recurring_until) return false

    // 2. Check end_date — only applies when there is no recurring_until
    //    (recurring_until extends the schedule beyond the initial end_date)
    if (!medicine?.recurring_until && medicine?.end_date && dateStr > medicine.end_date) return false

    // 3. Check start_date
    if (medicine?.start_date && dateStr < medicine.start_date) return false

    // 4. Check treatment_periods — only restrict if there is at least one valid (filled) period
    const periods = medicine?.treatment_periods
    if (periods && Array.isArray(periods) && periods.length > 0) {
        // Ignore incomplete rows where start or end was never filled in
        const validPeriods = periods.filter((p: any) => p.start && p.end)
        if (validPeriods.length > 0) {
            const inPeriod = validPeriods.some((p: any) => dateStr >= p.start && dateStr <= p.end)
            // Also allow extra_dates to override
            const isExtraDate = (medicine?.extra_dates ?? []).includes(dateStr)
            if (!inPeriod && !isExtraDate) return false
        }
    }

    // 5. Extra dates always count (already handled above or standalone)
    return true
}

// ─── Computed ─────────────────────────────────────────────────

const allMedicines = computed(() => state.medicines?.data ?? [])
const regularMedicines = computed(() => allMedicines.value.filter((m: any) => !m.is_pn_medicine))
const pnMedicines = computed(() => allMedicines.value.filter((m: any) => m.is_pn_medicine))
const todayStr = computed(() => moment().format('YYYY-MM-DD'))

const timeColumns = computed(() => {
    const times = new Set()
    regularMedicines.value.forEach((m: any) => {
        const entries: any[] = m?.dosage_status_by_date?.[todayStr.value] ?? []
        entries.forEach((d: any) => { if (d?.time) times.add(d.time) })
    })
    return Array.from(times).sort() as string[]
})

const todayLabel = computed(() => {
    const loc = intlLocale.value
    return new Intl.DateTimeFormat(loc, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
})

const currentPeriodLabel = computed(() => {
    const loc = intlLocale.value
    const start = moment().add(state.weekOffset, 'weeks').startOf('isoWeek').toDate()
    const end = moment().add(state.weekOffset, 'weeks').endOf('isoWeek').toDate()
    const fmtShort = new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'short' })
    const fmtFull = new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'short', year: 'numeric' })
    return `${fmtShort.format(start)} – ${fmtFull.format(end)}`
})

const weekDays = computed(() => {
    const loc = intlLocale.value
    const fmtShort = new Intl.DateTimeFormat(loc, { weekday: 'short' })
    const start = moment().add(state.weekOffset, 'weeks').startOf('isoWeek')
    return Array.from({ length: 7 }, (_, i) => {
        const day = start.clone().add(i, 'days')
        const date = day.toDate()
        return {
            dateStr: day.format('YYYY-MM-DD'),
            dayShort: fmtShort.format(date),
            dayNum: day.format('D/M'),
            isToday: day.isSame(moment(), 'day'),
        }
    })
})

const stats = computed(() => {
    const today = moment().format('YYYY-MM-DD')
    let overdue = 0, dueSoon = 0, given = 0, pending = 0
    regularMedicines.value
        .filter((m: any) => isMedicineActiveOnDate(m, today))
        .forEach((m: any) => {
            const entries: any[] = m?.dosage_status_by_date?.[today] ?? []
            entries.forEach((d: any) => {
                const s = d?.status
                if (s === 'given' || s === 'delivered') given++
                else if (isMissed(d?.time)) overdue++
                else if (isDueSoon(d?.time)) dueSoon++
                else pending++
            })
        })
    return { overdue, dueSoon, given, pending }
})

const alarmBanners = computed(() => {
    const banners: any[] = []
    const today = moment().format('YYYY-MM-DD')
    regularMedicines.value.forEach((m: any) => {
        const name = language.locale.value === 'en' ? m?.medicine?.en_name : m?.medicine?.dk_name
        const entries: any[] = m?.dosage_status_by_date?.[today] ?? []
        entries.forEach((d: any) => {
            if (d?.status) return
            if (isMissed(d?.time)) {
                const mins = minutesSince(d?.time)
                banners.push({ uuid: `${m.uuid}_${d.time}`, type: 'overdue', medicineName: name, time: d.time, message: t('citizens.medicineJournals.page.medicineIsOverdue', { time: formatMinutesSince(mins) }), medicine: m, dosage: d })
            } else if (isDueSoon(d?.time)) {
                banners.push({ uuid: `${m.uuid}_${d.time}_soon`, type: 'soon', medicineName: name, time: d.time, message: t('citizens.medicineJournals.page.dueInMinutes', { minutes: minutesUntil(d?.time) }) })
            }
        })
    })
    return banners.slice(0, 4)
})

// ─── Time helpers ─────────────────────────────────────────────

function isMissed(time: string): boolean {
    if (!time) return false
    const [h, m] = time.split(':').map(Number)
    const scheduled = new Date(state.now)
    scheduled.setHours(h, m, 0, 0)
    return state.now > scheduled
}

function isDueSoon(time: string): boolean {
    if (!time) return false
    const [h, m] = time.split(':').map(Number)
    const scheduled = new Date(state.now)
    scheduled.setHours(h, m, 0, 0)
    const diff = scheduled.getTime() - state.now.getTime()
    return diff > 0 && diff <= 60 * 60 * 1000
}

function minutesSince(time: string): number {
    const [h, m] = time.split(':').map(Number)
    const scheduled = new Date(state.now)
    scheduled.setHours(h, m, 0, 0)
    return Math.round((state.now.getTime() - scheduled.getTime()) / 60000)
}

function minutesUntil(time: string): number {
    const [h, m] = time.split(':').map(Number)
    const scheduled = new Date(state.now)
    scheduled.setHours(h, m, 0, 0)
    return Math.round((scheduled.getTime() - state.now.getTime()) / 60000)
}

function formatMinutesSince(mins: number): string {
    if (mins < 60) return `${mins} min`
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return m > 0 ? `${h}h ${m}min` : `${h} hour${h !== 1 ? 's' : ''}`
}

// ─── Slot helpers ─────────────────────────────────────────────

function getDosageForTime(medicine: any, time: string) {
    const today = moment().format('YYYY-MM-DD')
    const entries: any[] = medicine?.dosage_status_by_date?.[today] ?? []
    return entries.find((d: any) => d?.time === time) ?? null
}

function getSlotClass(dosage: any, time: string): string {
    const s = dosage?.status
    if (s === 'given') return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 cursor-pointer'
    if (s === 'delivered') return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 cursor-pointer'
    if (s === 'deviated') return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 cursor-pointer'
    if (isMissed(time)) return 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200 animate-pulse cursor-pointer'
    if (isDueSoon(time)) return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 cursor-pointer'
    return 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 cursor-pointer'
}

function getSlotIcon(dosage: any): string {
    const s = dosage?.status
    if (s === 'given') return 'ph:check-circle'
    if (s === 'delivered') return 'ph:package'
    if (s === 'deviated') return 'ph:warning-circle'
    return 'ph:pill'
}

function getSlotTooltip(dosage: any, time: string): string {
    const s = dosage?.status
    if (s === 'given') return customPagesStore.getCustomPagesName?.giveMedicine ?? t('citizens.medicineJournals.page.givenLegend')
    if (s === 'delivered') return t('citizens.medicineJournals.history.form.type.delivered')
    if (s === 'deviated') return t('citizens.medicineJournals.history.form.type.deviated')
    if (isMissed(time)) return t('citizens.medicineJournals.page.slotOverdue', { time })
    if (isDueSoon(time)) return t('citizens.medicineJournals.page.slotDueSoon', { minutes: minutesUntil(time), time })
    return t('citizens.medicineJournals.page.slotClickToGive', { time })
}

function getSlotTimeLabel(dosage: any, time: string): string {
    const s = dosage?.status
    if (s === 'given') return t('citizens.medicineJournals.page.slotGiven')
    if (s === 'delivered') return t('citizens.medicineJournals.page.slotDelivered')
    if (s === 'deviated') return t('citizens.medicineJournals.page.slotDeviation')
    if (isMissed(time)) return `+${formatMinutesSince(minutesSince(time))}`
    if (isDueSoon(time)) return t('citizens.medicineJournals.page.slotInMinutes', { minutes: minutesUntil(time) })
    return t('citizens.medicineJournals.page.slotAt', { time })
}

function getSlotTimeClass(dosage: any, time: string): string {
    const s = dosage?.status
    if (s === 'given') return 'text-green-600'
    if (s === 'delivered') return 'text-blue-600'
    if (s === 'deviated') return 'text-red-600'
    if (isMissed(time)) return 'text-red-600'
    if (isDueSoon(time)) return 'text-amber-600'
    return 'text-gray-400'
}

function gridStyle(colCount: number) {
    if (!colCount) return {}
    const w = Math.max(100, Math.min(160, Math.floor(480 / colCount)))
    return { display: 'grid', gridTemplateColumns: `1fr ${Array(colCount).fill(`${w}px`).join(' ')}` }
}

function getWeekDosagesForDay(medicine: any, day: any): any[] {
    if (!isMedicineActiveOnDate(medicine, day.dateStr)) return []
    return medicine?.dosage_status_by_date?.[day.dateStr] ?? []
}

function getWeekSlotClass(dosage: any, day: any): string {
    const s = dosage?.status
    const isPast = moment(day.dateStr).isBefore(moment(), 'day')
    const isFuture = moment(day.dateStr).isAfter(moment(), 'day')
    // Only show status colors if there actually IS a status
    if (s === 'given') return 'bg-green-100 text-green-800 border border-green-200 cursor-pointer'
    if (s === 'delivered') return 'bg-blue-100 text-blue-800 border border-blue-200 cursor-pointer'
    if (s === 'deviated') return 'bg-red-100 text-red-800 border border-red-200 cursor-pointer'
    // No status: use date-based coloring
    if (isFuture) return 'bg-gray-50 text-gray-300 border border-gray-100 cursor-pointer'
    if (day.isToday && isMissed(dosage?.time)) return 'bg-red-100 text-red-700 border border-red-200 animate-pulse cursor-pointer'
    if (day.isToday && isDueSoon(dosage?.time)) return 'bg-amber-50 text-amber-700 border border-amber-200 cursor-pointer'
    if (day.isToday) return 'bg-primary/10 text-primary border border-primary/20 cursor-pointer'
    // Past not given = missed
    if (isPast && !s) return 'bg-red-50 text-red-400 border border-red-100'
    return 'bg-gray-50 text-gray-400'
}

function getStatusLabel(status: string | null): string {
    if (status === 'given') return customPagesStore.getCustomPagesName?.giveMedicine ?? t('citizens.medicineJournals.page.givenLegend')
    if (status === 'delivered') return t('citizens.medicineJournals.history.form.type.delivered')
    if (status === 'deviated') return t('citizens.medicineJournals.history.form.type.deviated')
    return t('citizens.medicineJournals.page.notGivenStatus')
}

function getStatusBg(status: string | null): string {
    if (status === 'given') return 'bg-green-600'
    if (status === 'delivered') return 'bg-primary'
    if (status === 'deviated') return 'bg-red-600'
    return 'bg-gray-400'
}

function formatScheduleFrequency(medicine: any): string {
    const freq = medicine?.schedule_frequency
    const map: Record<string, string> = {
        everyday: t('citizens.medicineJournals.scheduleFrequencies.everyday'),
        every_other_day: t('citizens.medicineJournals.scheduleFrequencies.every2Days'),
        every_third_day: t('citizens.medicineJournals.scheduleFrequencies.every3Days'),
        weekly: t('citizens.medicineJournals.scheduleFrequencies.weekly'),
        biweekly: t('citizens.medicineJournals.scheduleFrequencies.biweekly'),
        monthly: t('citizens.medicineJournals.scheduleFrequencies.monthly'),
        quarterly: t('citizens.medicineJournals.scheduleFrequencies.quarterly'),
        annually: t('citizens.medicineJournals.scheduleFrequencies.annually'),
    }
    return map[freq] ?? freq ?? ''
}

function navigateDate(dir: number) {
    if (state.viewMode === "month") {
        state.monthOffset += dir
    } else {
        state.weekOffset += dir
    }
}

function goToToday() {
    state.weekOffset = 0
    state.monthOffset = 0
}

async function navigateToExternalLink(link: any) {
    await navigateTo(link, { external: true, open: { target: '_blank' } })
}


const currentMonthLabel = computed(() => {
    const loc = intlLocale.value
    return new Intl.DateTimeFormat(loc, { month: 'long', year: 'numeric' }).format(
        moment().add(state.monthOffset, 'months').toDate()
    )
})

const monthDays = computed(() => {
    const target = moment().add(state.monthOffset, 'months')
    const start = target.clone().startOf('month').startOf('isoWeek')
    const end = target.clone().endOf('month').endOf('isoWeek')
    const days = []
    let cur = start.clone()
    while (cur.isSameOrBefore(end, 'day')) {
        days.push({
            dateStr: cur.format('YYYY-MM-DD'),
            dayNum: cur.date(),
            isCurrentMonth: cur.month() === target.month(),
            isToday: cur.isSame(moment(), 'day'),
        })
        cur.add(1, 'day')
    }
    return days
})

const filteredRegularMedicines = computed(() => {
    const today = moment().format('YYYY-MM-DD')
    // First filter by active on today
    const activeMedicines = regularMedicines.value.filter((m: any) => isMedicineActiveOnDate(m, today))
    if (!state.statsFilter) return activeMedicines
    return activeMedicines.filter((m: any) => {
        const entries: any[] = m?.dosage_status_by_date?.[today] ?? []
        if (state.statsFilter === 'given') return entries.some((d: any) => d?.status === 'given' || d?.status === 'delivered')
        if (state.statsFilter === 'overdue') return entries.some((d: any) => !d?.status && isMissed(d?.time))
        if (state.statsFilter === 'soon') return entries.some((d: any) => !d?.status && isDueSoon(d?.time))
        if (state.statsFilter === 'pending') return entries.some((d: any) => !d?.status && !isMissed(d?.time) && !isDueSoon(d?.time))
        return true
    })
})

function toggleStatsFilter(filter: string) {
    state.statsFilter = state.statsFilter === filter ? null : filter
    if (state.statsFilter) state.viewMode = 'day'
}

function getMonthDosagesForDay(medicine: any, dateStr: string): any[] {
    return medicine?.dosage_status_by_date?.[dateStr] ?? []
}

function getMonthSlotClass(status: string | null, time: string, dateStr: string): string {
    const s = status
    const isFuture = dateStr > moment().format('YYYY-MM-DD')
    if (s === 'given') return 'bg-green-100 text-green-800'
    if (s === 'delivered') return 'bg-blue-100 text-blue-800'
    if (s === 'deviated') return 'bg-red-100 text-red-800'
    if (isFuture) return 'text-gray-300'
    return 'text-gray-400'
}

function getMonthSlotBorderClass(status: string | null, time: string, dateStr: string): string {
    const isFuture = dateStr > moment().format('YYYY-MM-DD')
    const isToday = dateStr === moment().format('YYYY-MM-DD')
    if (status === 'given') return 'border-green-300'
    if (status === 'delivered') return 'border-blue-300'
    if (status === 'deviated') return 'border-red-300'
    if (isFuture) return 'border-gray-100'
    if (isToday && isMissed(time)) return 'border-red-300'
    if (isToday) return 'border-primary/30'
    return 'border-gray-200'
}

function getMonthSlotBgClass(status: string | null, time: string, dateStr: string): string {
    const isFuture = dateStr > moment().format('YYYY-MM-DD')
    const isToday = dateStr === moment().format('YYYY-MM-DD')
    if (status === 'given') return 'bg-green-50 text-green-800'
    if (status === 'delivered') return 'bg-blue-50 text-blue-800'
    if (status === 'deviated') return 'bg-red-50 text-red-800'
    if (isFuture) return 'bg-gray-50 text-gray-300'
    if (isToday && isMissed(time)) return 'bg-red-50 text-red-700'
    if (isToday) return 'bg-primary/5 text-primary'
    return 'bg-white text-gray-500'
}

async function fetchCitizenMedicines(viewMode?: string) {
    state.error = {} as Error
    state.isTableLoading = true
    const activeMode = viewMode ?? state.viewMode
    try {
        // Send date range based on view mode so backend returns correct statuses
        const today = moment().format('YYYY-MM-DD')
        let startDate = today
        let endDate = today
        if (activeMode === 'week') {
            startDate = moment().add(state.weekOffset, 'weeks').startOf('isoWeek').format('YYYY-MM-DD')
            endDate = moment().add(state.weekOffset, 'weeks').endOf('isoWeek').format('YYYY-MM-DD')
        } else if (activeMode === 'month') {
            startDate = moment().add(state.monthOffset, 'months').startOf('month').format('YYYY-MM-DD')
            endDate = moment().add(state.monthOffset, 'months').endOf('month').format('YYYY-MM-DD')
        } else {
            // Day view: fetch 30 days back to show history
            startDate = moment().subtract(30, 'days').format('YYYY-MM-DD')
            endDate = moment().add(30, 'days').format('YYYY-MM-DD')
        }

        const params: any = {
            citizen_uuid: citizenUuid,
            medication_type: citizenMedicineStore.getFilterMedicationType,
            page: currentTablePage,
            page_length: state.currentPageLength,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            start_date: startDate,
            end_date: endDate,
            ...state.dataFilter,
        }
        if (citizenMedicineStore.getFilterByActiveInactiveDeactivated === 'deactivated') {
            params.is_deactivated = true
        } else {
            params.is_active = citizenMedicineStore.getFilterByActiveInactiveDeactivated === 'active'
        }
        const response = await medicineJournalService.getMedicines(params)
        if (response) {
            state.medicines = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchCitizenMedicines()
}

function next() {
    currentTablePage++
    fetchCitizenMedicines()
}

function changePageLength(event: any) {
    currentTablePage = 1
    state.currentPageLength = Number(event.target.value)
    fetchCitizenMedicines()
}

function sort(s: any) {
    currentTablePage = 1
    state.sortData = { sortField: s.column, sortOrder: s.sort }
    fetchCitizenMedicines()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] === '' ? [] : value
    fetchCitizenMedicines()
}

function setFilter(filter: any) {
    citizenMedicineStore.setFilterByActiveInactiveDeactivated(filter.isActive.value)
    citizenMedicineStore.setFilterMedicationType(filter.medicationType)
    fetchCitizenMedicines()
}

function addRemoveMedicine(medicine: any) {
    citizenMedicineStore.addRemoveSelectedMedicine(medicine)
}

function viewMedicine(medicine: any) {
    state.selectedMedicine = medicine
    state.modal.isViewMedicineOpen = true
}

function closeViewMedicineModal() {
    state.modal.isViewMedicineOpen = false
    state.selectedMedicine = {}
}

function closeGiveMedicineModal() {
    state.modal.isGiveMedicineOpen = false
    state.preselectedDate = null
    state.preselectedTime = null
    state.historyCache = {}
    fetchCitizenMedicines()
}

function giveMedicine(medicine: any) {
    state.selectedMedicine = medicine
    state.modal.isGiveMedicineOpen = true
}

function givePNMedicine(medicine: any) {
    state.selectedMedicine = medicine
    state.modal.isGivePNMedicineOpen = true
}

function openGiveMedicineOnDate(medicine: any, dosage: any, day: any) {
    if (!isMedicineActiveOnDate(medicine, day.dateStr)) return
    state.selectedMedicine = medicine
    state.preselectedDate = day.dateStr
    state.preselectedTime = dosage?.time ?? null
    state.modal.isGiveMedicineOpen = true
}

function openGiveMedicine(medicine: any, dosage: any) {
    state.selectedMedicine = medicine
    state.modal.isGiveMedicineOpen = true
}
function quickGive(alarm: any) {
    if (alarm.medicine) {
        state.selectedMedicine = alarm.medicine
        state.modal.isGiveMedicineOpen = true
    }
}

function giveFromWarning() {
    state.modal.isGiveMedicineOpen = true
    state.missedWarning = null
}

function viewMedicineHistory(medicine: any) {
    state.selectedMedicine = medicine
    state.modal.isViewMedicineHistoryOpen = true
}

function editMedicine(medicine: any) {
    state.selectedMedicine = medicine
    state.modal.isEditMedicineOpen = true
}

function closeEditMedicineModal() {
    state.modal.isEditMedicineOpen = false
    state.selectedMedicine = {}
}

function confirmMedicineActivation(medicine: any) {
    state.selectedMedicine = medicine
    state.modal.isActivateMedicineOpen = true
}

function confirmMedicineDeactivation(medicine: any) {
    state.selectedMedicine = medicine
    state.modal.isDeactivateMedicineOpen = true
}

async function toggleActivateDeactivateMedicine() {
    state.error = {} as Error
    state.isTableLoading = true
    try {
        const response = await medicineJournalService.activateDeactivateMedicine(state.selectedMedicine.uuid)
        if (response?.data) {
            fetchCitizenMedicines()
            successAlert(`${t('alert.success')}!`, response.data.is_deactivated ? `${t('citizens.medicineJournals.alert.successfullyDeactivated')}.` : `${t('citizens.medicineJournals.alert.successfullyActivated')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
