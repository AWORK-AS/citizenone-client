<template>
    <div v-if="unreadCount > 0" class="relative py-1" ref="bellRef">
        <button class="relative w-full text-primary hover:text-primary-700 rounded-md py-3 flex items-center gap-x-2"
            @click="togglePanel" type="button">
            <Icon name="ph:bell-ringing-light" class="h-6 w-6" aria-hidden="true" />
            <Badge v-if="unreadCount > 0" type="notification"
                class="w-5 h-5 flex items-center justify-center absolute top-0 left-3">
                {{ unreadCount > 99 ? '99+' : unreadCount }}
            </Badge>
        </button>

        <div v-if="state.isOpen"
            class="absolute right-0 top-full mt-1 w-[380px] bg-white rounded-sm shadow-lg ring-1 ring-gray-900/5 z-50 origin-top-right">
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 class="text-sm font-semibold text-gray-900">{{ $t('bellNotification.title') }}</h3>
                <button v-if="state.notifications.length > 0" @click="markAllAsRead" :disabled="state.isMarkingAll"
                    class="text-xs text-primary hover:text-primary-700 font-medium disabled:opacity-50" type="button">
                    {{ $t('bellNotification.markAllAsRead') }}
                </button>
            </div>

            <div class="px-3 py-2.5 border-b border-gray-100">
                <select v-model="state.activeCategory"
                    class="w-full text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary">
                    <option v-for="cat in categories" :key="cat.key" :value="cat.key">
                        {{ cat.label }}
                    </option>
                </select>
            </div>
            <div class="overflow-y-auto max-h-[340px]">
                <template v-if="state.isLoading">
                    <div v-for="n in 5" :key="n" class="flex items-start gap-3 px-4 py-3 border-b border-gray-50">
                        <div class="w-8 h-8 rounded-full bg-gray-200 animate-pulse flex-shrink-0 mt-0.5" />
                        <div class="flex-1 space-y-1.5">
                            <div class="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                            <div class="h-2.5 bg-gray-100 rounded animate-pulse w-1/2" />
                        </div>
                    </div>
                </template>
                <template v-else-if="filteredNotifications.length === 0">
                    <div class="flex flex-col items-center justify-center py-10 px-4 text-center">
                        <Icon name="ph:bell-slash" class="h-10 w-10 text-gray-300 mb-2" />
                        <p class="text-sm text-gray-500 font-medium">{{ $t('bellNotification.empty.title') }}</p>
                        <p class="text-xs text-gray-400 mt-0.5">{{ $t('bellNotification.empty.subtitle') }}</p>
                    </div>
                </template>
                <template v-else>
                    <div v-for="notif in filteredNotifications" :key="notif.id" @click="handleNotifClick(notif)" :class="[
                        'flex items-start gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer transition-colors',
                        !notif.read_at ? 'bg-primary/[0.03] hover:bg-primary/[0.06]' : 'hover:bg-gray-50'
                    ]">
                        <div :class="[
                            'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5',
                            getCategoryStyle(notif.type).bg
                        ]">
                            <Icon :name="getCategoryStyle(notif.type).icon" class="h-4 w-4"
                                :class="getCategoryStyle(notif.type).color" />
                        </div>

                        <div class="flex-1 min-w-0">
                            <p class="text-xs font-semibold text-gray-800 truncate">
                                {{ getNotifTitle(notif) }}
                            </p>
                            <p v-if="getNotifDescription(notif)" class="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                {{ getNotifDescription(notif) }}
                            </p>
                            <p class="text-[11px] text-gray-400 mt-1">
                                {{ formatTime(notif.created_at) }}
                            </p>
                        </div>
                        <div v-if="!notif.read_at" class="flex-shrink-0 w-2 h-2 rounded-full bg-secondary mt-2" />
                    </div>
                    <div v-if="state.hasMore" class="px-4 py-3 text-center">
                        <button @click="loadMore" :disabled="state.isLoadingMore"
                            class="text-xs text-primary hover:text-primary-700 font-medium disabled:opacity-50"
                            type="button">
                            <span v-if="state.isLoadingMore">{{ $t('bellNotification.loadingMore') }}</span>
                            <span v-else>{{ $t('bellNotification.loadMore') }}</span>
                        </button>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { notificationService } from '@/components/api/user/NotificationService'
import { useUserStore } from '@/store/user'

const { t } = useI18n()
const userStore = useUserStore() as any
const bellRef = ref<HTMLElement | null>(null)
const state = reactive({
    isOpen: false,
    activeCategory: 'all',
    notifications: [] as any[],
    error: {} as any,
    isLoading: false,
    isMarkingAll: false,
    isLoadingMore: false,
    hasMore: false,
    currentPage: 1,
})

const PAGE_LENGTH = 10

// add more categories here as needed
const categories = computed(() => [
    { key: 'all', label: t('bellNotification.categories.all'), icon: 'ph:list' },
    { key: 'duty_shift', label: t('bellNotification.categories.dutyShift'), icon: 'ph:shield-check' },
    { key: 'birthday', label: t('bellNotification.categories.birthday'), icon: 'ph:cake' },
])

function getCategory(type: string): string {
    if (!type) return 'other'
    if (type.toLowerCase().includes('dutyshiftrule')) return 'duty_shift'
    if (type.toLowerCase().includes('birthday')) return 'birthday'
    return 'other'
}

const categoryStyles: Record<string, { bg: string; icon: string; color: string }> = {
    duty_shift: { bg: 'bg-primary/10', icon: 'ph:shield-check', color: 'text-primary' },
    birthday: { bg: 'bg-accent-orange/10', icon: 'ph:cake', color: 'text-accent-orange' },
    other: { bg: 'bg-gray-100', icon: 'ph:dots-three', color: 'text-gray-500' },
}

function getCategoryStyle(type: string) {
    return categoryStyles[getCategory(type)] ?? categoryStyles.other
}

const unreadCount = computed(() => userStore.getUser?.unread_system_notification_count ?? 0)

const filteredNotifications = computed(() => state.notifications)

function splitPascalCase(str: string): string {
    let result = ''
    for (let i = 0; i < str.length; i++) {
        const char = str[i]
        if (i > 0 && char >= 'A' && char <= 'Z') {
            result += ' ' + char
        } else {
            result += char
        }
    }
    return result.trim()
}

function getNotifTitle(notif: any): string {
    const data = notif.data ?? {}
    if (getCategory(notif.type) === 'birthday') return t('bellNotification.birthday.title')
    if (data.notification_label) return data.notification_label
    if (data.subject) return data.subject
    const className = notif.type?.split('\\')?.pop() ?? ''
    const withoutSuffix = className.endsWith('Notification')
        ? className.slice(0, -'Notification'.length)
        : className
    return splitPascalCase(withoutSuffix)
}

function getNotifDescription(notif: any): string {
    const data = notif.data ?? {}
    if (getCategory(notif.type) === 'birthday') {
        return `${data.content?.name ?? ''} · ${t('overview.birthdays.turns', { age: data.content?.age })}`.trim()
    }
    if (data.content?.triggered_employee) {
        const emp = data.content.triggered_employee
        return `${emp.firstname} ${emp.lastname}`.trim()
    }
    if (data.triggered_employee) return data.triggered_employee
    if (data.note) return data.note
    if (data.message) return data.message
    if (data.body) return data.body
    return ''
}

function formatTime(dateStr: string): string {
    if (!dateStr) return ''
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return t('bellNotification.time.justNow')
    if (mins < 60) return t('bellNotification.time.minutesAgo', { count: mins })
    const hours = Math.floor(mins / 60)
    if (hours < 24) return t('bellNotification.time.hoursAgo', { count: hours })
    const days = Math.floor(hours / 24)
    if (days === 1) return t('bellNotification.time.yesterday')
    if (days < 7) return t('bellNotification.time.daysAgo', { count: days })
    return new Date(dateStr).toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })
}

async function fetchAllNotifications() {
    state.isLoading = true
    try {
        const response = await notificationService.getSystemNotifications({ page_length: PAGE_LENGTH, page: 1 })
        if (response) {
            state.notifications = response?.data ?? []
            state.hasMore = (response?.last_page ?? 1) > 1
            state.currentPage = 1
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function fetchAllDutyShiftRuleNotifications() {
    state.isLoading = true
    try {
        const response = await notificationService.getSystemNotifications({ page_length: PAGE_LENGTH, page: 1, type: 'DutyShiftRule' })
        if (response) {
            state.notifications = response?.data ?? []
            state.hasMore = (response?.last_page ?? 1) > 1
            state.currentPage = 1
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function fetchAllBirthdayNotifications() {
    state.isLoading = true
    try {
        const response = await notificationService.getSystemNotifications({ page_length: PAGE_LENGTH, page: 1, type: 'Birthday' })
        if (response) {
            state.notifications = response?.data ?? []
            state.hasMore = (response?.last_page ?? 1) > 1
            state.currentPage = 1
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function fetchNotificationsByCategory() {
    state.notifications = []
    if (state.activeCategory === 'duty_shift') return fetchAllDutyShiftRuleNotifications()
    if (state.activeCategory === 'birthday') return fetchAllBirthdayNotifications()
    return fetchAllNotifications()
}

watch(() => state.activeCategory, () => {
    fetchNotificationsByCategory()
})

async function loadMore() {
    state.isLoadingMore = true
    try {
        const nextPage = state.currentPage + 1
        const params: any = { page_length: PAGE_LENGTH, page: nextPage }
        if (state.activeCategory !== 'all') params.type = state.activeCategory
        const response = await notificationService.getSystemNotifications(params)
        if (response) {
            state.notifications.push(...(response?.data ?? []))
            state.hasMore = nextPage < (response?.last_page ?? 1)
            state.currentPage = nextPage
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoadingMore = false
}

async function refreshUnreadCount() {
    try {
        const response = await notificationService.getSystemNotifications({ page_length: 1 })
        userStore.setUserSystemNotificationCount(response?.total ?? 0)
    } catch { }
}

async function handleNotifClick(notif: any) {
    if (getCategory(notif.type) === 'duty_shift') {
        state.isOpen = false
        navigateTo('/notifications/duty-shift-rule-notifications')
        return
    }
    if (getCategory(notif.type) === 'birthday') {
        if (!notif.read_at) {
            try {
                const response = await notificationService.markSystemNotificationAsRead(notif.id)
                if (response) {
                    const index = state.notifications.findIndex((n: any) => n.id === notif.id)
                    if (index !== -1) state.notifications[index].read_at = new Date().toISOString()
                    await refreshUnreadCount()
                }
            } catch (error: any) {
                state.error = error
            }
        }
        state.isOpen = false
        const uuid = notif.data?.content?.uuid
        if (uuid) {
            navigateTo(notif.data?.content?.person_type === 'staff'
                ? `/employees/${uuid}/view-details`
                : `/citizens/${uuid}/journals`)
        }
        return
    }
    if (!notif.read_at) {
        try {
            const response = await notificationService.markSystemNotificationAsRead(notif.id)
            if (response) {
                const index = state.notifications.findIndex((n: any) => n.id === notif.id)
                if (index !== -1) state.notifications[index].read_at = new Date().toISOString()
                await refreshUnreadCount()
            }
        } catch (error: any) {
            state.error = error
        }
    }
}

async function markAllAsRead() {
    state.isMarkingAll = true
    try {
        const response = await notificationService.markAllSystemNotificationsAsRead()
        if (response) {
            state.notifications.forEach((n: any) => { n.read_at = n.read_at ?? new Date().toISOString() })
            await refreshUnreadCount()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isMarkingAll = false
}

function togglePanel() {
    state.isOpen = !state.isOpen
    if (state.isOpen && state.notifications.length === 0) {
        fetchNotificationsByCategory()
    }
}

function handleClickOutside(e: MouseEvent) {
    if (bellRef.value && !bellRef.value.contains(e.target as Node)) {
        state.isOpen = false
    }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', handleClickOutside))
</script>
