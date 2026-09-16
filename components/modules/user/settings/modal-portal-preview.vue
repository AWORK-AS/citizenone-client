<template>
    <div>
        <Modal size="lg" :title="$t('settings.company.form.portalPreviewTitle', { audience: audienceLabel })"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <p class="text-sm text-gray-500">
                    {{ $t('settings.company.form.portalPreviewHint') }}.
                </p>

                <!-- Mock of the portal shell, built from the current switches.
                     No real data is loaded: this shows the shape of the portal,
                     never another person's records. -->
                <div class="mt-4 rounded-xl border border-gray-200 overflow-hidden">
                    <div class="flex min-h-64">
                        <div class="w-40 shrink-0 bg-gradient-to-b from-sidebar to-sidebar-dark p-3 space-y-2">
                            <p class="text-primary font-semibold text-xs px-2 pb-2">CitizenOne™</p>
                            <div v-for="item in navItems" :key="item.key"
                                class="flex items-center gap-x-2 rounded-md px-2 py-1.5 text-xs font-semibold text-secondary-100">
                                <Icon :name="item.icon" class="h-4 w-4 shrink-0" aria-hidden="true" />
                                <span class="truncate">{{ item.label }}</span>
                            </div>
                            <p v-if="navItems.length === 0" class="text-xxs text-secondary-100 px-2">
                                {{ $t('settings.company.form.portalPreviewEmptyNav') }}
                            </p>
                        </div>

                        <div class="flex-1 bg-gray-50 p-4 space-y-3">
                            <div v-if="visibleSections.length === 0"
                                class="rounded-md border border-dashed border-gray-300 bg-white px-4 py-10 text-center text-sm text-gray-500">
                                {{ $t('settings.company.form.portalPreviewNothing') }}.
                            </div>
                            <div v-for="section in visibleSections" :key="section.key"
                                class="rounded-md border border-gray-200 bg-white px-4 py-3">
                                <p class="text-sm font-semibold text-gray-800">{{ $t(section.label) }}</p>
                                <p class="text-xs text-gray-500 mt-0.5">{{ $t(section.preview) }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-4 rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
                    <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {{ $t('settings.company.form.portalPreviewNeverSees') }}
                    </p>
                    <ul class="mt-1 list-disc pl-5 text-sm text-gray-600 space-y-0.5">
                        <li v-for="line in neverSees" :key="line">{{ $t(line) }}</li>
                    </ul>
                </div>

                <div class="mt-6 mb-2">
                    <FormButton type="button" buttonStyle="cancel" class="w-full" @click="closeModal">
                        {{ $t('close') }}
                    </FormButton>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    audience: {
        type: String,
        required: true,
    },
    audienceLabel: {
        type: String,
        required: true,
    },
    // Resolved section states from the settings form, so the preview always
    // matches what the admin is looking at, including unsaved changes.
    visibility: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['close'])
const { t } = useI18n()

const SECTIONS: Record<string, any[]> = {
    relative: [
        {
            key: 'journals', icon: 'ph:notebook',
            label: 'settings.company.form.portalSectionJournals',
            preview: 'settings.company.form.portalPreviewJournals',
        },
        {
            key: 'documents', icon: 'ph:files',
            label: 'settings.company.form.portalSectionDocuments',
            preview: 'settings.company.form.portalPreviewDocuments',
        },
        {
            key: 'messages', icon: 'heroicons:chat-bubble-left-right',
            label: 'settings.company.form.portalSectionMessages',
            preview: 'settings.company.form.portalPreviewMessagesRelative',
        },
    ],
    third_party: [
        {
            key: 'messages', icon: 'heroicons:chat-bubble-left-right',
            label: 'settings.company.form.portalSectionMessages',
            preview: 'settings.company.form.portalPreviewMessagesThirdParty',
        },
    ],
    citizen: [
        {
            key: 'overview', icon: 'material-symbols:dashboard',
            label: 'settings.company.form.portalSectionOverview',
            preview: 'settings.company.form.portalPreviewOverview',
        },
        {
            key: 'duty_schedules', icon: 'ph:calendar-dots',
            label: 'settings.company.form.portalSectionDutySchedules',
            preview: 'settings.company.form.portalPreviewDutySchedules',
        },
        {
            key: 'surveys', icon: 'ph:clipboard-text',
            label: 'settings.company.form.portalSectionSurveys',
            preview: 'settings.company.form.portalPreviewSurveys',
        },
        {
            key: 'protocols', icon: 'ph:check-square',
            label: 'settings.company.form.portalSectionProtocols',
            preview: 'settings.company.form.portalPreviewProtocols',
        },
        {
            key: 'messages', icon: 'heroicons:chat-bubble-left-right',
            label: 'settings.company.form.portalSectionMessages',
            preview: 'settings.company.form.portalPreviewMessagesCitizen',
        },
    ],
    patient: [
        {
            key: 'overview', icon: 'material-symbols:dashboard',
            label: 'settings.company.form.portalSectionOverview',
            preview: 'settings.company.form.portalPreviewOverview',
        },
        {
            key: 'appointments', icon: 'heroicons:clock',
            label: 'settings.company.form.portalSectionAppointments',
            preview: 'settings.company.form.portalPreviewAppointments',
        },
        {
            key: 'calendar', icon: 'ph:calendar-blank',
            label: 'settings.company.form.portalSectionCalendar',
            preview: 'settings.company.form.portalPreviewCalendar',
        },
        {
            key: 'booking', icon: 'ph:calendar-plus',
            label: 'settings.company.form.portalSectionBooking',
            preview: 'settings.company.form.portalPreviewBooking',
        },
        {
            key: 'messages', icon: 'heroicons:chat-bubble-left-right',
            label: 'settings.company.form.portalSectionMessages',
            preview: 'settings.company.form.portalPreviewMessagesCitizen',
        },
        {
            key: 'journals', icon: 'ph:notebook',
            label: 'settings.company.form.portalSectionJournals',
            preview: 'settings.company.form.portalPreviewPatientJournals',
        },
        {
            key: 'surveys', icon: 'ph:clipboard-text',
            label: 'settings.company.form.portalSectionSurveys',
            preview: 'settings.company.form.portalPreviewSurveys',
        },
        {
            key: 'documents', icon: 'ph:files',
            label: 'settings.company.form.portalSectionDocuments',
            preview: 'settings.company.form.portalPreviewDocuments',
        },
        {
            key: 'support', icon: 'material-symbols:support',
            label: 'settings.company.form.portalSectionSupport',
            preview: 'settings.company.form.portalPreviewSupport',
        },
    ],
}

const NEVER_SEES: Record<string, string[]> = {
    relative: [
        'settings.company.form.portalNeverDrafts',
        'settings.company.form.portalNeverUnsharedDocuments',
        'settings.company.form.portalNeverOtherCitizens',
        'settings.company.form.portalNeverStaffNotes',
    ],
    third_party: [
        'settings.company.form.portalNeverJournalsAtAll',
        'settings.company.form.portalNeverUnassignedStaff',
        'settings.company.form.portalNeverOtherCitizens',
    ],
    citizen: [
        'settings.company.form.portalNeverDrafts',
        'settings.company.form.portalNeverOtherCitizens',
        'settings.company.form.portalNeverStaffNotes',
    ],
    patient: [
        'settings.company.form.portalNeverDrafts',
        'settings.company.form.portalNeverUnsharedJournalNotes',
        'settings.company.form.portalNeverOtherCitizens',
        'settings.company.form.portalNeverStaffNotes',
    ],
}

const visibleSections = computed(() =>
    (SECTIONS[props.audience] ?? []).filter((section) => props.visibility?.[section.key] !== false))

const navItems = computed(() => {
    const items = visibleSections.value.map((section) => ({
        key: section.key,
        icon: section.icon,
        label: t(section.label),
    }))

    // Relatives always land on the citizen list, even with every section off.
    if (props.audience === 'relative') {
        items.unshift({ key: 'citizens', icon: 'heroicons:user-group', label: t('sidebar.citizens') })
    }

    return items
})

const neverSees = computed(() => NEVER_SEES[props.audience] ?? [])

function closeModal() {
    emit('close')
}
</script>
