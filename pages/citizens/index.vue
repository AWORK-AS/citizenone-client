<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ customPagesStore.getCustomPagesName?.citizens }}
                    -
                    {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb>
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

            <template #header>
                {{ customPagesStore.getCustomPagesName?.citizens }}
            </template>
            <template #guided-tour>
                <Tooltip :text="$t('guidedTour')" position="left" @click="openGuidedTour()">
                    <Icon name="ph:question" class="size-6 cursor-pointer text-gray-700" aria-hidden="true" />
                </Tooltip>
            </template>

            <div>
                <div
                    class="flex justify-between items-start flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
                    <div class="flex items-center gap-x-3">
                        <span
                            v-if="departmentStore.getSelectedDepartmentName && departmentStore.getSelectedDepartmentName !== 'All departments'"
                            class="inline-flex items-center gap-x-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-medium">
                            <Icon name="ph:buildings" class="h-4 w-4" aria-hidden="true" />
                            {{ departmentStore.getSelectedDepartmentName }}
                        </span>
                        <div class="flex items-center gap-x-1 text-sm text-slate-500">
                            <span>{{ $t('entriesPerPage') }}:</span>
                            <select class="focus:outline-none bg-transparent" @change="changePageLength"
                                id="citizensPageLength">
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="30">30</option>
                                <option value="40">40</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                                <option value="500">500</option>
                            </select>
                        </div>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                        <!-- Secondary actions grouped into one menu to declutter the toolbar.
                             All authorization gates (admin / can()) are preserved per item. -->
                        <Menu as="div" class="relative inline-block text-left z-20">
                            <div>
                                <MenuButton>
                                    <FormButton buttonStyle="action">
                                        <Icon name="ph:dots-three-outline" class="h-4 w-4" aria-hidden="true" />
                                        {{ $t('citizens.actions') }}
                                        <Icon name="ph:caret-down" class="h-3.5 w-3.5" aria-hidden="true" />
                                    </FormButton>
                                </MenuButton>
                            </div>
                            <transition enter-active-class="transition duration-100 ease-out"
                                enter-from-class="transform scale-95 opacity-0"
                                enter-to-class="transform scale-100 opacity-100"
                                leave-active-class="transition duration-75 ease-in"
                                leave-from-class="transform scale-100 opacity-100"
                                leave-to-class="transform scale-95 opacity-0">
                                <MenuItems
                                    class="absolute right-0 mt-2 min-w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none max-h-96 overflow-y-auto z-30">
                                    <div class="px-1 py-1">
                                        <MenuItem v-slot="{ active }">
                                            <button
                                                :class="[active && 'bg-gray-100', 'group flex w-full items-center gap-x-2 rounded-md px-2 py-2.5 text-sm text-left']"
                                                @click="state.modal.isViewLocationsOpen = true">
                                                <Icon name="ph:map-pin" class="h-4 w-4 text-gray-500"
                                                    aria-hidden="true" />
                                                {{ $t('citizens.viewLocations.viewLocations') }}
                                            </button>
                                        </MenuItem>
                                        <MenuItem v-slot="{ active }" v-if="isShelterOrCrisisCenter">
                                            <button
                                                :class="[active && 'bg-gray-100', 'group flex w-full items-center gap-x-2 rounded-md px-2 py-2.5 text-sm text-left']"
                                                @click="navigateTo('/inquiries')">
                                                <Icon name="ph:list-bullets" class="h-4 w-4 text-gray-500"
                                                    aria-hidden="true" />
                                                {{ $t('inquiries.inquiries') }}
                                            </button>
                                        </MenuItem>
                                        <MenuItem v-slot="{ active }">
                                            <button
                                                :class="[active && 'bg-gray-100', 'group flex w-full items-center gap-x-2 rounded-md px-2 py-2.5 text-sm text-left']"
                                                @click="navigateTo('/rooms')">
                                                <Icon name="ph:door" class="h-4 w-4 text-gray-500" aria-hidden="true" />
                                                {{ customPagesStore.getCustomPagesName?.rooms || $t('rooms.rooms') }}
                                            </button>
                                        </MenuItem>
                                        <MenuItem v-slot="{ active }">
                                            <button
                                                :class="[active && 'bg-gray-100', 'group flex w-full items-center gap-x-2 rounded-md px-2 py-2.5 text-sm text-left']"
                                                @click="navigateTo('/children')">
                                                <Icon name="ph:baby" class="h-4 w-4 text-gray-500" aria-hidden="true" />
                                                {{ $t('children.children') }}
                                            </button>
                                        </MenuItem>
                                        <MenuItem v-slot="{ active }">
                                            <button
                                                :class="[active && 'bg-gray-100', 'group flex w-full items-center gap-x-2 rounded-md px-2 py-2.5 text-sm text-left']"
                                                @click="state.modal.isSharedJournalsOpen = true">
                                                <Icon name="ph:share-fat" class="h-4 w-4 text-gray-500"
                                                    aria-hidden="true" />
                                                {{ $t('citizens.citizenJournals.shareJournals.sharedJournals') }}
                                            </button>
                                        </MenuItem>
                                        <MenuItem v-slot="{ active }" v-if="isAtLeast('Admin')">
                                            <button
                                                :class="[active && 'bg-gray-100', 'group flex w-full items-center gap-x-2 rounded-md px-2 py-2.5 text-sm text-left']"
                                                @click="state.modal.isImportCitizensOpen = true">
                                                <Icon name="ph:file-arrow-up" class="h-4 w-4 text-gray-500"
                                                    aria-hidden="true" />
                                                {{ $t('citizens.importCitizens.importCitizens') }}
                                            </button>
                                        </MenuItem>
                                        <MenuItem v-slot="{ active }" v-if="isAtLeast('Admin')">
                                            <button
                                                :class="[active && 'bg-gray-100', 'group flex w-full items-center gap-x-2 rounded-md px-2 py-2.5 text-sm text-left']"
                                                @click="state.modal.isImportMapperOpen = true">
                                                <Icon name="ph:arrows-merge" class="h-4 w-4 text-gray-500"
                                                    aria-hidden="true" />
                                                {{ $t('citizens.importFromOtherSystem') }}
                                            </button>
                                        </MenuItem>
                                        <MenuItem v-slot="{ active }"
                                            v-if="isAtLeast('Admin') && !isShelterOrCrisisCenter">
                                            <button
                                                :class="[active && 'bg-gray-100', 'group flex w-full items-center gap-x-2 rounded-md px-2 py-2.5 text-sm text-left']"
                                                @click="exportCitizens({})">
                                                <Icon name="ph:file-arrow-down" class="h-4 w-4 text-gray-500"
                                                    aria-hidden="true" />
                                                {{ $t('citizens.exportCitizens') }}
                                            </button>
                                        </MenuItem>
                                        <MenuItem v-slot="{ active }"
                                            v-if="isAtLeast('Admin') || can('update_form_field_config')">
                                            <button
                                                :class="[active && 'bg-gray-100', 'group flex w-full items-center gap-x-2 rounded-md px-2 py-2.5 text-sm text-left']"
                                                @click="navigateTo('/citizens/citizen-form')">
                                                <Icon name="ph:gear" class="h-4 w-4 text-gray-500" aria-hidden="true" />
                                                {{ $t('citizens.editCitizenForm') }}
                                            </button>
                                        </MenuItem>
                                        <MenuItem v-slot="{ active }"
                                            v-if="isAtLeast('Admin') || can('update_form_field_config')">
                                            <button
                                                :class="[active && 'bg-gray-100', 'group flex w-full items-center gap-x-2 rounded-md px-2 py-2.5 text-sm text-left']"
                                                @click="navigateTo('/citizens/journal-form-config')">
                                                <Icon name="ph:gear" class="h-4 w-4 text-gray-500" aria-hidden="true" />
                                                {{ $t('journalFormConfig.navLabel') }}
                                            </button>
                                        </MenuItem>
                                    </div>
                                </MenuItems>
                            </transition>
                        </Menu>
                        <Menu v-if="isAtLeast('Admin') && isShelterOrCrisisCenter" as="div"
                            class="relative inline-block text-left z-20">
                            <div>
                                <MenuButton>
                                    <FormButton buttonStyle="action">
                                        <Icon name="ph:file-arrow-down" class="h-4 w-4" aria-hidden="true" />
                                        {{ $t('citizens.exportCitizens') }}
                                    </FormButton>
                                </MenuButton>
                            </div>

                            <transition enter-active-class="transition duration-100 ease-out"
                                enter-from-class="transform scale-95 opacity-0"
                                enter-to-class="transform scale-100 opacity-100"
                                leave-active-class="transition duration-75 ease-in"
                                leave-from-class="transform scale-100 opacity-100"
                                leave-to-class="transform scale-95 opacity-0">
                                <MenuItems
                                    class="absolute right-0 mt-2 min-w-44 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none max-h-96 overflow-y-auto">
                                    <div class="px-1 py-1">
                                        <MenuItem v-slot="{ active }">
                                            <button :class="[
                                                active && 'bg-gray-100',
                                                'group flex w-full justify-start items-center rounded-md px-2 py-2.5 text-sm text-left',
                                            ]" @click="exportCitizens({})">
                                                {{ $t('department.allDepartment') }}
                                            </button>
                                        </MenuItem>
                                        <MenuItem v-slot="{ active }"
                                            v-for="(department, index) in state.departments?.data?.filter((d: any) => d.name !== 'All departments')"
                                            :key="index">
                                            <button :class="[
                                                active && 'bg-gray-100',
                                                'group flex w-full justify-start items-center rounded-md px-2 py-2.5 text-sm text-left',
                                            ]"
                                                @click="exportCitizens({ department: department.name, department_uuid: department.uuid })">
                                                {{ department.name }}
                                            </button>
                                        </MenuItem>
                                    </div>
                                </MenuItems>
                            </transition>
                        </Menu>
                        <Menu
                            v-if="userStore.getUser?.company?.industry?.system_name === 'social_welfare' && ['Crisis center', 'Shelter'].includes(userStore.getUser?.company?.facility_type?.en_name)"
                            as="div" class="relative inline-block text-left z-20">
                            <div>
                                <MenuButton>
                                    <FormButton buttonStyle="action">
                                        <Icon name="ph:file-arrow-down" class="h-4 w-4" aria-hidden="true" />
                                        {{ $t('inquiries.exportInquiries') }}
                                    </FormButton>
                                </MenuButton>
                            </div>

                            <transition enter-active-class="transition duration-100 ease-out"
                                enter-from-class="transform scale-95 opacity-0"
                                enter-to-class="transform scale-100 opacity-100"
                                leave-active-class="transition duration-75 ease-in"
                                leave-from-class="transform scale-100 opacity-100"
                                leave-to-class="transform scale-95 opacity-0">
                                <MenuItems
                                    class="absolute right-0 mt-2 min-w-44 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                                    <div class="px-1 py-1">
                                        <MenuItem v-slot="{ active }">
                                            <button :class="[
                                                active && 'bg-gray-100',
                                                'group flex w-full justify-start items-center rounded-md px-2 py-2.5 text-sm text-left',
                                            ]" @click="openExportInquiriesModal('shelter')">
                                                {{ shelterName }}
                                            </button>
                                        </MenuItem>
                                        <MenuItem v-slot="{ active }">
                                            <button :class="[
                                                active && 'bg-gray-100',
                                                'group flex w-full items-center rounded-md px-2 py-2.5 text-sm',
                                            ]" @click="openExportInquiriesModal('crisis_center')">
                                                {{ crisisCenterName }}
                                            </button>
                                        </MenuItem>
                                    </div>
                                </MenuItems>
                            </transition>
                        </Menu>
                        <FormButton buttonStyle="action" @click="state.modal.isFilterOpen = true">
                            <Icon name="ic:outline-filter-list" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('filter') }}
                            <span v-if="activeFilterCount > 0"
                                class="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xxs font-semibold text-white">
                                {{ activeFilterCount }}
                            </span>
                        </FormButton>
                        <!-- Primary call-to-action -->
                        <FormButton v-if="isAtLeast('Admin') || can('create_citizen')" buttonStyle="primary"
                            @click="navigateTo('/citizens/new')">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ tt('citizens.newCitizen') }}
                        </FormButton>
                    </div>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <!-- Count summary -->
                    <div class="flex items-baseline gap-2" v-if="state.citizens">
                        <span class="text-2xl font-bold tracking-tight text-primary">
                            <CountUp :value="Number(state.citizens?.total ?? state.citizens?.data?.length ?? 0)" />
                        </span>
                        <span class="text-sm font-medium text-slate-500">{{ $t('citizens.citizens') }}</span>
                    </div>
                    <TableSearch @search="handleSearch" :placeholder="$t('citizens.searchPlaceholder')" />
                    <div class="flex flex-wrap items-center gap-2" v-if="activeFilterCount > 0">
                        <span class="text-xs font-medium text-slate-500">{{ $t('citizens.filters.activeFilters') }}:</span>
                        <button type="button" v-for="chip in activeFilterChips" :key="chip.key"
                            class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 hover:bg-slate-200"
                            @click="removeFilter(chip.key)">
                            {{ chip.label }}
                            <Icon name="ph:x" class="size-3" aria-hidden="true" />
                        </button>
                        <button type="button" class="text-xs font-medium text-tertiary hover:underline"
                            @click="clearFilters">
                            {{ $t('table.clearFilters') }}
                        </button>
                    </div>
                    <!-- Phone: the table shows two of six columns and pushes every
                         row action off screen, so below md the same data is a list
                         of cards instead. Staff on the floor carry a phone. -->
                    <div class="md:hidden space-y-3" v-if="!state.isTableLoading">
                        <div v-if="(state.citizens?.data?.length ?? 0) === 0"
                            class="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
                            <template v-if="isFiltered">
                                <p>{{ emptyFilteredMessage }}</p>
                                <button type="button" class="mt-2 font-medium text-tertiary hover:underline"
                                    @click="clearFilters">{{ $t('table.clearFilters') }}</button>
                            </template>
                            <p v-else>{{ $t('citizens.emptyList') }}</p>
                        </div>
                        <article v-for="citizen in state.citizens?.data" :key="citizen.uuid"
                            class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                            <div class="flex items-start gap-3">
                                <img class="size-11 shrink-0 rounded-full object-cover"
                                    :src="citizen.image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${citizen.firstname} ${citizen.lastname}`"
                                    :alt="`${citizen.firstname} ${citizen.lastname}`" />
                                <div class="min-w-0 flex-1">
                                    <button type="button"
                                        class="flex min-h-11 w-full items-center truncate text-left font-semibold text-primary"
                                        @click="navigateTo(`/citizens/${citizen.uuid}/journals`)">
                                        {{ citizen.firstname }} {{ citizen.lastname }}
                                    </button>
                                    <p class="mt-0.5 truncate text-xs text-slate-500">
                                        <span v-for="(department, index) in citizen?.departments" :key="index">
                                            {{ department?.name }}<span v-if="index < (citizen?.departments?.length ?? 0) - 1">, </span>
                                        </span>
                                        <span v-if="!citizen?.departments?.length">{{ $t('citizens.noDepartmentYet') }}</span>
                                    </p>
                                </div>
                                <button type="button"
                                    class="flex size-11 shrink-0 items-center justify-center rounded-full"
                                    :aria-label="isPinned(citizen.uuid) ? $t('citizens.table.actions.unpin') : $t('citizens.table.actions.pin')"
                                    :aria-pressed="isPinned(citizen.uuid)" @click="togglePin(citizen)">
                                    <Icon :name="isPinned(citizen.uuid) ? 'ph:star-fill' : 'ph:star'"
                                        class="size-5" :class="isPinned(citizen.uuid) ? 'text-tertiary' : 'text-slate-300'" />
                                </button>
                            </div>
                            <dl class="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                                <div v-if="citizen.phone">
                                    <dt class="text-slate-400">{{ $t('citizens.form.phone') }}</dt>
                                    <dd><a :href="`tel:${citizen.phone}`"
                                        class="flex min-h-11 items-center text-primary">{{ citizen.phone }}</a></dd>
                                </div>
                                <div v-if="citizen.social_security_number">
                                    <dt class="text-slate-400">{{ $t('citizens.form.ssn') }}</dt>
                                    <dd class="tabular-nums text-slate-600">{{ citizen.social_security_number }}</dd>
                                </div>
                            </dl>
                            <div class="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
                                <FormButton type="button" buttonStyle="action" class="min-h-11 flex-1"
                                    @click="navigateTo(`/citizens/${citizen.uuid}/journals`)">
                                    {{ $t('citizens.table.actions.latestJournalEntry') }}
                                </FormButton>
                                <FormButton type="button" buttonStyle="cancel" class="min-h-11 flex-1"
                                    @click="navigateTo(`/citizens/${citizen.uuid}/edit`)">
                                    {{ $t('citizens.table.actions.edit') }}
                                </FormButton>
                            </div>
                        </article>
                    </div>
                    <div class="hidden md:block table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.citizens"
                            :isLoading="state.isTableLoading" :sortData="citizenStore.getSortData" @sort="sort"
                            emptyIcon="heroicons:user-group"
                            :emptyMessage="tt('citizens.emptyListHint')">
                            <template #body v-if="!(state.isTableLoading || (state.citizens?.data?.length === 0))">
                                <tr v-for="(citizen, index) in state.citizens?.data" :key="index">
                                    <td width="30%">
                                        <div class="flex items-center gap-x-2">
                                            <Tooltip
                                                :text="isPinned(citizen.uuid) ? $t('citizens.table.actions.unpin') : $t('citizens.table.actions.pin')">
                                                <button type="button" @click="togglePin(citizen)"
                                                    class="shrink-0 flex items-center justify-center rounded-full p-0.5 transition-colors"
                                                    :aria-pressed="isPinned(citizen.uuid)"
                                                    :aria-label="isPinned(citizen.uuid) ? $t('citizens.table.actions.unpin') : $t('citizens.table.actions.pin')">
                                                    <Icon
                                                        :name="isPinned(citizen.uuid) ? 'heroicons:star-solid' : 'heroicons:star'"
                                                        :class="['size-5', isPinned(citizen.uuid) ? 'text-tertiary' : 'text-gray-300 hover:text-tertiary']" />
                                                </button>
                                            </Tooltip>
                                            <img :src="citizen?.image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${citizen?.firstname + ' ' + citizen?.lastname}`"
                                                :class="[
                                                    citizen.latest_risk_assessment === null && 'border-secondary',
                                                    citizen.latest_risk_assessment?.assessment === 'no risk' && 'border-green-700',
                                                    citizen.latest_risk_assessment?.assessment === 'increased risk' && 'border-yellow-500',
                                                    citizen.latest_risk_assessment?.assessment === 'acute increased risk' && 'border-red-600',
                                                    'rounded-full w-12 h-12 object-cover border-2'
                                                ]" />
                                            <div>
                                                <CitizenHoverCard :uuid="citizen.uuid" :preset="citizen">
                                                    <button type="button"
                                                        class="text-left font-medium hover:text-primary hover:underline"
                                                        @click="navigateTo(`/citizens/${citizen.uuid}/journals`)">
                                                        {{ citizen?.firstname }} {{ citizen?.lastname }}
                                                    </button>
                                                </CitizenHoverCard>
                                                <div class="text-xxs flex flex-wrap gap-1">
                                                    <span v-for="(department, index) in citizen?.departments" :key=index
                                                        class="bg-primary px-2 py-1 text-white rounded-md">
                                                        {{ department?.name }}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td width="20%">
                                        <p v-if="citizen?.email">{{ citizen?.email }}</p>
                                    </td>
                                    <td width="15%">
                                        <span>{{ citizen?.social_security_number }}</span>
                                        <!-- The case number sits under the CPR rather than in a column
                                             of its own: only the customers who migrated from another
                                             system have one, and an always-empty column costs every
                                             other customer a column's width. -->
                                        <p v-if="citizen?.case_number" class="text-xxs text-gray-500">
                                            {{ $t('citizens.table.caseNumber') }}: {{ citizen.case_number }}
                                        </p>
                                    </td>
                                    <td width="15%">
                                        <span>{{ citizen?.phone }}</span>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-center justify-end gap-1.5">
                                            <Tooltip v-if="isInterventionCheckinEnabled"
                                                :text="citizen?.is_checked_in ? $t('citizens.table.actions.checkOut') : $t('citizens.table.actions.checkIn')">
                                                <FormSwitch :value="citizen?.is_checked_in"
                                                    @toggleSwitch="toggleLogin(citizen)" />
                                            </Tooltip>
                                            <Tooltip :text="$t('citizens.table.actions.view')">
                                                <FormButton :aria-label="$t('citizens.table.actions.view')" type="button" buttonStyle="action" buttonSize="xs"
                                                    @click="navigateTo(`/citizens/${citizen.uuid}/journals`)">
                                                    <Icon name="ph:eye" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip v-if="isMedicineEnabled"
                                                :text="$t('citizens.table.actions.medicationOverview')">
                                                <FormButton :aria-label="$t('citizens.table.actions.medicationOverview')" type="button" buttonStyle="action" buttonSize="xs"
                                                    @click="navigateTo(`/citizens/${citizen.uuid}/medicine-journals`)">
                                                    <Icon name="solar:jar-of-pills-2-linear" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip v-if="isDokumentationEnabled" :text="citizen?.plans_goals_status === 'none' ? $t('citizens.table.actions.plansAndGoals.noPlansAndGoals') :
                                                citizen?.plans_goals_status === 'expiring' ? $t('citizens.table.actions.plansAndGoals.expiringPlansAndGoals') :
                                                    citizen?.plans_goals_status === 'expired' ? $t('citizens.table.actions.plansAndGoals.expiredPlansAndGoals') :
                                                        $t('citizens.table.actions.plansAndGoals.plansAndGoals')">
                                                <FormButton :aria-label="citizen?.plans_goals_status === 'none' ? $t('citizens.table.actions.plansAndGoals.noPlansAndGoals') :
                                                citizen?.plans_goals_status === 'expiring' ? $t('citizens.table.actions.plansAndGoals.expiringPlansAndGoals') :
                                                    citizen?.plans_goals_status === 'expired' ? $t('citizens.table.actions.plansAndGoals.expiredPlansAndGoals') :
                                                        $t('citizens.table.actions.plansAndGoals.plansAndGoals')" type="button" buttonSize="xs" :buttonStyle="citizen?.plans_goals_status === 'none' ? 'plans-none' :
                                                    citizen?.plans_goals_status === 'expiring' ? 'plans-expiring' :
                                                        citizen?.plans_goals_status === 'expired' ? 'plans-expired' :
                                                            'action'"
                                                    @click="navigateTo(`/citizens/${citizen.uuid}/plans-and-goals/all`)">
                                                    <Icon name="ph:list-checks" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('citizens.table.actions.latestJournalEntry')">
                                                <FormButton :aria-label="$t('citizens.table.actions.latestJournalEntry')" type="button" buttonStyle="action" buttonSize="xs"
                                                    @click="showCitizenNote(citizen)">
                                                    <Icon name="ph:note" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('citizens.table.actions.edit')"
                                                v-if="isAtLeast('Admin') || can('update_citizen')">
                                                <FormButton :aria-label="$t('citizens.table.actions.edit')" type="button" buttonStyle="action" buttonSize="xs"
                                                    @click="navigateTo(`/citizens/${citizen.uuid}/edit`)">
                                                    <Icon name="ph:pencil-simple" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('citizens.table.actions.latestRiskAssessment')">
                                                <FormButton :aria-label="$t('citizens.table.actions.latestRiskAssessment')" type="button" buttonSize="xs"
                                                    :buttonStyle="citizen.latest_risk_assessment === null && 'action' ||
                                                        citizen.latest_risk_assessment?.assessment === 'no risk' && 'no-risk' ||
                                                        citizen.latest_risk_assessment?.assessment === 'increased risk' && 'increased-risk' ||
                                                        citizen.latest_risk_assessment?.assessment === 'acute increased risk' && 'acute-increased-risk' || 'action'"
                                                    @click="showRiskHistory(citizen)">
                                                    <Icon name="ph:shield-warning" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.citizens" @previous="previous" @next="next" />
                </div>
            </div>

            <ModulesUserCitizenModalFilter :isModalOpen="state.modal.isFilterOpen" :filter="state.propertyFilter"
                @close="state.modal.isFilterOpen = false" @setFilter="applyFilter" />
            <ModulesUserCitizenModalImport :isModalOpen="state.modal.isImportCitizensOpen"
                @close="state.modal.isImportCitizensOpen = false" />
            <ModulesUserCitizenModalImportMapper :isModalOpen="state.modal.isImportMapperOpen"
                @close="state.modal.isImportMapperOpen = false" @imported="fetchCitizens()" />
            <ModulesUserCitizenModalLatestJournal :isModalOpen="state.modal.isShowNote"
                :selectedCitizen="state.selectedCitizen" @close="state.modal.isShowNote = false" />
            <ModulesUserCitizenRiskHistoryModalView :isModalOpen="state.modal.isRiskHistoryOpen"
                :citizenUuid="state.selectedCitizen?.uuid" @close="state.modal.isRiskHistoryOpen = false" />
            <ModulesUserCitizenJournalShareModalView :isModalOpen="state.modal.isSharedJournalsOpen"
                @close="state.modal.isSharedJournalsOpen = false" />

            <ModulesUserGuidedTourModalCitizens v-if="state.modal.isGuidedTourCitizensOverviewOpen"
                :isModalOpen="state.modal.isGuidedTourCitizensOverviewOpen" :isGuidedTour="false"
                @close="state.modal.isGuidedTourCitizensOverviewOpen = false" />

            <ModulesUserCitizenTimeRegistrationModalType :isModalOpen="state.modal.isTimeInTypeModalOpen"
                @close="state.modal.isTimeInTypeModalOpen = false" @openTransport="openTransportLogin"
                @open-work="workLogin" />
            <ModulesUserCitizenTimeRegistrationModalTransport type="login"
                :isModalOpen="state.modal.isTransportLoginOpen" @transportLogin="transportLogin"
                @close="state.modal.isTransportLoginOpen = false" @submitTransportLogin="transportLogin" />
            <ModulesUserCitizenTimeRegistrationModalTransport type="logout"
                :isModalOpen="state.modal.isTransportLogoutOpen" @transportLogout="transportLogout"
                @close="state.modal.isTransportLogoutOpen = false" @submitTransportLogout="transportLogout" />
            <ModulesUserCitizenModalViewLocations :isModalOpen="state.modal.isViewLocationsOpen"
                :citizens="state.citizens?.data || []" @close="state.modal.isViewLocationsOpen = false" />
            <ModulesUserCitizenTimeRegistrationModalConfirmArrival :isModalOpen="state.modal.isConfirmArrivalOpen"
                :citizenName="`${state.selectedCitizen?.firstname || ''} ${state.selectedCitizen?.lastname || ''}`"
                :citizenAddress="state.selectedCitizen?.address?.street || ''" :distanceInMeters="state.arrivalDistance"
                :totalDistanceKm="locationTracking.getTotalDistanceKm()"
                @close="state.modal.isConfirmArrivalOpen = false" @confirmed="onArrivalConfirmed"
                @dismissed="onArrivalDismissed" />
            <ModulesUserCitizenTimeRegistrationModalConfirmWorking :isModalOpen="state.modal.isConfirmWorkingOpen"
                :citizenName="`${state.selectedCitizen?.firstname || ''} ${state.selectedCitizen?.lastname || ''}`"
                :workingMinutes="state.workingMinutes" @close="state.modal.isConfirmWorkingOpen = false"
                @confirmed="onWorkConfirmed" @dismissed="onWorkDismissed" />

            <ModulesUserCitizenModalExportInquiries :isModalOpen="state.modal.isExportInquiriesDepartmentOpen"
                :title="exportInquiryModalTitle" :departmentOptions="exportInquiryDepartmentOptions"
                @close="state.modal.isExportInquiriesDepartmentOpen = false" @confirm="confirmExportInquiries" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { citizenService } from '@/components/api/user/CitizenService'
import { interventionHoursService } from '@/components/api/user/InterventionHoursService'
import { useDepartmentStore } from '@/store/department'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useCitizenStore } from '@/store/citizen'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'
import { saveAs } from 'file-saver'
import { citizenInquiryService } from '@/components/api/user/CitizenInquiryService'
import { departmentService } from '@/components/api/user/DepartmentService'
import { useI18n } from 'vue-i18n'
import { usePermissions } from '@/composables/usePermissions'

const runtimeConfig = useRuntimeConfig()
const { tt } = useTerminology()
const departmentStore = useDepartmentStore() as any
const customPagesStore = useCustomPagesStore() as any
const citizenStore = useCitizenStore() as any
const userStore = useUserStore() as any
const { t } = useI18n()
const { isAtLeast, can } = usePermissions()
const { isPinned, add: addPinned, remove: removePinned, ensureLoaded: ensurePinnedLoaded } = usePinnedCitizens()

const locationTracking = useLocationTracking()
const workTimeTracking = useWorkTimeTracking()

const state = reactive({
    columnHeaders: [
        { name: 'citizens.table.name', isTranslateName: true, sorter: true, key: 'firstname' },
        { name: 'citizens.table.email', isTranslateName: true, sorter: true, key: 'email' },
        { name: 'citizens.table.ssn', isTranslateName: true, sorter: true, key: 'social_security_number' },
        { name: 'citizens.table.phone', isTranslateName: true, sorter: true, key: 'phone' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    // The property filters, kept apart from the free-text search so clearing one
    // does not clear the other.
    propertyFilter: {} as Record<string, any>,
    error: {} as Error,
    isTableLoading: false,
    citizens: [] as any,
    modal: {
        isFilterOpen: false,
        isGuidedTourCitizensOverviewOpen: false,
        isImportCitizensOpen: false,
        isImportMapperOpen: false,
        isRiskHistoryOpen: false,
        isSharedJournalsOpen: false,
        isShowNote: false,
        isTimeInTypeModalOpen: false,
        isTransportLoginOpen: false,
        isTransportLogoutOpen: false,
        isViewLocationsOpen: false,
        isConfirmArrivalOpen: false,
        isConfirmWorkingOpen: false,
        isExportInquiriesDepartmentOpen: false,
    },
    selectedCitizen: null as any,
    selectedExportInquiryDepartmentUuid: null as string | null,
    arrivalDistance: 0,
    workingMinutes: 0,
    departments: [] as any,
    exportInquiryType: '',
})

const arrivalCheckState = reactive({
    hasShownPrompt: false,
    isCheckingArrival: false,
})

const workCheckState = reactive({
    hasShownPrompt: false,
})

const shelterName = computed(() => customPagesStore.getCustomPagesName?.shelter || t('inquiries.form.options.inquiryType.shelter'))
const crisisCenterName = computed(() => customPagesStore.getCustomPagesName?.crisisCenter || t('inquiries.form.options.inquiryType.crisisCenter'))
const exportInquiryModalTitle = computed(() => state.exportInquiryType === 'shelter' ? shelterName.value : crisisCenterName.value)
const exportInquiryDepartmentOptions = computed(() => [
    ...(state.departments?.data ?? [])
        .map((d: any) => ({ value: d.uuid, label: d.name })),
])

const isTransportRegistrationEnabled = computed(() => {
    return userStore.getUser?.can_register_transport === true
})

const isShelterOrCrisisCenter = computed(() => {
    return userStore.getUser?.company?.industry?.system_name === 'social_welfare'
        && ['Crisis center', 'Shelter'].includes(userStore.getUser?.company?.facility_type?.en_name)
})

const isInterventionCheckinEnabled = computed(() => {
    return userStore.getUser?.company?.intervention_checkin_enabled === true
})

const isMedicineEnabled = computed(() => {
    return userStore.getUser?.company?.onboarding_preferences?.modules?.medicin !== false
})

const isDokumentationEnabled = computed(() => {
    return userStore.getUser?.company?.onboarding_preferences?.modules?.dokumentation !== false
})

onMounted(() => {
    fetchCitizens()
    ensurePinnedLoaded()
    fetchExportDepartments()

    if (isTransportRegistrationEnabled.value) {
        const savedLocationState = locationTracking.getSavedTrackingState()
        if (savedLocationState && savedLocationState.isTracking && savedLocationState.careHourUuid) {
            nextTick(() => {
                const trackingCitizen = state.citizens?.data?.find(
                    (c: any) => c.uuid === savedLocationState.citizenUuid && c.is_checked_in
                )

                if (trackingCitizen && savedLocationState.careHourUuid) {
                    state.selectedCitizen = trackingCitizen
                    arrivalCheckState.hasShownPrompt = locationTracking.getArrivalPromptShown()
                    startLocationTracking(savedLocationState.careHourUuid)
                } else {
                    locationTracking.stopTracking()
                }
            })
        }
    }

    const savedWorkState = workTimeTracking.getSavedWorkTimeState()
    if (savedWorkState && savedWorkState.isWorking && savedWorkState.careHourUuid) {

        nextTick(() => {
            const workingCitizen = state.citizens?.data?.find(
                (c: any) => c.uuid === savedWorkState.citizenUuid && c.is_checked_in
            )

            if (workingCitizen) {
                state.selectedCitizen = workingCitizen
                workTimeTracking.restoreFromState(savedWorkState, showWorkPrompt)
            } else {
                workTimeTracking.stopTracking()
            }
        })
    }
})

watch(() => departmentStore.getSelectedDepartmentName, (newValue: any) => {
    if (newValue != null) {
        fetchCitizens()
    }
})

watch(
    () => locationTracking.currentLocation.value,
    (newLocation) => {
        if (!isTransportRegistrationEnabled.value) return
        if (!newLocation || !state.selectedCitizen?.is_checked_in) return
        if (!state.selectedCitizen?.current_care_hour?.is_transportation) return
        if (arrivalCheckState.hasShownPrompt) return

        checkIfNearCitizen(newLocation)
    }
)

function checkIfNearCitizen(userLocation: { lat: number; lng: number }) {
    const citizen = state.selectedCitizen
    if (!citizen?.address?.latitude || !citizen?.address?.longitude) return

    const destination = {
        lat: Number(citizen.address.latitude),
        lng: Number(citizen.address.longitude),
    }

    const { isNear, distance } = locationTracking.isNearDestination(destination, 150)

    if (isNear && !arrivalCheckState.hasShownPrompt && (!state.modal.isTransportLoginOpen || !state.modal.isTransportLogoutOpen)) {
        arrivalCheckState.hasShownPrompt = true
        arrivalCheckState.isCheckingArrival = true
        state.modal.isConfirmArrivalOpen = true
        state.arrivalDistance = distance
        locationTracking.setArrivalPromptShown(true)
    }
}

function showWorkPrompt() {
    if (workCheckState.hasShownPrompt) return

    workCheckState.hasShownPrompt = true
    state.workingMinutes = workTimeTracking.getWorkingMinutes()
    state.modal.isConfirmWorkingOpen = true
}

async function onArrivalConfirmed() {
    await locationTracking.logCurrentLocation()

    const currentLat = locationTracking.currentLocation.value?.lat
    const currentLng = locationTracking.currentLocation.value?.lng
    const totalDistanceKm = locationTracking.getTotalDistanceKm()

    let arrivalAddress = ''
    if (currentLat && currentLng) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentLat}&lon=${currentLng}&zoom=18&addressdetails=1`,
                {
                    headers: {
                        'Accept-Language': 'da,en',
                    }
                }
            )
            const data = await response.json()
            if (data && data.display_name) {
                arrivalAddress = data.display_name
            }
        } catch (error) {
            arrivalAddress = `${currentLat}, ${currentLng}`
        }
    }

    state.error = {}
    state.isTableLoading = true
    try {
        if (state.selectedCitizen?.is_checked_in) {
            await stopLocationTracking()

            const params = {
                is_transportation: true,
                geo_end_lat: currentLat,
                geo_end_lng: currentLng,
                end_address: arrivalAddress,
                note: `${t('citizens.timeRegistration.confirmArrival.arrivedAt')} ${arrivalAddress}. ${t('citizens.timeRegistration.confirmArrival.totalDistance')}: ${totalDistanceKm.toFixed(2)}km`
            }

            const response = await interventionHoursService.checkout(state.selectedCitizen.uuid, params)
            if (response?.data) {
                await fetchCitizens()
                state.modal.isConfirmArrivalOpen = false
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function onArrivalDismissed() {
    arrivalCheckState.hasShownPrompt = false
    state.modal.isConfirmArrivalOpen = false
    locationTracking.setArrivalPromptShown(false)
}

function onWorkConfirmed() {
    workCheckState.hasShownPrompt = false
    state.modal.isConfirmWorkingOpen = false
}

function onWorkDismissed() {
    workLogout()
}

function startLocationTracking(careHourUuid: string) {
    if (!isTransportRegistrationEnabled.value) return

    arrivalCheckState.hasShownPrompt = locationTracking.getArrivalPromptShown()

    locationTracking.startTracking(
        careHourUuid,
        (location) => { },
        (error) => { },
        30000,
        state.selectedCitizen?.uuid,
        `${state.selectedCitizen?.firstname} ${state.selectedCitizen?.lastname}`,
        state.selectedCitizen?.address?.street,
        Number(state.selectedCitizen?.address?.latitude),
        Number(state.selectedCitizen?.address?.longitude)
    )
}

async function stopLocationTracking() {
    await locationTracking.stopTracking()
    arrivalCheckState.hasShownPrompt = false
    arrivalCheckState.isCheckingArrival = false
}

function openGuidedTour() {
    state.modal.isGuidedTourCitizensOverviewOpen = true
}

async function fetchCitizens() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            department: departmentStore.getSelectedDepartmentName,
            page: citizenStore.getCurrentPageNumber,
            page_length: citizenStore.getCurrentPageLength,
            sortField: citizenStore.getSortData.sortField,
            sortOrder: citizenStore.getSortData.sortOrder,
            ...state.dataFilter,
            ...activeFilterParams.value,
        }
        const response = await citizenService.getCitizens(params)
        if (response) {
            state.citizens = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function togglePin(citizen: any) {
    const uuid = citizen?.uuid
    if (!uuid) return
    const wasPinned = isPinned(uuid)
    // Optimistic UI: flip the star immediately, then persist and re-sort.
    wasPinned ? removePinned(uuid) : addPinned(uuid)
    try {
        wasPinned
            ? await citizenService.unpinCitizen(uuid)
            : await citizenService.pinCitizen(uuid)
        await fetchCitizens()
    } catch (error: any) {
        // Roll back the optimistic change on failure.
        wasPinned ? addPinned(uuid) : removePinned(uuid)
        state.error = error
    }
}

function previous() {
    const currentTablePage = citizenStore.getCurrentPageNumber - 1
    citizenStore.setCurrentPageNumber(currentTablePage)
    fetchCitizens()
}

function next() {
    const currentTablePage = citizenStore.getCurrentPageNumber + 1
    citizenStore.setCurrentPageNumber(currentTablePage)
    fetchCitizens()
}

function sort(sortingData: any) {
    citizenStore.setCurrentPageNumber(1)
    const sortField = sortingData.column
    const sortOrder = sortingData.sort
    citizenStore.setSortData(sortField, sortOrder)
    fetchCitizens()
}

function handleSearch(value: any) {
    citizenStore.setCurrentPageNumber(1)
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchCitizens()
}

/**
 * Only the properties that are actually set are sent, so an untouched filter
 * costs nothing and the query string stays readable.
 */
const activeFilterParams = computed(() => {
    const params: Record<string, any> = {}
    for (const [key, value] of Object.entries(state.propertyFilter)) {
        if (value === null || value === undefined || value === '') continue
        params[key] = value
    }

    return params
})

const activeFilterCount = computed(() => Object.keys(activeFilterParams.value).length)

/** Whether the list is narrowed at all, free-text search included. */
const isFiltered = computed(() => {
    const search = state.dataFilter.search as any

    return activeFilterCount.value > 0 || (Array.isArray(search) ? search.length > 0 : !!search)
})

const emptyFilteredMessage = computed(() => tt('citizens.emptyFiltered'))

const activeFilterChips = computed(() => {
    const labels: Record<string, string> = {
        admitted_from: t('citizens.filters.admittedFrom'),
        admitted_to: t('citizens.filters.admittedTo'),
        coordinator: t('citizens.coordinators.title'),
        coordinator_role: t('citizens.filters.coordinatorRole'),
        gender: t('citizens.form.gender'),
        requires_interpreter: t('citizens.filters.requiresInterpreter'),
        risk_level: t('citizens.filters.riskLevel'),
        spoken_language: t('citizens.filters.spokenLanguage'),
    }

    return Object.keys(activeFilterParams.value).map((key) => ({ key, label: labels[key] ?? key }))
})

function applyFilter(filter: Record<string, any>) {
    state.propertyFilter = { ...filter }
    citizenStore.setCurrentPageNumber(1)
    fetchCitizens()
}

function removeFilter(key: string) {
    const filter = { ...state.propertyFilter }
    delete filter[key]
    applyFilter(filter)
}

function clearFilters() {
    state.dataFilter.search = ''
    applyFilter({})
}

function changePageLength(event: any) {
    citizenStore.setCurrentPageNumber(1)
    citizenStore.setCurrentPageLength(event.target.value)
    fetchCitizens()
}

function showCitizenNote(citizen: any) {
    state.selectedCitizen = citizen
    state.modal.isShowNote = true
}

function showRiskHistory(citizen: any) {
    state.selectedCitizen = citizen
    state.modal.isRiskHistoryOpen = true
}

async function fetchExportDepartments() {
    state.error = {}
    try {
        const params = {}
        const response = await departmentService.getAllDepartments(params)
        if (response) {
            state.departments = response
        }
    } catch (error: any) {
        state.error = error
    }
}

async function exportCitizens(departmentParams: { department?: string, department_uuid?: string }) {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            department: departmentParams.department ?? departmentStore.getSelectedDepartmentName,
            department_uuid: departmentParams.department_uuid ?? departmentStore.getSelectedDepartment?.uuid,
        }
        const response = await citizenService.exportCitizens(params)
        if (response) {
            saveAs(response, customPagesStore.getCustomPagesName?.citizens)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function openExportInquiriesModal(inquiryType: string) {
    state.exportInquiryType = inquiryType
    state.selectedExportInquiryDepartmentUuid = ''
    state.modal.isExportInquiriesDepartmentOpen = true
}

async function confirmExportInquiries(departmentUuid: string) {
    const dept = (state.departments?.data ?? []).find((d: any) => d.uuid === departmentUuid)
    await exportInquiries({
        inquiry_type: state.exportInquiryType,
        department: dept?.name,
        department_uuid: dept?.uuid,
    })
    state.modal.isExportInquiriesDepartmentOpen = false
}

async function exportInquiries(params: { inquiry_type: string, department?: string, department_uuid?: string }) {
    state.error = {}
    state.isTableLoading = true
    try {
        const queryParams = {
            inquiry_type: params.inquiry_type,
            department: params.department ?? departmentStore.getSelectedDepartmentName,
            department_uuid: params.department_uuid ?? departmentStore.getSelectedDepartment,
        }
        const response = await citizenInquiryService.exportInquiries(queryParams)
        if (response) {
            let fileName = params.inquiry_type === 'shelter' ? t('inquiries.shelterInquiry') : t('inquiries.crisisCenterInquiry')
            saveAs(response, `${customPagesStore.getCustomPagesName?.citizens}-${fileName}`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function toggleLogin(citizen: any) {
    state.selectedCitizen = citizen
    if (!citizen?.is_checked_in) {
        selectTimeInType()
    } else {
        if (citizen?.current_care_hour?.is_transportation && isTransportRegistrationEnabled.value) {
            openTransportLogout()
        } else {
            workLogout()
        }
    }
}

function selectTimeInType() {
    if (!isTransportRegistrationEnabled.value) {
        workLogin()
        return
    }

    state.modal.isTimeInTypeModalOpen = true
}

async function workLogin() {
    state.error = {}
    state.isTableLoading = true
    try {
        if (!state.selectedCitizen?.is_checked_in) {
            const params = {}
            const response = await interventionHoursService.checkin(state.selectedCitizen.uuid, params)
            if (response?.data) {
                const careHourUuid = response.data.uuid || response.data.citizen_care_hour_uuid

                await fetchCitizens()

                if (careHourUuid) {
                    workTimeTracking.startTracking(
                        careHourUuid,
                        showWorkPrompt,
                        state.selectedCitizen?.uuid,
                        `${state.selectedCitizen?.firstname} ${state.selectedCitizen?.lastname}`
                    )
                }
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function openTransportLogin() {
    if (!isTransportRegistrationEnabled.value) {
        console.warn('Transport registration is disabled')
        return
    }

    state.modal.isTimeInTypeModalOpen = false
    state.modal.isTransportLoginOpen = true
}

function openTransportLogout() {
    if (!isTransportRegistrationEnabled.value) {
        console.warn('Transport registration is disabled')
        return
    }

    state.modal.isTimeInTypeModalOpen = false
    state.modal.isTransportLogoutOpen = true
}

async function transportLogin(transportLoginDetails: any) {
    if (!isTransportRegistrationEnabled.value) {
        console.error('Transport registration is disabled')
        return
    }

    state.error = {}
    state.isTableLoading = true
    try {
        if (!state.selectedCitizen?.is_checked_in) {
            const params = {
                is_transportation: true,
                geo_start_lat: transportLoginDetails.geo_start_lat,
                geo_start_lng: transportLoginDetails.geo_start_lng,
                start_address: transportLoginDetails.start_address,
                note: transportLoginDetails.note
            }
            const response = await interventionHoursService.checkin(state.selectedCitizen.uuid, params)
            if (response?.data) {
                const careHourUuid = response.data.uuid || response.data.citizen_care_hour_uuid

                await fetchCitizens()
                state.modal.isTransportLoginOpen = false

                if (careHourUuid) {
                    startLocationTracking(careHourUuid)
                }
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function workLogout() {
    state.error = {}
    state.isTableLoading = true
    try {
        workTimeTracking.stopTracking()

        const params = {}
        const response = await interventionHoursService.checkout(state.selectedCitizen.uuid, params)
        if (response?.data) {
            setTimeout(() => {
                fetchCitizens()
            }, 500)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function transportLogout(transportLogoutDetails: any) {
    if (!isTransportRegistrationEnabled.value) {
        console.error('Transport registration is disabled')
        return
    }

    state.error = {}
    state.isTableLoading = true
    try {
        if (state.selectedCitizen?.is_checked_in) {
            await stopLocationTracking()

            const params = {
                is_transportation: true,
                geo_end_lat: transportLogoutDetails.geo_end_lat,
                geo_end_lng: transportLogoutDetails.geo_end_lng,
                end_address: transportLogoutDetails.end_address,
                note: transportLogoutDetails.note
            }
            const response = await interventionHoursService.checkout(state.selectedCitizen.uuid, params)
            if (response?.data) {
                fetchCitizens()
                state.modal.isTransportLogoutOpen = false
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

// Contribute commands to the global palette (⌘K).
const { setPageCommands, clearPageCommands } = useCommandPalette()
watchEffect(() => {
    const A = t('commandPalette.actions')
    const cmds: any[] = []
    if (isAtLeast('Admin') || can('create_citizen')) {
        cmds.push({ id: 'new-citizen', group: A, icon: 'ph:user-plus', label: tt('citizens.newCitizen'), run: () => navigateTo('/citizens/new') })
    }
    if (isAtLeast('Admin')) {
        cmds.push({ id: 'import-citizens', group: A, icon: 'ph:upload-simple', label: t('citizens.importCitizens.importCitizens'), run: () => { state.modal.isImportCitizensOpen = true } })
    }
    cmds.push({ id: 'shared-journals', group: A, icon: 'ph:share-network', label: t('citizens.citizenJournals.shareJournals.sharedJournals'), run: () => { state.modal.isSharedJournalsOpen = true } })
    setPageCommands(cmds)
})
onUnmounted(() => clearPageCommands())
</script>