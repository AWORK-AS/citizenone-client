<template>
    <div>
        <!-- Chosen: show who it is, with a way out. -->
        <div v-if="state.selected"
            class="flex items-start justify-between gap-3 rounded-[9px] border border-surface-200 bg-[#f6f9fa] px-3 py-2.5">
            <div class="min-w-0">
                <p class="truncate text-[13px] font-semibold text-slate-800">
                    {{ fullName(state.selected) }}
                </p>
                <p class="truncate text-[11px] text-slate-500">
                    {{ [state.selected.company_name, state.selected.email, state.selected.phone].filter(Boolean).join(' · ') }}
                </p>
            </div>
            <button type="button" class="shrink-0 text-slate-400 hover:text-slate-600"
                :aria-label="$t('inquiryContact.clear')" @click="clear">
                <Icon name="ph:x" class="size-4" />
            </button>
        </div>

        <template v-else>
            <div class="relative">
                <Icon name="ph:magnifying-glass"
                    class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input v-model="state.search" type="text" :placeholder="$t('inquiryContact.searchPlaceholder')"
                    class="block h-11 w-full appearance-none rounded-lg border border-gray-200 pl-9 pr-4 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-700 focus:outline-none focus:ring-primary-700 sm:text-sm"
                    @input="search" />
            </div>

            <div v-if="state.results.length"
                class="mt-1 max-h-44 overflow-y-auto rounded-lg border border-surface-200 bg-white shadow">
                <button v-for="contact in state.results" :key="contact.uuid" type="button"
                    class="flex w-full flex-col items-start px-3 py-2 text-left transition-colors hover:bg-surface-50"
                    @click="select(contact)">
                    <span class="text-[13px] font-semibold text-slate-800">{{ fullName(contact) }}</span>
                    <span class="text-[11px] text-slate-500">
                        {{ [contact.company_name, contact.email].filter(Boolean).join(' · ') }}
                    </span>
                </button>
            </div>

            <!-- Not in the register yet: create them here rather than sending the
                 user off to another page and losing the inquiry they were filling in. -->
            <div v-if="state.searched && !state.results.length" class="mt-1.5">
                <p class="text-[11px] text-slate-400">
                    {{ $t('inquiryContact.noResults') }}
                </p>
                <FormButton v-if="!state.isCreating" type="button" buttonStyle="action" class="mt-1.5"
                    @click="startCreating">
                    <Icon name="ph:plus" class="size-4" />
                    {{ $t('inquiryContact.createNew') }}
                </FormButton>
            </div>

            <div v-if="state.isCreating" class="mt-2 space-y-3 rounded-[9px] border border-surface-200 p-3">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <FormLabel for="new-contact-firstname" :label="$t('inquiries.form.firstname')" />
                        <FormTextField id="new-contact-firstname" name="new-contact-firstname"
                            v-model="state.form.firstname" :placeholder="$t('inquiries.form.firstname')" />
                    </div>
                    <div>
                        <FormLabel for="new-contact-lastname" :label="$t('inquiries.form.lastname')" />
                        <FormTextField id="new-contact-lastname" name="new-contact-lastname"
                            v-model="state.form.lastname" :placeholder="$t('inquiries.form.lastname')" />
                    </div>
                    <div>
                        <FormLabel for="new-contact-jobtitle" :label="$t('inquiryContact.jobTitle')" />
                        <FormSelect id="new-contact-jobtitle" v-model="state.form.contact_job_title_uuid"
                            :options="jobTitleOptions" :canClear="false" />
                    </div>
                    <div>
                        <FormLabel for="new-contact-company" :label="$t('inquiryContact.organisation')" />
                        <FormTextField id="new-contact-company" name="new-contact-company"
                            v-model="state.form.company_name" :placeholder="$t('inquiryContact.organisation')" />
                    </div>
                    <div>
                        <FormLabel for="new-contact-email" :label="$t('inquiryContact.email')" />
                        <FormTextField id="new-contact-email" name="new-contact-email" v-model="state.form.email"
                            :placeholder="$t('inquiryContact.email')" />
                    </div>
                    <div>
                        <FormLabel for="new-contact-phone" :label="$t('inquiryContact.phone')" />
                        <FormTextField id="new-contact-phone" name="new-contact-phone" v-model="state.form.phone"
                            :placeholder="$t('inquiryContact.phone')" />
                    </div>
                </div>
                <div class="flex justify-end gap-2">
                    <FormButton type="button" buttonStyle="cancel" @click="state.isCreating = false">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton type="button" buttonStyle="primary" :disabled="!canCreate || state.isSaving"
                        @click="create">
                        {{ $t('save') }}
                    </FormButton>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { companyContactService } from '@/components/api/user/CompanyContactService'
import { contactJobTitlesService } from '@/components/api/user/ContactJobTitlesService'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const { t, locale } = useI18n()

const props = defineProps({
    // The contact already on the inquiry, if any.
    contact: {
        type: Object,
        required: false,
        default: null,
    },
})

const emit = defineEmits(['update:contactUuid'])

let searchTimeout: any = null

const state = reactive({
    error: {} as Error,
    isCreating: false,
    isSaving: false,
    jobTitles: [] as any[],
    results: [] as any[],
    search: '',
    searched: false,
    selected: props.contact ?? null,
    form: {
        firstname: '',
        lastname: '',
        contact_job_title_uuid: null as string | null,
        company_name: '',
        email: '',
        phone: '',
    },
})

// Job titles carry a column per language, and no_title and sv_title are often
// empty, so the label falls back rather than rendering blank.
const jobTitleOptions = computed(() =>
    state.jobTitles.map((title: any) => ({
        value: title.uuid,
        label: title[`${locale.value}_title`] || title.dk_title || title.en_title || title.system_name || '-',
    }))
)

const canCreate = computed(() =>
    !!state.form.firstname.trim() && !!state.form.contact_job_title_uuid
)

watch(() => props.contact, (contact: any) => {
    state.selected = contact ?? null
})

onMounted(() => {
    fetchJobTitles()
})

function fullName(contact: any) {
    return `${contact?.firstname ?? ''} ${contact?.lastname ?? ''}`.trim()
}

async function fetchJobTitles() {
    try {
        const response = await contactJobTitlesService.getContactJobTitles({ page_length: 200 })
        state.jobTitles = response?.data ?? []
    } catch (_) {
        state.jobTitles = []
    }
}

function search() {
    clearTimeout(searchTimeout)
    state.searched = false

    if (!state.search.trim()) {
        state.results = []

        return
    }

    searchTimeout = setTimeout(async () => {
        try {
            const response = await companyContactService.getContacts({ search: state.search.trim(), page_length: 8 })
            state.results = response?.data ?? []
        } catch (_) {
            state.results = []
        }
        state.searched = true
    }, 300)
}

function select(contact: any) {
    state.selected = contact
    state.results = []
    state.search = ''
    state.searched = false
    emit('update:contactUuid', contact.uuid)
}

function clear() {
    state.selected = null
    emit('update:contactUuid', null)
}

function startCreating() {
    // Whatever was typed into the search is almost always the name, so it seeds
    // the form instead of being thrown away.
    const parts = state.search.trim().split(/\s+/)
    state.form = {
        firstname: parts[0] ?? '',
        lastname: parts.slice(1).join(' '),
        contact_job_title_uuid: state.jobTitles[0]?.uuid ?? null,
        company_name: '',
        email: '',
        phone: '',
    }
    state.error = {}
    state.isCreating = true
}

async function create() {
    state.isSaving = true
    state.error = {}
    try {
        const response = await companyContactService.saveContact({
            firstname: state.form.firstname.trim(),
            lastname: state.form.lastname.trim() || null,
            contact_job_title_uuid: state.form.contact_job_title_uuid,
            company_name: state.form.company_name.trim() || null,
            email: state.form.email.trim() || null,
            phone: state.form.phone.trim() || null,
        })
        if (response?.data) {
            state.isCreating = false
            select(response.data)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}
</script>
