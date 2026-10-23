<template>
    <div>
        <Modal size="md" :title="$t('inactiveEmployees.title')" :show="open" @close="close">
            <template #modal-body>
                <div class="space-y-4">
                    <p class="text-sm text-gray-800" role="status">{{ message }}</p>
                    <p class="text-sm text-gray-500">{{ $t('inactiveEmployees.licenseNote') }}</p>

                    <ul class="divide-y divide-gray-100 rounded-lg border border-gray-200">
                        <li v-for="employee in employees" :key="employee.uuid" class="space-y-2 p-3">
                            <div class="min-w-0">
                                <p class="truncate text-sm font-semibold text-gray-900">{{ employee.name }}</p>
                                <p class="text-xs text-gray-500">
                                    <template v-if="employee.role">{{ employee.role }} &middot; </template>
                                    <template v-if="employee.never_logged_in || !employee.last_seen_at">
                                        {{ $t('inactiveEmployees.neverLoggedIn') }}
                                    </template>
                                    <template v-else>
                                        {{ $t('inactiveEmployees.lastActive', { when: relative(employee.last_seen_at) }) }}
                                    </template>
                                </p>
                            </div>
                            <div class="flex flex-wrap items-center gap-2">
                                <FormButton buttonStyle="danger" buttonSize="xs" :disabled="isBusy(employee.uuid)"
                                    @click="askArchive(employee)">
                                    <Icon name="ph:archive" class="size-4" aria-hidden="true" />
                                    {{ $t('inactiveEmployees.archive') }}
                                </FormButton>
                                <FormButton buttonStyle="action" buttonSize="xs" :disabled="isBusy(employee.uuid)"
                                    @click="keepActive(employee)">
                                    <Icon name="ph:check-circle" class="size-4" aria-hidden="true" />
                                    {{ $t('inactiveEmployees.keepActive') }}
                                </FormButton>
                                <FormButton buttonStyle="cancel" buttonSize="xs" :disabled="isBusy(employee.uuid)"
                                    @click="viewEmployee(employee)">
                                    <Icon name="ph:eye" class="size-4" aria-hidden="true" />
                                    {{ $t('inactiveEmployees.viewEmployee') }}
                                </FormButton>
                            </div>
                        </li>
                    </ul>

                    <div class="flex flex-wrap items-center justify-end gap-2 pt-2">
                        <FormButton buttonStyle="cancel" :disabled="snoozing" @click="remindLater">
                            {{ $t('inactiveEmployees.remindLater') }}
                        </FormButton>
                        <FormButton buttonStyle="primary" @click="close">
                            {{ $t('inactiveEmployees.close') }}
                        </FormButton>
                    </div>
                </div>
            </template>
        </Modal>

        <DialogConfirmation :isModalOpen="isArchiveOpen"
            :message="$t('inactiveEmployees.archiveConfirm', { name: pending?.name ?? '' })"
            @close="isArchiveOpen = false" @confirm="archive" />
    </div>
</template>

<script setup lang="ts">
// "These employees have been inactive for 3 months": an admin-only pop-up that points out
// people who keep a paid license without using CitizenOne.
//
// The backend decides who sees it and when (admins only, hidden for 7 days after "Remind me
// later", per employee for 3 months after "Keep active"). This component only asks, at most
// once a day per browser, and acts on the buttons. "Close" hides it until tomorrow, which is
// simply that once-a-day check: nothing is stored on the server for it.
import { inactiveEmployeeService, type InactiveEmployee } from '@/components/api/user/InactiveEmployeeService'
import { employeeService } from '@/components/api/user/EmployeeService'
import { formatLongDate, formatRelativeFromNow, hasHandledToday, markHandledToday } from '@/composables/inactiveEmployees'
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'

/** Not the moment somebody logs in: let the screen settle (and other pop-ups go first). */
const DELAY_MS = 3000
/** Below this the app is used as a phone: no pop-up there. */
const MIN_WIDTH_PX = 768

// `held`: another prompt (the feedback survey) is showing. This one then waits and opens once that
// one is closed, instead of appearing on top of it.
const props = defineProps({
    held: { type: Boolean, default: false },
})
const emit = defineEmits<{ (e: 'visibilityChange', visible: boolean): void }>()

const { t, locale } = useI18n()
const { successAlert, errorAlert } = useAlert()
const userStore = useUserStore() as any

/** The server said there is something to show. `open` is that, once nothing else is showing. */
const ready = ref(false)
const open = computed(() => ready.value && !props.held)
const employees = ref<InactiveEmployee[]>([])
const busy = ref<string[]>([])
const snoozing = ref(false)
const isArchiveOpen = ref(false)
const pending = ref<InactiveEmployee | null>(null)

const impersonating = typeof localStorage !== 'undefined' && !!safeGet('_original_token')

let timer: ReturnType<typeof setTimeout> | null = null
let userId: string | null = null

function safeGet(key: string): string | null {
    try {
        return localStorage.getItem(key)
    } catch (e) {
        return null
    }
}

const message = computed(() => {
    if (employees.value.length === 1) {
        const only = employees.value[0]
        if (only.never_logged_in || !only.last_seen_at) {
            return t('inactiveEmployees.messageSingleNever', { name: only.name })
        }
        return t('inactiveEmployees.messageSingle', { name: only.name, date: formatLongDate(only.last_seen_at, locale.value) })
    }
    return t('inactiveEmployees.messageMany', { count: employees.value.length })
})

function relative(iso: string): string {
    return formatRelativeFromNow(iso, locale.value)
}

function isBusy(uuid: string): boolean {
    return busy.value.includes(uuid)
}

watch(open, (value) => emit('visibilityChange', value), { immediate: true })

let stopWaitingForUser: (() => void) | null = null

onMounted(() => {
    if (impersonating) return
    if (typeof window !== 'undefined' && window.innerWidth < MIN_WIDTH_PX) return

    // "Checked today" is remembered per user, so the check waits until the user has loaded: a check
    // made before that would be stored for nobody and asked again on the next page load.
    stopWaitingForUser = watch(() => userStore.getUser?.uuid, (uuid: string | undefined) => {
        if (!uuid || timer) return
        userId = uuid
        timer = setTimeout(check, DELAY_MS)
        stopWaitingForUser?.()
    }, { immediate: true })
})

onBeforeUnmount(() => {
    if (timer) clearTimeout(timer)
    stopWaitingForUser?.()
})

async function check(): Promise<void> {
    if (!userId || hasHandledToday(userId)) return

    try {
        const res = await inactiveEmployeeService.getPrompt()
        const list = res?.data?.employees ?? []
        if (res?.data?.show === true && list.length > 0) {
            employees.value = list
            ready.value = true
            return
        }
        markHandledToday(userId)
    } catch (e: any) {
        // 403: not an admin, so there is never anything to show. Anything else (an older
        // backend, a network error): show nothing and ask again later.
        if (e?.status === 403) markHandledToday(userId)
    }
}

/** Any way of closing counts as "Close": not asked again today. */
function close(): void {
    ready.value = false
    markHandledToday(userId)
}

async function remindLater(): Promise<void> {
    snoozing.value = true
    try {
        await inactiveEmployeeService.snooze()
    } catch (e: any) {
        errorAlert(t('alert.error'), e?.message)
    }
    snoozing.value = false
    close()
}

/** Takes a row off the list, and closes the pop-up when it was the last one. */
function removeRow(uuid: string): void {
    employees.value = employees.value.filter(e => e.uuid !== uuid)
    if (employees.value.length === 0) close()
}

function askArchive(employee: InactiveEmployee): void {
    pending.value = employee
    isArchiveOpen.value = true
}

async function archive(): Promise<void> {
    const employee = pending.value
    if (!employee) return

    busy.value.push(employee.uuid)
    try {
        await employeeService.archiveEmployee(employee.uuid, true)
        successAlert(`${t('alert.success')}!`, t('inactiveEmployees.licenseFreed'))
        removeRow(employee.uuid)
    } catch (e: any) {
        errorAlert(t('alert.error'), e?.message)
    }
    busy.value = busy.value.filter(uuid => uuid !== employee.uuid)
}

async function keepActive(employee: InactiveEmployee): Promise<void> {
    busy.value.push(employee.uuid)
    try {
        await inactiveEmployeeService.dismiss(employee.uuid)
        removeRow(employee.uuid)
    } catch (e: any) {
        errorAlert(t('alert.error'), e?.message)
    }
    busy.value = busy.value.filter(uuid => uuid !== employee.uuid)
}

function viewEmployee(employee: InactiveEmployee): void {
    close()
    navigateTo(`/employees/${employee.uuid}/view-details`)
}
</script>
