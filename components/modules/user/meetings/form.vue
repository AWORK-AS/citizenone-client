<template>
    <form class="space-y-6" @submit.prevent="submit">
        <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="space-y-1 md:col-span-2">
                <FormLabel for="meeting-title" :label="$t('meetings.form.title')" />
                <FormTextField id="meeting-title" name="title" v-model="state.form.title"
                    :placeholder="$t('meetings.form.titlePlaceholder')" />
                <p class="text-xs text-gray-500">{{ $t('meetings.form.titleHint') }}</p>
                <FormError :error="state.error?.errors?.title?.[0]" />
            </div>

            <div class="space-y-1">
                <FormLabel for="meeting-starts" :label="$t('meetings.form.startsAt')" />
                <FormDateTimeField id="meeting-starts" name="starts_at" v-model="state.form.starts_at"
                    :placeholder="$t('meetings.form.startsAt')" />
                <FormError :error="state.error?.errors?.starts_at?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="meeting-ends" :label="$t('meetings.form.endsAt')" />
                <FormDateTimeField id="meeting-ends" name="ends_at" v-model="state.form.ends_at"
                    :placeholder="$t('meetings.form.endsAt')" />
                <FormError :error="state.timeError || state.error?.errors?.ends_at?.[0]" />
            </div>

            <div class="space-y-1 md:col-span-2" v-if="!isEdit">
                <FormLabel for="meeting-description" :label="$t('meetings.form.description')" />
                <FormTextArea id="meeting-description" name="description" v-model="state.form.description"
                    :placeholder="$t('meetings.form.description')" />
            </div>

            <div class="md:col-span-2 flex items-center gap-3">
                <FormSwitch :value="state.form.waiting_room" :label="$t('meetings.form.waitingRoom')"
                    @toggleSwitch="state.form.waiting_room = !state.form.waiting_room" />
                <span class="text-sm">{{ $t('meetings.form.waitingRoom') }}</span>
            </div>
        </div>

        <template v-if="!isEdit">
            <div class="space-y-1">
                <FormLabel for="meeting-citizen" :label="$t('meetings.form.citizen')" />
                <FormSelect id="meeting-citizen" name="citizen" v-model="state.form.citizen_uuid"
                    :options="state.options.citizens" :placeholder="$t('meetings.form.citizen')" />
                <p class="text-xs text-gray-500">{{ $t('meetings.form.citizenHint') }}</p>
                <label v-if="state.form.citizen_uuid" class="flex items-center gap-2 text-sm mt-2">
                    <input type="checkbox" v-model="state.inviteCitizen" />
                    {{ $t('meetings.form.inviteCitizen') }}
                </label>
            </div>

            <div class="space-y-1">
                <FormLabel for="meeting-colleagues" :label="$t('meetings.form.colleagues')" />
                <FormSelectMultiple id="meeting-colleagues" v-model="state.colleagues" :options="state.options.users" />
            </div>

            <div class="space-y-2">
                <FormLabel :label="$t('meetings.form.guests')" />
                <div v-for="(guest, index) in state.guests" :key="index" class="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
                    <FormTextField :name="`guest-name-${index}`" v-model="guest.name" :placeholder="$t('meetings.form.guestName')" />
                    <FormTextField :name="`guest-email-${index}`" v-model="guest.email" :placeholder="$t('meetings.form.guestEmail')" />
                    <button type="button" class="px-2 text-gray-500 hover:text-red-600" :title="$t('meetings.detail.remove')"
                        @click="state.guests.splice(index, 1)">
                        <Icon name="ph:x" class="h-5 w-5" />
                    </button>
                </div>
                <FormButton type="button" buttonStyle="secondary" @click="state.guests.push({ name: '', email: '' })">
                    <Icon name="ph:plus" class="h-4 w-4 mr-1" /> {{ $t('meetings.form.addGuest') }}
                </FormButton>
            </div>

            <label class="flex items-center gap-2 text-sm">
                <input type="checkbox" v-model="state.form.send_invites" />
                {{ $t('meetings.form.sendInvites') }}
            </label>
        </template>

        <div class="flex justify-end">
            <FormButton type="submit" buttonStyle="primary" :disabled="state.isSaving">
                {{ isEdit ? $t('meetings.form.save') : $t('meetings.form.create') }}
            </FormButton>
        </div>
    </form>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useI18n } from 'vue-i18n'
import { meetingService } from '@/components/api/user/MeetingService'
import { citizenService } from '@/components/api/user/CitizenService'
import { userService } from '@/components/api/user/UserService'
import { useDepartmentStore } from '@/store/department'
import { useUserStore } from '@/store/user'

/**
 * Plan a meeting, or (with `meeting`) change its title, time and waiting
 * room. Participants are added on the meeting page once it exists.
 */
const props = defineProps<{ meeting?: any }>()
const emit = defineEmits(['saved'])
const { t } = useI18n()
const departmentStore = useDepartmentStore() as any
const userStore = useUserStore() as any

const isEdit = computed(() => !!props.meeting)

const nextQuarter = moment().add(1, 'hour').startOf('hour')

const state = reactive({
    form: {
        title: props.meeting?.title ?? '',
        description: props.meeting?.description ?? '',
        starts_at: props.meeting ? moment(props.meeting.starts_at).format('YYYY-MM-DD HH:mm') : nextQuarter.format('YYYY-MM-DD HH:mm'),
        ends_at: props.meeting ? moment(props.meeting.ends_at).format('YYYY-MM-DD HH:mm') : nextQuarter.clone().add(1, 'hour').format('YYYY-MM-DD HH:mm'),
        waiting_room: props.meeting?.waiting_room ?? true,
        citizen_uuid: '' as string,
        send_invites: true,
    },
    inviteCitizen: false,
    colleagues: [] as string[],
    guests: [] as { name: string, email: string }[],
    options: { citizens: [] as any[], users: [] as any[] },
    error: {} as any,
    timeError: '',
    isSaving: false,
})

onMounted(() => {
    if (!isEdit.value) {
        loadCitizens()
        loadUsers()
    }
})

async function loadCitizens() {
    try {
        const response = await citizenService.getAllCitizens({ department: departmentStore.getSelectedDepartmentName })
        state.options.citizens = (response?.data ?? []).map((citizen: any) => ({
            value: citizen.uuid,
            label: `${citizen.firstname} ${citizen.lastname ?? ''}`.trim(),
        }))
    } catch (error: any) {
        state.error = error
    }
}

async function loadUsers() {
    try {
        const response = await userService.getAllUsers({ department: departmentStore.getSelectedDepartmentName })
        const me = userStore.getUser?.uuid
        state.options.users = (response?.data ?? [])
            .filter((user: any) => user.uuid !== me)
            .map((user: any) => ({ value: user.uuid, label: `${user.firstname} ${user.lastname ?? ''}`.trim() }))
    } catch (error: any) {
        state.error = error
    }
}

// The pickers give local time; the API gets it with the browser's offset so
// it lands on the same wall-clock time whatever the server's timezone.
function toIso(value: string) {
    return moment(value, 'YYYY-MM-DD HH:mm').format()
}

async function submit() {
    state.error = {}
    state.timeError = ''

    if (!moment(state.form.ends_at).isAfter(moment(state.form.starts_at))) {
        state.timeError = t('meetings.form.endBeforeStart')
        return
    }

    const payload: any = {
        title: state.form.title,
        starts_at: toIso(state.form.starts_at),
        ends_at: toIso(state.form.ends_at),
        waiting_room: state.form.waiting_room,
    }

    state.isSaving = true
    try {
        if (isEdit.value) {
            const response = await meetingService.update(props.meeting.uuid, payload)
            emit('saved', response?.data)
        } else {
            payload.description = state.form.description || null
            payload.citizen_uuid = state.form.citizen_uuid || null
            payload.send_invites = state.form.send_invites
            payload.participants = [
                ...state.colleagues.map((uuid) => ({ type: 'user', uuid })),
                ...(state.inviteCitizen && state.form.citizen_uuid ? [{ type: 'citizen', uuid: state.form.citizen_uuid }] : []),
                ...state.guests
                    .filter((guest) => guest.name.trim())
                    .map((guest) => ({ type: 'guest', name: guest.name.trim(), email: guest.email.trim() || null })),
            ]
            const response = await meetingService.create(payload)
            emit('saved', response?.data)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}
</script>
