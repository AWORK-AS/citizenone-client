<template>
    <form @submit.prevent="submitForm()" class="text-left">
        <Alert type="danger" :text="props.error?.message" v-if="props.error?.message" />

        <div class="flex flex-wrap gap-6">
            <div class="min-w-0 space-y-4" style="flex: 999 1 420px">
                <!-- Kind -->
                <div class="space-y-1">
                    <SuperadminFormLabel :label="$t('superadmin.announcements.form.kind')" />
                    <div class="flex flex-wrap gap-2">
                        <button v-for="kind in kinds" :key="kind" type="button" @click="state.form.kind = kind"
                            class="rounded-lg border px-3 py-2 text-sm transition-colors"
                            :class="state.form.kind === kind ? 'border-primary bg-primary/10 font-semibold text-primary' : 'border-gray-200 text-gray-600 hover:bg-gray-50'">
                            {{ $t(`superadmin.announcements.kind.${kind}`) }}
                        </button>
                    </div>
                    <p class="text-xs text-gray-500">{{ $t(`superadmin.announcements.kindHint.${state.form.kind}`) }}</p>
                </div>

                <!-- App (try the new app) -->
                <div v-if="state.form.kind === 'feature'" class="space-y-1">
                    <SuperadminFormLabel for="application" :label="$t('superadmin.announcements.form.app')" />
                    <select id="application" v-model="state.form.application_uuid"
                        class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none">
                        <option value="">{{ $t('superadmin.announcements.form.noApp') }}</option>
                        <option v-for="app in props.apps" :key="app.uuid" :value="app.uuid">{{ app.name }}</option>
                    </select>
                    <p class="text-xs text-gray-500">{{ $t('superadmin.announcements.form.appHint') }}</p>
                    <SuperadminFormError :error="props.error?.errors?.application_uuid?.[0]" />
                </div>

                <div class="space-y-1">
                    <SuperadminFormLabel for="title" :label="$t('superadmin.announcements.form.title')" />
                    <input id="title" v-model="state.form.title" type="text" maxlength="120"
                        class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                    <SuperadminFormError :error="v$.form.title.$errors[0]?.$message?.toString()" />
                    <SuperadminFormError :error="props.error?.errors?.title?.[0]" />
                </div>

                <div class="space-y-1">
                    <div class="flex items-center justify-between gap-2">
                        <SuperadminFormLabel for="body" :label="$t('superadmin.announcements.form.body')" />
                        <span class="text-xs text-gray-400">{{ state.form.body.length }} / 280</span>
                    </div>
                    <textarea id="body" v-model="state.form.body" rows="3" maxlength="280"
                        class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"></textarea>
                    <p class="text-xs text-gray-500">{{ $t('superadmin.announcements.form.bodyHint') }}</p>
                    <SuperadminFormError :error="v$.form.body.$errors[0]?.$message?.toString()" />
                    <SuperadminFormError :error="props.error?.errors?.body?.[0]" />
                </div>

                <!-- Own button, when no app chooses it -->
                <div v-if="!hasApp" class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div class="space-y-1">
                        <SuperadminFormLabel for="cta_label" :label="$t('superadmin.announcements.form.ctaLabel')" />
                        <input id="cta_label" v-model="state.form.cta_label" type="text" maxlength="60"
                            :placeholder="$t('announcements.cta.open')"
                            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                    </div>
                    <div class="space-y-1">
                        <SuperadminFormLabel for="link_url" :label="$t('superadmin.announcements.form.link')" />
                        <input id="link_url" v-model="state.form.link_url" type="text" maxlength="500" placeholder="/citizens"
                            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                        <p class="text-xs text-gray-500">{{ $t('superadmin.announcements.form.linkHint') }}</p>
                        <SuperadminFormError :error="props.error?.errors?.link_url?.[0]" />
                    </div>
                </div>

                <div v-if="state.form.kind !== 'tip'" class="space-y-1">
                    <SuperadminFormLabel for="image" :label="$t('superadmin.announcements.form.image')" />
                    <input id="image" type="file" accept="image/png,image/jpeg,image/webp" @change="pickImage"
                        class="block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm" />
                    <p class="text-xs text-gray-500">{{ $t('superadmin.announcements.form.imageHint') }}</p>
                    <label v-if="props.selectedItem?.image_url && !state.imageFile" class="flex items-center gap-2 text-xs text-gray-600">
                        <input v-model="state.removeImage" type="checkbox" /> {{ $t('superadmin.announcements.form.removeImage') }}
                    </label>
                    <SuperadminFormError :error="props.error?.errors?.image?.[0]" />
                </div>

                <!-- Audience -->
                <div class="space-y-1">
                    <SuperadminFormLabel for="audience" :label="$t('superadmin.announcements.form.audience')" />
                    <select id="audience" v-model="state.form.audience"
                        class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none">
                        <option v-for="audience in audiences" :key="audience" :value="audience">
                            {{ $t(`superadmin.announcements.audience.${audience}`) }}
                        </option>
                    </select>
                </div>

                <div class="space-y-1">
                    <SuperadminFormLabel :label="$t('superadmin.announcements.form.industries')" />
                    <p class="text-xs text-gray-500">{{ $t('superadmin.announcements.form.industriesHint') }}</p>
                    <div class="flex flex-wrap gap-2 pt-1">
                        <label v-for="industry in props.industries" :key="industry.uuid"
                            class="inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
                            :class="state.form.industry_uuids.includes(industry.uuid) ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-600'">
                            <input type="checkbox" class="sr-only" :value="industry.uuid" v-model="state.form.industry_uuids" />
                            {{ industryName(industry) }}
                        </label>
                    </div>
                </div>

                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div class="space-y-1">
                        <SuperadminFormLabel for="starts_at" :label="$t('superadmin.announcements.form.startsAt')" />
                        <input id="starts_at" v-model="state.form.starts_at" type="datetime-local"
                            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                    </div>
                    <div class="space-y-1">
                        <SuperadminFormLabel for="ends_at" :label="$t('superadmin.announcements.form.endsAt')" />
                        <input id="ends_at" v-model="state.form.ends_at" type="datetime-local"
                            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                        <SuperadminFormError :error="props.error?.errors?.ends_at?.[0]" />
                    </div>
                </div>

                <div class="space-y-1">
                    <SuperadminFormLabel for="release_note" :label="$t('superadmin.announcements.form.releaseNote')" />
                    <select id="release_note" v-model="state.form.release_note_uuid"
                        class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none">
                        <option value="">{{ $t('superadmin.announcements.form.noReleaseNote') }}</option>
                        <option v-for="note in props.releaseNotes" :key="note.uuid" :value="note.uuid">
                            {{ note.version ? `${note.version} · ` : '' }}{{ note.title }}{{ note.status !== 'published' ? ` (${$t('superadmin.announcements.draft')})` : '' }}
                        </option>
                    </select>
                    <p class="text-xs text-gray-500">{{ $t('superadmin.announcements.form.releaseNoteHint') }}</p>
                </div>
            </div>

            <!-- Preview: the card as a user sees it -->
            <div class="min-w-0 space-y-2" style="flex: 1 1 300px">
                <p class="text-sm font-medium text-gray-700">{{ $t('superadmin.announcements.form.preview') }}</p>
                <div class="flex min-h-[320px] flex-col justify-end rounded-xl bg-gray-100 p-4">
                    <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
                        <img v-if="previewImage" :src="previewImage" alt="" class="h-[130px] w-full object-cover" />
                        <div class="flex items-start gap-x-3 p-4">
                            <span v-if="!previewImage" class="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Icon :name="state.form.kind === 'tip' ? 'ph:lightbulb' : state.form.kind === 'feature' ? 'ph:sparkle' : 'ph:megaphone'" class="h-5 w-5" />
                            </span>
                            <div class="min-w-0">
                                <p class="text-[11px] font-semibold uppercase tracking-wider text-tertiary">
                                    {{ selectedApp && state.form.kind === 'feature' ? selectedApp.name : $t(eyebrowKey(state.form.kind)) }}
                                </p>
                                <p class="mt-0.5 text-[15px] font-semibold text-gray-900">{{ state.form.title || $t('superadmin.announcements.form.title') }}</p>
                                <p class="mt-1 text-sm text-gray-600">{{ state.form.body || '…' }}</p>
                                <div class="mt-3 flex flex-wrap gap-2">
                                    <span v-if="previewCta" class="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white">{{ previewCta }}</span>
                                    <span class="rounded-lg px-2 py-1.5 text-xs text-gray-500">
                                        {{ state.form.kind === 'tip' ? $t('announcements.gotIt') : $t('announcements.later') }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <p v-if="hasApp" class="text-xs text-gray-500">{{ $t('superadmin.announcements.form.previewAppHint') }}</p>
                <p class="text-xs text-gray-500">{{ $t('superadmin.announcements.form.frequencyHint') }}</p>
            </div>
        </div>

        <div class="flex justify-end gap-x-2 pb-6 pt-6">
            <FormButton type="button" buttonStyle="cancel" @click="emit('close')">{{ $t('cancel') }}</FormButton>
            <FormButton type="submit" buttonStyle="primary">{{ $t('save') }}</FormButton>
        </div>
    </form>
</template>

<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'
import { required, maxLength, helpers } from '@vuelidate/validators'
import { useI18n } from 'vue-i18n'
import type { PropType } from 'vue'
import { ctaText, eyebrowKey, type AnnouncementKind } from '@/composables/announcements'

const props = defineProps({
    error: { type: Object, required: false },
    selectedItem: { type: Object, required: false, default: null },
    apps: { type: Array as PropType<any[]>, default: () => [] },
    industries: { type: Array as PropType<any[]>, default: () => [] },
    releaseNotes: { type: Array as PropType<any[]>, default: () => [] },
})
const emit = defineEmits(['submitForm', 'close'])
const { t, locale } = useI18n()

const kinds: AnnouncementKind[] = ['feature', 'news', 'tip']
const audiences = ['all', 'buyers', 'staff']

const state = reactive({
    form: emptyForm(),
    imageFile: null as File | null,
    imagePreview: '' as string,
    removeImage: false,
})

function emptyForm() {
    return {
        kind: 'feature' as AnnouncementKind,
        title: '',
        body: '',
        application_uuid: '',
        cta_label: '',
        link_url: '',
        audience: 'all',
        industry_uuids: [] as string[],
        starts_at: '',
        ends_at: '',
        release_note_uuid: '',
    }
}

// The API speaks ISO; a datetime-local input wants "YYYY-MM-DDTHH:mm" in local time.
function toLocalInput(value: string | null | undefined): string {
    if (!value) return ''
    const date = new Date(value)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function syncFromProps(item: any) {
    state.imageFile = null
    state.imagePreview = ''
    state.removeImage = false
    state.form = item
        ? {
            kind: item.kind ?? 'feature',
            title: item.title ?? '',
            body: item.body ?? '',
            application_uuid: item.application?.uuid ?? '',
            cta_label: item.cta_label ?? '',
            link_url: item.link_url ?? '',
            audience: item.audience ?? 'all',
            industry_uuids: (item.industries ?? []).map((industry: any) => industry.uuid),
            starts_at: toLocalInput(item.starts_at),
            ends_at: toLocalInput(item.ends_at),
            release_note_uuid: item.release_note?.uuid ?? '',
        }
        : emptyForm()
}

onMounted(() => syncFromProps(props.selectedItem))
watch(() => props.selectedItem, (item) => syncFromProps(item))

const selectedApp = computed(() => props.apps.find((app: any) => app.uuid === state.form.application_uuid) ?? null)
const hasApp = computed(() => state.form.kind === 'feature' && !!state.form.application_uuid)

const previewImage = computed(() => {
    if (state.form.kind === 'tip' || state.removeImage) return ''
    return state.imagePreview || props.selectedItem?.image_url || ''
})

// With an app, a buyer's button is shown: staff see "ask my admin" instead.
const previewCta = computed(() => {
    const cta = hasApp.value
        ? { action: 'trial' as const, url: '', label: null, trial_days: selectedApp.value?.trial_days ?? null }
        : (state.form.link_url ? { action: 'open' as const, url: state.form.link_url, label: state.form.cta_label || null, trial_days: null } : null)
    const text = ctaText(cta)
    return text ? (text.literal ?? t(text.key, text.values ?? {})) : ''
})

function pickImage(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null
    state.imageFile = file
    state.removeImage = false
    state.imagePreview = file ? URL.createObjectURL(file) : ''
}

function industryName(industry: any): string {
    return (locale.value === 'dk' ? industry.dk_name : industry.en_name) || industry.en_name || industry.dk_name
}

const rules = computed(() => ({
    form: {
        title: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            maxLength: maxLength(120),
        },
        body: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            maxLength: maxLength(280),
        },
    },
}))

const v$ = useVuelidate(rules, state)

/**
 * Multipart, because of the image. Every field is sent, so the form is the whole
 * message: an emptied field is saved empty, never left at its old value by accident.
 */
async function submitForm() {
    if (!(await v$.value.$validate())) return
    const f = state.form
    const form = new FormData()
    form.append('kind', f.kind)
    form.append('title', f.title)
    form.append('body', f.body)
    form.append('application_uuid', f.kind === 'feature' ? f.application_uuid : '')
    form.append('cta_label', hasApp.value ? '' : f.cta_label)
    form.append('link_url', hasApp.value ? '' : f.link_url)
    form.append('audience', f.audience)
    form.append('starts_at', f.starts_at ? new Date(f.starts_at).toISOString() : '')
    form.append('ends_at', f.ends_at ? new Date(f.ends_at).toISOString() : '')
    form.append('release_note_uuid', f.release_note_uuid)
    if (f.industry_uuids.length) {
        f.industry_uuids.forEach((uuid) => form.append('industry_uuids[]', uuid))
    } else {
        form.append('industry_uuids', '')
    }
    if (state.imageFile && f.kind !== 'tip') form.append('image', state.imageFile)
    if (state.removeImage || (f.kind === 'tip' && props.selectedItem?.image_url)) form.append('remove_image', '1')
    emit('submitForm', form)
}
</script>
