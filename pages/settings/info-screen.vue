<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('settings.infoScreen.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('settings.infoScreen.title') }}</template>

            <LoadingSpinner :isActive="state.isLoading">
                <div class="mt-8 max-w-4xl space-y-5">
                    <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />

                    <p class="text-sm text-slate-500">{{ $t('settings.infoScreen.subtitle') }}</p>

                    <!-- App not bought: point the admin to the app store -->
                    <div v-if="!appActive"
                        class="rounded-xl border border-dashed border-surface-200 bg-surface-50 p-8 text-center">
                        <div class="mx-auto flex size-12 items-center justify-center rounded-full bg-primary-50 text-primary">
                            <Icon name="ph:lock-key" class="size-6" />
                        </div>
                        <p class="mt-3 text-sm text-slate-500">{{ $t('settings.infoScreen.notPurchased') }}</p>
                        <div class="mt-4 flex justify-center">
                            <FormButton buttonStyle="primary" @click="navigateTo('/apps')">
                                <Icon name="ph:storefront" class="h-4 w-4" />
                                {{ $t('settings.infoScreen.goToApps') }}
                            </FormButton>
                        </div>
                    </div>

                    <template v-else>
                        <!-- Seats + new screen -->
                        <div class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
                            <div>
                                <p class="text-xs uppercase tracking-wide text-slate-400">{{ $t('settings.infoScreen.seats') }}</p>
                                <p class="mt-1 font-semibold text-slate-900">
                                    {{ $t('settings.infoScreen.seatsUsed', { paired: state.seats.paired, total: state.seats.total }) }}
                                </p>
                                <p class="mt-1 text-xs text-slate-400">{{ $t('settings.infoScreen.seatsHint') }}</p>
                            </div>
                            <FormButton buttonStyle="primary" @click="newScreen">
                                <Icon name="ph:plus" class="h-4 w-4" />
                                {{ $t('settings.infoScreen.newScreen') }}
                            </FormButton>
                        </div>

                        <!-- Screens -->
                        <div v-if="state.screens.length === 0"
                            class="rounded-xl border border-dashed border-surface-200 bg-white p-8 text-center text-sm text-slate-500">
                            {{ $t('settings.infoScreen.empty') }}
                        </div>

                        <div v-for="screen in state.screens" :key="screen.uuid"
                            class="rounded-xl border bg-white p-5 shadow-sm"
                            :class="state.form?.uuid === screen.uuid ? 'border-[#2dbab2]' : 'border-surface-200'">
                            <div class="flex flex-wrap items-center justify-between gap-3">
                                <div class="flex items-center gap-3">
                                    <div class="flex size-10 items-center justify-center rounded-lg bg-primary-50 text-primary">
                                        <Icon name="ph:television-simple" class="size-5" />
                                    </div>
                                    <div>
                                        <p class="font-semibold text-slate-900">{{ screen.name }}</p>
                                        <p class="text-xs text-slate-500">
                                            {{ screen.department?.name ?? $t('settings.infoScreen.noDepartment') }}
                                        </p>
                                    </div>
                                    <span class="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                                        :class="screen.is_paired ? 'bg-[#f0faf9] text-[#1b6d8a]' : 'bg-slate-100 text-slate-500'">
                                        {{ screen.is_paired ? $t('settings.infoScreen.paired') : $t('settings.infoScreen.notPaired') }}
                                    </span>
                                    <span v-if="isOffline(screen)"
                                        class="inline-flex items-center gap-1 rounded-full border border-[#fecaca] bg-[#fef2f2] px-2.5 py-0.5 text-[11px] font-semibold text-[#dc2626]">
                                        <Icon name="ph:wifi-slash" class="h-3 w-3" /> {{ $t('settings.infoScreen.offline') }}
                                    </span>
                                    <span v-if="screen.is_paired && screen.last_seen_at" class="text-xs text-slate-400">
                                        {{ $t('settings.infoScreen.lastSeen', { time: formatTime(screen.last_seen_at) }) }}
                                    </span>
                                </div>
                                <div class="flex flex-wrap items-center gap-2">
                                    <FormButton buttonStyle="action" @click="pair(screen)">
                                        <Icon name="ph:link" class="h-4 w-4" />
                                        {{ screen.is_paired ? $t('settings.infoScreen.repair') : $t('settings.infoScreen.pair') }}
                                    </FormButton>
                                    <FormButton v-if="screen.is_paired" buttonStyle="action" @click="state.confirm = { type: 'unpair', screen }">
                                        <Icon name="ph:link-break" class="h-4 w-4" />
                                        {{ $t('settings.infoScreen.unpair') }}
                                    </FormButton>
                                    <FormButton buttonStyle="action" @click="preview(screen)">
                                        <Icon name="ph:monitor-play" class="h-4 w-4" />
                                        {{ $t('settings.infoScreen.preview') }}
                                    </FormButton>
                                    <FormButton buttonStyle="action" @click="edit(screen)">
                                        <Icon name="ph:pencil-simple" class="h-4 w-4" />
                                        {{ $t('settings.infoScreen.edit') }}
                                    </FormButton>
                                    <FormButton buttonStyle="danger" @click="state.confirm = { type: 'delete', screen }">
                                        <Icon name="ph:trash" class="h-4 w-4" />
                                    </FormButton>
                                </div>
                            </div>
                        </div>

                        <!-- Editor -->
                        <div v-if="state.form" class="rounded-xl border border-surface-200 bg-white p-5 shadow-sm space-y-6">
                            <h3 class="text-sm font-semibold text-slate-900">
                                {{ state.form.uuid ? $t('settings.infoScreen.editTitle') : $t('settings.infoScreen.newScreen') }}
                            </h3>

                            <div class="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <FormLabel for="screen-name" :label="$t('settings.infoScreen.name')" />
                                    <FormTextField id="screen-name" name="screen-name" v-model="state.form.name"
                                        :placeholder="$t('settings.infoScreen.namePlaceholder')" :maxLength="255" />
                                </div>
                                <div>
                                    <FormLabel for="screen-department" :label="$t('settings.infoScreen.department')" />
                                    <FormSelect id="screen-department" v-model="state.form.department_uuid"
                                        :options="departmentOptions" :placeholder="$t('settings.infoScreen.noDepartment')" />
                                </div>
                            </div>

                            <!-- What the screen shows -->
                            <div>
                                <p class="text-sm font-semibold text-slate-900">{{ $t('settings.infoScreen.widgets') }}</p>
                                <div class="mt-3 grid gap-3 sm:grid-cols-2">
                                    <div v-for="widget in widgets" :key="widget.key" class="flex items-start gap-3">
                                        <FormSwitch :value="state.form[widget.key]" :label="widget.label"
                                            @toggleSwitch="state.form[widget.key] = !state.form[widget.key]" />
                                        <div>
                                            <p class="text-sm text-slate-900">{{ widget.label }}</p>
                                            <p v-if="widget.hint" class="text-xs text-slate-400">{{ widget.hint }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <FormLabel for="screen-message" :label="$t('settings.infoScreen.message')" />
                                <FormTextArea name="screen-message" v-model="state.form.message" :rows="2"
                                    :placeholder="$t('settings.infoScreen.messagePlaceholder')" />
                                <div v-if="state.form.message" class="mt-2 flex flex-wrap items-center gap-2">
                                    <label for="screen-message-until" class="text-xs text-slate-500">{{ $t('settings.infoScreen.messageUntil') }}</label>
                                    <input id="screen-message-until" type="date" v-model="state.form.message_until"
                                        class="h-9 rounded-lg border border-gray-200 px-2 text-sm text-gray-900 focus:border-primary-700 focus:outline-none" />
                                    <span class="text-xs text-slate-400">{{ $t('settings.infoScreen.messageUntilHint') }}</span>
                                </div>
                            </div>

                            <!-- Night -->
                            <div v-if="state.form.night_mode" class="flex flex-wrap items-center gap-2">
                                <p class="text-sm font-semibold text-slate-900">{{ $t('settings.infoScreen.nightFrom') }}</p>
                                <input type="time" v-model="state.form.night_from" :aria-label="$t('settings.infoScreen.nightFrom')"
                                    class="h-9 rounded-lg border border-gray-200 px-2 text-sm text-gray-900 focus:border-primary-700 focus:outline-none" />
                                <p class="text-sm text-slate-900">{{ $t('settings.infoScreen.nightTo') }}</p>
                                <input type="time" v-model="state.form.night_to" :aria-label="$t('settings.infoScreen.nightTo')"
                                    class="h-9 rounded-lg border border-gray-200 px-2 text-sm text-gray-900 focus:border-primary-700 focus:outline-none" />
                            </div>

                            <!-- Program -->
                            <div v-if="state.form.show_activities">
                                <p class="text-sm font-semibold text-slate-900">{{ $t('settings.infoScreen.activities') }}</p>
                                <p class="text-xs text-slate-400">{{ $t('settings.infoScreen.activitiesHint') }}</p>
                                <div class="mt-3 space-y-2">
                                    <div v-for="(row, index) in state.form.activities" :key="index"
                                        class="grid grid-cols-[9rem_6rem_10rem_1fr_auto] items-center gap-2">
                                        <FormSelect v-model="row.weekday" :options="weekdayOptions" :canClear="false" :canDeselect="false" />
                                        <input type="time" v-model="row.time"
                                            class="h-11 rounded-lg border border-gray-200 px-2 text-sm text-gray-900 focus:border-primary-700 focus:outline-none" />
                                        <div class="flex items-center gap-1.5">
                                            <Icon :name="activityIcon(row.icon) ?? 'ph:image-square'" class="h-5 w-5 shrink-0"
                                                :class="row.icon ? 'text-[#0f4c75]' : 'text-slate-300'" />
                                            <FormSelect v-model="row.icon" :options="iconOptions" :placeholder="$t('settings.infoScreen.pictogram')" />
                                        </div>
                                        <FormTextField v-model="row.title" :maxLength="120"
                                            :placeholder="$t('settings.infoScreen.activityPlaceholder')" />
                                        <button type="button" class="p-2 text-slate-400 hover:text-[#dc2626]"
                                            :aria-label="$t('settings.infoScreen.remove')"
                                            @click="state.form.activities.splice(index, 1)">
                                            <Icon name="ph:x" class="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <button type="button" class="mt-2 text-sm font-semibold text-primary hover:underline" @click="addActivity">
                                    + {{ $t('settings.infoScreen.addActivity') }}
                                </button>
                            </div>

                            <!-- Menu -->
                            <div v-if="state.form.show_menu">
                                <p class="text-sm font-semibold text-slate-900">{{ $t('settings.infoScreen.menu') }}</p>
                                <div class="mt-3 grid gap-3 sm:grid-cols-2">
                                    <div v-for="day in weekdayOptions" :key="day.value">
                                        <FormLabel :label="day.label" />
                                        <FormTextField v-model="state.form.menu[day.value]" :maxLength="500"
                                            :placeholder="$t('settings.infoScreen.menuPlaceholder')" />
                                    </div>
                                </div>
                            </div>

                            <!-- Pictures -->
                            <div v-if="state.form.show_slides">
                                <div class="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <p class="text-sm font-semibold text-slate-900">{{ $t('settings.infoScreen.slides') }}</p>
                                        <p class="text-xs text-slate-400">{{ $t('settings.infoScreen.slidesHint') }}</p>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <FormLabel for="slide-seconds" :label="$t('settings.infoScreen.slideSeconds')" />
                                        <input id="slide-seconds" type="number" min="3" max="120" v-model.number="state.form.slide_seconds"
                                            class="h-9 w-20 rounded-lg border border-gray-200 px-2 text-sm" />
                                    </div>
                                </div>
                                <p v-if="!state.form.uuid" class="mt-3 text-xs text-slate-500">{{ $t('settings.infoScreen.saveFirst') }}</p>
                                <div v-else class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    <div v-for="slide in state.form.slides" :key="slide.uuid" class="group relative overflow-hidden rounded-lg border border-surface-200">
                                        <img :src="slide.url" :alt="slide.name" class="aspect-video w-full object-cover" />
                                        <button type="button" @click="removeSlide(slide)"
                                            class="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-[#dc2626] shadow"
                                            :aria-label="$t('settings.infoScreen.remove')">
                                            <Icon name="ph:trash" class="h-4 w-4" />
                                        </button>
                                    </div>
                                    <label class="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-surface-200 text-xs text-slate-500 hover:bg-surface-50">
                                        <Icon name="ph:image" class="mb-1 h-5 w-5" />
                                        {{ state.uploading ? $t('settings.infoScreen.uploading') : $t('settings.infoScreen.addSlide') }}
                                        <input type="file" accept="image/jpeg,image/png,image/webp" multiple class="hidden"
                                            :disabled="state.uploading" @change="uploadSlides" />
                                    </label>
                                </div>
                            </div>

                            <!-- Weather -->
                            <div v-if="state.form.show_weather">
                                <p class="text-sm font-semibold text-slate-900">{{ $t('settings.infoScreen.weatherPlace') }}</p>
                                <p class="text-xs text-slate-400">{{ $t('settings.infoScreen.weatherPlaceHint') }}</p>
                                <div class="mt-3">
                                    <FormAddressAutocomplete id="weather-place" name="weather-place"
                                        :modelValue="state.form.weather_place ?? ''"
                                        :coords="state.form.weather_latitude !== null ? { lat: state.form.weather_latitude, lng: state.form.weather_longitude } : null"
                                        :showConfirmation="true"
                                        @update:modelValue="(value: string) => state.form.weather_place = value"
                                        @select="(place: any) => { state.form.weather_latitude = place.lat; state.form.weather_longitude = place.lng }"
                                        @clear="state.form.weather_latitude = null; state.form.weather_longitude = null" />
                                </div>
                            </div>

                            <!-- Poll -->
                            <div v-if="state.form.show_poll">
                                <p class="text-sm font-semibold text-slate-900">{{ $t('settings.infoScreen.poll') }}</p>
                                <p class="text-xs text-slate-400">{{ $t('settings.infoScreen.pollHint') }}</p>
                                <div class="mt-3 space-y-2">
                                    <FormTextField v-model="state.form.poll_question" :maxLength="200"
                                        :placeholder="$t('settings.infoScreen.pollQuestionPlaceholder')" />
                                    <div v-for="(option, index) in state.form.poll_options" :key="index" class="flex items-center gap-2">
                                        <FormTextField v-model="state.form.poll_options[index]" :maxLength="80"
                                            :placeholder="$t('settings.infoScreen.pollOptionPlaceholder', { number: index + 1 })" />
                                        <button type="button" class="p-2 text-slate-400 hover:text-[#dc2626]" :aria-label="$t('settings.infoScreen.remove')"
                                            @click="state.form.poll_options.splice(index, 1)">
                                            <Icon name="ph:x" class="h-4 w-4" />
                                        </button>
                                    </div>
                                    <button v-if="state.form.poll_options.length < MAX_POLL_OPTIONS" type="button"
                                        class="text-sm font-semibold text-primary hover:underline" @click="state.form.poll_options.push('')">
                                        + {{ $t('settings.infoScreen.pollAddOption') }}
                                    </button>
                                </div>
                                <div v-if="state.form.uuid && state.form.poll_token" class="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-surface-50 p-3 text-xs text-slate-500">
                                    <Icon name="ph:qr-code" class="h-4 w-4" />
                                    <span>{{ $t('settings.infoScreen.pollLink') }}</span>
                                    <a :href="voteUrl(state.form.poll_token)" target="_blank" rel="noopener" class="font-semibold text-primary hover:underline">
                                        {{ voteUrl(state.form.poll_token) }}
                                    </a>
                                    <button type="button" class="ml-auto font-semibold text-primary hover:underline" @click="resetPoll">
                                        {{ $t('settings.infoScreen.pollReset') }}
                                    </button>
                                </div>
                            </div>

                            <div class="flex justify-end gap-2 border-t border-surface-100 pt-4">
                                <FormButton buttonStyle="action" @click="state.form = null">{{ $t('settings.infoScreen.cancel') }}</FormButton>
                                <FormButton buttonStyle="primary" :disabled="!state.form.name || state.isSaving" @click="save">
                                    {{ $t('settings.infoScreen.save') }}
                                </FormButton>
                            </div>
                        </div>
                    </template>
                </div>
            </LoadingSpinner>

            <!-- Pairing code -->
            <Modal size="sm" :show="!!state.pairing" :title="$t('settings.infoScreen.pairTitle')" @close="state.pairing = null">
                <template #modal-body>
                    <div v-if="state.pairing" class="space-y-4 pb-6 text-center">
                        <p class="text-sm text-slate-600">{{ $t('settings.infoScreen.pairStep1') }}</p>
                        <code class="block rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-base font-semibold text-slate-900">{{ displayUrl }}</code>
                        <p class="text-sm text-slate-600">{{ $t('settings.infoScreen.pairStep2') }}</p>
                        <p class="text-5xl font-light tracking-[0.3em] text-[#0f4c75]">{{ state.pairing.code }}</p>
                        <p class="text-xs text-slate-400">{{ $t('settings.infoScreen.pairExpires', { time: formatClock(state.pairing.expires_at) }) }}</p>
                    </div>
                </template>
            </Modal>

            <DialogConfirmation :isModalOpen="!!state.confirm"
                :message="state.confirm?.type === 'delete' ? $t('settings.infoScreen.confirmDelete') : $t('settings.infoScreen.confirmUnpair')"
                @close="state.confirm = null" @confirm="confirmAction" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { infoScreenService } from '@/components/api/user/InfoScreenService'
import { departmentService } from '@/components/api/user/DepartmentService'
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import { ACTIVITY_ICONS, activityIcon, isOffline } from '@/composables/infoScreen'

/**
 * The Info Screen app: screens in common rooms. An admin sets up what each
 * screen shows and pairs a TV with a short code; the TV opens /screen.
 */
const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()

const breadcrumbLinks = [
    { name: 'settings.infoScreen.title', translate: true, href: '/settings/info-screen' },
]

const appActive = computed(() => !!userStore.getUser?.company?.info_screen_enabled)

const displayUrl = computed(() => (import.meta.client ? window.location.origin : '') + '/screen')

const state = reactive({
    error: {} as any,
    isLoading: false,
    isSaving: false,
    uploading: false,
    screens: [] as any[],
    seats: { total: 0, paired: 0 },
    departments: [] as any[],
    form: null as any,
    pairing: null as null | { code: string; expires_at: string },
    confirm: null as null | { type: 'delete' | 'unpair'; screen: any },
})

const departmentOptions = computed(() => state.departments.map((department: any) => ({ value: department.uuid, label: department.name })))

// ISO weekdays, Monday first.
const weekdayOptions = computed(() => [1, 2, 3, 4, 5, 6, 7].map((day) => ({
    value: day,
    label: t(`settings.infoScreen.weekdays.${day}`),
})))

const widgets = computed(() => [
    { key: 'show_clock', label: t('settings.infoScreen.showClock') },
    { key: 'show_activities', label: t('settings.infoScreen.showActivities') },
    { key: 'show_menu', label: t('settings.infoScreen.showMenu') },
    { key: 'show_news', label: t('settings.infoScreen.showNews'), hint: t('settings.infoScreen.showNewsHint') },
    { key: 'show_slides', label: t('settings.infoScreen.showSlides') },
    { key: 'show_staff_on_duty', label: t('settings.infoScreen.showStaff'), hint: t('settings.infoScreen.showStaffHint') },
    { key: 'show_timeline', label: t('settings.infoScreen.showTimeline'), hint: t('settings.infoScreen.showTimelineHint') },
    { key: 'show_weather', label: t('settings.infoScreen.showWeather'), hint: t('settings.infoScreen.showWeatherHint') },
    { key: 'show_poll', label: t('settings.infoScreen.showPoll'), hint: t('settings.infoScreen.showPollHint') },
    { key: 'night_mode', label: t('settings.infoScreen.nightMode'), hint: t('settings.infoScreen.nightModeHint') },
    { key: 'large_text', label: t('settings.infoScreen.largeText'), hint: t('settings.infoScreen.largeTextHint') },
])

const iconOptions = computed(() => Object.keys(ACTIVITY_ICONS).map((key) => ({
    value: key,
    label: t(`settings.infoScreen.pictograms.${key}`),
})))

function preview(screen: any) {
    window.open(`/screen?preview=${screen.uuid}`, '_blank', 'noopener')
}

const MAX_POLL_OPTIONS = 6

function voteUrl(pollToken: string): string {
    return (import.meta.client ? window.location.origin : '') + `/screen-vote/${pollToken}`
}

onMounted(async () => {
    if (!appActive.value) return
    state.isLoading = true
    await Promise.all([fetchScreens(), fetchDepartments()])
    state.isLoading = false
})

async function fetchScreens() {
    try {
        const response = await infoScreenService.getScreens()
        state.screens = response?.data ?? []
        state.seats = response?.meta?.seats ?? state.seats
    } catch (error: any) {
        state.error = error
    }
}

async function fetchDepartments() {
    try {
        const response = await departmentService.getAllDepartments({})
        state.departments = (response?.data ?? []).filter((department: any) => department.uuid !== 'all-departments')
    } catch (error: any) {
        state.error = error
    }
}

function toForm(screen: any = null) {
    const menu: Record<number, string> = {}
    for (let day = 1; day <= 7; day++) {
        menu[day] = screen?.menu?.[day] ?? screen?.menu?.[String(day)] ?? ''
    }

    return {
        uuid: screen?.uuid ?? null,
        name: screen?.name ?? '',
        department_uuid: screen?.department?.uuid ?? null,
        show_clock: screen?.show_clock ?? true,
        show_activities: screen?.show_activities ?? true,
        show_menu: screen?.show_menu ?? true,
        show_news: screen?.show_news ?? true,
        show_slides: screen?.show_slides ?? true,
        show_staff_on_duty: screen?.show_staff_on_duty ?? false,
        message: screen?.message ?? '',
        message_until: screen?.message_until ?? '',
        night_mode: screen?.night_mode ?? false,
        night_from: screen?.night_from ?? '22:00',
        night_to: screen?.night_to ?? '06:00',
        large_text: screen?.large_text ?? false,
        menu,
        activities: (screen?.activities ?? []).map((row: any) => ({ ...row })),
        slide_seconds: screen?.slide_seconds ?? 10,
        slides: screen?.slides ?? [],
        show_timeline: screen?.show_timeline ?? false,
        show_weather: screen?.show_weather ?? false,
        weather_place: screen?.weather_place ?? '',
        weather_latitude: screen?.weather_latitude ?? null,
        weather_longitude: screen?.weather_longitude ?? null,
        show_poll: screen?.show_poll ?? false,
        poll_question: screen?.poll_question ?? '',
        poll_options: screen?.poll_options?.length ? [...screen.poll_options] : ['', ''],
        poll_token: screen?.poll_token ?? null,
    }
}

function newScreen() {
    state.form = toForm()
}

function edit(screen: any) {
    state.form = toForm(screen)
}

function addActivity() {
    const last = state.form.activities[state.form.activities.length - 1]
    state.form.activities.push({ weekday: last?.weekday ?? 1, time: '', title: '' })
}

async function save() {
    state.error = {}
    state.isSaving = true
    const { uuid, slides: _slides, poll_token: _pollToken, ...form } = state.form
    const payload = {
        ...form,
        message: form.message || null,
        message_until: (form.message && form.message_until) || null,
        weather_place: form.weather_place || null,
        poll_question: form.poll_question || null,
        poll_options: form.poll_options.map((option: string) => option.trim()).filter(Boolean),
        activities: form.activities
            .filter((row: any) => row.title?.trim())
            .map((row: any) => ({ weekday: row.weekday, time: row.time || null, title: row.title.trim(), icon: row.icon || null })),
    }

    try {
        const response = uuid
            ? await infoScreenService.updateScreen(uuid, payload)
            : await infoScreenService.createScreen(payload)
        await fetchScreens()
        state.form = toForm(response?.data)
        successAlert(`${t('alert.success')}!`, t('settings.infoScreen.saved'))
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}

async function resetPoll() {
    state.error = {}
    try {
        await infoScreenService.resetPoll(state.form.uuid)
        successAlert(`${t('alert.success')}!`, t('settings.infoScreen.pollResetDone'))
    } catch (error: any) {
        state.error = error
    }
}

async function pair(screen: any) {
    state.error = {}
    try {
        const response = await infoScreenService.createPairingCode(screen.uuid)
        state.pairing = { code: response?.data?.pairing_code, expires_at: response?.data?.expires_at }
    } catch (error: any) {
        state.error = error
    }
}

async function confirmAction() {
    const confirm = state.confirm
    state.confirm = null
    if (!confirm) return
    state.error = {}
    try {
        if (confirm.type === 'delete') {
            await infoScreenService.deleteScreen(confirm.screen.uuid)
            if (state.form?.uuid === confirm.screen.uuid) state.form = null
        } else {
            await infoScreenService.unpair(confirm.screen.uuid)
        }
        await fetchScreens()
    } catch (error: any) {
        state.error = error
    }
}

async function uploadSlides(event: Event) {
    const input = event.target as HTMLInputElement
    const files = Array.from(input.files ?? [])
    if (!files.length || !state.form?.uuid) return
    state.error = {}
    state.uploading = true
    try {
        let response: any = null
        for (const file of files) {
            response = await infoScreenService.uploadSlide(state.form.uuid, file)
        }
        state.form.slides = response?.data?.slides ?? state.form.slides
        await fetchScreens()
    } catch (error: any) {
        state.error = error
    }
    input.value = ''
    state.uploading = false
}

async function removeSlide(slide: any) {
    state.error = {}
    try {
        const response = await infoScreenService.deleteSlide(state.form.uuid, slide.uuid)
        state.form.slides = response?.data?.slides ?? state.form.slides.filter((s: any) => s.uuid !== slide.uuid)
        await fetchScreens()
    } catch (error: any) {
        state.error = error
    }
}

function formatTime(value: string): string {
    return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function formatClock(value: string): string {
    return new Date(value).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}
</script>
