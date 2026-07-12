<template>
    <div class="animate-fade-in">
        <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500">
            <div class="flex items-center gap-x-1.5">
                <span class="h-2 w-2 rounded-full bg-primary"></span>
                <span>{{ $t('events.myself') }}</span>
            </div>
            <div class="flex items-center gap-x-1.5">
                <span class="h-2 w-2 rounded-full bg-green-600"></span>
                <span>{{ $t('events.employees') }}</span>
            </div>
            <div class="flex items-center gap-x-1.5">
                <span class="h-2 w-2 rounded-full bg-amber-500"></span>
                <span>{{ $t('events.citizens') }}</span>
            </div>
            <div class="flex items-center gap-x-1.5">
                <span class="h-2 w-2 rounded-full bg-secondary"></span>
                <span>{{ $t('events.holidays') }}</span>
            </div>
        </div>
        <div class="mt-3 lg:flex lg:h-full lg:flex-col">
            <header class="flex items-center justify-between py-4 lg:flex-none">
                <div class="flex items-baseline gap-x-2">
                <h3 class="text-2xl font-semibold tracking-tight text-gray-900">
                    <span v-if="month === 'January'">{{ $t('calendar.month.January') }}</span>
                    <span v-if="month === 'February'">{{ $t('calendar.month.February') }}</span>
                    <span v-if="month === 'March'">{{ $t('calendar.month.March') }}</span>
                    <span v-if="month === 'April'">{{ $t('calendar.month.April') }}</span>
                    <span v-if="month === 'May'">{{ $t('calendar.month.May') }}</span>
                    <span v-if="month === 'June'">{{ $t('calendar.month.June') }}</span>
                    <span v-if="month === 'July'">{{ $t('calendar.month.July') }}</span>
                    <span v-if="month === 'August'">{{ $t('calendar.month.August') }}</span>
                    <span v-if="month === 'September'">{{ $t('calendar.month.September') }}</span>
                    <span v-if="month === 'October'">{{ $t('calendar.month.October') }}</span>
                    <span v-if="month === 'November'">{{ $t('calendar.month.November') }}</span>
                    <span v-if="month === 'December'">{{ $t('calendar.month.December') }}</span>
                    {{ year }}
                </h3>
                <span v-if="monthCount" class="text-sm text-gray-400">
                    {{ monthCount === 1 ? $t('calendar.view.oneEvent') : $t('calendar.view.eventsCount', { count: monthCount }) }}
                </span>
                </div>
                <div class="flex items-center gap-x-2">
                    <button type="button" @click="setToday()"
                        class="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50 transition-colors">
                        {{ $t('goToToday') }}
                    </button>
                    <div class="inline-flex items-center rounded-full border border-gray-200 bg-white shadow-sm">
                        <button type="button" @click="previousMonth()"
                            class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-l-full text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                            <span class="sr-only">Previous month</span>
                            <Icon name="heroicons:chevron-left" class="h-4 w-4" aria-hidden="true" />
                        </button>
                        <span class="h-4 w-px bg-gray-200"></span>
                        <button type="button" @click="nextMonth()"
                            class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-r-full text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                            <span class="sr-only">Next month</span>
                            <Icon name="heroicons:chevron-right" class="h-4 w-4" aria-hidden="true" />
                        </button>
                    </div>
                    <div class="hidden">
                        <FormDateField id="date" name="date" :placeholder="$t('dutySchedules.form.date')"
                            dateType="calendar" v-model="state.selectedDate" />
                    </div>
                </div>
            </header>
            <div class="overflow-hidden rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm lg:flex lg:flex-auto lg:flex-col">
                <div
                    class="md:hidden grid grid-cols-7 border-b border-gray-200 bg-white text-center text-[11px] font-semibold uppercase tracking-wider leading-6 text-gray-400 lg:flex-none">
                    <div class="py-2.5">
                        {{ $t('calendar.week.oneLetter.Monday') }}
                    </div>
                    <div class="py-2.5">
                        {{ $t('calendar.week.oneLetter.Tuesday') }}
                    </div>
                    <div class="py-2.5">
                        {{ $t('calendar.week.oneLetter.Wednesday') }}
                    </div>
                    <div class="py-2.5">
                        {{ $t('calendar.week.oneLetter.Thursday') }}
                    </div>
                    <div class="py-2.5">
                        {{ $t('calendar.week.oneLetter.Friday') }}
                    </div>
                    <div class="py-2.5">
                        {{ $t('calendar.week.oneLetter.Saturday') }}
                    </div>
                    <div class="py-2.5">
                        {{ $t('calendar.week.oneLetter.Sunday') }}
                    </div>
                </div>
                <div
                    class="hidden md:grid grid-cols-7 border-b border-gray-200 bg-white text-center text-[11px] font-semibold uppercase tracking-wider leading-6 text-gray-400 lg:flex-none">

                    <div class="py-2.5">
                        {{ $t('calendar.week.short.Monday') }}
                    </div>
                    <div class="py-2.5">
                        {{ $t('calendar.week.short.Tuesday') }}
                    </div>
                    <div class="py-2.5">
                        {{ $t('calendar.week.short.Wednesday') }}
                    </div>
                    <div class="py-2.5">
                        {{ $t('calendar.week.short.Thursday') }}
                    </div>
                    <div class="py-2.5">
                        {{ $t('calendar.week.short.Friday') }}
                    </div>
                    <div class="py-2.5">
                        {{ $t('calendar.week.short.Saturday') }}
                    </div>
                    <div class="py-2.5">
                        {{ $t('calendar.week.short.Sunday') }}
                    </div>
                </div>
                <div class="flex bg-gray-100 text-xs leading-6 text-gray-700 lg:flex-auto">
                    <div class="hidden w-full lg:grid lg:grid-cols-7 lg:auto-rows-fr lg:gap-px">
                        <div v-for="(day, index) in state.days" :key="index"
                            :class="[day.isToday ? 'bg-tertiary/[0.05]' : (day.isCurrentMonth ? 'bg-white' : 'bg-gray-50/70'), 'relative flex min-h-[7rem] flex-col gap-y-1 px-2 py-2']">
                            <time :datetime="day.date"
                                :class="day.isToday
                                    ? 'flex h-6 w-6 items-center justify-center rounded-full bg-tertiary text-[13px] font-semibold text-white'
                                    : ['text-[13px] font-medium', day.isCurrentMonth ? (isWeekend(day.date) ? 'text-gray-400' : 'text-gray-700') : 'text-gray-300']">
                                {{ day.date?.split('-').pop()?.replace(/^0/, '') }}
                            </time>
                            <ol v-if="day.holidays.length > 0" class="space-y-1">
                                <li v-for="(holiday, holidayIndex) in day.holidays" :key="holidayIndex">
                                    <div class="flex items-center gap-x-1.5 rounded-md bg-secondary/10 px-1.5 py-1">
                                        <span class="h-1.5 w-1.5 flex-none rounded-full bg-secondary"></span>
                                        <span class="truncate text-[11px] font-medium text-secondary">{{ holiday?.name }}</span>
                                    </div>
                                </li>
                            </ol>
                            <ol v-if="day.events.length > 0" class="space-y-1">
                                <li v-for="(myCalendarEvent, index) in visibleEvents(day)" :key="index">
                                    <div v-if="myCalendarEvent?.is_shift"
                                        class="flex items-center gap-x-1.5 rounded-md bg-indigo-50 px-1.5 py-1"
                                        :title="`${myCalendarEvent?.title} · ${myCalendarEvent.time_start}-${myCalendarEvent.time_end}`">
                                        <Icon name="ph:briefcase" class="h-3 w-3 flex-none text-indigo-500" />
                                        <span class="min-w-0 flex-1 truncate text-[11px] font-medium text-indigo-700">
                                            {{ myCalendarEvent?.title }}
                                        </span>
                                        <span class="hidden flex-none text-[10px] tabular-nums text-indigo-400 xl:block">
                                            {{ myCalendarEvent.time_start }}
                                        </span>
                                    </div>
                                    <div v-else class="group/event relative">
                                        <div class="flex cursor-pointer items-center gap-x-1.5 rounded-md px-1.5 py-1 transition hover:bg-gray-100 active:scale-[0.98]"
                                            :class="[
                                                myCalendarEvent?.completion_status === 'completed' && 'opacity-70',
                                                isNow(myCalendarEvent) && 'bg-red-50 ring-1 ring-inset ring-red-300',
                                                isOverdue(myCalendarEvent) && 'ring-1 ring-inset ring-amber-300',
                                            ]"
                                            @mouseenter="showPreview($event, myCalendarEvent)" @mouseleave="hidePreview"
                                            @click="editMyCalendarEvent(myCalendarEvent)">
                                            <span class="h-1.5 w-1.5 flex-none rounded-full" :class="[
                                                isNow(myCalendarEvent) ? 'bg-red-500 animate-pulse' : [
                                                    myCalendarEvent?.type === 'citizens' && 'bg-amber-500',
                                                    myCalendarEvent?.type === 'employees' && 'bg-green-600',
                                                    myCalendarEvent?.type === 'my_self' && 'bg-primary',
                                                ],
                                            ]"></span>
                                            <span class="min-w-0 flex-1 truncate text-[11px] font-medium"
                                                :class="myCalendarEvent?.completion_status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800 group-hover/event:text-gray-900'">
                                                {{ myCalendarEvent?.title }}
                                            </span>
                                            <Icon v-if="myCalendarEvent?.completion_status === 'completed'"
                                                name="ph:check-circle-fill" class="h-3 w-3 flex-none text-green-500" />
                                            <Icon v-else-if="isOverdue(myCalendarEvent)"
                                                name="ph:warning-circle-fill" class="h-3 w-3 flex-none text-amber-500" />
                                            <span class="hidden flex-none text-[10px] tabular-nums text-gray-400 group-hover/event:opacity-0 xl:block">
                                                {{ myCalendarEvent.time_start }}
                                            </span>
                                            <Menu as="div"
                                                class="absolute right-1 flex-none opacity-0 group-hover/event:opacity-100"
                                                @click.stop>
                                                <MenuButton class="flex items-center rounded bg-white/90 p-0.5 text-gray-400 shadow-sm ring-1 ring-gray-200 hover:text-gray-700">
                                                    <Icon name="heroicons:ellipsis-horizontal" class="h-3.5 w-3.5" />
                                                </MenuButton>
                                                <transition enter-active-class="transition ease-out duration-100"
                                                    enter-from-class="transform opacity-0 scale-95"
                                                    enter-to-class="transform opacity-100 scale-100"
                                                    leave-active-class="transition ease-in duration-75"
                                                    leave-from-class="transform opacity-100 scale-100"
                                                    leave-to-class="transform opacity-0 scale-95">
                                                    <MenuItems class="absolute right-0 z-20 mt-1 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                        <div class="py-1">
                                                            <MenuItem v-slot="{ active }">
                                                            <a href="#" :class="[active && 'bg-gray-100', 'text-gray-700', 'flex items-center gap-x-1.5 px-4 py-2 text-sm']"
                                                                @click.stop="editMyCalendarEvent(myCalendarEvent)">
                                                                <Icon name="ph:pencil-simple" class="h-4 w-4" />
                                                                {{ $t('calendar.edit') }}
                                                            </a>
                                                            </MenuItem>
                                                            <MenuItem v-slot="{ active }">
                                                            <a href="#" :class="[active && 'bg-gray-100', 'text-red-600', 'flex items-center gap-x-1.5 px-4 py-2 text-sm']"
                                                                @click.stop="confirmEventDeletion(myCalendarEvent)">
                                                                <Icon name="ph:trash" class="h-4 w-4" />
                                                                {{ $t('calendar.delete') }}
                                                            </a>
                                                            </MenuItem>
                                                            <template v-if="myCalendarEvent?.completion_status !== 'completed'">
                                                                <MenuItem v-slot="{ active }">
                                                                <a href="#" :class="[active && 'bg-gray-100', 'text-green-700', 'flex items-center gap-x-1.5 px-4 py-2 text-sm']"
                                                                    @click.stop="markEventAsStatus(myCalendarEvent, 'completed')">
                                                                    <Icon name="ph:check-circle" class="h-4 w-4" />
                                                                    {{ $t('events.markAsCompleted') }}
                                                                </a>
                                                                </MenuItem>
                                                            </template>
                                                            <template v-if="myCalendarEvent?.completion_status !== 'not_completed'">
                                                                <MenuItem v-slot="{ active }">
                                                                <a href="#" :class="[active && 'bg-gray-100', 'text-red-700', 'flex items-center gap-x-1.5 px-4 py-2 text-sm']"
                                                                    @click.stop="markEventAsStatus(myCalendarEvent, 'not_completed')">
                                                                    <Icon name="ph:x-circle" class="h-4 w-4" />
                                                                    {{ $t('events.markAsNotCompleted') }}
                                                                </a>
                                                                </MenuItem>
                                                            </template>
                                                            <template v-if="myCalendarEvent?.type === 'citizens'">
                                                                <MenuItem v-slot="{ active }">
                                                                <a href="#" :class="[active && 'bg-gray-100', 'text-gray-700', 'flex items-center gap-x-1.5 px-4 py-2 text-sm']"
                                                                    @click.stop="openCreateJournal(myCalendarEvent)">
                                                                    <Icon name="ph:notebook" class="h-4 w-4" />
                                                                    {{ $t('events.createJournalNote') }}
                                                                </a>
                                                                </MenuItem>
                                                            </template>
                                                        </div>
                                                    </MenuItems>
                                                </transition>
                                            </Menu>
                                        </div>
                                    </div>
                                </li>
                                <li v-if="day.events.length > 3 && !state.expandedDays.includes(day.date)">
                                    <button type="button" @click="state.expandedDays.push(day.date)"
                                        class="w-full rounded-md px-1.5 py-0.5 text-left text-[11px] font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                                        +{{ day.events.length - 3 }} {{ $t('showMore') }}
                                    </button>
                                </li>
                            </ol>
                        </div>
                    </div>
                    <div class="isolate grid w-full grid-cols-7 grid-rows-5 gap-px lg:hidden">
                        <button v-for="(day, index) in state.days" :key="index" type="button" :class="[
                            day.isCurrentMonth ? 'bg-white' : 'bg-gray-50',
                            (day.isSelected || day.isToday) && 'font-semibold',
                            day.isSelected && 'text-white',
                            !day.isSelected && day.isToday && 'text-tertiary',
                            !day.isSelected && day.isCurrentMonth && !day.isToday && 'text-gray-900',
                            !day.isSelected && !day.isCurrentMonth && !day.isToday && 'text-gray-500',
                            'flex h-14 flex-col px-3 py-2 hover:bg-gray-100 focus:z-10'
                        ]" @click="setSelectedDay(day)">
                            <time :datetime="day.date" :class="[
                                day.isSelected && 'flex h-6 w-6 items-center justify-center rounded-full',
                                day.isSelected && day.isToday && 'bg-tertiary',
                                day.isSelected && !day.isToday && 'bg-tertiary',
                                'ml-auto'
                            ]">
                                {{ day.date?.split('-').pop()?.replace(/^0/, '') }}
                            </time>
                            <span class="sr-only">{{ day.events.length }} events</span>
                            <span v-if="day.events.length > 0" class="-mx-0.5 mt-auto flex flex-wrap-reverse">
                                <span v-for="event in day.events" :key="event.id"
                                    class="mx-0.5 mb-1 h-1.5 w-1.5 rounded-full bg-tertiary" />
                            </span>
                        </button>
                    </div>
                </div>
            </div>
            <ol class="lg:hidden mt-4 space-y-2 text-sm leading-6 lg:col-span-7 xl:col-span-8" v-if=state.selectedDay>
                <li v-for="(holiday, index) in state.days.find(day => day.date === state.selectedDay?.date)?.holidays || []"
                    :key="index" class="border-secondary pl-4 border-l-4">
                    <div class="py-4">
                        <div class="flex items-center gap-x-2">
                            <dt class="flex items-center">
                                <span class="sr-only">Title</span>
                                <Icon name="ph:clipboard" class="h-4 w-4 text-gray-400" aria-hidden="true" />
                            </dt>
                            <dd class="font-semibold text-gray-900 xl:pr-0">
                                {{ holiday?.name }}
                            </dd>
                        </div>
                        <dl class="text-gray-500">
                            <div class="flex items-center space-x-3 text-xs">
                                <dt class="flex items-center">
                                    <span class="sr-only">Date</span>
                                    <Icon name="ph:calendar" class="h-4 w-4 text-gray-400" aria-hidden="true" />
                                </dt>
                                <dd>
                                    <time :datetime="holiday.date">
                                        {{ formatDateToReadable(holiday.date) }}
                                    </time>
                                </dd>
                            </div>
                        </dl>
                    </div>
                </li>
                <li v-for="(myCalendarEvent, index) in state.days.find(day => day.date === state.selectedDay?.date)?.events || []"
                    :key="index" :class="[
                        myCalendarEvent?.is_shift && 'border-indigo-500 bg-indigo-50/60 rounded-r-md',
                        !myCalendarEvent?.is_shift && myCalendarEvent?.type === 'citizens' && 'border-yellow-500',
                        !myCalendarEvent?.is_shift && myCalendarEvent?.type === 'employees' && 'border-green-700',
                        !myCalendarEvent?.is_shift && myCalendarEvent?.type === 'my_self' && 'border-primary',
                        'pl-4 border-l-4'
                    ]">
                    <div v-if="myCalendarEvent?.is_shift" class="relative py-4">
                        <div class="flex items-center gap-x-2 flex-wrap">
                            <Icon name="ph:briefcase" class="h-4 w-4 text-indigo-600" aria-hidden="true" />
                            <dd class="font-semibold text-gray-900 xl:pr-0">{{ myCalendarEvent?.title }}</dd>
                            <span
                                class="inline-flex items-center gap-x-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                                <Icon name="ph:clock" class="h-3.5 w-3.5" />
                                {{ $t('events.shiftLabel') }}
                            </span>
                        </div>
                        <p class="text-xs text-gray-500 mt-1" v-if="myCalendarEvent?.employee">{{ myCalendarEvent?.employee }}</p>
                        <p class="text-xs text-gray-500" v-if="myCalendarEvent?.citizens?.length">
                            {{ myCalendarEvent.citizens.map((c) => c.name).join(', ') }}
                        </p>
                        <dl class="text-gray-500">
                            <div class="flex items-center space-x-3 text-xs">
                                <dt class="flex items-center">
                                    <span class="sr-only">Date</span>
                                    <Icon name="ph:calendar" class="h-4 w-4 text-gray-400" aria-hidden="true" />
                                </dt>
                                <dd>
                                    <time :datetime="myCalendarEvent.date_time_start">
                                        {{ formatDateTimeToReadable(myCalendarEvent.date_time_start) }}
                                        -
                                        {{ formatDateTimeToReadable(myCalendarEvent.date_time_end) }}
                                    </time>
                                </dd>
                            </div>
                        </dl>
                    </div>
                    <div v-else class="relative flex space-x-6 py-6">
                        <img :src="`https://ui-avatars.com/api/?background=42AED9&color=fff&name=${myCalendarEvent?.title}`"
                            alt="Image" class="h-14 w-14 flex-none rounded-full" />
                        <div class="flex-auto">
                            <h3 class="pr-10 font-semibold text-gray-900 xl:pr-0">
                                {{ myCalendarEvent?.user?.firstname }}
                                {{ myCalendarEvent?.user?.lastname }}
                            </h3>
                            <div class="flex items-center gap-x-2 flex-wrap">
                                <dt class="flex items-center">
                                    <span class="sr-only">Title</span>
                                    <Icon name="ph:clipboard" class="h-4 w-4 text-gray-400" aria-hidden="true" />
                                </dt>
                                <dd class="font-semibold text-gray-900 xl:pr-0">
                                    {{ myCalendarEvent?.title }}
                                </dd>
                                <span v-if="myCalendarEvent?.completion_status === 'completed'"
                                    class="inline-flex items-center gap-x-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                    <Icon name="ph:check-circle" class="h-3.5 w-3.5" />
                                    {{ $t('events.status.completed') }}
                                </span>
                                <span v-else-if="myCalendarEvent?.completion_status === 'not_completed'"
                                    class="inline-flex items-center gap-x-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                                    <Icon name="ph:x-circle" class="h-3.5 w-3.5" />
                                    {{ $t('events.status.notCompleted') }}
                                </span>
                            </div>
                            <div class="flex gap-x-2">
                                <dt class="flex mt-1">
                                    <span class="sr-only">Description</span>
                                    <Icon name="heroicons:bars-3-bottom-left" class="h-4 w-4 text-gray-400"
                                        aria-hidden="true" />
                                </dt>
                                <dd class="text-gray-900 xl:pr-0">
                                    {{ myCalendarEvent?.description }}
                                </dd>
                            </div>
                            <dl class="text-gray-500">
                                <div class="flex items-center space-x-3 text-xs">
                                    <dt class="flex items-center">
                                        <span class="sr-only">Date</span>
                                        <Icon name="ph:calendar" class="h-4 w-4 text-gray-400" aria-hidden="true" />
                                    </dt>
                                    <dd>
                                        <time :datetime="myCalendarEvent.datetime">
                                            {{ formatDateTimeToReadable(myCalendarEvent.date_time_start) }}
                                            -
                                            {{ formatDateTimeToReadable(myCalendarEvent.date_time_end) }}
                                        </time>
                                    </dd>
                                </div>
                            </dl>
                            <div class="text-xxs flex flex-wrap gap-1 mt-1"
                                v-if="myCalendarEvent.calendar_tags?.length > 0">
                                <span v-for="(calendarTag, index) in myCalendarEvent.calendar_tags" :key=index
                                    class="p-1 text-white rounded-md" :style="{ backgroundColor: calendarTag?.color }">
                                    {{ calendarTag?.tag }}
                                </span>
                            </div>
                            <div class="text-gray-500 text-xxs mt-1">
                                <p>{{ $t('events.eventOwner') }}:</p>
                                <div class="flex flex-wrap gap-1 mt-1">
                                    <div v-for="(owner, index) in myCalendarEvent.calendar_owners" :key="index"
                                        class="bg-secondary text-xxs p-1 text-white rounded-md">
                                        {{ owner?.owner?.firstname }} {{ owner?.owner?.lastname }}
                                    </div>
                                </div>
                            </div>
                            <div class="text-gray-500 text-xxs mt-1" v-if="myCalendarEvent.calendar_users?.length > 0">
                                <p>{{ $t('events.invitees') }}:</p>
                                <div class="flex flex-wrap gap-1 mt-1">
                                    <div v-for="(invitee, index) in myCalendarEvent.calendar_users?.slice(0, 2)"
                                        :key="index" class="bg-secondary text-xxs p-1 text-white rounded-md">
                                        {{ invitee?.user?.firstname }} {{ invitee?.user?.lastname }}
                                    </div>
                                </div>
                                <button @click="showAllInvitees(myCalendarEvent)"
                                    class="mt-1 text-primary text-xs hover:text-primary-700"
                                    v-if="myCalendarEvent.calendar_users?.length > 2">
                                    {{ $t('showAll') }}...
                                </button>
                            </div>
                        </div>
                        <Menu as="div"
                            class="absolute right-0 top-6 xl:relative xl:right-auto xl:top-auto xl:self-center">
                            <div>
                                <MenuButton
                                    class="-m-2 flex items-center rounded-full p-2 text-gray-500 hover:text-gray-600">
                                    <span class="sr-only">Open options</span>
                                    <Icon name="heroicons:ellipsis-horizontal" class="h-5 w-5" aria-hidden="true" />
                                </MenuButton>
                            </div>
                            <transition enter-active-class="transition ease-out duration-100"
                                enter-from-class="transform opacity-0 scale-95"
                                enter-to-class="transform opacity-100 scale-100"
                                leave-active-class="transition ease-in duration-75"
                                leave-from-class="transform opacity-100 scale-100"
                                leave-to-class="transform opacity-0 scale-95">
                                <MenuItems
                                    class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    <div class="py-1">
                                        <MenuItem v-slot="{ active }">
                                        <a href="#"
                                            :class="[active && 'bg-gray-100', 'text-gray-700', 'flex items-center gap-x-1.5 px-4 py-2 text-sm']"
                                            @click="editMyCalendarEvent(myCalendarEvent)">
                                            <Icon name="ph:pencil-simple" class="h-4 w-4" />
                                            {{ $t('calendar.edit') }}
                                        </a>
                                        </MenuItem>
                                        <MenuItem v-slot="{ active }">
                                        <a href="#"
                                            :class="[active && 'bg-gray-100', 'text-red-600', 'flex items-center gap-x-1.5 px-4 py-2 text-sm']"
                                            @click="confirmEventDeletion(myCalendarEvent)">
                                            <Icon name="ph:trash" class="h-4 w-4" />
                                            {{ $t('calendar.delete') }}
                                        </a>
                                        </MenuItem>
                                        <template v-if="myCalendarEvent?.completion_status !== 'completed'">
                                            <MenuItem v-slot="{ active }">
                                            <a href="#"
                                                :class="[active && 'bg-gray-100', 'text-green-700', 'flex items-center gap-x-1.5 px-4 py-2 text-sm']"
                                                @click="markEventAsStatus(myCalendarEvent, 'completed')">
                                                <Icon name="ph:check-circle" class="h-4 w-4" />
                                                {{ $t('events.markAsCompleted') }}
                                            </a>
                                            </MenuItem>
                                        </template>
                                        <template v-if="myCalendarEvent?.completion_status !== 'not_completed'">
                                            <MenuItem v-slot="{ active }">
                                            <a href="#"
                                                :class="[active && 'bg-gray-100', 'text-red-700', 'flex items-center gap-x-1.5 px-4 py-2 text-sm']"
                                                @click="markEventAsStatus(myCalendarEvent, 'not_completed')">
                                                <Icon name="ph:x-circle" class="h-4 w-4" />
                                                {{ $t('events.markAsNotCompleted') }}
                                            </a>
                                            </MenuItem>
                                        </template>
                                        <template v-if="myCalendarEvent?.type === 'citizens'">
                                            <MenuItem v-slot="{ active }">
                                            <a href="#"
                                                :class="[active && 'bg-gray-100', 'text-gray-700', 'flex items-center gap-x-1.5 px-4 py-2 text-sm']"
                                                @click="openCreateJournal(myCalendarEvent)">
                                                <Icon name="ph:notebook" class="h-4 w-4" />
                                                {{ $t('events.createJournalNote') }}
                                            </a>
                                            </MenuItem>
                                        </template>
                                    </div>
                                </MenuItems>
                            </transition>
                        </Menu>
                    </div>
                </li>
            </ol>
            <ModulesUserMyCalendarModalShowAllInvitees :isModalOpen="state.modal.isShowAllInviteesOpen"
                :invitees="state.selectedSchedule?.calendar_users" @close="state.modal.isShowAllInviteesOpen = false"
                v-if="state.modal.isShowAllInviteesOpen" />
            <DialogConfirmation :isModalOpen="state.modal.isDeleteScheduleOpen"
                :message="$t('events.confirmation.deleteConfirmation') + '?'"
                @close="state.modal.isDeleteScheduleOpen = false" @confirm="deleteMyCalendarEvent" />
        </div>

        <Teleport to="body">
            <div v-if="state.preview.event"
                class="pointer-events-none fixed z-[60] w-64 rounded-xl bg-white p-3 shadow-dropdown ring-1 ring-gray-200 animate-fade-in"
                :style="{ left: state.preview.x + 'px', top: state.preview.y + 'px' }">
                <div class="flex items-center gap-x-1.5">
                    <span class="h-2 w-2 flex-none rounded-full" :class="[
                        state.preview.event?.type === 'citizens' && 'bg-amber-500',
                        state.preview.event?.type === 'employees' && 'bg-green-600',
                        state.preview.event?.type === 'my_self' && 'bg-primary',
                    ]"></span>
                    <p class="truncate text-sm font-semibold text-gray-900">{{ state.preview.event?.title }}</p>
                </div>
                <p class="mt-1 text-xs tabular-nums text-gray-500">
                    {{ state.preview.event?.time_start }} – {{ state.preview.event?.time_end }}
                </p>
                <p v-if="state.preview.event?.unit?.name" class="mt-1 flex items-center gap-x-1 text-xs text-gray-500">
                    <Icon name="ph:map-pin" class="h-3.5 w-3.5 text-gray-400" />{{ state.preview.event?.unit?.name }}
                </p>
                <p v-if="ownersLabel(state.preview.event)" class="mt-0.5 flex items-center gap-x-1 text-xs text-gray-500">
                    <Icon name="ph:user-circle" class="h-3.5 w-3.5 text-gray-400" />{{ ownersLabel(state.preview.event) }}
                </p>
                <p v-if="state.preview.event?.description" class="mt-1 line-clamp-3 text-xs text-gray-600">
                    {{ state.preview.event?.description }}
                </p>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'

const { formatDateToReadable, formatDateTimeToReadable } = useDatetimeFormatter()
const props = defineProps({
    myCalendarEvents: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['changeMonthYear', 'editMyCalendarEvent', 'deleteMyCalendarEvent', 'markEventAsStatus', 'createJournalFromEvent'])
const today = moment()

const state = reactive({
    currentMonth: today.month(),
    currentYear: today.year(),
    days: generateDays(today.year(), today.month(), props.myCalendarEvents),
    expandedDays: [] as string[],
    preview: { event: null as any, x: 0, y: 0 },
    modal: {
        isDeleteScheduleOpen: false,
        isShowAllInviteesOpen: false,
    },
    selectedDay: null as any,
    selectedDate: moment().format('YYYY-MM-DD'),
    selectedSchedule: {} as any,
})

watch(() => props.myCalendarEvents, (newValue: any) => {
    if (newValue != null) {
        updateDays()
    }
})

watch(() => state.selectedDate, (newSelectedDate: any) => {
    if (newSelectedDate) {
        const selected = moment(newSelectedDate, 'YYYY-MM-DD')
        state.currentMonth = selected.month()
        state.currentYear = selected.year()
        updateDays()
        emit('changeMonthYear', state.currentYear, state.currentMonth)
    }
})

function setSelectedDay(day: any) {
    state.selectedDay = day
    state.days.forEach(d => d.isSelected = d.date === day.date)
}

function previousMonth() {
    const previous = moment([state.currentYear, state.currentMonth]).subtract(1, 'month')
    state.currentMonth = previous.month()
    state.currentYear = previous.year()
    state.selectedDate = moment(state.selectedDate).subtract(1, 'month').format('YYYY-MM-DD')
    updateDays()
    emit('changeMonthYear', state.currentYear, state.currentMonth)
}

function setToday() {
    state.currentMonth = today.month()
    state.currentYear = today.year()
    state.selectedDate = moment().format('YYYY-MM-DD')
    updateDays()
    emit('changeMonthYear', state.currentYear, state.currentMonth)
}

function nextMonth() {
    const next = moment([state.currentYear, state.currentMonth]).add(1, 'month')
    state.currentMonth = next.month()
    state.currentYear = next.year()
    state.selectedDate = moment(state.selectedDate).add(1, 'month').format('YYYY-MM-DD')
    updateDays()
    emit('changeMonthYear', state.currentYear, state.currentMonth)
}

function showAllInvitees(myCalendarEvent: any) {
    state.selectedSchedule = myCalendarEvent
    state.modal.isShowAllInviteesOpen = true
}

function updateDays() {
    state.days = generateDays(state.currentYear, state.currentMonth, props.myCalendarEvents)
}

function generateDays(year: any, month: any, myCalendarEvents: any) {
    const startOfMonth = moment([year, month]).startOf('month')
    const endOfMonth = moment([year, month]).endOf('month')
    const startOfWeek = startOfMonth.clone().startOf('isoWeek')
    const endOfWeek = endOfMonth.clone().endOf('isoWeek')

    const daysArray = []
    let day = startOfWeek.clone()

    while (day.isBefore(endOfWeek, 'day') || day.isSame(endOfWeek, 'day')) {
        const dateStr = day.format('YYYY-MM-DD')
        daysArray.push({
            date: dateStr,
            isCurrentMonth: day.isSame(startOfMonth, 'month'),
            isSelected: false,
            isToday: isToday(dateStr),
            events: myCalendarEvents?.data?.filter((event: any) => isWithinRange(dateStr, event.date_time_start, event.date_time_end)).map((event: any) => ({
                ...event,
                time_start: moment(event.date_time_start).format('HH:mm'),
                time_end: moment(event.date_time_end).format('HH:mm'),
            })) || [],
            holidays: myCalendarEvents?.holidays?.filter((holiday: any) => isWithinRange(dateStr, holiday.date, holiday.date)).map((holiday: any) => ({
                ...holiday
            })) || [],
        })
        day.add(1, 'day')
    }

    return daysArray
}

function isToday(day: any) {
    return moment().isSame(day, 'day')
}

function isWeekend(dateStr: string) {
    return moment(dateStr).isoWeekday() >= 6
}

function isNow(event: any) {
    if (!event?.date_time_start || !event?.date_time_end) return false
    return moment().isBetween(moment(event.date_time_start), moment(event.date_time_end), null, '[)')
}

function visibleEvents(day: any) {
    if (state.expandedDays.includes(day.date)) return day.events
    return day.events.slice(0, 3)
}

function isOverdue(event: any) {
    if (!event || event.completion_status === 'completed' || event.is_shift) return false
    return !isNow(event) && moment(event.date_time_end).isBefore(moment())
}

const monthCount = computed(() => {
    if (!props.myCalendarEvents?.data) return 0
    return props.myCalendarEvents.data.filter((e: any) =>
        moment(e.date_time_start).month() === state.currentMonth
        && moment(e.date_time_start).year() === state.currentYear).length
})

function ownersLabel(event: any) {
    if (!event?.calendar_owners?.length) return ''
    return event.calendar_owners
        .map((o: any) => `${o?.owner?.firstname ?? ''} ${o?.owner?.lastname ?? ''}`.trim())
        .filter(Boolean).join(', ')
}

function showPreview(e: MouseEvent, event: any) {
    const margin = 12
    const width = 256
    let x = e.clientX + margin
    if (x + width > window.innerWidth) x = e.clientX - width - margin
    state.preview = { event, x, y: e.clientY + margin }
}

function hidePreview() {
    state.preview.event = null
}

function onCalKey(e: KeyboardEvent) {
    if (e.metaKey || e.ctrlKey || e.altKey) return
    const t = e.target as HTMLElement
    if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return
    if (e.key === 'ArrowLeft') { e.preventDefault(); previousMonth() }
    else if (e.key === 'ArrowRight') { e.preventDefault(); nextMonth() }
    else if (e.key === 't' || e.key === 'T') { setToday() }
}
onMounted(() => window.addEventListener('keydown', onCalKey))
onUnmounted(() => window.removeEventListener('keydown', onCalKey))

function isWithinRange(dateStr: string, start: string, end: string) {
    const date = moment(dateStr)
    const startDate = moment(start)
    const endDate = moment(end)

    return date.isBetween(startDate, endDate, 'day', '[]')
}

const month = computed(() => {
    const date = moment([state.currentYear, state.currentMonth])
    return date.format('MMMM')
})

const year = computed(() => {
    const date = moment([state.currentYear, state.currentMonth])
    return date.format('YYYY')
})

function editMyCalendarEvent(myCalendarEvent: any) {
    if (myCalendarEvent?.is_shift) return
    if (!state.modal.isShowAllInviteesOpen) {
        emit('editMyCalendarEvent', myCalendarEvent)
    }
}

function confirmEventDeletion(myCalendarEvent: any) {
    state.selectedSchedule = myCalendarEvent
    state.modal.isDeleteScheduleOpen = true
}

function deleteMyCalendarEvent() {
    emit('deleteMyCalendarEvent', state.selectedSchedule)
    state.modal.isDeleteScheduleOpen = false
}

function markEventAsStatus(myCalendarEvent: any, status: 'completed' | 'not_completed') {
    emit('markEventAsStatus', myCalendarEvent, status)
}

function openCreateJournal(myCalendarEvent: any) {
    emit('createJournalFromEvent', myCalendarEvent)
}
</script>
