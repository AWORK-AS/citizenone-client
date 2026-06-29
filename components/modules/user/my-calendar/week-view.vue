<template>
    <div>
        <div class="md:flex gap-x-3 text-sm">
            <div class="flex items-center gap-x-2">
                <div class="w-3 h-3 rounded-sm bg-primary"></div>
                <span>{{ $t('events.myself') }}</span>
            </div>
            <div class="flex items-center gap-x-2">
                <div class="w-3 h-3 rounded-sm bg-green-700"></div>
                <span>{{ $t('events.employees') }}</span>
            </div>
            <div class="flex items-center gap-x-2">
                <div class="w-3 h-3 rounded-sm bg-yellow-500"></div>
                <span>{{ $t('events.citizens') }}</span>
            </div>
            <div class="flex items-center gap-x-2">
                <div class="w-3 h-3 rounded-sm bg-secondary"></div>
                <span>{{ $t('events.holidays') }}</span>
            </div>
        </div>
        <div class="flex h-full flex-col">
            <header class="flex flex-none items-center justify-between border-b border-gray-200 py-4">
                <h3 class="text-base font-semibold leading-6 text-gray-900">
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
                <div class="space-y-2">
                    <div class="flex items-center">
                        <div
                            class="inline-flex items-center rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <button @click="previousWeek()" type="button"
                                class="flex h-11 w-10 flex-shrink-0 items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                                <span class="sr-only">Previous week</span>
                                <Icon name="heroicons:chevron-left" class="h-5 w-5" aria-hidden="true" />
                            </button>
                            <FormDateField id="date" name="date" :placeholder="$t('dutySchedules.form.date')"
                                dateType="calendar" v-model="state.selectedDate" />
                            <button @click="nextWeek()" type="button"
                                class="flex h-11 w-10 flex-shrink-0 items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                                <span class="sr-only">Next week</span>
                                <Icon name="heroicons:chevron-right" class="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                    <div class="flex justify-end">
                        <button @click="setToday()" class="text-primary text-sm hover:text-primary-700 text">
                            {{ $t('goToToday') }}
                        </button>
                    </div>
                </div>
            </header>
            <div class="isolate flex flex-auto flex-col overflow-auto bg-white">
                <div style="width: 165%" class="flex max-w-full flex-none flex-col sm:max-w-none md:max-w-full">
                    <div class="sticky top-0 z-30 flex-none bg-white shadow ring-1 ring-black ring-opacity-5 sm:pr-8">
                        <div class="grid grid-cols-7 text-sm leading-6 text-gray-500 sm:hidden">
                            <button v-for="day in weekDays" :key="day.date" type="button"
                                class="flex flex-col items-center pb-3 pt-2">
                                <span v-if="day.longName === 'Mon'">
                                    {{ $t('calendar.week.oneLetter.Monday') }}
                                </span>
                                <span v-if="day.longName === 'Tue'">
                                    {{ $t('calendar.week.oneLetter.Tuesday') }}
                                </span>
                                <span v-if="day.longName === 'Wed'">
                                    {{ $t('calendar.week.oneLetter.Wednesday') }}
                                </span>
                                <span v-if="day.longName === 'Thu'">
                                    {{ $t('calendar.week.oneLetter.Thursday') }}
                                </span>
                                <span v-if="day.longName === 'Fri'">
                                    {{ $t('calendar.week.oneLetter.Friday') }}
                                </span>
                                <span v-if="day.longName === 'Sat'">
                                    {{ $t('calendar.week.oneLetter.Saturday') }}
                                </span>
                                <span v-if="day.longName === 'Sun'">
                                    {{ $t('calendar.week.oneLetter.Sunday') }}
                                </span>
                                <span
                                    :class="moment(selectedDay).format('YYYY-MM-DD') === moment(day.fullDate).format('YYYY-MM-DD') ? 'mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-tertiary font-semibold text-white' : 'mt-1 flex h-8 w-8 items-center justify-center font-semibold text-gray-900'">
                                    {{ day.date }}
                                </span>
                            </button>
                        </div>

                        <div
                            class="-mr-px hidden grid-cols-7 divide-x divide-gray-100 border-r border-gray-100 text-sm leading-6 text-gray-500 sm:grid">
                            <div class="col-end-1 w-14" />
                            <div v-for="day in weekDays" :key="day.date" class="flex items-center justify-center py-3">
                                <span class="flex gap-x-1">
                                    <span v-if="day.longName === 'Mon'">
                                        {{ $t('calendar.week.short.Monday') }}
                                    </span>
                                    <span v-if="day.longName === 'Tue'">
                                        {{ $t('calendar.week.short.Tuesday') }}
                                    </span>
                                    <span v-if="day.longName === 'Wed'">
                                        {{ $t('calendar.week.short.Wednesday') }}
                                    </span>
                                    <span v-if="day.longName === 'Thu'">
                                        {{ $t('calendar.week.short.Thursday') }}
                                    </span>
                                    <span v-if="day.longName === 'Fri'">
                                        {{ $t('calendar.week.short.Friday') }}
                                    </span>
                                    <span v-if="day.longName === 'Sat'">
                                        {{ $t('calendar.week.short.Saturday') }}
                                    </span>
                                    <span v-if="day.longName === 'Sun'">
                                        {{ $t('calendar.week.short.Sunday') }}
                                    </span>
                                    <span class="items-center justify-center font-semibold text-gray-900">
                                        {{ day.date }}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="hidden md:flex flex-auto">
                        <div class="sticky left-0 z-10 w-14 flex-none bg-white ring-1 ring-gray-100" />
                        <div class="grid flex-auto grid-cols-1 grid-rows-1">
                            <div class="col-start-1 col-end-2 row-start-1 grid divide-y divide-gray-100"
                                style="grid-template-rows: repeat(8, minmax(3.5rem, 1fr))">
                                <div class="row-end-1 h-7" />
                            </div>
                            <div
                                class="col-start-1 col-end-2 row-start-1 hidden grid-cols-7 grid-rows-1 divide-x divide-gray-100 sm:grid sm:grid-cols-7">
                                <div v-for="(events, eventsByDayIndex) in eventsByDay" :key="eventsByDayIndex"
                                    class="col-start-{{ index + 1 }}">
                                    <div class="p-3 space-y-2">
                                        <div v-for="(holiday, holidayIndex) in holidaysByDay[eventsByDayIndex]"
                                            :key="holidayIndex"
                                            class="bg-gray-200 p-2 rounded-md cursor-pointer border-l-4 border-secondary">
                                            <p class="text-xs">
                                                {{ holiday?.name }}
                                            </p>
                                        </div>
                                        <template v-for="myCalendarEvent in events" :key="myCalendarEvent.id">
                                        <div v-if="myCalendarEvent?.is_shift"
                                            class="relative bg-indigo-50 p-2 rounded-md border-l-4 border-indigo-500">
                                            <div class="flex items-center gap-x-1">
                                                <Icon name="ph:briefcase" class="h-3 w-3 text-indigo-600" />
                                                <p class="text-xs truncate font-medium text-indigo-800">
                                                    {{ myCalendarEvent?.title }}
                                                </p>
                                            </div>
                                            <span
                                                class="inline-flex items-center gap-x-0.5 rounded-full bg-indigo-100 px-1.5 py-0.5 text-xxs font-medium text-indigo-700 mt-1">
                                                <Icon name="ph:clock" class="h-3 w-3" />
                                                {{ $t('events.shiftLabel') }}
                                            </span>
                                            <p class="text-xxs mt-1">
                                                {{ moment(myCalendarEvent.date_time_start).format('HH:mm') }} -
                                                {{ moment(myCalendarEvent.date_time_end).format('HH:mm') }}
                                            </p>
                                            <p class="text-xxs text-gray-600" v-if="myCalendarEvent?.employee">
                                                {{ myCalendarEvent?.employee }}
                                            </p>
                                        </div>
                                        <div v-else
                                            class="relative bg-gray-200 p-2 rounded-md cursor-pointer" :class="[
                                                myCalendarEvent?.type === 'citizens' && 'border-yellow-500',
                                                myCalendarEvent?.type === 'employees' && 'border-green-700',
                                                myCalendarEvent?.type === 'my_self' && 'border-primary',
                                                'border-l-4'
                                            ]" @click="editMyCalendarEvent(myCalendarEvent)">
                                            <div class="flex items-start justify-between gap-x-1">
                                                <div class="min-w-0">
                                                    <p class="text-xs truncate">
                                                        {{ myCalendarEvent?.title }}
                                                    </p>
                                                    <span v-if="myCalendarEvent?.completion_status === 'completed'"
                                                        class="inline-flex items-center gap-x-0.5 rounded-full bg-green-100 px-1.5 py-0.5 text-xxs font-medium text-green-700">
                                                        <Icon name="ph:check-circle" class="h-3 w-3" />
                                                        {{ $t('events.status.completed') }}
                                                    </span>
                                                    <span v-else-if="myCalendarEvent?.completion_status === 'not_completed'"
                                                        class="inline-flex items-center gap-x-0.5 rounded-full bg-red-100 px-1.5 py-0.5 text-xxs font-medium text-red-700">
                                                        <Icon name="ph:x-circle" class="h-3 w-3" />
                                                        {{ $t('events.status.notCompleted') }}
                                                    </span>
                                                </div>
                                                <Menu as="div" class="flex-shrink-0" @click.stop>
                                                    <MenuButton class="flex items-center rounded p-0.5 text-gray-500 hover:bg-gray-300 hover:text-gray-700">
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
                                            <p class="text-xxs">
                                                {{ moment(myCalendarEvent.date_time_start).format('HH:mm') }} -
                                                {{ moment(myCalendarEvent.date_time_end).format('HH:mm') }}
                                            </p>
                                            <div class="flex gap-x-2 text-xxs">
                                                <p>
                                                    {{ $t('units.unit') }}:
                                                </p>
                                                <p>
                                                    {{ myCalendarEvent?.unit?.name }}
                                                </p>
                                            </div>
                                            <div class="text-xxs flex flex-wrap gap-1 mt-1"
                                                v-if="myCalendarEvent.calendar_tags?.length > 0">
                                                <span v-for="(calendarTag, index) in myCalendarEvent.calendar_tags"
                                                    :key=index class="p-1 text-white rounded-md"
                                                    :style="{ backgroundColor: calendarTag?.color }">
                                                    {{ calendarTag?.tag }}
                                                </span>
                                            </div>
                                            <div class="text-gray-500 text-xxs mt-1">
                                                <p>{{ $t('events.eventOwner') }}:</p>
                                                <div class="flex flex-wrap gap-1 mt-1">
                                                    <div v-for="(owner, index) in myCalendarEvent.calendar_owners"
                                                        :key="index"
                                                        class="bg-secondary text-xxs p-1 text-white rounded-md">
                                                        {{ owner?.owner?.firstname }} {{ owner?.owner?.lastname }}
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="text-gray-500 text-xxs mt-1"
                                                v-if="myCalendarEvent.calendar_users?.length > 0">
                                                <p>{{ $t('events.invitees') }}:</p>
                                                <div class="flex flex-wrap gap-1 mt-1">
                                                    <div v-for="(invitee, index) in myCalendarEvent.calendar_users?.slice(0, 2)"
                                                        :key="index"
                                                        class="bg-secondary text-xxs p-1 text-white rounded-md">
                                                        {{ invitee?.user?.firstname }} {{ invitee?.user?.lastname }}
                                                    </div>
                                                </div>
                                                <button @click="showAllInvitees(myCalendarEvent)"
                                                    class="mt-1 text-primary text-xs hover:text-primary-700"
                                                    v-if="myCalendarEvent.calendar_users?.length > 2">
                                                    {{ $t('showAll') }}...
                                                </button>
                                            </div>
                                            <div class="text-gray-500 text-xxs mt-1">
                                                <p>{{ $t('events.createdBy') }}:</p>
                                                <div class="flex flex-wrap gap-1 mt-1">
                                                    <div class="bg-secondary text-xxs p-1 text-white rounded-md">
                                                        {{ myCalendarEvent.creator?.firstname }} {{
                                                            myCalendarEvent.creator?.lastname }}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        </template>
                                    </div>
                                </div>
                                <div class="col-start-8 w-8" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ol class="mt-4 space-y-2 text-sm leading-6 lg:col-span-7 xl:col-span-8 lg:hidden" v-if=selectedDay>
                <li v-for="(holiday, holidayIndex) in props.myCalendarEvents?.holidays" :key="holidayIndex"
                    class="border-secondary pl-4 border-l-4">
                    <div class="py-2">
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
                <li v-for="(event, index) in props.myCalendarEvents?.data" :key="index" :class="[
                    event?.is_shift && 'border-indigo-500 bg-indigo-50/60 rounded-r-md',
                    !event?.is_shift && event?.type === 'citizens' && 'border-yellow-500',
                    !event?.is_shift && event?.type === 'employees' !== userStore.getUser?.uuid && 'border-green-700',
                    !event?.is_shift && event?.type === 'my_self' && 'border-primary',
                    'pl-4 border-l-4'
                ]">
                    <div v-if="event?.is_shift" class="relative py-4">
                        <div class="flex items-center gap-x-2 flex-wrap">
                            <Icon name="ph:briefcase" class="h-4 w-4 text-indigo-600" aria-hidden="true" />
                            <dd class="font-semibold text-gray-900 xl:pr-0">{{ event?.title }}</dd>
                            <span
                                class="inline-flex items-center gap-x-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                                <Icon name="ph:clock" class="h-3.5 w-3.5" />
                                {{ $t('events.shiftLabel') }}
                            </span>
                        </div>
                        <p class="text-xs text-gray-500 mt-1" v-if="event?.employee">{{ event?.employee }}</p>
                        <dl class="text-gray-500">
                            <div class="flex items-center space-x-3 text-xs">
                                <dt class="flex items-center">
                                    <span class="sr-only">Date</span>
                                    <Icon name="ph:calendar" class="h-4 w-4 text-gray-400" aria-hidden="true" />
                                </dt>
                                <dd>
                                    <time :datetime="event.date_time_start">
                                        {{ formatDateTimeToReadable(event.date_time_start) }}
                                        -
                                        {{ formatDateTimeToReadable(event.date_time_end) }}
                                    </time>
                                </dd>
                            </div>
                        </dl>
                    </div>
                    <div v-else class="relative flex space-x-6 py-6">
                        <img :src="`https://ui-avatars.com/api/?background=42AED9&color=fff&name=${event?.title}`"
                            alt="Image" class="h-14 w-14 flex-none rounded-full" />
                        <div class="flex-auto">
                            <h3 class="pr-10 font-semibold text-gray-900 xl:pr-0">
                                {{ event?.user?.firstname }}
                                {{ event?.user?.lastname }}
                            </h3>
                            <div class="flex items-center gap-x-2 flex-wrap">
                                <dt class="flex items-center">
                                    <span class="sr-only">Title</span>
                                    <Icon name="ph:clipboard" class="h-4 w-4 text-gray-400" aria-hidden="true" />
                                </dt>
                                <dd class="font-semibold text-gray-900 xl:pr-0">
                                    {{ event?.title }}
                                </dd>
                                <span v-if="event?.completion_status === 'completed'"
                                    class="inline-flex items-center gap-x-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                    <Icon name="ph:check-circle" class="h-3.5 w-3.5" />
                                    {{ $t('events.status.completed') }}
                                </span>
                                <span v-else-if="event?.completion_status === 'not_completed'"
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
                                    {{ event?.description }}
                                </dd>
                            </div>
                            <dl class="text-gray-500">
                                <div class="flex items-center space-x-3 text-xs">
                                    <dt class="flex items-center">
                                        <span class="sr-only">Date</span>
                                        <Icon name="ph:calendar" class="h-4 w-4 text-gray-400" aria-hidden="true" />
                                    </dt>
                                    <dd>
                                        <time :datetime="event.datetime">
                                            {{ formatDateTimeToReadable(event.date_time_start) }}
                                            -
                                            {{ formatDateTimeToReadable(event.date_time_end) }}
                                        </time>
                                    </dd>
                                </div>
                            </dl>
                            <div class="text-xxs flex flex-wrap gap-1 mt-1" v-if="event.calendar_tags?.length > 0">
                                <span v-for="(calendarTag, index) in event.calendar_tags" :key=index
                                    class="p-1 text-white rounded-md" :style="{ backgroundColor: calendarTag?.color }">
                                    {{ calendarTag?.tag }}
                                </span>
                            </div>
                            <div class="text-gray-500 text-xs mt-1">
                                <p>{{ $t('events.eventOwner') }}:</p>
                                <div class="flex flex-wrap gap-1 mt-1">
                                    <div v-for="(owner, index) in event.calendar_owners" :key="index"
                                        class="bg-secondary text-xxs p-1 text-white rounded-md">
                                        {{ owner?.owner?.firstname }} {{ owner?.owner?.lastname }}
                                    </div>
                                </div>
                            </div>
                            <div class="text-gray-500 text-xs mt-1" v-if="event.calendar_users?.length > 0">
                                <p>{{ $t('events.invitees') }}:</p>
                                <div class="flex flex-wrap gap-1 mt-1">
                                    <div v-for="(invitee, index) in event.calendar_users?.slice(0, 2)" :key="index"
                                        class="bg-secondary text-xxs p-1 text-white rounded-md">
                                        {{ invitee?.user?.firstname }} {{ invitee?.user?.lastname }}
                                    </div>
                                </div>
                                <button @click="showAllInvitees(event)"
                                    class="mt-1 text-primary text-xs hover:text-primary-700"
                                    v-if="event.calendar_users?.length > 2">
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
                                            @click="editMyCalendarEvent(event)">
                                            <Icon name="ph:pencil-simple" class="h-4 w-4" />
                                            {{ $t('calendar.edit') }}
                                        </a>
                                        </MenuItem>
                                        <MenuItem v-slot="{ active }">
                                        <a href="#"
                                            :class="[active && 'bg-gray-100', 'text-red-600', 'flex items-center gap-x-1.5 px-4 py-2 text-sm']"
                                            @click="confirmEventDeletion(event)">
                                            <Icon name="ph:trash" class="h-4 w-4" />
                                            {{ $t('calendar.delete') }}
                                        </a>
                                        </MenuItem>
                                        <template v-if="event?.completion_status !== 'completed'">
                                            <MenuItem v-slot="{ active }">
                                            <a href="#"
                                                :class="[active && 'bg-gray-100', 'text-green-700', 'flex items-center gap-x-1.5 px-4 py-2 text-sm']"
                                                @click="markEventAsStatus(event, 'completed')">
                                                <Icon name="ph:check-circle" class="h-4 w-4" />
                                                {{ $t('events.markAsCompleted') }}
                                            </a>
                                            </MenuItem>
                                        </template>
                                        <template v-if="event?.completion_status !== 'not_completed'">
                                            <MenuItem v-slot="{ active }">
                                            <a href="#"
                                                :class="[active && 'bg-gray-100', 'text-red-700', 'flex items-center gap-x-1.5 px-4 py-2 text-sm']"
                                                @click="markEventAsStatus(event, 'not_completed')">
                                                <Icon name="ph:x-circle" class="h-4 w-4" />
                                                {{ $t('events.markAsNotCompleted') }}
                                            </a>
                                            </MenuItem>
                                        </template>
                                        <template v-if="event?.type === 'citizens'">
                                            <MenuItem v-slot="{ active }">
                                            <a href="#"
                                                :class="[active && 'bg-gray-100', 'text-gray-700', 'flex items-center gap-x-1.5 px-4 py-2 text-sm']"
                                                @click="openCreateJournal(event)">
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
    </div>
</template>


<script setup lang="ts">
import moment from 'moment'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { useUserStore } from '@/store/user'

const { formatDateToReadable, formatDateTimeToReadable } = useDatetimeFormatter()
const props = defineProps({
    myCalendarEvents: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['changeDatePerWeek', 'editMyCalendarEvent', 'deleteMyCalendarEvent', 'markEventAsStatus', 'createJournalFromEvent'])
const userStore = useUserStore() as any

const currentDate = ref(moment())
const selectedDay = ref(moment())

const state = reactive({
    modal: {
        isDeleteScheduleOpen: false,
        isShowAllInviteesOpen: false,
    },
    selectedDate: moment().format('YYYY-MM-DD'),
    selectedSchedule: {} as any
})

watch(() => state.selectedDate, (newSelectedDate: any) => {
    if (newSelectedDate) {
        currentDate.value = moment(newSelectedDate)
        const dateMoment = moment(currentDate.value)
        const startOfWeek = dateMoment.clone().startOf('isoWeek')
        const endOfWeek = dateMoment.clone().endOf('isoWeek')
        const startOfWeekFormatted = startOfWeek.format('YYYY-MM-DD')
        const endOfWeekFormatted = endOfWeek.format('YYYY-MM-DD')
        emit('changeDatePerWeek', [startOfWeekFormatted, endOfWeekFormatted])
    }
})

const previousWeek = () => {
    currentDate.value = moment(currentDate.value).subtract(1, 'week')
    const dateMoment = moment(currentDate.value)
    const startOfWeek = dateMoment.clone().startOf('isoWeek')
    const endOfWeek = dateMoment.clone().endOf('isoWeek')
    const startOfWeekFormatted = startOfWeek.format('YYYY-MM-DD')
    const endOfWeekFormatted = endOfWeek.format('YYYY-MM-DD')
    emit('changeDatePerWeek', [startOfWeekFormatted, endOfWeekFormatted])
    state.selectedDate = moment(state.selectedDate).subtract(1, 'week').format('YYYY-MM-DD')
}

const setToday = () => {
    currentDate.value = moment()
    const dateMoment = moment(currentDate.value)
    const startOfWeek = dateMoment.clone().startOf('isoWeek')
    const endOfWeek = dateMoment.clone().endOf('isoWeek')
    const startOfWeekFormatted = startOfWeek.format('YYYY-MM-DD')
    const endOfWeekFormatted = endOfWeek.format('YYYY-MM-DD')
    emit('changeDatePerWeek', [startOfWeekFormatted, endOfWeekFormatted])
    state.selectedDate = moment(currentDate.value).format('YYYY-MM-DD')
}

const nextWeek = () => {
    currentDate.value = moment(currentDate.value).add(1, 'week')
    const dateMoment = moment(currentDate.value)
    const startOfWeek = dateMoment.clone().startOf('isoWeek')
    const endOfWeek = dateMoment.clone().endOf('isoWeek')
    const startOfWeekFormatted = startOfWeek.format('YYYY-MM-DD')
    const endOfWeekFormatted = endOfWeek.format('YYYY-MM-DD')
    emit('changeDatePerWeek', [startOfWeekFormatted, endOfWeekFormatted])
    state.selectedDate = moment(state.selectedDate).add(1, 'week').format('YYYY-MM-DD')
}

function showAllInvitees(myCalendarEvent: any) {
    state.selectedSchedule = myCalendarEvent
    state.modal.isShowAllInviteesOpen = true
}

function editMyCalendarEvent(myCalendarEvent: any) {
    if (myCalendarEvent?.is_shift) return
    if (!state.modal.isShowAllInviteesOpen) {
        emit('editMyCalendarEvent', myCalendarEvent)
    }
}

const month = computed(() => currentDate.value.format('MMMM'))
const year = computed(() => currentDate.value.format('YYYY'))

const weekDays = computed(() => {
    const startOfWeek = moment(currentDate.value).startOf('isoWeek')
    return Array.from({ length: 7 }).map((_, i) => {
        const day = moment(startOfWeek).add(i, 'day')
        return {
            shortName: day.format('dd')[0],
            longName: day.format('ddd'),
            date: day.date(),
            fullDate: day
        }
    })
})

function setSelectedDay(day: any) {
    selectedDay.value = day.fullDate
    const dateMoment = moment(currentDate.value)
    const startOfWeek = dateMoment.clone().startOf('isoWeek')
    const endOfWeek = dateMoment.clone().endOf('isoWeek')
    const startOfWeekFormatted = startOfWeek.format('YYYY-MM-DD')
    const endOfWeekFormatted = endOfWeek.format('YYYY-MM-DD')
    emit('changeDatePerWeek', [startOfWeekFormatted, endOfWeekFormatted])
}

function isWithinRange(eventStart: moment.Moment, eventEnd: moment.Moment, dayStart: moment.Moment, dayEnd: moment.Moment) {
    return eventStart.isBefore(dayEnd) && eventEnd.isAfter(dayStart)
}

const eventsByDay = computed(() => {
    if (!props.myCalendarEvents?.data) return Array.from({ length: 7 }).map(() => [])

    const startOfWeek = moment(currentDate.value).startOf('isoWeek')

    return Array.from({ length: 7 }).map((_, i) => {
        const dayStart = moment(startOfWeek).add(i, 'day').startOf('day')
        const dayEnd = moment(dayStart).endOf('day')

        return props.myCalendarEvents.data.filter((event: any) => {
            const eventStart = moment(event.date_time_start)
            const eventEnd = moment(event.date_time_end)
            return isWithinRange(eventStart, eventEnd, dayStart, dayEnd)
        })
    })
})

const holidaysByDay = computed(() => {
    if (!props.myCalendarEvents?.holidays) return Array.from({ length: 7 }).map(() => [])

    const startOfWeek = moment(currentDate.value).startOf('isoWeek')

    return Array.from({ length: 7 }).map((_, i) => {
        const dayStart = moment(startOfWeek).add(i, 'days').startOf('day')
        const dayEnd = moment(dayStart).endOf('day')

        return props.myCalendarEvents.holidays.filter((holiday: any) => {
            const eventStart = moment(holiday.date).startOf('day')
            const eventEnd = moment(holiday.date).endOf('day')
            return isWithinRange(eventStart, eventEnd, dayStart, dayEnd)
        })
    })
})

const eventsBySelectedDay = computed(() => {
    if (!props.myCalendarEvents?.data) return Array.from({ length: 7 }).map(() => [])

    const dayStart = moment(selectedDay.value).startOf('day')
    const dayEnd = moment(selectedDay.value).endOf('day')
    return props.myCalendarEvents.data.filter((event: any) => {
        const eventStart = moment(event.date_time_start)
        const eventEnd = moment(event.date_time_end)
        return isWithinRange(eventStart, eventEnd, dayStart, dayEnd)
    })
})

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
