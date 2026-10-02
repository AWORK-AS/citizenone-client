<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('overview.overview') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <!-- No breadcrumb: this is a top-level page, and the tabs below
                 already say where you are. It read "Oversigt" three times over. -->

            <template #header>
                <OverviewTabs active="overview" />
            </template>

            <template #guided-tour>
                <!-- ml-auto: with no breadcrumb beside it, this row would otherwise
                     start at the left. Brand blue rather than violet - one action
                     colour, as everywhere else. -->
                <div class="ml-auto flex items-center gap-x-2">
                    <button type="button" v-if="userStore.getUser?.has_ai_access" @click="handoverOpen = true"
                        class="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary-100 transition-colors">
                        <Icon name="ph:sparkle-fill" class="size-4" aria-hidden="true" />
                        {{ $t('handover.button') }}
                    </button>
                    <Tooltip :text="$t('guidedTour')" position="left" @click="openGuidedTour()">
                        <Icon name="ph:question"
                            class="size-5 cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
                            aria-hidden="true" />
                    </Tooltip>
                </div>
            </template>

            <Alert type="danger" :text="state?.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />

            <!-- Shift briefing -->
            <div
                class="mb-4 rounded-2xl border border-surface-200 bg-gradient-to-br from-primary/[0.06] to-secondary/[0.06] px-5 py-4">
                <p class="text-lg font-semibold text-slate-900">
                    {{ $t('overview.briefing.' + greetingPart, { name: firstName }) }} 👋
                </p>
                <div class="mt-2 flex flex-wrap items-center gap-2 text-sm">
                    <span v-if="todaysBirthdays.length > 0"
                        class="inline-flex items-center gap-x-1 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1">
                        🎂 {{ $t('overview.briefing.birthdays', { count: todaysBirthdays.length }) }}
                    </span>
                    <span v-if="medicineActionCitizens.length > 0"
                        class="inline-flex items-center gap-x-1 rounded-full bg-red-50 text-red-600 px-2.5 py-1">
                        💊 {{ $t('overview.briefing.medicine', { count: medicineActionCitizens.length }) }}
                    </span>
                    <span v-if="todaysEventsCount > 0"
                        class="inline-flex items-center gap-x-1 rounded-full bg-blue-50 text-blue-700 px-2.5 py-1">
                        📅 {{ $t('overview.briefing.appointments', { count: todaysEventsCount }) }}
                    </span>
                    <span
                        v-if="todaysBirthdays.length === 0 && medicineActionCitizens.length === 0 && todaysEventsCount === 0"
                        class="text-slate-500">
                        {{ $t('overview.briefing.allCalm') }} ☀️
                    </span>
                </div>
            </div>

            <!-- "Fortsæt hvor du slap" - last citizen/chat viewed on any device -->
            <div v-if="state.continuity"
                class="mb-4 flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                <div class="flex items-center gap-2 text-sm text-slate-700 min-w-0">
                    <Icon name="ph:arrow-clockwise" class="w-4 h-4 text-primary shrink-0" />
                    <span class="truncate">
                        {{ $t(state.continuity.type === 'chat' ? 'overview.continuity.continueOnChat' : 'overview.continuity.continueOnCitizen', { label: state.continuity.label }) }}
                    </span>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                    <button class="text-sm font-medium text-primary hover:text-primary-600 px-2 py-1"
                        @click="goToContinuity">
                        {{ $t('overview.continuity.goTo') }} →
                    </button>
                    <button class="text-slate-400 hover:text-slate-600 p-1" :aria-label="$t('close')"
                        @click="state.continuity = null">
                        <Icon name="ph:x" class="w-4 h-4" />
                    </button>
                </div>
            </div>

            <!-- Action bar -->
            <div class="flex items-center justify-between gap-3 flex-wrap">
                <div class="flex items-center gap-x-3">
                    <button
                        class="flex items-center gap-x-1.5 text-sm text-slate-500 hover:text-primary transition-colors rounded-lg px-2.5 py-1.5 hover:bg-primary-25"
                        @click="state.modal.isFilterDailyOverviewOpen = true">
                        <Icon name="ph:sliders-horizontal" class="w-4 h-4" />
                        <span>{{ $t('showHide') }}</span>
                    </button>
                    <!-- Date navigator -->
                    <div
                        class="flex items-center gap-x-2 bg-white rounded-lg border border-surface-200 shadow-sm px-3 py-1.5">
                        <button @click="previousDay" :aria-label="$t('overview.previousDay')" class="p-0.5 rounded hover:bg-surface-100 transition-colors">
                            <Icon name="heroicons:chevron-left-20-solid" class="h-4 w-4 text-slate-400" />
                        </button>
                        <button @click="state.modal.isDailyOverviewDateRangeOpen = true"
                            class="text-sm font-medium text-slate-700 hover:text-primary transition-colors px-1">
                            {{ formatDisplayDate() }}
                        </button>
                        <button @click="nextDay" :aria-label="$t('overview.nextDay')" class="p-0.5 rounded hover:bg-surface-100 transition-colors">
                            <Icon name="heroicons:chevron-right-20-solid" class="h-4 w-4 text-slate-400" />
                        </button>
                    </div>
                </div>
                <div class="flex flex-wrap gap-2">
                    <FormButton buttonStyle="primary" class="w-full md:w-fit shadow-sm"
                        @click="state.modal.isCreateJournalOpen = true">
                        <Icon name="ph:note-pencil" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('journalNotes.newNote') }}
                    </FormButton>
                    <FormButton buttonStyle="action" class="w-full md:w-fit shadow-sm"
                        @click="navigateTo('/overview/view')">
                        {{ $t('overview.viewAll') }}
                    </FormButton>
                    <FormButton buttonStyle="action" class="w-full md:w-fit shadow-sm" @click="navigateTo('/inquiries')"
                        v-if="userStore.getUser?.company?.industry?.system_name === 'social_welfare' && ['Crisis center', 'Shelter'].includes(userStore.getUser?.company?.facility_type?.en_name)">
                        <Icon name="ph:list-bullets" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('inquiries.inquiries') }}
                    </FormButton>
                    <FormButton buttonStyle="primary" class="w-full md:w-fit shadow-sm"
                        @click="state.modal.isQuickRiskAssessmentOpen = true"
                        v-if="userStore.getUser?.company?.quick_risk_assessment_enabled">
                        {{ $t('overview.quickRiskAssessment.quickRiskAssessment') }}
                    </FormButton>
                </div>
            </div>

            <!-- Stat cards row -->
            <div class="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
                <div class="stat-card">
                    <div class="stat-label">
                        <span class="w-2 h-2 rounded-full bg-accent-blue"></span>
                        {{ $t('overview.citizensEvents') }}
                    </div>
                    <div class="mt-2 stat-value text-primary">
                        <CountUp :value="Number(state.stats.citizenCalendarEvents?.data?.length ?? 0)" />
                    </div>
                    <div class="stat-sublabel">
                        {{ $t('overview.stats.ongoing') }} ·
                        {{ $t('overview.stats.upcoming') }}
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">
                        <span class="w-2 h-2 rounded-full bg-accent-green"></span>
                        {{ $t('overview.stats.journalEntries') || 'Journal entries' }}
                    </div>
                    <div class="mt-2 stat-value text-accent-green">
                        <CountUp :value="Number(state.stats.latestCitizensJournal?.data?.length ?? 0)" />
                    </div>
                    <div class="stat-sublabel">
                        {{ $t('overview.stats.acrossCitizens', { n: state.stats.latestCitizensJournal?.data?.length ?? 0 }) }}
                    </div>
                </div>
                <div class="stat-card" v-if="hasMedicineModule">
                    <div class="stat-label">
                        <span class="w-2 h-2 rounded-full bg-accent-orange"></span>
                        {{ $t('overview.stats.medicationsDue') || 'Medications due' }}
                    </div>
                    <div class="mt-2 stat-value text-accent-orange">
                        <CountUp :value="Number(state.stats.medicinesPendingCount ?? 0)" />
                    </div>
                    <div class="stat-sublabel">
                        {{ state.stats.medicinesGivenCount }}
                        {{ $t('overview.stats.administered') }} ·
                        {{ state.stats.medicinesPendingCount }}
                        {{ $t('overview.stats.pending') }} ·
                        {{ state.stats.medicinesDeviatedCount }}
                        {{ $t('overview.stats.deviated', Number(state.stats.medicinesDeviatedCount ?? 0)) }}
                    </div>
                </div>
                <div class="stat-card cursor-pointer hover:ring-secondary hover:ring-2 transition-all"
                    @click="scrollToTreatments" v-if="isShown('showTreatments')">
                    <div class="stat-label">
                        <span class="w-2 h-2 rounded-full bg-green-500"></span>
                        {{ $t('overview.stats.activeTreatments') }}
                    </div>
                    <div class="mt-2 stat-value text-green-600">
                        <CountUp :value="Number(state.stats.activeTreatmentsCount ?? 0)" />
                    </div>
                    <div class="stat-sublabel flex items-center gap-1">
                        {{ $t('overview.stats.viewAll') }}
                        <Icon name="ph:arrow-right" class="size-3" />
                    </div>
                </div>
                <!-- Birthdays: today's are shown, the rest open in a popup; when
                     none this week, the next birthday in line is shown instead. -->
                <div class="stat-card" v-if="state.stats.birthdays.length > 0">
                    <div class="stat-label">
                        <Icon name="ph:cake" class="h-4 w-4 text-accent-orange" />
                        {{ todaysBirthdays.length > 0
                            ? $t('overview.birthdays.todayTitle')
                            : (hasThisWeekBirthdays ? $t('overview.birthdays.title') : $t('overview.birthdays.nextTitle'))
                        }}
                        <span v-if="hasThisWeekBirthdays"
                            class="ml-1 inline-flex items-center justify-center rounded-full bg-slate-100 px-1.5 text-[11px] text-slate-600">
                            {{ todaysBirthdays.length > 0 ? todaysBirthdays.length : thisWeekBirthdays.length }}
                        </span>
                    </div>
                    <ul v-if="todaysBirthdays.length > 0" class="mt-2 space-y-1.5 max-h-24 overflow-y-auto pr-1">
                        <li v-for="(birthday, birthdayIndex) in todaysBirthdays" :key="birthdayIndex"
                            class="flex items-center justify-between gap-x-2 text-xs font-semibold text-primary">
                            <span class="truncate">{{ birthday.name }}</span>
                            <span class="shrink-0 text-[11px]">{{ $t('overview.birthdays.turns', { age: birthday.age })
                            }}</span>
                        </li>
                    </ul>
                    <!-- No birthdays this week: surface the next one in line -->
                    <!-- Stacked: side by side, the non-shrinking "in 109 days · turns 48"
                         left a quarter-width card room for "Louis..." and no more. -->
                    <div v-else-if="!hasThisWeekBirthdays && nextBirthday" class="mt-2 min-w-0">
                        <p class="truncate text-sm font-semibold text-primary">{{ nextBirthday.name }}</p>
                        <p class="mt-0.5 text-xs text-slate-500">
                            {{ $t('overview.birthdays.inDays', { days: nextBirthday.days_until }) }} · {{
                                $t('overview.birthdays.turns', { age: nextBirthday.age }) }}
                        </p>
                    </div>
                    <button v-if="hasThisWeekBirthdays && (laterBirthdaysCount > 0 || todaysBirthdays.length === 0)"
                        type="button" @click="state.modal.isBirthdaysOpen = true"
                        class="mt-2 inline-flex items-center gap-x-1 text-xs text-primary font-medium hover:text-primary-700 transition-colors">
                        <template v-if="todaysBirthdays.length > 0">
                            {{ $t('overview.birthdays.moreThisWeek', { count: laterBirthdaysCount }) }}
                        </template>
                        <template v-else>
                            {{ $t('overview.birthdays.countThisWeek', { count: thisWeekBirthdays.length }) }}
                        </template>
                        <Icon name="ph:arrow-right" class="size-3" />
                    </button>
                </div>
                <!-- Medicine: citizens with a deviation or missed dose today -->
                <div class="stat-card" v-if="medicineActionCitizens.length > 0">
                    <div class="stat-label">
                        <Icon name="ph:pill" class="h-4 w-4 text-red-500" />
                        {{ $t('overview.medicineAction.title') }}
                        <span
                            class="ml-1 inline-flex items-center justify-center rounded-full bg-slate-100 px-1.5 text-[11px] text-slate-600">
                            {{ medicineActionCitizens.length }}
                        </span>
                    </div>
                    <ul class="mt-2 -mx-1.5 space-y-0.5">
                        <li v-for="citizen in medicineActionCitizens.slice(0, 3)" :key="citizen.uuid || citizen.name"
                            @click="citizen.uuid && navigateTo(`/citizens/${citizen.uuid}/medicine-journals`)"
                            class="group flex items-center gap-x-2 rounded-lg px-1.5 py-1.5 cursor-pointer hover:bg-surface-50 transition-colors">
                            <div class="min-w-0 flex-1">
                                <CitizenHoverCard :uuid="citizen.uuid" :name="citizen.name"
                                    class="text-xs font-semibold text-primary group-hover:text-primary-700">
                                    <span class="truncate">{{ citizen.name }}</span>
                                </CitizenHoverCard>
                                <div class="mt-0.5 flex items-center gap-x-1 text-[11px]">
                                    <span v-if="citizen.deviated > 0"
                                        class="rounded-full bg-red-50 text-red-600 px-1.5 py-0.5">
                                        {{ $t('overview.medicineAction.deviated', { count: citizen.deviated }) }}
                                    </span>
                                    <span v-if="citizen.overdue > 0"
                                        class="rounded-full bg-amber-50 text-amber-600 px-1.5 py-0.5">
                                        {{ $t('overview.medicineAction.overdue', { count: citizen.overdue }) }}
                                    </span>
                                </div>
                            </div>
                            <Icon name="ph:caret-right"
                                class="size-3 shrink-0 text-slate-300 group-hover:text-primary transition-colors" />
                        </li>
                    </ul>
                    <p v-if="medicineActionCitizens.length > 3" class="mt-2 text-xs text-slate-400">
                        {{ $t('overview.medicineAction.more', { count: medicineActionCitizens.length - 3 }) }}
                    </p>
                </div>
            </div>

            <!-- Main content grid -->
            <div class="mt-8 space-y-10">
                <!-- Boxes the admin set up (custom Daily Overview boxes). First,
                     because they are what the admin decided matters most here. -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-5" v-if="visibleCustomBoxes.length > 0">
                    <ModulesUserDailyOverviewCustomBox v-for="box in visibleCustomBoxes" :key="box.key" :box="box" />
                </div>
                <!-- When is my next shift? Above the rest: it is the first thing an employee checks. -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-5" v-if="isShown('showNextShift')">
                    <ModulesUserDailyOverviewNextShift />
                </div>
                <!-- Citizens' events + Latest journal notes row -->
                <!-- Medication overview and Follow-up reminders row -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-5 gap-y-6 stagger-children" v-if="isShown('showCitizensDailyEvents') ||
                    isShown('showLatestJournal') ||
                    isShown('showDailyMedicineOverview') ||
                    isShown('showCitizensFollowUpReminders') ||
                    isShown('showReminders')">
                    <!-- Citizens' events panel -->
                    <div class="card" v-if="isShown('showCitizensDailyEvents')">
                        <div class="card-header">
                            <div class="flex items-center gap-x-2">
                                <Icon name="ph:check-circle" class="h-5 w-5 text-primary" />
                                <h3 class="text-sm font-semibold text-slate-900">
                                    {{ $t('overview.citizensEvents') }}
                                </h3>
                                <span class="badge badge-blue">
                                    {{ state.stats.citizenCalendarEvents?.data?.length ?? 0 }}
                                </span>
                            </div>
                            <button
                                class="text-sm text-primary font-medium hover:text-primary-700 transition-colors flex items-center gap-x-1"
                                @click="navigateTo('/calendar')">
                                {{ $t('overview.viewAll') }}
                                <Icon name="heroicons:arrow-right-20-solid" class="h-4 w-4" />
                            </button>
                        </div>
                        <div>
                            <ModulesUserDailyOverviewCitizensDailyEvents :dateRange="state.dateRange.formDateRange" />
                        </div>
                    </div>

                    <!-- Recent journal notes panel. Deliberately outside the
                         date navigator above: the feed always opens on the last
                         seven days, which is what staff read when they log in. -->
                    <div class="card" v-if="isShown('showLatestJournal')">
                        <div class="card-header">
                            <div class="flex items-center gap-x-2">
                                <Icon name="ph:notebook" class="h-5 w-5 text-primary" />
                                <h3 class="text-sm font-semibold text-slate-900">
                                    {{ $t('overview.recentJournalNotes.title') }}
                                </h3>
                                <span class="badge badge-green">
                                    {{ state.stats.recentJournalNotesTotal }}
                                </span>
                                <span class="text-xs text-slate-500">
                                    {{ $t('overview.recentJournalNotes.lastDays', { days: recentJournalDays }) }}
                                </span>
                            </div>
                            <button
                                class="text-sm text-primary font-medium hover:text-primary-700 transition-colors flex items-center gap-x-1"
                                @click="goToAllJournalNotes">
                                {{ $t('overview.viewAll') }}
                                <Icon name="heroicons:arrow-right-20-solid" class="h-4 w-4" />
                            </button>
                        </div>
                        <div>
                            <ModulesUserDailyOverviewRecentJournalNotes :days="recentJournalDays"
                                @total="(total: number) => state.stats.recentJournalNotesTotal = total" />
                        </div>
                    </div>

                    <!-- Medication overview panel -->
                    <div class="card"
                        v-if="hasMedicineModule && isShown('showDailyMedicineOverview')">
                        <div class="card-header">
                            <div class="flex items-center gap-x-2">
                                <Icon name="ph:camera-plus" class="h-5 w-5 text-primary" />
                                <h3 class="text-sm font-semibold text-slate-900">
                                    {{ $t('overview.medicationOverview.medicationOverview') }}
                                </h3>
                            </div>
                        </div>
                        <div>
                            <ModulesUserDailyOverviewCitizensMedicineOverview
                                :dateRange="state.dateRange.formDateRange" />
                        </div>
                    </div>

                    <!-- User reminders panel -->
                    <div class="card" v-if="isShown('showReminders')">
                        <div class="card-header">
                            <div class="flex items-center gap-x-2">
                                <Icon name="ph:check-square" class="h-5 w-5 text-primary" />
                                <h3 class="text-sm font-semibold text-slate-900">
                                    {{ $t('reminders.reminders') }}
                                </h3>
                            </div>
                            <button
                                class="text-sm text-primary font-medium hover:text-primary-700 transition-colors flex items-center gap-x-1"
                                @click="navigateTo('/reminders')">
                                {{ $t('overview.viewAll') }}
                                <Icon name="heroicons:arrow-right-20-solid" class="h-4 w-4" />
                            </button>
                        </div>
                        <div>
                            <ModulesUserDailyOverviewMyInquiryInvitations
                                v-if="userStore.getUser?.company?.inquiry_pipeline_enabled" />
                            <ModulesUserDailyOverviewMyTasks />
                            <ModulesUserDailyOverviewSentTasks />
                            <ModulesUserDailyOverviewReminders />
                        </div>
                    </div>

                    <!-- Follow up reminders panel -->
                    <div class="card" v-if="isShown('showCitizensFollowUpReminders')">
                        <div class="card-header">
                            <div class="flex items-center gap-x-2">
                                <Icon name="ph:notification" class="h-5 w-5 text-primary" />
                                <h3 class="text-sm font-semibold text-slate-900">
                                    {{ $t('overview.followUpReminders.followUpReminders') }}
                                </h3>
                            </div>
                        </div>
                        <div>
                            <ModulesUserDailyOverviewCitizensFollowUpReminders
                                :dateRange="state.dateRange.formDateRange" />
                        </div>
                    </div>
                </div>

                <!-- Treatments, My Events, Bulletin -->
                <div id="treatments-section" class="grid grid-cols-1 md:grid-cols-3 gap-5" v-if="isShown('showTreatments') ||
                    isShown('showMyDailyEvents') ||
                    isShown('showBulletBoard')">
                    <div v-if="isShown('showTreatments')">
                        <ModulesUserDailyOverviewTreatments :dateRange="state.dateRange.formDateRange" />
                    </div>
                    <div v-if="isShown('showMyDailyEvents')">
                        <ModulesUserDailyOverviewMyEventToday :dateRange="state.dateRange.formDateRange" />
                    </div>
                    <ModulesUserDailyOverviewBulletBoard :dateRange="state.dateRange.formDateRange"
                        v-if="isShown('showBulletBoard')" />
                </div>

                <!-- Schedule + Plans -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5"
                    v-if="isShown('showScheduleSlots') || isShown('showPlansAndGoals')">
                    <div v-if="isShown('showScheduleSlots')">
                        <ModulesUserDailyOverviewScheduleSlots :dateRange="state.dateRange.formDateRange" />
                    </div>
                    <div v-if="isShown('showPlansAndGoals')">
                        <ModulesUserDailyOverviewPlansAndGoals :dateRange="state.dateRange.formDateRange" />
                    </div>
                </div>
            </div>

            <!-- Modals -->
            <ModulesUserDailyOverviewFilterModalShowHide :isModalOpen="state.modal.isFilterDailyOverviewOpen"
                @close="state.modal.isFilterDailyOverviewOpen = false" />
            <ModulesUserDailyOverviewFilterModalDateRange :isModalOpen="state.modal.isDailyOverviewDateRangeOpen"
                :dateRange="state.dateRange" @close="state.modal.isDailyOverviewDateRangeOpen = false"
                @filterDate="filterDailyOverviewByDate" />
            <ModulesUserDailyOverviewFilterModalDateRangeHelper :isModalOpen="state.modal.isDateRangeHelperOpen"
                @close="state.modal.isDateRangeHelperOpen = false" />
            <ModulesUserDailyOverviewQuickRiskAssessmentModalNew :isModalOpen="state.modal.isQuickRiskAssessmentOpen"
                @close="state.modal.isQuickRiskAssessmentOpen = false" />
            <ModulesUserJournalNotesModalNew :isModalOpen="state.modal.isCreateJournalOpen"
                :citizenOptions="state.citizenOptions" @close="state.modal.isCreateJournalOpen = false"
                @refreshJournal="fetchCitizensLatestJournal(state.dateRange.formDateRange)" />
            <Modal size="sm" :title="$t('overview.birthdays.title')" :show="state.modal.isBirthdaysOpen"
                @close="state.modal.isBirthdaysOpen = false">
                <template #modal-body>
                    <ul class="space-y-2 max-h-96 overflow-y-auto pr-1">
                        <li v-for="(birthday, birthdayIndex) in state.stats.birthdays" :key="birthdayIndex"
                            class="flex items-center justify-between gap-x-3 rounded-xl border px-3 py-2.5 transition-colors"
                            :class="birthday.days_until === 0 ? 'border-primary/30 bg-primary/5' : 'border-slate-100 hover:bg-slate-50'">
                            <div class="flex items-center gap-x-3 min-w-0">
                                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                                    :class="birthday.type === 'staff' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700'">
                                    {{ getInitials(birthday.name) }}
                                </div>
                                <div class="min-w-0">
                                    <div class="flex items-center gap-x-2">
                                        <span class="truncate font-medium text-slate-900">{{ birthday.name }}</span>
                                        <span class="shrink-0 rounded-full px-2 py-0.5 text-[11px]"
                                            :class="birthday.type === 'staff' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-600'">
                                            {{ birthday.type === 'staff' ? $t('overview.birthdays.staff') :
                                                $t('overview.birthdays.child') }}
                                        </span>
                                    </div>
                                    <div class="text-xs text-slate-400">{{ $t('overview.birthdays.turns', {
                                        age:
                                            birthday.age
                                    }) }}</div>
                                </div>
                            </div>
                            <span
                                class="inline-flex shrink-0 items-center gap-x-1 rounded-full px-2.5 py-1 text-xs font-medium"
                                :class="birthday.days_until === 0 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'">
                                <Icon v-if="birthday.days_until === 0" name="ph:cake-fill" class="h-3.5 w-3.5" />
                                <template v-if="birthday.days_until === 0">{{ $t('overview.birthdays.today')
                                }}</template>
                                <template v-else>{{ $t('overview.birthdays.inDays', { days: birthday.days_until })
                                }}</template>
                            </span>
                        </li>
                    </ul>
                </template>
            </Modal>
            <ModulesUserGuidedTourModalDailyOverview v-if="state.modal.isGuidedTourDailyOverviewOpen"
                :isModalOpen="state.modal.isGuidedTourDailyOverviewOpen" :isGuidedTour="false"
                @close="state.modal.isGuidedTourDailyOverviewOpen = false" />
            <ModulesUserHandoverModalSummary :isModalOpen="handoverOpen"
                :department="departmentStore.getSelectedDepartmentName" @close="handoverOpen = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useUserStore } from '@/store/user'
import { dailyOverviewService } from '@/components/api/user/DailyOverviewService'
import { citizenService } from '@/components/api/user/CitizenService'
import { continuityService } from '@/components/api/user/ContinuityService'
import { useCommandPalette } from '@/composables/useCommandPalette'
import { useDailyOverviewStore } from '@/store/daily-overview'
import { useDailyOverviewLayout } from '@/composables/useDailyOverviewLayout'
import { useDepartmentStore } from '@/store/department'
import { useConfetti } from '@/composables/useConfetti'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const overviewStore = useDailyOverviewStore()
// Admin-set layout for the selected department; with none, isShown() is the
// user's own show/hide choice, exactly as before.
const { isShown, visibleCustomBoxes, refreshLayout } = useDailyOverviewLayout()
const departmentStore = useDepartmentStore()

/**
 * Whether this company works with medicine at all.
 *
 * Same two conditions the citizen's medicine tab uses: the page has to be
 * granted, and the company's real module_pages choice (what Settings ->
 * Company manages) has to include it - not onboarding_preferences, which is
 * only ever written by the one-time onboarding wizard and goes stale the
 * moment the module is toggled from Settings instead. That staleness used
 * to leave this doses-due card hidden (or shown reading zero) even when the
 * company had genuinely enabled and was actively using medicine.
 */
const hasMedicineModule = computed(() => {
    const pages = userStore.getUser?.pages ?? []
    const hasPage = pages.some((page: any) => page.name === 'Medicine card')

    const companyModulePages = userStore.getUser?.company?.module_pages
    const companyHasModule = !Array.isArray(companyModulePages) || companyModulePages.length === 0 || companyModulePages.includes('Medicine card')

    return hasPage && companyHasModule
})

// True when any statistics widget is enabled — guards the collapsible Statistics
// section so an empty header never shows.
const showStatisticsSection = computed(() => {
    const f = overviewStore.getDailyOverviewFilter
    const useOfForceEnabled = userStore.getUser?.company?.onboarding_preferences?.modules?.useOfForce !== false
    return f.showCitizensAdmissionAndDischarged || f.showCitizensOrigin || f.showCitizensAddictions
        || f.showCitizensDiagnoses || f.showRiskAssessment || f.showGender
        || f.showStatusesScoreStatistics || f.showGoalsScoreStatistics || f.showIncidentStatistics
        || f.showMedicineDeviationStatistics || f.showJournalScoreStatistics || f.showSubgoalsScoreStatistics
        || (f.showUseOfForceStatistics && useOfForceEnabled)
})
const userStore = useUserStore() as any
const handoverOpen = ref(false)
const { celebrate } = useConfetti()
const { successAlert } = useAlert()
const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const newsSection = ref<HTMLElement | null>(null)

const state = reactive({
    currentDate: moment(),
    dateRange: {
        formDateRange: {
            start_date: moment().startOf('isoWeek').format('YYYY-MM-DD'),
            end_date: moment().endOf('isoWeek').format('YYYY-MM-DD'),
        },
    } as any,
    continuity: null as { type: 'citizen' | 'chat'; subject_uuid: string; label: string } | null,
    error: {} as Error,
    isPageLoading: false,
    citizenOptions: [] as any,
    modal: {
        isDailyOverviewDateRangeOpen: false,
        isDateRangeHelperOpen: false,
        isFilterDailyOverviewOpen: false,
        isGuidedTourDailyOverviewOpen: false,
        isQuickRiskAssessmentOpen: false,
        isBirthdaysOpen: false,
        isCreateJournalOpen: false,
    },
    stats: {
        citizenCalendarEvents: [],
        latestCitizensJournal: [],
        recentJournalNotesTotal: 0,
        medicines: [],
        medicinesDeviatedCount: 0,
        medicinesGivenCount: 0,
        medicinesPendingCount: 0,
        activeTreatmentsCount: 0,
        birthdays: [],
    } as any,
})

function getInitials(name: string) {
    const parts = (name ?? '').trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return '?'
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

const todaysBirthdays = computed(() => (state.stats.birthdays ?? []).filter((birthday: any) => birthday.days_until === 0))
const thisWeekBirthdays = computed(() => (state.stats.birthdays ?? []).filter((birthday: any) => birthday.days_until <= 7))
const hasThisWeekBirthdays = computed(() => thisWeekBirthdays.value.length > 0)
const laterBirthdaysCount = computed(() => thisWeekBirthdays.value.length - todaysBirthdays.value.length)
// When nobody has a birthday this week the backend returns just the next one
// in line, so the card can still show who's up next.
const nextBirthday = computed(() => (state.stats.birthdays ?? [])[0] ?? null)

// Citizens needing medicine attention now: a deviation, or an overdue dose
// (scheduled earlier today and still not given). Doses later today that aren't
// due yet are excluded — they're not actionable yet.
const medicineActionCitizens = computed(() => {
    const now = moment()
    const today = now.format('YYYY-MM-DD')
    const byCitizen = new Map<string, { uuid: string; name: string; deviated: number; overdue: number }>()
    for (const medicine of (state.stats.medicines?.data ?? [])) {
        const citizen = medicine?.citizen
        if (!citizen) continue
        const todaysDoses = (medicine.due_dates ?? []).filter((due: any) => due.date === today)
        const deviated = todaysDoses.filter((due: any) => due.status === 'deviated').length
        const overdue = todaysDoses.filter((due: any) =>
            due.status === null && due.time && moment(`${today} ${due.time}`, 'YYYY-MM-DD HH:mm').isBefore(now)
        ).length
        if (deviated === 0 && overdue === 0) continue
        const key = citizen.uuid ?? `${citizen.firstname}-${citizen.lastname}`
        const entry = byCitizen.get(key) ?? {
            uuid: citizen.uuid ?? '',
            name: `${citizen.firstname ?? ''} ${citizen.lastname ?? ''}`.trim(),
            deviated: 0,
            overdue: 0,
        }
        entry.deviated += deviated
        entry.overdue += overdue
        byCitizen.set(key, entry)
    }
    // Deviations are more urgent than overdue doses, so surface them first.
    return Array.from(byCitizen.values()).sort((a, b) => (b.deviated - a.deviated) || (b.overdue - a.overdue))
})

// Warm, time-of-day greeting for the shift briefing.
const firstName = computed(() => userStore.getUser?.firstname ?? '')
const greetingPart = computed(() => {
    const hour = moment().hour()
    return hour < 12 ? 'morning' : (hour < 18 ? 'afternoon' : 'evening')
})
const todaysEventsCount = computed(() => state.stats.citizenCalendarEvents?.data?.length ?? 0)

// The recent journal notes feed always opens on the last seven days, no matter
// where the date navigator above stands - that is the window staff catch up on.
const recentJournalDays = 7

function goToAllJournalNotes() {
    navigateTo({
        path: '/journal-notes',
        query: recentJournalWindow(recentJournalDays),
    })
}

const { setPageCommands, clearPageCommands } = useCommandPalette()

// "Fortsæt hvor du slap" - failure is silent on purpose, this is a
// nice-to-have prompt, never worth an error banner over.
async function fetchContinuity() {
    try {
        const response = await continuityService.get()
        if (response?.data) state.continuity = response.data
    } catch {
        // Silent - see comment above.
    }
}

function goToContinuity() {
    if (!state.continuity) return
    const path = state.continuity.type === 'chat'
        ? `/messages/${state.continuity.subject_uuid}`
        : `/citizens/${state.continuity.subject_uuid}/journals`
    navigateTo(path)
}

onMounted(() => {
    // Desktop Dock quick action ("Ny note") arrives as
    // citizenone://overview?action=new-note - see citizenone-desktop's Dock
    // menu (main.ts). Cleared via replace so a later refresh/back doesn't
    // reopen the modal.
    if (route.query.action === 'new-note') {
        state.modal.isCreateJournalOpen = true
        router.replace({ query: {} })
    }
    refreshLayout()
    scrollToNewsIfNeeded()
    fetchUpcomingBirthdays()
    fetchAllCitizens()
    fetchContinuity()
    setPageCommands([
        {
            id: 'overview-new-journal',
            group: t('commandPalette.actions'),
            icon: 'ph:note-pencil',
            label: t('journalNotes.newNote'),
            run: () => { state.modal.isCreateJournalOpen = true },
        },
    ])
})

onBeforeUnmount(() => clearPageCommands())

async function fetchAllCitizens() {
    try {
        const response = await citizenService.getAllCitizens({})
        if (response?.data) {
            state.citizenOptions = response.data.map((citizen: any) => ({
                value: citizen?.uuid,
                label: `${citizen?.firstname} ${citizen?.lastname}`,
            }))
        }
    } catch {
        // silently ignore - citizens list is optional for the quick journal-note shortcut
    }
}

watch(() => departmentStore.getSelectedDepartmentName, () => {
    fetchUpcomingBirthdays()
    refreshLayout()
})

// The user object is written more than once per load - route middleware
// fetches it before the layout's own onMounted does - and this watcher fires on
// every write. Each fire re-read the saved filter over whatever range the user
// had just picked and refired the four requests behind it, which is a doubled
// fan-out on a screen that already makes about a dozen calls, and the reason a
// chosen range could snap back to today on its own. The saved filter decides
// the range once; after that the range belongs to the session.
//
// immediate, because arriving from another page in the app leaves the user
// already in the store, and a watcher with nothing left to fire on would leave
// the events/journal/medicine cards empty.
let savedDateFilterApplied = false

watch(() => userStore.getUser, (user: any) => {
    if (user && !savedDateFilterApplied) {
        savedDateFilterApplied = true
        if (user?.daily_overview_date_filter?.filter_type === 'today') {
            state.dateRange.formDateRange = {
                start_date: moment().format('YYYY-MM-DD'),
                end_date: moment().format('YYYY-MM-DD'),
            }
        } else if (user?.daily_overview_date_filter?.filter_type === 'next_7_days') {
            state.dateRange.formDateRange = {
                start_date: moment().format('YYYY-MM-DD'),
                end_date: moment().add(1, 'week').format('YYYY-MM-DD'),
            }
        } else if (user?.daily_overview_date_filter?.filter_type === 'custom') {
            state.dateRange.formDateRange = {
                start_date: moment(user?.daily_overview_date_filter?.overview_date_start).format('YYYY-MM-DD'),
                end_date: moment(user?.daily_overview_date_filter?.overview_date_end).format('YYYY-MM-DD'),
            }
        } else {
            state.dateRange.formDateRange = {
                start_date: moment().startOf('isoWeek').format('YYYY-MM-DD'),
                end_date: moment().endOf('isoWeek').format('YYYY-MM-DD'),
            }
        }
        fetchCitizenCalendarEvents(state.dateRange.formDateRange)
        fetchCitizensLatestJournal(state.dateRange.formDateRange)
        fetchCitizensMedicines(state.dateRange.formDateRange)
        fetchActiveTreatmentsCount()
    }
}, { immediate: true })

function scrollToTreatments() {
    const el = document.getElementById('treatments-section')
    if (el) {
        const offset = 80 // compensate for fixed navbar height
        const top = el.getBoundingClientRect().top + window.scrollY - offset
        window.scrollTo({ top, behavior: 'smooth' })
    }
}

// Month names come from the app's own `months.*` keys: moment's locale files
// are not reliably bundled, so `format('MMMM')` printed "September - October"
// in a Danish interface (see the same note in pages/my-day/index.vue).
const MONTH_KEYS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

function formatDay(date: moment.Moment, withYear: boolean) {
    const month = t('months.' + MONTH_KEYS[date.month()])
    // "24 September 2026" in English; "24. september 2026" in the Nordic languages.
    const day = locale.value === 'en' ? `${date.date()} ${month}` : `${date.date()}. ${month.toLowerCase()}`
    return withYear ? `${day} ${date.year()}` : day
}

function formatDisplayDate() {
    const start = moment(state.dateRange.formDateRange.start_date)
    const end = moment(state.dateRange.formDateRange.end_date)
    if (start.isSame(end, 'day')) {
        return formatDay(start, true)
    }
    return `${formatDay(start, !start.isSame(end, 'year'))} – ${formatDay(end, true)}`
}

function previousDay() {
    const start = moment(state.dateRange.formDateRange.start_date)
    const end = moment(state.dateRange.formDateRange.end_date)
    const diff = end.diff(start, 'days') + 1
    const newStart = start.clone().subtract(diff, 'days')
    const newEnd = end.clone().subtract(diff, 'days')
    state.dateRange.formDateRange.start_date = newStart.format('YYYY-MM-DD')
    state.dateRange.formDateRange.end_date = newEnd.format('YYYY-MM-DD')
    state.currentDate = newStart
    fetchCitizenCalendarEvents(state.dateRange.formDateRange)
    fetchCitizensLatestJournal(state.dateRange.formDateRange)
    fetchCitizensMedicines(state.dateRange.formDateRange)
}

function nextDay() {
    const start = moment(state.dateRange.formDateRange.start_date)
    const end = moment(state.dateRange.formDateRange.end_date)
    const diff = end.diff(start, 'days') + 1
    const newStart = start.clone().add(diff, 'days')
    const newEnd = end.clone().add(diff, 'days')
    state.dateRange.formDateRange.start_date = newStart.format('YYYY-MM-DD')
    state.dateRange.formDateRange.end_date = newEnd.format('YYYY-MM-DD')
    state.currentDate = newStart
    fetchCitizenCalendarEvents(state.dateRange.formDateRange)
    fetchCitizensLatestJournal(state.dateRange.formDateRange)
    fetchCitizensMedicines(state.dateRange.formDateRange)
}

function scrollToNewsIfNeeded() {
    if (route.hash === '#news' && newsSection.value) {
        nextTick(() => {
            setTimeout(() => {
                newsSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 3000)
        })
    }
}

function openGuidedTour() {
    state.modal.isGuidedTourDailyOverviewOpen = true
}

function filterDailyOverviewByDate(formDateRange: any) {
    state.dateRange.formDateRange.start_date = formDateRange.start_date
    state.dateRange.formDateRange.end_date = formDateRange.end_date
}

async function fetchCitizenCalendarEvents(dateRange: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params: any = {
            department: departmentStore.getSelectedDepartmentName
        }

        if (state.dateRange) {
            params.end_date = dateRange.end_date
            params.start_date = dateRange.start_date
        }
        const response = await dailyOverviewService.getCitizenDailyEvents(params)
        if (response) {
            state.stats.citizenCalendarEvents = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchUpcomingBirthdays() {
    try {
        const response = await dailyOverviewService.getUpcomingBirthdays({
            department: departmentStore.getSelectedDepartmentName,
        })
        if (response) {
            state.stats.birthdays = response.data ?? []
        }
    } catch (error: any) {
        state.error = error
    }
}

async function fetchCitizensLatestJournal(dateRange: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params: any = {
            department: departmentStore.getSelectedDepartmentName,
        }

        if (state.dateRange) {
            params.end_date = dateRange.end_date
            params.start_date = dateRange.start_date
        }
        const response = await dailyOverviewService.getLatestCitizensJournal(params)
        if (response) {
            state.stats.latestCitizensJournal = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchCitizensMedicines(dateRange: any) {
    // Nothing on the page reads it when the module is off: both the doses-due
    // card and the medication panel are gone.
    if (!hasMedicineModule.value) {
        return
    }

    state.error = {}
    state.isPageLoading = true
    try {
        const params: any = {
            department: departmentStore.getSelectedDepartmentName
        }

        if (state.dateRange) {
            params.end_date = dateRange.end_date
            params.start_date = dateRange.start_date
        }
        const response = await dailyOverviewService.getCitizenDailyMedicineOverview(params)
        if (response) {
            state.stats.medicines = response

            const today = moment().format('YYYY-MM-DD')

            const todayDueDates = response?.data?.flatMap((medicine: any) =>
                (medicine?.due_dates || []).filter((dueDate: any) => dueDate.date === today)
            ) || []

            state.stats.medicinesPendingCount = todayDueDates.filter(
                (dueDate: any) => dueDate.status === null
            ).length

            state.stats.medicinesGivenCount = todayDueDates.filter(
                (dueDate: any) => ['delivered', 'given'].includes(dueDate.status)
            ).length

            state.stats.medicinesDeviatedCount = todayDueDates.filter(
                (dueDate: any) => dueDate.status === 'deviated'
            ).length

            maybeCelebrateMedicines()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

// A small celebration the first time today's medicine is fully done.
function maybeCelebrateMedicines() {
    const given = state.stats.medicinesGivenCount
    const pending = state.stats.medicinesPendingCount
    const deviated = state.stats.medicinesDeviatedCount
    if (given <= 0 || pending !== 0 || deviated !== 0) return
    const key = 'medsCelebrated-' + moment().format('YYYY-MM-DD')
    if (typeof localStorage === 'undefined' || localStorage.getItem(key)) return
    localStorage.setItem(key, 'true')
    celebrate({ emojis: ['🎉', '✨', '🥳', '💊'], count: 24 })
    successAlert(t('overview.medsDone.title'), t('overview.medsDone.body'))
}

async function fetchActiveTreatmentsCount() {
    try {
        const params: any = {
            is_completed: 0,
            department: departmentStore.getSelectedDepartmentName,
            per_page: 1,
        }
        const response = await dailyOverviewService.getTreatments(params)
        if (response) {
            state.stats.activeTreatmentsCount = response.total ?? response.data?.length ?? 0
        }
    } catch {
        // silently fail — widget shows 0
    }
}
</script>
