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
        <div class="lg:flex lg:h-full lg:flex-col">
            <header class="flex items-center justify-between border-b border-gray-200 py-4 lg:flex-none">
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
                            <button type="button" @click="previousMonth()"
                                class="flex h-11 w-10 flex-shrink-0 items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                                <span class="sr-only">Previous month</span>
                                <Icon name="heroicons:chevron-left" class="h-5 w-5" aria-hidden="true" />
                            </button>
                            <FormDateField id="date" name="date" :placeholder="$t('dutySchedules.form.date')"
                                dateType="calendar" v-model="state.selectedDate" />
                            <button type="button" @click="nextMonth()"
                                class="flex h-11 w-10 flex-shrink-0 items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                                <span class="sr-only">Next month</span>
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
            <div class="shadow ring-1 ring-black ring-opacity-5 lg:flex lg:flex-auto lg:flex-col">
                <div
                    class="md:hidden grid grid-cols-7 gap-px border-b border-gray-300 bg-gray-200 text-center text-xs font-semibold leading-6 text-gray-700 lg:flex-none">
                    <div class="bg-white py-2">
                        {{ $t('calendar.week.oneLetter.Monday') }}
                    </div>
                    <div class="bg-white py-2">
                        {{ $t('calendar.week.oneLetter.Tuesday') }}
                    </div>
                    <div class="bg-white py-2">
                        {{ $t('calendar.week.oneLetter.Wednesday') }}
                    </div>
                    <div class="bg-white py-2">
                        {{ $t('calendar.week.oneLetter.Thursday') }}
                    </div>
                    <div class="bg-white py-2">
                        {{ $t('calendar.week.oneLetter.Friday') }}
                    </div>
                    <div class="bg-white py-2">
                        {{ $t('calendar.week.oneLetter.Saturday') }}
                    </div>
                    <div class="bg-white py-2">
                        {{ $t('calendar.week.oneLetter.Sunday') }}
                    </div>
                </div>
                <div
                    class="hidden md:grid grid-cols-7 gap-px border-b border-gray-300 bg-gray-200 text-center text-xs font-semibold leading-6 text-gray-700 lg:flex-none">

                    <div class="bg-white py-2">
                        {{ $t('calendar.week.short.Monday') }}
                    </div>
                    <div class="bg-white py-2">
                        {{ $t('calendar.week.short.Tuesday') }}
                    </div>
                    <div class="bg-white py-2">
                        {{ $t('calendar.week.short.Wednesday') }}
                    </div>
                    <div class="bg-white py-2">
                        {{ $t('calendar.week.short.Thursday') }}
                    </div>
                    <div class="bg-white py-2">
                        {{ $t('calendar.week.short.Friday') }}
                    </div>
                    <div class="bg-white py-2">
                        {{ $t('calendar.week.short.Saturday') }}
                    </div>
                    <div class="bg-white py-2">
                        {{ $t('calendar.week.short.Sunday') }}
                    </div>
                </div>
                <div class="flex bg-gray-200 text-xs leading-6 text-gray-700 lg:flex-auto">
                    <div class="hidden w-full lg:grid lg:grid-cols-7 lg:grid-rows-5 lg:gap-px">
                        <div v-for="(day, index) in state.days" :key="index"
                            :class="[day.isCurrentMonth ? 'bg-white' : 'min-h-20 bg-gray-50 text-gray-500', 'relative px-3 py-2']">
                            <time :datetime="day.date"
                                :class="day.isToday ? 'flex h-6 w-6 items-center justify-center rounded-full bg-tertiary font-semibold text-white' : undefined">
                                {{ day.date?.split('-').pop()?.replace(/^0/, '') }}
                            </time>
                            <ol v-if="day.holidays.length > 0" class="mt-2 space-y-2">
                                <li v-for="(holiday, holidayIndex) in day.holidays" :key="holidayIndex">
                                    <div
                                        class="bg-gray-200 p-2 rounded-md text-xxs space-y-1 border-l-4 border-secondary">
                                        {{ holiday?.name }}
                                    </div>
                                </li>
                            </ol>
                            <ol v-if="day.events.length > 0" class="mt-2 space-y-2">
                                <li v-for="(myCalendarEvent, index) in day.events" :key="index">
                                    <div v-if="myCalendarEvent?.is_shift"
                                        class="relative bg-indigo-50 p-2 rounded-md text-xxs space-y-1 border-l-4 border-indigo-500">
                                        <div class="flex items-center gap-x-1">
                                            <Icon name="ph:briefcase" class="h-3 w-3 text-indigo-600" />
                                            <p class="flex-auto truncate font-medium text-indigo-800">
                                                {{ myCalendarEvent?.title }}
                                            </p>
                                        </div>
                                        <span
                                            class="inline-flex items-center gap-x-0.5 rounded-full bg-indigo-100 px-1.5 py-0.5 text-xxs font-medium text-indigo-700">
                                            <Icon name="ph:clock" class="h-3 w-3" />
                                            {{ $t('events.shiftLabel') }}
                                        </span>
                                        <p class="text-gray-600">
                                            {{ myCalendarEvent.time_start }} - {{ myCalendarEvent.time_end }}
                                        </p>
                                        <p class="text-gray-600" v-if="myCalendarEvent?.employee">
                                            {{ myCalendarEvent?.employee }}
                                        </p>
                                    </div>
                                    <div v-else class="relative group cursor-pointer bg-gray-200 p-2 rounded-md text-xxs space-y-1"
                                        :class="[
                                            myCalendarEvent?.type === 'citizens' && 'border-yellow-500',
                                            myCalendarEvent?.type === 'employees' && 'border-green-700',
                                            myCalendarEvent?.type === 'my_self' && 'border-primary',
                                            'border-l-4'
                                        ]" @click="editMyCalendarEvent(myCalendarEvent)">
                                        <div class="flex items-start justify-between gap-x-1">
                                            <div class="min-w-0">
                                                <p class="flex-auto truncate font-medium text-gray-900 group-hover:text-tertiary">
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
                                        <p class="hidden flex-none text-gray-500 group-hover:text-tertiary xl:block">
                                            {{ myCalendarEvent.time_start }} - {{ myCalendarEvent.time_end }}
                                        </p>
                                        <div class="flex gap-x-2 text-xxs group-hover:text-tertiary"
                                            v-if="myCalendarEvent?.unit">
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
