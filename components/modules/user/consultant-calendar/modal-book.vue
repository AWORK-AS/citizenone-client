<template>
    <Modal size="xs" :title="$t('consultantCalendar.bookTitle')" :show="props.isModalOpen" @close="closeModal">
        <template #modal-body>
            <LoadingSpinner :isActive="state.isSaving">
                <form class="grid grid-cols-1 gap-y-3" @submit.prevent="submit">
                    <Alert type="danger" :text="state.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <div class="space-y-1">
                        <FormLabel for="consultant_uuid" :label="$t('consultantCalendar.form.consultant')" />
                        <FormSelect id="consultant_uuid" :options="props.consultantOptions" :canClear="false"
                            v-model="state.form.consultant_uuid" />
                        <FormError :error="state.error?.errors?.consultant_uuid?.[0]" />
                    </div>

                    <!-- A citizen appointment, or work without a citizen that counts as working time. -->
                    <div class="space-y-1">
                        <FormLabel for="kind" :label="$t('consultantCalendar.form.type')" />
                        <FormSelect id="kind" :options="kindOptions" :canClear="false" :canDeselect="false"
                            v-model="state.form.kind" />
                    </div>

                    <div class="space-y-1" v-if="state.form.kind === 'citizen'">
                        <FormLabel for="citizen_uuid" :label="$t('consultantCalendar.form.citizen')" />
                        <FormSelect id="citizen_uuid" :options="state.citizenOptions" searchable
                            v-model="state.form.citizen_uuid" />
                        <FormError :error="state.error?.errors?.citizen_uuid?.[0]" />
                    </div>

                    <div class="space-y-1">
                        <FormLabel for="title" :label="$t('events.form.title')" />
                        <FormTextField id="title" name="title" :placeholder="$t('events.form.title')"
                            v-model="state.form.title" />
                        <FormError :error="state.error?.errors?.title?.[0]" />
                    </div>

                    <div class="space-y-1">
                        <FormLabel for="date_time_start" :label="$t('events.form.datetimeStart')" />
                        <FormDateTimeField id="date_time_start" name="date_time_start"
                            :placeholder="$t('events.form.datetimeStart')" v-model="state.form.date_time_start" />
                        <FormError :error="state.error?.errors?.date_time_start?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="date_time_end" :label="$t('events.form.dateTimeEnd')" />
                        <FormDateTimeField id="date_time_end" name="date_time_end"
                            :placeholder="$t('events.form.dateTimeEnd')" v-model="state.form.date_time_end" />
                        <FormError :error="state.error?.errors?.date_time_end?.[0]" />
                    </div>

                    <div class="space-y-1">
                        <FormLabel for="description" :label="$t('events.form.description')" />
                        <FormTextArea id="description" name="description" :placeholder="$t('events.form.description')"
                            v-model="state.form.description" />
                    </div>

                    <p v-if="state.form.kind !== 'citizen'" class="text-xs text-gray-500">
                        {{ $t('consultantCalendar.form.workTimeHint') }}
                    </p>

                    <div class="mt-2 flex justify-end gap-x-2">
                        <FormButton type="button" buttonStyle="cancel" @click="closeModal">{{ $t('cancel') }}</FormButton>
                        <FormButton type="submit" buttonStyle="primary" :disabled="state.isSaving">
                            {{ $t('consultantCalendar.book') }}
                        </FormButton>
                    </div>
                </form>
            </LoadingSpinner>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import moment from 'moment'
import { consultantCalendarService } from '@/components/api/user/ConsultantCalendarService'
import { citizenService } from '@/components/api/user/CitizenService'
import { useAlert } from '@/composables/alert'
import { useDepartmentStore } from '@/store/department'
import { useI18n } from 'vue-i18n'

const props = defineProps({
    isModalOpen: { type: Boolean, required: true },
    consultantOptions: { type: Array as any, default: () => [] },
    defaultConsultant: { type: String, default: '' },
})
const emit = defineEmits(['close', 'booked'])

const { t } = useI18n()
const { successAlert } = useAlert()
const departmentStore = useDepartmentStore()

const kindOptions = computed(() => [
    { value: 'citizen', label: t('consultantCalendar.workTypes.citizen') },
    { value: 'staff_meeting', label: t('consultantCalendar.workTypes.staff_meeting') },
    { value: 'supervision', label: t('consultantCalendar.workTypes.supervision') },
])

function emptyForm() {
    const start = moment().add(1, 'hour').startOf('hour')
    return {
        consultant_uuid: '',
        kind: 'citizen',
        citizen_uuid: '',
        title: '',
        description: '',
        date_time_start: start.format('YYYY-MM-DD HH:mm'),
        date_time_end: start.clone().add(1, 'hour').format('YYYY-MM-DD HH:mm'),
    }
}

const state = reactive({
    form: emptyForm(),
    citizenOptions: [] as any[],
    isSaving: false,
    error: {} as any,
})

watch(() => props.isModalOpen, (open: boolean) => {
    if (!open) return
    state.form = emptyForm()
    state.error = {}
    const options = props.consultantOptions as any[]
    state.form.consultant_uuid = options.some((o: any) => o.value === props.defaultConsultant)
        ? props.defaultConsultant
        : (options[0]?.value ?? '')
    if (!state.citizenOptions.length) fetchCitizens()
})

// A meeting gets its type as title until someone writes another.
watch(() => state.form.kind, (kind: string, previous: string) => {
    const previousLabel = previous && previous !== 'citizen' ? t(`consultantCalendar.workTypes.${previous}`) : ''
    if (kind !== 'citizen' && (!state.form.title || state.form.title === previousLabel)) {
        state.form.title = t(`consultantCalendar.workTypes.${kind}`)
    } else if (kind === 'citizen' && state.form.title === previousLabel) {
        state.form.title = ''
    }
})

async function fetchCitizens() {
    try {
        const response = await citizenService.getAllCitizens({ department: departmentStore.getSelectedDepartmentName })
        state.citizenOptions = (response.data ?? []).map((citizen: any) => ({
            value: citizen?.uuid,
            label: `${citizen?.firstname ?? ''} ${citizen?.lastname ?? ''}`.trim(),
        }))
    } catch (error: any) {
        state.error = error
    }
}

function closeModal() {
    emit('close')
}

async function submit() {
    state.error = {}
    state.isSaving = true
    try {
        const isCitizen = state.form.kind === 'citizen'
        await consultantCalendarService.book({
            consultant_uuid: state.form.consultant_uuid,
            citizen_uuid: isCitizen ? state.form.citizen_uuid || null : null,
            work_type: isCitizen ? null : state.form.kind,
            title: state.form.title,
            description: state.form.description || null,
            date_time_start: state.form.date_time_start,
            date_time_end: state.form.date_time_end,
        })
        successAlert(t('alert.success'), t('consultantCalendar.booked'))
        emit('booked')
        closeModal()
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}
</script>
